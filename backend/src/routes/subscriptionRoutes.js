const express = require("express");
const { getDetectedSubscriptions } = require("../controllers/subscriptionController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getDetectedSubscriptions);

module.exports = router;
