const transactionService = require("./transactionService");
const healthService = require("./healthService");
const budgetService = require("./budgetService");
const { detectAnomalies, getForecast } = require("./aiService");
const { generateInsights } = require("./geminiService");

/**
 * Compiles a comprehensive Monthly Financial Statement & Executive Report.
 */
const generateMonthlyReport = async (userId, month, year) => {
  try {
    const current = new Date();
    const targetMonth = month ? parseInt(month, 10) : current.getMonth() + 1;
    const targetYear = year ? parseInt(year, 10) : current.getFullYear();

    const transactions = await transactionService.getAllTransactions(userId);
    const budgets = await budgetService.getBudgets(userId, targetMonth, targetYear);
    const healthResult = await healthService.calculateHealthScore(userId);

    // Filter transactions for specified month
    const monthTransactions = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() + 1 === targetMonth && d.getFullYear() === targetYear;
    });

    const totalIncome = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);

    const totalExpenses = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);

    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    // Category breakdown
    const categoryMap = {};
    monthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const cat = t.category || "Others";
        categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
      });

    const categoryBreakdown = Object.keys(categoryMap).map((cat) => ({
      category: cat,
      amount: categoryMap[cat],
      percentage: totalExpenses > 0 ? Math.round((categoryMap[cat] / totalExpenses) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);

    // Budget adherence
    const budgetAdherence = budgets.map((b) => {
      const spent = categoryMap[b.category] || 0;
      return {
        category: b.category,
        limit: b.limit,
        spent: spent,
        isExceeded: spent > b.limit,
        usagePercentage: Math.round((spent / b.limit) * 100),
      };
    });

    // Formatting date string
    const monthName = new Date(targetYear, targetMonth - 1, 1).toLocaleString("en-IN", { month: "long" });
    const statementPeriod = `${monthName} ${targetYear}`;
    const statementId = `FIN-${targetYear}${String(targetMonth).padStart(2, "0")}-${userId.toString().slice(-4).toUpperCase()}`;

    // Gracefully fetch forecast and insights
    let forecast = null;
    let insights = [];

    const formattedTransactions = (transactions || []).map((t) => ({
      id: t._id ? t._id.toString() : "",
      amount: t.amount || 0,
      category: t.category || "Others",
      type: t.type || "expense",
      date: t.date ? new Date(t.date).toISOString() : new Date().toISOString(),
      description: t.description || "",
    }));

    try {
      const forecastRes = await getForecast(formattedTransactions);
      if (forecastRes.success) forecast = forecastRes.forecast;
    } catch (err) {
      console.warn("Report forecast unreachable. Skipping.");
    }

    try {
      const userContext = {
        balance: netSavings,
        totalIncome,
        totalExpenses,
        healthScore: healthResult ? healthResult.score : null,
        healthGrade: healthResult ? healthResult.grade : null,
        budgets: budgets.map((b) => ({ category: b.category, limit: b.limit })),
        forecast,
      };
      const insightsRes = await generateInsights(userContext);
      if (insightsRes.success) insights = insightsRes.insights;
    } catch (err) {
      console.warn("Report insights unreachable. Skipping.");
    }

    return {
      success: true,
      reportHeader: {
        statementId,
        statementPeriod,
        generatedAt: new Date().toISOString(),
        currency: "INR (₹)",
      },
      financialSummary: {
        totalIncome,
        totalExpenses,
        netSavings,
        savingsRate: Math.round(savingsRate),
        transactionCount: monthTransactions.length,
      },
      healthAssessment: {
        score: healthResult ? healthResult.score : 75,
        grade: healthResult ? healthResult.grade : "Good",
        gradeColor: healthResult ? healthResult.gradeColor : "text-indigo-600",
      },
      categoryBreakdown,
      budgetAdherence,
      forecast,
      advisorInsights: insights,
    };
  } catch (error) {
    console.error("Error generating monthly report:", error.message);
    throw error;
  }
};

/**
 * Compiles a Financial Statement & Executive Report for a custom date range.
 */
const generateCustomReport = async (userId, startDateStr, endDateStr) => {
  try {
    const transactions = await transactionService.getAllTransactions(userId);
    const healthResult = await healthService.calculateHealthScore(userId);

    const start = startDateStr ? new Date(startDateStr) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    start.setHours(0, 0, 0, 0);

    const end = endDateStr ? new Date(endDateStr) : new Date();
    end.setHours(23, 59, 59, 999);

    const targetMonth = start.getMonth() + 1;
    const targetYear = start.getFullYear();
    const budgets = await budgetService.getBudgets(userId, targetMonth, targetYear);

    // Filter transactions within custom date range
    const rangeTransactions = transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });

    const totalIncome = rangeTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);

    const totalExpenses = rangeTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);

    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    // Category breakdown
    const categoryMap = {};
    rangeTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const cat = t.category || "Others";
        categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
      });

    const categoryBreakdown = Object.keys(categoryMap).map((cat) => ({
      category: cat,
      amount: categoryMap[cat],
      percentage: totalExpenses > 0 ? Math.round((categoryMap[cat] / totalExpenses) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);

    // Budget adherence
    const budgetAdherence = budgets.map((b) => {
      const spent = categoryMap[b.category] || 0;
      return {
        category: b.category,
        limit: b.limit,
        spent: spent,
        isExceeded: spent > b.limit,
        usagePercentage: Math.round((spent / b.limit) * 100),
      };
    });

    // Formatting date range statement period
    const startFormatted = start.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const endFormatted = end.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const statementPeriod = `${startFormatted} – ${endFormatted}`;

    const startCompact = start.toISOString().slice(0, 10).replace(/-/g, "");
    const endCompact = end.toISOString().slice(0, 10).replace(/-/g, "");
    const statementId = `FIN-CUST-${startCompact}-${endCompact}-${userId.toString().slice(-4).toUpperCase()}`;

    // Gracefully fetch forecast and insights
    let forecast = null;
    let insights = [];

    const formattedTransactions = (transactions || []).map((t) => ({
      id: t._id ? t._id.toString() : "",
      amount: t.amount || 0,
      category: t.category || "Others",
      type: t.type || "expense",
      date: t.date ? new Date(t.date).toISOString() : new Date().toISOString(),
      description: t.description || "",
    }));

    try {
      const forecastRes = await getForecast(formattedTransactions);
      if (forecastRes.success) forecast = forecastRes.forecast;
    } catch (err) {
      console.warn("Report forecast unreachable. Skipping.");
    }

    try {
      const userContext = {
        balance: netSavings,
        totalIncome,
        totalExpenses,
        healthScore: healthResult ? healthResult.score : null,
        healthGrade: healthResult ? healthResult.grade : null,
        budgets: budgets.map((b) => ({ category: b.category, limit: b.limit })),
        forecast,
        customPeriod: statementPeriod,
      };
      const insightsRes = await generateInsights(userContext);
      if (insightsRes.success) insights = insightsRes.insights;
    } catch (err) {
      console.warn("Report insights unreachable. Skipping.");
    }

    return {
      success: true,
      reportHeader: {
        statementId,
        statementPeriod,
        generatedAt: new Date().toISOString(),
        currency: "INR (₹)",
        isCustomRange: true,
      },
      financialSummary: {
        totalIncome,
        totalExpenses,
        netSavings,
        savingsRate: Math.round(savingsRate),
        transactionCount: rangeTransactions.length,
      },
      healthAssessment: {
        score: healthResult ? healthResult.score : 75,
        grade: healthResult ? healthResult.grade : "Good",
        gradeColor: healthResult ? healthResult.gradeColor : "text-indigo-600",
      },
      categoryBreakdown,
      budgetAdherence,
      forecast,
      advisorInsights: insights,
    };
  } catch (error) {
    console.error("Error generating custom report:", error.message);
    throw error;
  }
};

module.exports = {
  generateMonthlyReport,
  generateCustomReport,
};
