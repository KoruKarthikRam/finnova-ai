const express = require("express");
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkCreateTransactions,
} = require("../controllers/transactionController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Apply auth middleware to protect all routes below
router.use(protect);

router.get("/", getTransactions);
router.post("/bulk", bulkCreateTransactions);
router.get("/:id", getTransaction);
router.post("/", createTransaction);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

module.exports = router;