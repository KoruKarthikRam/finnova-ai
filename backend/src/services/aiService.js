const axios = require("axios");

const aiServiceClient = axios.create({
  baseURL: process.env.AI_SERVICE_URL || "http://localhost:8000",
  timeout: 10000, // 10 seconds timeout
});

const checkAiServiceHealth = async () => {
  try {
    const response = await aiServiceClient.get("/health");
    return response.data;
  } catch (error) {
    console.error("AI Service health check failed:", error.message);
    return {
      status: "unreachable",
      error: error.message
    };
  }
};

module.exports = {
  checkAiServiceHealth,
};
