const Transaction = require("../models/Transaction");

const getAllTransactions = async (userId) => {
  return await Transaction.find({ userId }).sort({ date: -1 });
};

const getTransactionById = async (id, userId) => {
  return await Transaction.findOne({ _id: id, userId });
};

const createTransaction = async (userId, transactionData) => {
  const transaction = new Transaction({
    ...transactionData,
    userId,
  });

  return await transaction.save();
};

const updateTransaction = async (id, userId, transactionData) => {
  return await Transaction.findOneAndUpdate(
    { _id: id, userId },
    transactionData,
    {
      new: true,
      runValidators: true,
    }
  );
};

const deleteTransaction = async (id, userId) => {
  return await Transaction.findOneAndDelete({ _id: id, userId });
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};