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
        reason: `Your current monthly savings rate is at ${Math.max(0, Math.round(savingsRate))}%, which is below the target benchmark of 20-30%. Building a dedicated 3 to 6-month liquid emergency cushion prevents forced distress selling of long-term investments during unexpected financial shocks.`,
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
        reason: `${Math.round(nonEssentialRatio)}% of your expenses this month went toward non-essential wants (dining, shopping, OTT, trips). Implementing the 50/30/20 rule caps discretionary lifestyle costs at 30% and channels your surplus directly into compounding assets.`,
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
        reason: `Your Financial Health Score is currently at ${healthScore}/100. Improving credit utilization below 30% and maintaining strict on-time EMI repayments will boost your rating above 750+, unlocking lower interest rates across future credit applications.`,
        actionText: "Boost Credit Score"
      });
    }

    // Rule 4: High Salary/Income (> ₹60,000/mo) - Tax Optimization
    if (totalIncome >= 60000 || totalExpenses >= 50000) {
      recommendations.push({
        id: "rec-tax-savings",
        lessonId: "taxes-80c-80d-mastery",
        title: "Mastering Section 80C & 80D Tax Deductions",
        category: "Taxes",
        priority: "Medium",
        badgeColor: "indigo",
        reason: `Your income profile puts you in an active tax bracket. Claiming up to ₹1.5 Lakhs under Section 80C (ELSS/PPF/EPF) and ₹25,000 under Section 80D (Health Insurance) reduces annual taxable income and boosts your net take-home salary under the Old Tax Regime.`,
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
        reason: `Outstanding job maintaining a strong ${Math.round(savingsRate)}% monthly savings rate! Route your excess cash flow into automated Nifty 50 Index Fund SIPs to harness rupee cost averaging and build long-term multi-crore wealth.`,
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
        reason: "Explore the 25x Rule and 4% safe withdrawal strategy to achieve Financial Independence and Retire Early (FIRE). Utilize NPS for an extra ₹50,000 tax deduction under Section 80CCD(1B).",
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
