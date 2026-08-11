const Transaction = require("../models/Transaction");

const getAllTransactions = async () => {
  return await Transaction.find().sort({ date: -1 });
};

const getTransactionById = async (id) => {
  return await Transaction.findById(id);
};

const createTransaction = async (transactionData) => {
  const transaction = new Transaction(transactionData);

  return await transaction.save();
};

const updateTransaction = async (id, transactionData) => {
  return await Transaction.findByIdAndUpdate(
    id,
    transactionData,
    {
      new: true,
      runValidators: true,
    }
  );
};

const deleteTransaction = async (id) => {
  return await Transaction.findByIdAndDelete(id);
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};