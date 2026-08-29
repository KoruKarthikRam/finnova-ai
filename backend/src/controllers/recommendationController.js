const { generateUserRecommendations } = require("../services/recommendationService");

const getRecommendations = async (req, res) => {
  try {
    const result = await generateUserRecommendations(req.user.id);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate smart recommendations",
      error: error.message,
    });
  }
};

module.exports = {
  getRecommendations,
};
