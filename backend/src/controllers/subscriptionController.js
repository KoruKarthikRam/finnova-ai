const { getUserSubscriptions } = require("../services/subscriptionService");

const getDetectedSubscriptions = async (req, res) => {
  try {
    const result = await getUserSubscriptions(req.user.id);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to detect recurring subscriptions",
      error: error.message,
    });
  }
};

module.exports = {
  getDetectedSubscriptions,
};
