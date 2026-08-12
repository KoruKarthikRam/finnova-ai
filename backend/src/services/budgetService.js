const Budget = require("../models/Budget");

const getBudgets = async (userId, month, year) => {
  return await Budget.find({ userId, month, year });
};

const upsertBudget = async (userId, category, limit, month, year) => {
  return await Budget.findOneAndUpdate(
    { userId, category, month, year },
    { limit },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );
};

const deleteBudget = async (id, userId) => {
  return await Budget.findOneAndDelete({ _id: id, userId });
};

module.exports = {
  getBudgets,
  upsertBudget,
  deleteBudget,
};
