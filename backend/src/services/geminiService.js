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
const getModel = (modelName = "gemini-1.5-flash") => {
  if (!genAI) {
    const isInitialized = initGemini();
    if (!isInitialized) return null;
  }
  
  // Define enriched system instructions for FinNova AI
  const systemInstruction = 
    `You are FinNova AI Assistant, an elite, highly descriptive, friendly, and comprehensive personal finance tutor and financial advisor. ` +
    `Your mission is to provide thorough, in-depth, structured, and actionable financial education and advice. \n\n` +
    `CRITICAL RESPONSE REQUIREMENTS & FORMATTING RULES:\n` +
    `1. ANSWER LENGTH & DEPTH: Provide rich, multi-paragraph, detailed explanations. Never give brief 1-line or vague responses. Fully unpack complex topics with foundational concepts, step-by-step methodologies, real-world examples, and long-term implications.\n` +
    `2. CURRENCY & REGION: Use Indian Rupees (₹) for all currency figures, examples, tax slabs, and math calculations.\n` +
    `3. STRUCTURED MARKDOWN: Format every response cleanly using markdown headers (## and ###), bullet points, numbered lists, bold text for key terms, blockquotes for important callouts, and markdown tables where comparing options (e.g., Old vs New Tax Regime, Equity vs Debt Mutual Funds, SIP vs Lump Sum).\n` +
    `4. STEP-BY-STEP ACTIONABLE PLAN: Conclude educational answers or financial advice with a clear, numbered "Step-by-Step Action Plan" that the user can immediately implement.\n` +
    `5. CONCRETE EXAMPLES & MATHEMATICAL BREAKDOWNS: When explaining concepts like SIP compounding, 50/30/20 rule, emergency funds, or tax savings, include practical numerical breakdowns (e.g., "If you invest ₹5,000/month at 12% p.a. for 10 years...").\n` +
    `6. PERSONALIZED FINANCIAL CONTEXT ANALYSIS: Whenever user financial context (Account Balance, Monthly Income/Expenses, Financial Health Score, Category Spending, Budgets, Recent Transactions) is present in the prompt:\n` +
    `   - Ground your analysis directly in their exact figures.\n` +
    `   - Compare their actual spending ratios to financial benchmarks (e.g. 50/30/20 rule, 30% savings rate target).\n` +
    `   - Highlight specific category budget risks or savings opportunities.\n` +
    `   - Provide tailored advice based on their current Health Score.\n` +
    `7. SCOPE & SAFETY: Cover personal finance, budgeting, tax planning (Old/New Regime, 80C/80D), emergency reserves, debt management (CIBIL, EMIs), mutual funds, SIPs, and retirement (EPF, NPS, PPF). Do NOT provide specific stock tips or definitive legal/tax filing guarantees. Encourage consulting certified financial planners or tax experts for official filings. Decline topics completely unrelated to finance or personal growth politely.`;

  const candidateModels = [modelName, "gemini-1.5-flash", "gemini-2.5-flash", "gemini-1.5-pro"];
  const uniqueCandidates = [...new Set(candidateModels)];

  for (const name of uniqueCandidates) {
    try {
      const model = genAI.getGenerativeModel({
        model: name,
        systemInstruction: systemInstruction,
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.5,
          topP: 0.9,
        }
      });
      if (model) return model;
    } catch (e) {
      console.warn(`Could not load model ${name}:`, e.message);
    }
  }
  return null;
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

    // Format and sanitize history for Google Generative AI
    // Structure expected: { role: 'user' | 'model', parts: [{ text: string }] }
    // Gemini SDK requires history to start with 'user' and alternate 'user' -> 'model'
    const formattedHistory = [];
    if (Array.isArray(history) && history.length > 0) {
      // Ignore leading assistant messages before the first user message
      const firstUserIdx = history.findIndex(h => h.role === "user");
      const validTurns = firstUserIdx !== -1 ? history.slice(firstUserIdx) : [];

      let expectedRole = "user"; // First turn in Gemini history MUST be 'user'
      for (const turn of validTurns) {
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

      // Gemini history MUST end with 'model' so chat.sendMessage(finalPrompt) can send the next 'user' turn.
      if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === "user") {
        formattedHistory.pop();
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
        ? userContext.budgets.map(b => `${b.category}: limit ₹${b.limit} (Spent: ₹${b.spent || 0})`).join(", ")
        : "None";

      const categoryTotalsStr = userContext.categoryTotals && Object.keys(userContext.categoryTotals).length > 0
        ? Object.entries(userContext.categoryTotals).map(([cat, val]) => `${cat}: ₹${val}`).join(", ")
        : "No expense transactions logged yet";

      const recentTxStr = Array.isArray(userContext.recentTransactions) && userContext.recentTransactions.length > 0
        ? userContext.recentTransactions.map(t => `- ${t.date.split("T")[0]}: ${t.description || t.category} (₹${t.amount}, ${t.type})`).join("\n")
        : "No recent transactions";

      finalPrompt += `[USER FINANCIAL CONTEXT]\n` +
        `- Account Balance: ₹${userContext.balance || 0}\n` +
        `- Total Income this month: ₹${userContext.totalIncome || 0}\n` +
        `- Total Expenses this month: ₹${userContext.totalExpenses || 0}\n` +
        `- Financial Health Score: ${userContext.healthScore || "N/A"}/100\n` +
        `- Monthly Spending by Category: ${categoryTotalsStr}\n` +
        `- Active Budgets: ${activeBudgetsStr}\n` +
        `- Recent Transactions:\n${recentTxStr}\n` +
        `[END OF CONTEXT]\n\n`;
    }

    if (finalPrompt) {
      finalPrompt += `User Message: ${message}`;
    } else {
      finalPrompt = message;
    }

    try {
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
    } catch (chatErr) {
      console.warn("Gemini startChat/sendMessage error, falling back to single-turn generateContent:", chatErr.message);
      const singleResult = await model.generateContent(finalPrompt);
      const singleResponse = await singleResult.response;
      const text = singleResponse.text();

      return {
        text: text,
        isMock: false
      };
    }
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

