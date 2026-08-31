const transactionService = require("./transactionService");
const healthService = require("./healthService");
const budgetService = require("./budgetService");

const recCache = new Map();
const REC_TTL_MS = 5 * 60 * 1000;

/**
 * Generates personalized financial masterclass & action recommendations based on user financial state.
 */
const generateUserRecommendations = async (userId) => {
  try {
    const cached = recCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const [transactions, healthResult] = await Promise.all([
      transactionService.getAllTransactions(userId),
      healthService.calculateHealthScore(userId)
    ]);

    const current = new Date();
    const currentMonth = current.getMonth() + 1;
    const currentYear = current.getFullYear();

    const currentMonthTransactions = (transactions || []).filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
    });

    const totalIncome = currentMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);

    const totalExpenses = currentMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);

    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    // Calculate non-essential expenses
    const nonEssentialCategories = new Set(["shopping", "entertainment", "others", "gift", "travel", "restaurant", "leisure"]);
    const nonEssentialExpenses = currentMonthTransactions
      .filter((t) => t.type === "expense" && nonEssentialCategories.has((t.category || "").toLowerCase().trim()))
      .reduce((sum, item) => sum + item.amount, 0);

    const nonEssentialRatio = totalExpenses > 0 ? (nonEssentialExpenses / totalExpenses) * 100 : 0;

    const healthScore = healthResult ? healthResult.score : 70;
    const recommendations = [];

    // Rule 1: Low Savings Rate (< 20%)
    if (totalIncome > 0 && savingsRate < 20) {
      recommendations.push({
        id: "rec-savings-low",
        lessonId: "savings-emergency-fund",
        title: "Emergency Fund: Building a 6-Month Safety Net",
        category: "Savings",
        priority: "High",
        badgeColor: "rose",
        reason: `Your current monthly savings rate is ${Math.max(0, Math.round(savingsRate))}%. Build an emergency reserve to protect against unforeseen expenses.`,
        actionText: "Build Safety Cushion"
      });
    }

    // Rule 2: High Non-Essential Spending (> 40%)
    if (nonEssentialRatio > 40) {
      recommendations.push({
        id: "rec-wants-high",
        lessonId: "budgeting-50-30-20",
        title: "Budgeting 101: The 50/30/20 Rule",
        category: "Budgeting",
        priority: "High",
        badgeColor: "amber",
        reason: `${Math.round(nonEssentialRatio)}% of your expenses this month went to non-essential wants. Use the 50/30/20 rule to balance your spending.`,
        actionText: "Optimize Budget"
      });
    }

    // Rule 3: Low Financial Health Score (< 60)
    if (healthScore < 60) {
      recommendations.push({
        id: "rec-health-low",
        lessonId: "loans-cibil-emi-management",
        title: "Demystifying EMIs & Improving Credit (CIBIL) Score",
        category: "Loans",
        priority: "Critical",
        badgeColor: "rose",
        reason: `Your Financial Health Score is ${healthScore}/100. Learn how timely EMI management and credit score strategies can boost your rating.`,
        actionText: "Boost Credit Score"
      });
    }

    // Rule 4: High Salary/Income (> ₹62,500/mo -> ~₹7.5L/yr) - Tax Optimization
    if (totalIncome >= 60000 || totalExpenses >= 50000) {
      recommendations.push({
        id: "rec-tax-savings",
        lessonId: "taxes-80c-80d-mastery",
        title: "Mastering Section 80C & 80D Tax Deductions",
        category: "Taxes",
        priority: "Medium",
        badgeColor: "indigo",
        reason: "You are in an eligible tax bracket! Claim up to ₹1.5 Lakhs u/s 80C and ₹25,000 u/s 80D to save on annual taxes.",
        actionText: "Save Tax Now"
      });
    }

    // Rule 5: High Savings Rate (> 30%) - Wealth Compounding
    if (savingsRate >= 30) {
      recommendations.push({
        id: "rec-sip-wealth",
        lessonId: "investments-sip-power",
        title: "SIP vs Lump Sum: Power of Rupee Cost Averaging",
        category: "Investments",
        priority: "High",
        badgeColor: "emerald",
        reason: `Excellent job! You maintain a strong ${Math.round(savingsRate)}% savings rate. Put your surplus cash flow into market-linked SIPs to compound wealth.`,
        actionText: "Start Compounding"
      });
    }

    // Default Baseline Recommendation if empty or few recommendations
    if (recommendations.length < 2) {
      recommendations.push({
        id: "rec-retirement-fire",
        lessonId: "retirement-nps-epf-fire",
        title: "Retirement & Compounding: NPS, EPF, & FIRE Movement",
        category: "Retirement",
        priority: "Normal",
        badgeColor: "indigo",
        reason: "Learn the 25x Rule and 4% withdrawal strategy to achieve long-term financial independence early.",
        actionText: "Explore FIRE Plan"
      });
    }

    const result = {
      success: true,
      metricsSummary: {
        totalIncome,
        totalExpenses,
        savingsRate: Math.round(savingsRate),
        nonEssentialRatio: Math.round(nonEssentialRatio),
        healthScore
      },
      recommendations: recommendations.slice(0, 3) // Return top 3 tailored recommendations
    };

    recCache.set(userId, {
      data: result,
      expiresAt: Date.now() + REC_TTL_MS
    });

    return result;
  } catch (error) {
    console.error("Error generating smart recommendations:", error.message);
    throw error;
  }
};

module.exports = {
  generateUserRecommendations
};
