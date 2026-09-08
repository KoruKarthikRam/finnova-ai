const metalService = require("../services/metalService");

/**
 * Get live Gold and Silver rates in INR
 */
const getLiveRates = async (req, res) => {
  try {
    const data = await metalService.getLiveRates();
    return res.json(data);
  } catch (error) {
    console.error("Error fetching metal rates:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch live Gold/Silver rates",
      error: error.message
    });
  }
};

/**
 * Get rate history for trend charts
 */
const getRateHistory = async (req, res) => {
  try {
    const data = await metalService.getRateHistory();
    return res.json(data);
  } catch (error) {
    console.error("Error fetching rate history:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch metal rate history",
      error: error.message
    });
  }
};

/**
 * Calculate metal price based on user weight and purity
 */
const calculateMetalValue = async (req, res) => {
  try {
    const { weight, unit, purity, metal, includeGst } = req.body;
    const liveRates = await metalService.getLiveRates();
    const result = metalService.calculateValue({
      weight,
      unit,
      purity,
      metal,
      includeGst,
      liveRates
    });
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error calculating metal value:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to calculate metal valuation",
      error: error.message
    });
  }
};

module.exports = {
  getLiveRates,
  getRateHistory,
  calculateMetalValue
};
