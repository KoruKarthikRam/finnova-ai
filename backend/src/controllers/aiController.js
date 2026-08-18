const { checkAiServiceHealth, classifyDescription, detectAnomalies } = require("../services/aiService");
const transactionService = require("../services/transactionService");

const testAiServiceConnection = async (req, res) => {
  const result = await checkAiServiceHealth();
  if (result.status === "healthy") {
    return res.json({
      success: true,
      message: "Connection to Python FastAPI microservice successful!",
      data: result,
    });
  } else {
    return res.status(503).json({
      success: false,
      message: "Could not connect to Python FastAPI microservice.",
      error: result.error || "Unknown error",
    });
  }
};

const classifyTransaction = async (req, res) => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({
      success: false,
      message: "Description is required",
    });
  }

  try {
    const result = await classifyDescription(description);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to classify transaction description",
      error: error.message,
    });
  }
};

const getTransactionAnomalies = async (req, res) => {
  try {
    const transactions = await transactionService.getAllTransactions(req.user.id);
    
    const formattedTransactions = transactions.map((t) => ({
      id: t._id.toString(),
      amount: t.amount,
      category: t.category,
      type: t.type,
      date: t.date.toISOString(),
      description: t.description || "",
    }));

    const result = await detectAnomalies(formattedTransactions);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to detect transaction anomalies",
      error: error.message,
    });
  }
};

module.exports = {
  testAiServiceConnection,
  classifyTransaction,
  getTransactionAnomalies,
};
