const express = require("express");
const { testAiServiceConnection, classifyTransaction, getTransactionAnomalies } = require("../controllers/aiController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// All AI/ML routes require authorization
router.use(protect);

router.get("/test", testAiServiceConnection);
router.post("/classify", classifyTransaction);
router.get("/anomalies", getTransactionAnomalies);

module.exports = router;
