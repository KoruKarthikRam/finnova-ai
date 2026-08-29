/**
 * Request payload validation and sanitization middleware for FinNova AI.
 */

const validateTransactionPayload = (req, res, next) => {
  const { amount, category, type, date } = req.body;

  if (amount === undefined || amount === null || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Amount must be a positive number greater than 0.",
    });
  }

  if (!category || typeof category !== "string" || !category.trim()) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Category is required and must be a valid text.",
    });
  }

  if (!type || (type !== "income" && type !== "expense")) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Type must be either 'income' or 'expense'.",
    });
  }

  if (date && isNaN(Date.parse(date))) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Invalid date format.",
    });
  }

  next();
};

const validateBudgetPayload = (req, res, next) => {
  const { category, limit, month, year } = req.body;

  if (!category || typeof category !== "string" || !category.trim()) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Category is required.",
    });
  }

  if (limit === undefined || limit === null || typeof limit !== "number" || limit <= 0) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Budget limit must be a positive number.",
    });
  }

  if (month && (typeof month !== "number" || month < 1 || month > 12)) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Month must be between 1 and 12.",
    });
  }

  if (year && (typeof year !== "number" || year < 2000 || year > 2100)) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Year must be a valid four-digit year.",
    });
  }

  next();
};

const validateGoalPayload = (req, res, next) => {
  const { name, targetAmount } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Goal name is required.",
    });
  }

  if (targetAmount === undefined || targetAmount === null || typeof targetAmount !== "number" || targetAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Target amount must be a positive number.",
    });
  }

  next();
};

const validateAuthPayload = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Please provide a valid email address.",
    });
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Password must be at least 6 characters long.",
    });
  }

  next();
};

module.exports = {
  validateTransactionPayload,
  validateBudgetPayload,
  validateGoalPayload,
  validateAuthPayload,
};
