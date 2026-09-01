const goalService = require("../services/goalService");
const cacheService = require("../services/cacheService");

const getGoals = async (req, res) => {
  try {
    const goals = await goalService.getAllGoals(req.user.id);
    res.json({
      success: true,
      data: goals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch savings goals",
    });
  }
};

const createGoal = async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, deadline } = req.body;

    if (!name || targetAmount === undefined || !deadline) {
      return res.status(400).json({
        success: false,
        message: "Goal name, target amount, and deadline are required",
      });
    }

    if (isNaN(targetAmount) || parseFloat(targetAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Target amount must be a positive number",
      });
    }

    if (currentAmount !== undefined && (isNaN(currentAmount) || parseFloat(currentAmount) < 0)) {
      return res.status(400).json({
        success: false,
        message: "Current amount cannot be negative",
      });
    }

    const goal = await goalService.createGoal(req.user.id, {
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
      deadline,
    });

    cacheService.invalidateUserDashboardCache(req.user.id);

    res.status(201).json({
      success: true,
      message: "Savings goal created successfully",
      data: goal,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateGoal = async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, deadline, status } = req.body;
    const goalData = {};

    if (name !== undefined) goalData.name = name;
    if (targetAmount !== undefined) goalData.targetAmount = parseFloat(targetAmount);
    if (currentAmount !== undefined) goalData.currentAmount = parseFloat(currentAmount);
    if (deadline !== undefined) goalData.deadline = deadline;
    if (status !== undefined) goalData.status = status;

    const goal = await goalService.updateGoal(req.params.id, req.user.id, goalData);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Savings goal not found",
      });
    }

    cacheService.invalidateUserDashboardCache(req.user.id);

    res.json({
      success: true,
      message: "Savings goal updated successfully",
      data: goal,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const goal = await goalService.deleteGoal(req.params.id, req.user.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Savings goal not found",
      });
    }

    cacheService.invalidateUserDashboardCache(req.user.id);

    res.json({
      success: true,
      message: "Savings goal deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete savings goal",
    });
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
};
