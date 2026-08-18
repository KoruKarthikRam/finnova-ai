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

const analyzeTransactions = async (transactions) => {
  try {
    const response = await aiServiceClient.post("/analyze", { transactions });
    return response.data;
  } catch (error) {
    console.error("AI Service analyze transaction failed:", error.message);
    throw error;
  }
};

const classifyDescription = async (description) => {
  try {
    const response = await aiServiceClient.post("/classify", { description });
    return response.data;
  } catch (error) {
    console.error("AI Service classify description failed:", error.message);
    throw error;
  }
};

const detectAnomalies = async (transactions) => {
  try {
    const response = await aiServiceClient.post("/anomalies", { transactions });
    return response.data;
  } catch (error) {
    console.error("AI Service anomaly detection failed:", error.message);
    throw error;
  }
};

module.exports = {
  checkAiServiceHealth,
  analyzeTransactions,
  classifyDescription,
  detectAnomalies,
};
