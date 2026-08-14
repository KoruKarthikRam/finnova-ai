const { checkAiServiceHealth } = require("../services/aiService");

const testAiServiceConnection = async (req, res) => {
  const result = await checkAiServiceHealth();
  if (result.status === "healthy") {
    return res.json({
      success: true,
      message: "Connection to Python FastAPI microservice successful!",
      data: result,
    });
  } else {
    return res.status(503).json({
      success: false,
      message: "Could not connect to Python FastAPI microservice.",
      error: result.error || "Unknown error",
    });
  }
};

module.exports = {
  testAiServiceConnection,
};
