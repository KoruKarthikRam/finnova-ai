const healthService = require("../services/healthService");

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

module.exports = {
  getHealthScore,
};
