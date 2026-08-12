const Goal = require("../models/Goal");

const getAllGoals = async (userId) => {
  return await Goal.find({ userId }).sort({ deadline: 1 });
};

const createGoal = async (userId, goalData) => {
  const goal = new Goal({
    ...goalData,
    userId,
  });
  return await goal.save();
};

const updateGoal = async (id, userId, goalData) => {
  const updateFields = { ...goalData };
  
  // Auto-complete status trigger
  if (updateFields.currentAmount !== undefined) {
    const existingGoal = await Goal.findOne({ _id: id, userId });
    if (existingGoal) {
      const target = updateFields.targetAmount !== undefined ? updateFields.targetAmount : existingGoal.targetAmount;
      if (updateFields.currentAmount >= target) {
        updateFields.status = "completed";
      } else {
        updateFields.status = "active";
      }
    }
  }

  return await Goal.findOneAndUpdate(
    { _id: id, userId },
    updateFields,
    {
      new: true,
      runValidators: true,
    }
  );
};

const deleteGoal = async (id, userId) => {
  return await Goal.findOneAndDelete({ _id: id, userId });
};

module.exports = {
  getAllGoals,
  createGoal,
  updateGoal,
  deleteGoal,
};
