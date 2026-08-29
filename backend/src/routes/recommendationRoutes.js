const express = require("express");
const { getRecommendations } = require("../controllers/recommendationController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getRecommendations);

module.exports = router;
