const healthService = require("../services/healthService");
const transactionService = require("../services/transactionService");
const budgetService = require("../services/budgetService");
const goalService = require("../services/goalService");
const { generateUserRecommendations } = require("../services/recommendationService");

const getHealthScore = async (req, res) => {
  try {
    const healthData = await healthService.calculateHealthScore(req.user.id);
    res.json({
      success: true,
      data: healthData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to calculate financial health score",
    });
  }
};

const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const current = new Date();
    const month = parseInt(req.query.month) || current.getMonth() + 1;
    const year = parseInt(req.query.year) || current.getFullYear();

    const [transactions, budgets, goals, healthData, recommendationsRes] = await Promise.all([
      transactionService.getAllTransactions(userId),
      budgetService.getBudgets(userId, month, year),
      goalService.getGoals(userId),
      healthService.calculateHealthScore(userId),
      generateUserRecommendations(userId).catch(() => ({ recommendations: [] }))
    ]);

    res.json({
      success: true,
      data: {
        transactions: transactions || [],
        budgets: budgets || [],
        goals: goals || [],
        healthData: healthData || null,
        recommendations: recommendationsRes.recommendations || []
      }
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch aggregated dashboard summary",
    });
  }
};

module.exports = {
  getHealthScore,
  getDashboardSummary,
};
