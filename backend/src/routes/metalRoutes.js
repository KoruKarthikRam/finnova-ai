const express = require("express");
const { getLiveRates, getRateHistory, calculateMetalValue, getStockGraph } = require("../controllers/metalController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Apply auth protection if logged in
router.use(protect);

router.get("/live", getLiveRates);
router.get("/history", getRateHistory);
router.get("/stock-graph", getStockGraph);
router.post("/calculate", calculateMetalValue);

module.exports = router;
