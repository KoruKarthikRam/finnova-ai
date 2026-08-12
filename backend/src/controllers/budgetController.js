const budgetService = require("../services/budgetService");

const getBudgets = async (req, res) => {
  try {
    const current = new Date();
    const month = req.query.month ? parseInt(req.query.month) : current.getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year) : current.getFullYear();

    const budgets = await budgetService.getBudgets(req.user.id, month, year);

    res.json({
      success: true,
      data: budgets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch budgets",
    });
  }
};

const setBudget = async (req, res) => {
  try {
    const { category, limit } = req.body;
    const current = new Date();
    const month = req.body.month ? parseInt(req.body.month) : current.getMonth() + 1;
    const year = req.body.year ? parseInt(req.body.year) : current.getFullYear();

    if (!category || limit === undefined) {
      return res.status(400).json({
        success: false,
        message: "Category and limit are required",
      });
    }

    if (isNaN(limit) || parseFloat(limit) < 0) {
      return res.status(400).json({
        success: false,
        message: "Limit must be a positive number",
      });
    }

    const budget = await budgetService.upsertBudget(
      req.user.id,
      category,
      parseFloat(limit),
      month,
      year
    );

    res.json({
      success: true,
      message: "Budget limit set successfully",
      data: budget,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const budget = await budgetService.deleteBudget(req.params.id, req.user.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    res.json({
      success: true,
      message: "Budget deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete budget",
    });
  }
};

module.exports = {
  getBudgets,
  setBudget,
  deleteBudget,
};
