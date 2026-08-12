const express = require("express");
const {
  getBudgets,
  setBudget,
  deleteBudget,
} = require("../controllers/budgetController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all budget routes
router.use(protect);

router.get("/", getBudgets);
router.post("/", setBudget);
router.delete("/:id", deleteBudget);

module.exports = router;
