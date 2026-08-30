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
    const response = await aiServiceClient.post("/classify", { description }, { timeout: 2000 });
    return response.data;
  } catch (error) {
    console.error("AI Service classify description failed:", error.message);
    throw error;
  }
};

const detectAnomalies = async (transactions) => {
  try {
    const response = await aiServiceClient.post("/anomalies", { transactions }, { timeout: 2500 });
    return response.data;
  } catch (error) {
    console.error("AI Service anomaly detection failed:", error.message);
    throw error;
  }
};

const getForecast = async (transactions) => {
  try {
    const response = await aiServiceClient.post("/forecast", { transactions }, { timeout: 2500 });
    return response.data;
  } catch (error) {
    console.error("AI Service forecasting failed:", error.message);
    throw error;
  }
};

const searchKnowledge = async (query, limit = 3) => {
  try {
    const response = await aiServiceClient.post("/search-knowledge", { query, limit }, { timeout: 2500 });
    return response.data;
  } catch (error) {
    console.error("AI Service search knowledge failed:", error.message);
    return { success: false, matches: [] };
  }
};

const detectSubscriptions = async (transactions) => {
  try {
    const response = await aiServiceClient.post("/subscriptions", { transactions }, { timeout: 2500 });
    return response.data;
  } catch (error) {
    console.error("AI Service subscription detection failed:", error.message);
    return { success: false, subscriptions: [], total_monthly_overhead: 0.0 };
  }
};

module.exports = {
  checkAiServiceHealth,
  analyzeTransactions,
  classifyDescription,
  detectAnomalies,
  getForecast,
  searchKnowledge,
  detectSubscriptions,
};


