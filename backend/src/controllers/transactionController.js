const transactionService = require("../services/transactionService");
const cacheService = require("../services/cacheService");

const getTransactions = async (req, res) => {
  try {
    const transactions = await transactionService.getAllTransactions(req.user.id);

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
    });
  }
};

const getTransaction = async (req, res) => {
  try {
    const transaction = await transactionService.getTransactionById(
      req.params.id,
      req.user.id
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch transaction",
    });
  }
};

const createTransaction = async (req, res) => {
  try {
    const transaction = await transactionService.createTransaction(
      req.user.id,
      req.body
    );

    cacheService.invalidateUserDashboardCache(req.user.id);

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const transaction = await transactionService.updateTransaction(
      req.params.id,
      req.user.id,
      req.body
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    cacheService.invalidateUserDashboardCache(req.user.id);

    res.json({
      success: true,
      message: "Transaction updated successfully",
      data: transaction,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const transaction = await transactionService.deleteTransaction(
      req.params.id,
      req.user.id
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    cacheService.invalidateUserDashboardCache(req.user.id);

    res.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete transaction",
    });
  }
};

const bulkCreateTransactions = async (req, res) => {
  try {
    const { transactions } = req.body;
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of transactions to import",
      });
    }

    const created = await transactionService.bulkCreateTransactions(
      req.user.id,
      transactions
    );

    cacheService.invalidateUserDashboardCache(req.user.id);

    res.status(201).json({
      success: true,
      message: `Successfully imported ${created.length} transactions!`,
      data: created,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to bulk import transactions",
    });
  }
};

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkCreateTransactions,
};