const transactionService = require("../services/transactionService");

const getTransactions = async (req, res) => {
  try {
    const transactions =
      await transactionService.getAllTransactions();

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
    const transaction =
      await transactionService.getTransactionById(req.params.id);

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
    const transaction =
      await transactionService.createTransaction(req.body);

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
    const transaction =
      await transactionService.updateTransaction(
        req.params.id,
        req.body
      );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

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
    const transaction =
      await transactionService.deleteTransaction(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

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

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};