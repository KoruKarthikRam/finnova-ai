const express = require("express");
const { testAiServiceConnection, classifyTransaction, getTransactionAnomalies, getTransactionForecast, chatWithAssistant, getAiInsights, generateTopicQuiz } = require("../controllers/aiController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// All AI/ML routes require authorization
router.use(protect);

router.get("/test", testAiServiceConnection);
router.post("/classify", classifyTransaction);
router.get("/anomalies", getTransactionAnomalies);
router.get("/forecast", getTransactionForecast);
router.post("/chat", chatWithAssistant);
router.get("/insights", getAiInsights);
router.post("/quiz", generateTopicQuiz);

module.exports = router;

