const transactionService = require("./transactionService");
const { detectSubscriptions } = require("./aiService");

/**
 * Service to aggregate detected recurring subscriptions for a user.
 */
const fallbackDetectSubscriptions = (transactions) => {
  const subKeywords = [
    "netflix", "spotify", "prime", "hotstar", "youtube", "airtel", "jio", "fiber", 
    "broadband", "gym", "cult", "rent", "insurance", "cloud", "icloud", "apple", 
    "google one", "chatgpt", "medium", "newspaper", "subscription", "membership",
    "maintenance", "dth", "tata play", "electricity", "gas bill", "water tax"
  ];

  const expenses = (transactions || []).filter((t) => t.type === "expense");
  const grouped = {};

  expenses.forEach((t) => {
    const desc = (t.description || "").trim().toLowerCase();
    if (!desc) return;
    if (!grouped[desc]) grouped[desc] = [];
    grouped[desc].push(t);
  });

  const subscriptions = [];
  let totalMonthlyOverhead = 0.0;

  Object.keys(grouped).forEach((desc) => {
    const items = grouped[desc];
    const firstItem = items[0];
    const category = firstItem.category || "Others";
    const isSubKeyword = subKeywords.some((kw) => desc.includes(kw));
    const isRecurringCat = ["bills", "entertainment", "rent", "healthcare"].includes(category.toLowerCase());

    if (isSubKeyword || (items.length >= 2 && isRecurringCat)) {
      const totalAmt = items.reduce((sum, i) => sum + (i.amount || 0), 0);
      const avgAmount = totalAmt / items.length;
      
      const dates = items.map((i) => new Date(i.date)).filter((d) => !isNaN(d.getTime())).sort((a, b) => b - a);
      const lastDate = dates[0] || new Date();
      const nextDue = new Date(lastDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      subscriptions.push({
        title: firstItem.description || desc,
        category,
        amount: Math.round(avgAmount),
        frequency: "Monthly",
        occurrences: items.length,
        last_paid: lastDate.toISOString().split("T")[0],
        next_due: nextDue,
        confidence: isSubKeyword ? 0.95 : 0.8
      });
      totalMonthlyOverhead += avgAmount;
    }
  });

  return {
    subscriptions,
    totalMonthlyOverhead: Math.round(totalMonthlyOverhead)
  };
};

/**
 * Service to aggregate detected recurring subscriptions for a user.
 */
const getUserSubscriptions = async (userId) => {
  try {
    const transactions = await transactionService.getAllTransactions(userId);
    
    const formattedTransactions = (transactions || []).map((t) => ({
      id: t._id ? t._id.toString() : "",
      amount: t.amount || 0,
      category: t.category || "Others",
      type: t.type || "expense",
      date: t.date ? new Date(t.date).toISOString() : new Date().toISOString(),
      description: t.description || "",
    }));

    let subscriptions = [];
    let totalMonthlyOverhead = 0.0;

    try {
      const result = await detectSubscriptions(formattedTransactions);
      if (result && result.success && Array.isArray(result.subscriptions) && result.subscriptions.length > 0) {
        subscriptions = result.subscriptions;
        totalMonthlyOverhead = result.total_monthly_overhead || 0.0;
      }
    } catch (err) {
      console.warn("Python subscription service offline. Falling back to local subscription detector:", err.message);
    }

    // Fallback if AI service returned empty or is offline
    if (subscriptions.length === 0) {
      const fallbackResult = fallbackDetectSubscriptions(formattedTransactions);
      subscriptions = fallbackResult.subscriptions;
      totalMonthlyOverhead = fallbackResult.totalMonthlyOverhead;
    }

    return {
      success: true,
      subscriptions,
      totalMonthlyOverhead,
      detectedCount: subscriptions.length
    };
  } catch (error) {
    console.error("Error fetching user subscriptions:", error.message);
    throw error;
  }
};

module.exports = {
  getUserSubscriptions,
};
