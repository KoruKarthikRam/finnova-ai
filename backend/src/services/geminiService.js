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
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction,
    });
  } catch (error) {
    console.error("Error fetching generative model:", error.message);
    try {
      return genAI.getGenerativeModel({
        model: "gemini-pro",
        systemInstruction: systemInstruction,
      });
    } catch (fallbackErr) {
      return null;
    }
  }
};

/**
 * Generates advice from Gemini API, supporting conversation history and user financial context.
 */
const generateChatResponse = async (message, history = [], userContext = null, ragContext = null) => {
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

    // Inject user context and RAG context if available
    let finalPrompt = "";
    if (ragContext && Array.isArray(ragContext) && ragContext.length > 0) {
      finalPrompt += `[KNOWLEDGE BASE CONTEXT]\n`;
      ragContext.forEach((match) => {
        finalPrompt += `Source document: ${match.source}\nContent excerpt:\n${match.text}\n---\n`;
      });
      finalPrompt += `[END OF KNOWLEDGE BASE CONTEXT]\n\n`;
    }

    if (userContext) {
      const activeBudgetsStr = Array.isArray(userContext.budgets) && userContext.budgets.length > 0
        ? userContext.budgets.map(b => `${b.category}: limit ₹${b.limit}`).join(", ")
        : "None";

      finalPrompt += `[USER FINANCIAL CONTEXT]\n` +
        `- Current Account Balance: ₹${userContext.balance || 0}\n` +
        `- Total Income this month: ₹${userContext.totalIncome || 0}\n` +
        `- Total Expenses this month: ₹${userContext.totalExpenses || 0}\n` +
        `- Active Budgets: ${activeBudgetsStr}\n` +
        `- Financial Health Score: ${userContext.healthScore || "N/A"}/100\n` +
        `[END OF CONTEXT]\n\n`;
    }

    if (finalPrompt) {
      finalPrompt += `User Message: ${message}`;
    } else {
      finalPrompt = message;
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
    return {
      text: "I experienced a connection issue while reaching the AI model. Please verify your `GEMINI_API_KEY` in `backend/.env` or try again.",
      isMock: true,
      error: error.message
    };
  }
};

/**
 * Generates personalized natural-language recommendations (insights) using Gemini API.
 */
const generateInsights = async (userContext) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here" || !apiKey.trim()) {
    return {
      insights: [
        "Please configure your `GEMINI_API_KEY` in the backend `.env` file to unlock dynamic AI-generated insights.",
        `Your current balance is ₹${userContext.balance.toLocaleString('en-IN')}. Set category budgets on the Budgets page to keep track of wants vs essentials.`,
        "Try to maintain a savings rate above 30% to improve your financial health score grade."
      ],
      isMock: true
    };
  }

  try {
    const model = getModel();
    if (!model) {
      throw new Error("Failed to initialize Gemini model");
    }

    const prompt = 
      `You are FinNova AI Advisor. Analyze the user's financial context below and generate exactly 3-4 bulleted personalized financial recommendations/insights. ` +
      `Focus on: \n` +
      `- Actionable tips to improve their current Financial Health Score \n` +
      `- Warning them about category budgets they are close to exceeding or have exceeded \n` +
      `- Advising on detected anomalies or high spending categories \n` +
      `- Suggesting steps to meet savings goals or adjust spending based on the next month's forecast. \n\n` +
      `Rules: \n` +
      `1. Use Indian Rupees (₹) for all examples, numbers, and calculations. \n` +
      `2. Keep the recommendations brief, constructive, encouraging, and highly specific to their actual numbers. \n` +
      `3. Return the response as a valid JSON array of strings ONLY. Example format: \n` +
      `["Insight 1 text here", "Insight 2 text here", "Insight 3 text here"] \n` +
      `Do NOT include any markdown code blocks (like \`\`\`json) or extra text outside the JSON array. Output raw JSON. \n\n` +
      `[USER FINANCIAL CONTEXT] \n` +
      `- Account Balance: ₹${userContext.balance} \n` +
      `- Total Income: ₹${userContext.totalIncome} \n` +
      `- Total Expenses: ₹${userContext.totalExpenses} \n` +
      `- Financial Health Score: ${userContext.healthScore || "N/A"}/100 (Grade: ${userContext.healthGrade || "N/A"}) \n` +
      `- Budgets Set: ${JSON.stringify(userContext.budgets)} \n` +
      `- Anomalies Detected: ${JSON.stringify(userContext.anomalies)} \n` +
      `- Next Month Forecast: ${JSON.stringify(userContext.forecast)} \n` +
      `[END OF CONTEXT]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Clean up any markdown blocks if the model wraps them anyway
    const cleanText = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    let insightsArray = [];
    try {
      const parsed = JSON.parse(cleanText);
      insightsArray = Array.isArray(parsed) ? parsed : [parsed];
    } catch (parseErr) {
      // If LLM returned bullet points text instead of JSON array
      insightsArray = text.split("\n").map(s => s.replace(/^[-*•\d.]+\s*/, "").trim()).filter(Boolean);
    }

    // Ensure every element is a plain string
    const stringInsights = insightsArray.map(item => {
      if (typeof item === "string") return item;
      if (typeof item === "object" && item !== null) {
        return item.text || item.insight || item.description || item.message || item.advice || item.title || JSON.stringify(item);
      }
      return String(item || "");
    }).filter(Boolean);

    return {
      insights: stringInsights.length > 0 ? stringInsights : ["Keep tracking your daily spending to optimize your savings."],
      isMock: false
    };
  } catch (error) {
    console.error("Error generating insights from Gemini:", error.message);
    // Fallback to rules-based insights if LLM fails
    const mockInsights = [
      `Your current balance is ₹${(userContext.balance || 0).toLocaleString('en-IN')}. Keep tracking your daily transactions.`,
    ];
    if (userContext.healthScore !== null && userContext.healthScore < 60) {
      mockInsights.push("Your financial health score is under 60. We recommend scaling back on non-essential spending (Wants) to improve budget adherence.");
    } else {
      mockInsights.push("Excellent work maintaining a stable financial health score. Consider allocating excess savings toward active goals.");
    }
    if (Array.isArray(userContext.budgets) && userContext.budgets.length > 0) {
      mockInsights.push("Review your active category budgets on the Dashboard to verify you are staying within limits.");
    } else {
      mockInsights.push("Create a category budget on the Budgets page to start analyzing your spending limits.");
    }
    return {
      insights: mockInsights,
      isMock: true,
      error: error.message
    };
  }
};

module.exports = {
  generateChatResponse,
  generateInsights
};

