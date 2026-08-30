const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Goal = require("../models/Goal");

const calculateHealthScore = async (userId) => {
  const current = new Date();
  const month = current.getMonth() + 1;
  const year = current.getFullYear();

  // 1. Fetch current month's transactions
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const transactions = await Transaction.find({
    userId,
    date: { $gte: startDate, $lte: endDate },
  });

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  // 2. Essential vs Non-Essential Expenses
  // Standard non-essential categories (Wants)
  const nonEssentialCats = ["shopping", "entertainment", "others", "gift"];
  const nonEssentialExpenses = transactions
    .filter((t) => t.type === "expense" && nonEssentialCats.includes((t.category || "").toLowerCase().trim()))
    .reduce((sum, item) => sum + item.amount, 0);

  const nonEssentialRatio = totalExpense > 0 ? (nonEssentialExpenses / totalExpense) * 100 : 0;

  // 3. Fetch Budgets & Check Exceeded Limits
  const budgets = await Budget.find({ userId, month, year });
  let totalBudgetsCount = budgets.length;
  let exceededBudgetsCount = 0;

  if (totalBudgetsCount > 0) {
    for (const b of budgets) {
      // Calculate category spent amount in this month
      const spent = transactions
        .filter((t) => t.type === "expense" && (t.category || "").toLowerCase().trim() === (b.category || "").toLowerCase().trim())
        .reduce((sum, item) => sum + item.amount, 0);
      if (spent > b.limit) {
        exceededBudgetsCount++;
      }
    }
  }

  // 4. Fetch Savings Goals & Check Progress
  const goals = await Goal.find({ userId, status: "active" });
  let goalsCount = goals.length;
  let totalGoalProgress = 0;
  let averageGoalProgress = 0;

  if (goalsCount > 0) {
    goals.forEach((g) => {
      totalGoalProgress += (g.currentAmount / g.targetAmount) * 100;
    });
    averageGoalProgress = Math.round(totalGoalProgress / goalsCount);
  }

  // 5. Score Algorithm Calculations (Weights: Savings Rate: 30%, Budget: 30%, Wants Ratio: 20%, Goals: 20%)
  
  // A. Savings Rate Score (Max: 30 points)
  let savingsRateScore = 0;
  if (totalIncome === 0) {
    savingsRateScore = 0; // No income recorded
  } else if (savingsRate >= 30) {
    savingsRateScore = 30;
  } else if (savingsRate >= 20) {
    savingsRateScore = 20;
  } else if (savingsRate >= 10) {
    savingsRateScore = 10;
  } else if (savingsRate >= 0) {
    savingsRateScore = 5;
  } else {
    savingsRateScore = 0; // Deficit spending
  }

  // B. Budget Adherence Score (Max: 30 points)
  let budgetScore = 0;
  if (totalBudgetsCount === 0) {
    budgetScore = 20; // Default buffer to encourage creating budgets
  } else {
    const exceededRatio = exceededBudgetsCount / totalBudgetsCount;
    if (exceededRatio === 0) {
      budgetScore = 30;
    } else if (exceededRatio <= 0.2) {
      budgetScore = 20;
    } else if (exceededRatio <= 0.5) {
      budgetScore = 10;
    } else {
      budgetScore = 0;
    }
  }

  // C. Wants/Non-Essential Ratio Score (Max: 20 points)
  let essentialScore = 0;
  if (totalExpense === 0) {
    essentialScore = 20; // Default if no expenses
  } else {
    if (nonEssentialRatio <= 30) {
      essentialScore = 20; // Matches standard 50/30/20 budget guidelines
    } else if (nonEssentialRatio <= 50) {
      essentialScore = 15;
    } else if (nonEssentialRatio <= 70) {
      essentialScore = 8;
    } else {
      essentialScore = 2;
    }
  }

  // D. Goals Progress Score (Max: 20 points)
  let goalScore = 0;
  if (goalsCount === 0) {
    goalScore = 10; // Default buffer if no goals set yet
  } else {
    if (averageGoalProgress >= 80) {
      goalScore = 20;
    } else if (averageGoalProgress >= 50) {
      goalScore = 15;
    } else if (averageGoalProgress >= 20) {
      goalScore = 10;
    } else {
      goalScore = 5;
    }
  }

  const totalScore = savingsRateScore + budgetScore + essentialScore + goalScore;

  // Grade categorization
  let grade = "Needs Improvement";
  let gradeColor = "text-amber-500";
  if (totalScore >= 80) {
    grade = "Excellent";
    gradeColor = "text-emerald-500";
  } else if (totalScore >= 60) {
    grade = "Good";
    gradeColor = "text-indigo-500";
  } else if (totalScore >= 40) {
    grade = "Fair";
    gradeColor = "text-amber-500";
  } else {
    grade = "High Risk";
    gradeColor = "text-rose-500";
  }

  return {
    score: totalScore,
    grade,
    gradeColor,
    breakdown: {
      savingsRateScore,
      budgetScore,
      essentialScore,
      goalScore,
    },
    metrics: {
      savingsRate: Math.round(savingsRate),
      totalBudgetsCount,
      exceededBudgetsCount,
      nonEssentialRatio: Math.round(nonEssentialRatio),
      averageGoalProgress,
    },
  };
};

module.exports = {
  calculateHealthScore,
};
