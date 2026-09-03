const { checkAiServiceHealth, classifyDescription, detectAnomalies, getForecast, searchKnowledge } = require("../services/aiService");
const transactionService = require("../services/transactionService");
const { generateChatResponse, generateInsights } = require("../services/geminiService");
const budgetService = require("../services/budgetService");
const healthService = require("../services/healthService");

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

const fallbackClassify = (description) => {
  const text = (description || "").toLowerCase();

  const rules = [
    { category: "Food", words: ["food", "lunch", "dinner", "breakfast", "burger", "pizza", "restaurant", "cafe", "chai", "tea", "coffee", "swiggy", "zomato", "dominos", "mcdonalds", "kfc", "starbucks", "subway", "grocery", "groceries", "blinkit", "zepto", "instamart", "dhaba", "snack", "snacks", "eating", "biryani", "cake", "bakery", "meal"] },
    { category: "Transport", words: ["uber", "ola", "cab", "petrol", "fuel", "diesel", "metro", "bus", "train", "flight", "taxi", "rapido", "toll", "parking", "auto", "rickshaw", "irctc"] },
    { category: "Rent", words: ["rent", "landlord", "flat", "pg", "apartment", "brokerage", "maintenance"] },
    { category: "Shopping", words: ["amazon", "flipkart", "myntra", "ajio", "zara", "h&m", "decathlon", "clothes", "clothing", "shoes", "sneakers", "shopping", "dress", "jacket", "nykaa"] },
    { category: "Bills", words: ["electricity", "bill", "bills", "water", "gas", "recharge", "wifi", "broadband", "jio", "airtel", "dth", "tata play", "utility", "postpaid", "prepaid"] },
    { category: "Entertainment", words: ["netflix", "spotify", "movie", "cinema", "pvr", "bookmyshow", "hotstar", "steam", "gaming", "youtube", "playstation", "concert"] },
    { category: "Healthcare", words: ["doctor", "medicine", "medicines", "pharmacy", "hospital", "clinic", "health", "apollo", "medplus", "dentist", "prescription", "lab"] },
    { category: "Education", words: ["course", "udemy", "coursera", "school", "college", "tuition", "book", "books", "stationery", "exam", "fee", "fees"] },
    { category: "Salary", words: ["salary", "paycheck", "stipend", "wage", "wages", "payroll", "income"] },
    { category: "Investment", words: ["investment", "stock", "stocks", "crypto", "dividend", "interest", "returns", "mutual fund"] },
    { category: "Gift", words: ["gift", "present", "reward"] },
    { category: "Refund", words: ["refund", "reimbursement", "return"] }
  ];

  for (const item of rules) {
    if (item.words.some((w) => text.includes(w))) {
      return item.category;
    }
  }

  return "Others";
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
    console.warn("AI Microservice unreachable for classify. Using fallback classifier:", error.message);
    const category = fallbackClassify(description);
    return res.json({
      success: true,
      category,
      confidence: 0.85,
      fallback: true
    });
  }
};

const getTransactionAnomalies = async (req, res) => {
  try {
    const transactions = await transactionService.getAllTransactions(req.user.id);
    
    const formattedTransactions = (transactions || []).map((t) => ({
      id: t._id ? t._id.toString() : "",
      amount: t.amount || 0,
      category: t.category || "Uncategorized",
      type: t.type || "expense",
      date: t.date ? new Date(t.date).toISOString() : new Date().toISOString(),
      description: t.description || "",
    }));

    try {
      const result = await detectAnomalies(formattedTransactions);
      return res.json(result);
    } catch (aiErr) {
      console.warn("AI Microservice unreachable for anomalies. Returning empty fallback:", aiErr.message);
      return res.json({
        success: true,
        anomalies: [],
        count: 0,
        message: "AI microservice offline. No anomalies detected."
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to detect transaction anomalies",
      error: error.message,
    });
  }
};

const getTransactionForecast = async (req, res) => {
  try {
    const transactions = await transactionService.getAllTransactions(req.user.id);
    
    const formattedTransactions = (transactions || []).map((t) => ({
      id: t._id ? t._id.toString() : "",
      amount: t.amount || 0,
      category: t.category || "Uncategorized",
      type: t.type || "expense",
      date: t.date ? new Date(t.date).toISOString() : new Date().toISOString(),
      description: t.description || "",
    }));

    try {
      const result = await getForecast(formattedTransactions);
      return res.json(result);
    } catch (aiErr) {
      console.warn("AI Microservice unreachable for forecast. Returning default fallback:", aiErr.message);
      return res.json({
        success: true,
        forecast: {
          predicted_expense: 0,
          confidence: "low",
          message: "AI microservice offline."
        }
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get transaction forecast",
      error: error.message,
    });
  }
};

const chatWithAssistant = async (req, res) => {
  const { message, history, useContext } = req.body;
  if (!message) {
    return res.status(400).json({
      success: false,
      message: "Message is required",
    });
  }

  try {
    const current = new Date();
    const currentMonth = current.getMonth() + 1;
    const currentYear = current.getFullYear();
    const userId = req.user.id;

    // Execute context queries & RAG search in PARALLEL for maximum speed
    const [txResult, budgetResult, healthResult, ragResult] = await Promise.allSettled([
      useContext ? transactionService.getAllTransactions(userId) : Promise.resolve([]),
      useContext ? budgetService.getBudgets(userId, currentMonth, currentYear) : Promise.resolve([]),
      useContext ? healthService.calculateHealthScore(userId) : Promise.resolve(null),
      searchKnowledge(message)
    ]);

    let userContext = null;
    if (useContext) {
      const transactions = txResult.status === "fulfilled" && Array.isArray(txResult.value) ? txResult.value : [];
      const budgets = budgetResult.status === "fulfilled" && Array.isArray(budgetResult.value) ? budgetResult.value : [];
      const healthData = healthResult.status === "fulfilled" ? healthResult.value : null;

      const currentMonthTransactions = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
      });

      const totalIncome = currentMonthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, item) => sum + item.amount, 0);

      const totalExpenses = currentMonthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, item) => sum + item.amount, 0);

      userContext = {
        balance: totalIncome - totalExpenses,
        totalIncome,
        totalExpenses,
        budgets: budgets.map((b) => ({ category: b.category, limit: b.limit })),
        healthScore: healthData ? healthData.score : null
      };
    }

    let ragContext = null;
    if (ragResult.status === "fulfilled" && ragResult.value?.success && ragResult.value?.matches) {
      ragContext = ragResult.value.matches;
    }

    const response = await generateChatResponse(message, history, userContext, ragContext);
    return res.json({
      success: true,
      ...response
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate chat response",
      error: error.message,
    });
  }
};

// Simple in-memory cache for AI insights (5-minute TTL per user)
const insightsCache = new Map();
const INSIGHTS_TTL_MS = 5 * 60 * 1000;

const getAiInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const cached = insightsCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      return res.json({
        success: true,
        cached: true,
        ...cached.data
      });
    }

    const current = new Date();
    const currentMonth = current.getMonth() + 1;
    const currentYear = current.getFullYear();

    // 1. Fetch transactions, budgets, and health score in PARALLEL
    const [transactions, budgets, healthResult] = await Promise.all([
      transactionService.getAllTransactions(userId),
      budgetService.getBudgets(userId, currentMonth, currentYear),
      healthService.calculateHealthScore(userId)
    ]);
    
    // Calculate current month's income, expenses, balance
    const currentMonthTransactions = (transactions || []).filter(t => {
      const d = new Date(t.date);
      return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
    });

    const totalIncome = currentMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);

    const totalExpenses = currentMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);

    const balance = totalIncome - totalExpenses;

    const formattedTransactions = (transactions || []).map((t) => ({
      id: t._id ? t._id.toString() : "",
      amount: t.amount || 0,
      category: t.category || "Others",
      type: t.type || "expense",
      date: t.date ? new Date(t.date).toISOString() : new Date().toISOString(),
      description: t.description || "",
    }));

    // 2. Fetch anomalies & forecast in PARALLEL using Promise.allSettled
    let anomalies = [];
    let forecast = null;

    const [anomalyResult, forecastResult] = await Promise.allSettled([
      detectAnomalies(formattedTransactions),
      getForecast(formattedTransactions)
    ]);

    if (anomalyResult.status === "fulfilled" && anomalyResult.value?.success) {
      anomalies = anomalyResult.value.anomalies || [];
    }
    if (forecastResult.status === "fulfilled" && forecastResult.value?.success) {
      forecast = forecastResult.value.forecast || null;
    }

    const userContext = {
      balance,
      totalIncome,
      totalExpenses,
      healthScore: healthResult ? healthResult.score : null,
      healthGrade: healthResult ? healthResult.grade : null,
      budgets: (budgets || []).map(b => ({ category: b.category, limit: b.limit })),
      anomalies: anomalies.slice(0, 3).map(a => ({ amount: a.amount, category: a.category, reason: a.reason })),
      forecast
    };

    const response = await generateInsights(userContext);
    
    // Cache the response
    insightsCache.set(userId, {
      data: response,
      expiresAt: Date.now() + INSIGHTS_TTL_MS
    });

    return res.json({
      success: true,
      ...response
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate financial insights",
      error: error.message,
    });
  }
};

module.exports = {
  testAiServiceConnection,
  classifyTransaction,
  getTransactionAnomalies,
  getTransactionForecast,
  chatWithAssistant,
  getAiInsights,
};

