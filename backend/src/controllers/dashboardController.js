const healthService = require("../services/healthService");
const transactionService = require("../services/transactionService");
const budgetService = require("../services/budgetService");
const goalService = require("../services/goalService");
const { generateUserRecommendations } = require("../services/recommendationService");
const cacheService = require("../services/cacheService");

const getHealthScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `dashboard:${userId}:health`;
    
    let cachedData = null;
    try {
      cachedData = cacheService.get(cacheKey);
    } catch (cacheErr) {
      console.warn("Dashboard cache lookup warning:", cacheErr);
    }

    if (cachedData) {
      return res.json({
        success: true,
        data: cachedData,
        cached: true,
      });
    }

    const healthData = await healthService.calculateHealthScore(userId);
    try {
      cacheService.set(cacheKey, healthData, 300); // cache for 5 mins
    } catch (cacheErr) {
      console.warn("Dashboard cache set warning:", cacheErr);
    }

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
    const cacheKey = `dashboard:${userId}:summary:${month}:${year}`;

    let cachedSummary = null;
    try {
      cachedSummary = cacheService.get(cacheKey);
    } catch (cacheErr) {
      console.warn("Dashboard cache lookup warning:", cacheErr);
    }

    if (cachedSummary) {
      return res.json({
        success: true,
        data: cachedSummary,
        cached: true,
      });
    }

    const [transactions, budgets, goals, healthData, recommendationsRes] = await Promise.all([
      transactionService.getAllTransactions(userId).catch((err) => {
        console.error("Dashboard transactionService error:", err);
        return [];
      }),
      budgetService.getBudgets(userId, month, year).catch((err) => {
        console.error("Dashboard budgetService error:", err);
        return [];
      }),
      goalService.getAllGoals(userId).catch((err) => {
        console.error("Dashboard goalService error:", err);
        return [];
      }),
      healthService.calculateHealthScore(userId).catch((err) => {
        console.error("Dashboard healthService error:", err);
        return null;
      }),
      generateUserRecommendations(userId).catch(() => ({ recommendations: [] }))
    ]);

    const responseData = {
      transactions: transactions || [],
      budgets: budgets || [],
      goals: goals || [],
      healthData: healthData || null,
      recommendations: (recommendationsRes && recommendationsRes.recommendations) || []
    };

    try {
      cacheService.set(cacheKey, responseData, 300); // cache for 5 mins
    } catch (cacheErr) {
      console.warn("Dashboard cache set warning:", cacheErr);
    }

    res.json({
      success: true,
      data: responseData
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
