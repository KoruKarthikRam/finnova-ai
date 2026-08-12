const express = require("express");
const { getHealthScore } = require("../controllers/dashboardController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all dashboard routes
router.use(protect);

router.get("/health-score", getHealthScore);

module.exports = router;
