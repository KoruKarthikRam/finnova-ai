const express = require("express");
const { getHealthScore, getDashboardSummary } = require("../controllers/dashboardController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all dashboard routes
router.use(protect);

router.get("/summary", getDashboardSummary);
router.get("/health-score", getHealthScore);

module.exports = router;
