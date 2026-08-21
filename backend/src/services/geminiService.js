const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = null;

/**
 * Initializes the Google Generative AI client.
 * Returns true if successful, false otherwise.
 */
const initGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    console.warn("WARNING: GEMINI_API_KEY is not configured in .env. AI chat will run in mock/graceful mode.");
    return false;
  }
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    return true;
  } catch (error) {
    console.error("Failed to initialize GoogleGenerativeAI:", error.message);
    return false;
  }
};

/**
 * Retrieves the Gemini model with system instructions pre-configured.
 */
const getModel = () => {
  if (!genAI) {
    const isInitialized = initGemini();
    if (!isInitialized) return null;
  }
  
  // Define strict system instructions for FinNova AI
  const systemInstruction = 
    `You are FinNova AI Assistant, a friendly, professional, and highly knowledgeable personal finance tutor and advisor. ` +
    `Your primary goal is to help users improve their financial literacy, manage their budgets, save money, learn about investing, and understand financial planning. ` +
    `Please adhere to the following rules: \n` +
    `1. Use Indian Rupees (₹) as the default currency for all examples, numbers, and calculations. \n` +
    `2. Provide educational explanations and general advice regarding budgeting, saving, mutual funds, SIPs, Indian tax laws (e.g., Old vs New Tax Regime, Section 80C deductions), emergency funds, and loans. \n` +
    `3. Do NOT make specific stock tips, day trading suggestions, or give definitive legal or tax filings advice. Advise consulting professional tax advisors where appropriate. \n` +
    `4. If the user asks questions that are completely unrelated to personal finance, budgeting, economics, career development, or financial goals, politely decline to answer and guide them back to financial topics. \n` +
    `5. Provide structured, readable answers using clear markdown headers, bold text, and lists where appropriate. \n` +
    `6. When user transaction data, budgets, or financial health summaries are provided, analyze them constructively to offer tailored budgeting suggestions. Keep suggestions encouraging and actionable.`;

  try {
    return genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: systemInstruction,
    });
  } catch (error) {
    console.error("Error fetching generative model:", error.message);
    return null;
  }
};

/**
 * Generates advice from Gemini API, supporting conversation history and user financial context.
 */
const generateChatResponse = async (message, history = [], userContext = null) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here" || !apiKey.trim()) {
    return {
      text: "I'm sorry, but my AI core is currently offline because the `GEMINI_API_KEY` is not set in the server configuration. Please configure it in the backend `.env` file to start chatting!",
      isMock: true
    };
  }

  try {
    const model = getModel();
    if (!model) {
      return {
        text: "I'm sorry, but I failed to connect to my AI model. Please verify your `GEMINI_API_KEY` or try again later.",
        isMock: true
      };
    }

    // Format history for Google Generative AI
    // Structure expected: { role: 'user' | 'model', parts: [{ text: string }] }
    const formattedHistory = [];
    if (Array.isArray(history)) {
      let expectedRole = "user"; // Start with user
      for (const turn of history) {
        let role = turn.role === "assistant" || turn.role === "model" ? "model" : "user";
        let text = "";
        
        if (turn.content) {
          text = turn.content;
        } else if (turn.parts) {
          text = typeof turn.parts === "string" ? turn.parts : (Array.isArray(turn.parts) && turn.parts[0]?.text) ? turn.parts[0].text : "";
        }
        
        if (!text) continue;

        if (role === expectedRole) {
          formattedHistory.push({
            role,
            parts: [{ text }]
          });
          expectedRole = expectedRole === "user" ? "model" : "user";
        }
      }
    }

    // Inject user context if available
    let finalPrompt = message;
    if (userContext) {
      const activeBudgetsStr = Array.isArray(userContext.budgets) && userContext.budgets.length > 0
        ? userContext.budgets.map(b => `${b.category}: limit ₹${b.limit}`).join(", ")
        : "None";

      const contextString = `[USER FINANCIAL CONTEXT]\n` +
        `- Current Account Balance: ₹${userContext.balance || 0}\n` +
        `- Total Income this month: ₹${userContext.totalIncome || 0}\n` +
        `- Total Expenses this month: ₹${userContext.totalExpenses || 0}\n` +
        `- Active Budgets: ${activeBudgetsStr}\n` +
        `- Financial Health Score: ${userContext.healthScore || "N/A"}/100\n` +
        `[END OF CONTEXT]\n\n` +
        `User Message: ${message}`;
      
      finalPrompt = contextString;
    }

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(finalPrompt);
    const response = await result.response;
    const text = response.text();

    return {
      text: text,
      isMock: false
    };
  } catch (error) {
    console.error("Error generating response from Gemini:", error.message);
    throw error;
  }
};

module.exports = {
  generateChatResponse
};
