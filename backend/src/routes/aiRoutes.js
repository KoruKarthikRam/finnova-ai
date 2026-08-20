const express = require("express");
const { testAiServiceConnection, classifyTransaction, getTransactionAnomalies, getTransactionForecast, chatWithAssistant } = require("../controllers/aiController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// All AI/ML routes require authorization
router.use(protect);

router.get("/test", testAiServiceConnection);
router.post("/classify", classifyTransaction);
router.get("/anomalies", getTransactionAnomalies);
router.get("/forecast", getTransactionForecast);
router.post("/chat", chatWithAssistant);

module.exports = router;
