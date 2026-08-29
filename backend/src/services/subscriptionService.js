const transactionService = require("./transactionService");
const { detectSubscriptions } = require("./aiService");

/**
 * Service to aggregate detected recurring subscriptions for a user.
 */
const getUserSubscriptions = async (userId) => {
  try {
    const transactions = await transactionService.getAllTransactions(userId);
    
    const formattedTransactions = transactions.map((t) => ({
      id: t._id.toString(),
      amount: t.amount,
      category: t.category,
      type: t.type,
      date: t.date.toISOString(),
      description: t.description || "",
    }));

    const result = await detectSubscriptions(formattedTransactions);
    return {
      success: true,
      subscriptions: result.subscriptions || [],
      totalMonthlyOverhead: result.total_monthly_overhead || 0.0,
      detectedCount: (result.subscriptions || []).length
    };
  } catch (error) {
    console.error("Error fetching user subscriptions:", error.message);
    throw error;
  }
};

module.exports = {
  getUserSubscriptions,
};
