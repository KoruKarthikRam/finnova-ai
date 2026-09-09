const express = require("express");
const { getMonthlyReport, getCustomReport } = require("../controllers/reportController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/monthly", getMonthlyReport);
router.get("/custom", getCustomReport);

module.exports = router;
