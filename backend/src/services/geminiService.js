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

/**
 * Generates an AI-powered financial quiz for a specific topic & difficulty.
 */
const generateQuiz = async (topic = "Budgeting", difficulty = "Beginner") => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  // Fallback quiz generator function if LLM is unavailable
  const getFallbackQuiz = (topicName) => {
    const fallbacks = {
      Budgeting: [
        {
          id: 1,
          question: "Under the popular 50/30/20 rule, what percentage of your income should be allocated to essential 'Needs'?",
          options: ["20%", "30%", "50%", "70%"],
          correctAnswer: 2,
          explanation: "The 50/30/20 rule recommends spending 50% of your net income on essential needs like rent, groceries, and utilities."
        },
        {
          id: 2,
          question: "Which of the following is considered a 'Want' in personal budgeting?",
          options: ["House Rent", "Electricity Bill", "OTT Video Subscription", "Health Insurance"],
          correctAnswer: 2,
          explanation: "OTT subscriptions (like Netflix or Hotstar) are lifestyle choices, classifying them as 'Wants'."
        },
        {
          id: 3,
          question: "What is Zero-Based Budgeting?",
          options: [
            "Having ₹0 in your bank account at the end of the month",
            "Assigning every Rupee of your income a specific job until Income minus Expenses equals Zero",
            "Not spending any money on weekends",
            "A budget method with 0% tax deductions"
          ],
          correctAnswer: 1,
          explanation: "Zero-based budgeting assigns every single rupee of income to expenses, savings, or investments so remaining unallocated funds equal zero."
        },
        {
          id: 4,
          question: "Why should you automate your savings on payday rather than saving at the end of the month?",
          options: [
            "Banks charge extra fees if you save late",
            "Payday automation enforces 'Pay Yourself First' before impulse spending occurs",
            "Interest rates drop at the end of the month",
            "It is required by Indian income tax laws"
          ],
          correctAnswer: 1,
          explanation: "Automating savings on payday ensures you save before impulse lifestyle spending takes away your surplus."
        },
        {
          id: 5,
          question: "If your monthly income is ₹60,000, how much should be directed to Savings under 50/30/20?",
          options: ["₹6,000", "₹12,000", "₹18,000", "₹30,000"],
          correctAnswer: 1,
          explanation: "20% of ₹60,000 equals ₹12,000 allocated for investments and emergency reserves."
        }
      ],
      Taxes: [
        {
          id: 1,
          question: "What is the maximum annual tax deduction limit available under Section 80C in India?",
          options: ["₹1,00,000", "₹1,50,000", "₹2,00,000", "₹2,50,000"],
          correctAnswer: 1,
          explanation: "Section 80C allows taxpayers to claim up to ₹1,50,000 in total deductions per financial year."
        },
        {
          id: 2,
          question: "Which Section 80C investment option offers the shortest lock-in period of 3 years?",
          options: ["Public Provident Fund (PPF)", "ELSS Mutual Funds", "Tax Saver Fixed Deposit", "National Savings Certificate"],
          correctAnswer: 1,
          explanation: "ELSS (Equity Linked Savings Scheme) mutual funds have a 3-year lock-in, the shortest among all Section 80C options."
        },
        {
          id: 3,
          question: "Under the New Tax Regime, what is the default Standard Deduction allowed for salaried employees?",
          options: ["₹40,000", "₹50,000", "₹75,000", "₹1,00,000"],
          correctAnswer: 2,
          explanation: "As per recent Union Budget revisions, the New Tax Regime grants a flat standard deduction of ₹75,000."
        },
        {
          id: 4,
          question: "Section 80D of the Income Tax Act provides tax benefits for which of the following?",
          options: ["Home Loan Principal Repayment", "Health Insurance Premium", "Children Tuition Fees", "Electric Vehicle Loans"],
          correctAnswer: 1,
          explanation: "Section 80D allows tax deductions on medical insurance premiums paid for self, family, and parents."
        },
        {
          id: 5,
          question: "Under Section 10(13A), HRA tax exemption is calculated as the minimum of how many key criteria?",
          options: ["2 criteria", "3 criteria", "4 criteria", "5 criteria"],
          correctAnswer: 1,
          explanation: "HRA exemption is the minimum of: 1) Actual HRA received, 2) Rent paid minus 10% basic salary, 3) 50% (metro) or 40% (non-metro) basic salary."
        }
      ],
      Savings: [
        {
          id: 1,
          question: "How many months of essential living expenses should an emergency fund ideally cover for a salaried employee?",
          options: ["1 to 2 months", "3 to 6 months", "12 to 24 months", "5 years"],
          correctAnswer: 1,
          explanation: "Financial advisors recommend keeping 3 to 6 months of essential living expenses in liquid emergency accounts."
        },
        {
          id: 2,
          question: "What is the primary characteristic of an ideal emergency fund vehicle?",
          options: ["Maximum Stock Market Returns", "High Liquidity and Low Risk", "15-Year Mandatory Lock-In", "High Tax Deductions"],
          correctAnswer: 1,
          explanation: "Emergency funds must prioritize high liquidity (instant withdrawal capability) and capital safety over high market returns."
        },
        {
          id: 3,
          question: "What is the Rule of 72 used for in personal finance?",
          options: [
            "Calculating credit score limits",
            "Estimating the number of years required to double your money at a given interest rate",
            "Calculating monthly home loan EMIs",
            "Determining your retirement age"
          ],
          correctAnswer: 1,
          explanation: "Divide 72 by your annual interest rate to find roughly how many years it will take to double your investment."
        },
        {
          id: 4,
          question: "If an investment yields an annual return of 12%, approximately how many years will it take to double your money using the Rule of 72?",
          options: ["4 years", "6 years", "10 years", "12 years"],
          correctAnswer: 1,
          explanation: "72 divided by 12 = 6 years to double your investment."
        },
        {
          id: 5,
          question: "Why should you avoid keeping your entire long-term savings in a regular 3% savings bank account?",
          options: [
            "Banks charge penalties for keeping money",
            "Inflation (typically 5-6%) will erode your real purchasing power over time",
            "Savings accounts do not allow UPI payments",
            "It automatically gets locked after 1 year"
          ],
          correctAnswer: 1,
          explanation: "If inflation rate is 6% and savings account interest is 3%, your money loses 3% of real purchasing power annually."
        }
      ],
      Loans: [
        {
          id: 1,
          question: "In India, what CIBIL credit score range is generally considered 'Excellent' by major banks?",
          options: ["300 - 550", "550 - 650", "650 - 749", "750 - 900"],
          correctAnswer: 3,
          explanation: "A CIBIL score of 750 or above is considered excellent and qualifies borrowers for low interest rates."
        },
        {
          id: 2,
          question: "Which factor carries the highest weightage in calculating your CIBIL credit score?",
          options: ["Your age", "Repayment history (paying bills/EMIs on time)", "Number of bank accounts owned", "Debit card usage"],
          correctAnswer: 1,
          explanation: "On-time payment history accounts for ~35% of your total credit score calculation."
        },
        {
          id: 3,
          question: "What is Credit Utilization Ratio?",
          options: [
            "The percentage of your total available credit limit that you are currently spending",
            "The ratio of home loans to personal loans",
            "The time it takes to get a loan approved",
            "The interest rate charged on fixed loans"
          ],
          correctAnswer: 0,
          explanation: "Credit utilization ratio measures how much of your total credit card limits you spend each billing cycle."
        },
        {
          id: 4,
          question: "What happens when you select a Floating Interest Rate home loan?",
          options: [
            "Your interest rate remains fixed for 20 years",
            "Your interest rate changes periodically based on market benchmark rates like the RBI Repo Rate",
            "You don't have to pay EMIs during market drops",
            "Your loan tenure is fixed to 5 years"
          ],
          correctAnswer: 1,
          explanation: "Floating rates adjust according to central bank policy benchmark rate changes over the loan tenure."
        },
        {
          id: 5,
          question: "What does the Debt Snowball method prioritize when paying off multiple debts?",
          options: [
            "Paying off the loan with the highest interest rate first",
            "Paying off the smallest balance loan first to build psychological momentum",
            "Ignoring small debts and paying only home loans",
            "Converting all debts into credit card bills"
          ],
          correctAnswer: 1,
          explanation: "The Debt Snowball method targets paying off smallest debt balances first for quick psychological wins."
        }
      ],
      Investments: [
        {
          id: 1,
          question: "What does SIP stand for in mutual fund investing?",
          options: [
            "Systematic Investment Plan",
            "Secured Income Protection",
            "Standard Interest Portfolio",
            "Savings & Investment Partnership"
          ],
          correctAnswer: 0,
          explanation: "SIP stands for Systematic Investment Plan, allowing disciplined recurring investments in mutual funds."
        },
        {
          id: 2,
          question: "What is Rupee Cost Averaging in SIP investments?",
          options: [
            "Buying more units when market prices drop and fewer units when prices rise",
            "Converting Indian Rupees to US Dollars",
            "Getting a guaranteed 15% fixed return every month",
            "A tax exemption on stock dividends"
          ],
          correctAnswer: 0,
          explanation: "Fixed monthly SIP amounts buy more fund units when market prices crash, averaging out overall purchase costs."
        },
        {
          id: 3,
          question: "What is the primary difference between Equity Mutual Funds and Debt Mutual Funds?",
          options: [
            "Equity funds invest in company shares (higher growth/risk), while Debt funds invest in fixed-income bonds (stable/lower risk)",
            "Debt funds have a 15-year lock-in while equity funds have zero lock-in",
            "Equity funds are issued only by the RBI",
            "There is no difference"
          ],
          correctAnswer: 0,
          explanation: "Equity funds invest in corporate shares for long-term growth, whereas Debt funds invest in government & corporate bonds for income stability."
        },
        {
          id: 4,
          question: "What is an Index Fund?",
          options: [
            "A fund actively managed by a fund manager picking stocks daily",
            "A passive mutual fund that mirrors a specific market benchmark index like Nifty 50 or Sensex",
            "A fund that only buys real estate properties",
            "A government savings scheme with zero returns"
          ],
          correctAnswer: 1,
          explanation: "Index funds passively replicate benchmark market indices like Nifty 50 with low expense ratios."
        },
        {
          id: 5,
          question: "Why are Direct Plan mutual funds generally better than Regular Plan mutual funds?",
          options: [
            "Direct plans do not pay distributor commissions, resulting in a lower expense ratio and higher net returns",
            "Regular plans are illegal in India",
            "Direct plans guarantee 20% annual returns",
            "Regular plans carry no market risk"
          ],
          correctAnswer: 0,
          explanation: "Direct plans bypass third-party broker commissions, passing the savings on to investors through lower expense ratios."
        }
      ],
      Retirement: [
        {
          id: 1,
          question: "Under the FIRE movement framework, what is the '25x Rule' for retirement planning?",
          options: [
            "You should retire at age 25",
            "Your target retirement corpus should be at least 25 times your annual living expenses",
            "You should invest in 25 different stocks",
            "Your salary will double 25 times"
          ],
          correctAnswer: 1,
          explanation: "The 25x Rule suggests saving 25 times your annual expenses to achieve financial independence."
        },
        {
          id: 2,
          question: "What extra tax deduction is available exclusively for contributions to the National Pension System (NPS) under Section 80CCD(1B)?",
          options: ["₹10,000", "₹25,000", "₹50,000", "₹1,00,000"],
          correctAnswer: 2,
          explanation: "Section 80CCD(1B) provides an exclusive tax deduction of up to ₹50,000 over and above the ₹1.5L Section 80C limit."
        },
        {
          id: 3,
          question: "What is the standard Safe Withdrawal Rate (SWR) percentage used in long-term retirement planning?",
          options: ["4% per year", "12% per year", "25% per year", "50% per year"],
          correctAnswer: 0,
          explanation: "The 4% rule allows retirees to withdraw 4% of their initial portfolio annually (adjusted for inflation) without running out of money."
        },
        {
          id: 4,
          question: "What tax status does the Public Provident Fund (PPF) hold in India?",
          options: ["Fully Taxable", "Taxed on Maturity", "Exempt-Exempt-Exempt (EEE)", "Taxed at 30%"],
          correctAnswer: 2,
          explanation: "PPF enjoys EEE status: contribution is tax deductible, interest earned is tax-free, and maturity amount is 100% tax-free."
        },
        {
          id: 5,
          question: "In the Employees' Provident Fund (EPF), what percentage of a salaried employee's basic salary is deducted monthly for provident fund savings?",
          options: ["5%", "8%", "12%", "20%"],
          correctAnswer: 2,
          explanation: "Standard EPF contribution requires 12% of basic salary + DA from the employee, matched equally by the employer."
        }
      ]
    };

    return fallbacks[topicName] || fallbacks["Budgeting"];
  };

  if (!apiKey || apiKey === "your_gemini_api_key_here" || !apiKey.trim()) {
    return {
      quiz: getFallbackQuiz(topic),
      isMock: true
    };
  }

  try {
    const model = getModel();
    if (!model) {
      return { quiz: getFallbackQuiz(topic), isMock: true };
    }

    const prompt = 
      `You are FinNova AI Quiz Master. Generate a 5-question multiple choice quiz on the personal finance topic '${topic}' at '${difficulty}' level for Indian users. \n` +
      `Rules: \n` +
      `1. Format output ONLY as a valid JSON array of 5 objects. \n` +
      `2. Each object MUST contain these exact fields: \n` +
      `   - "id": number (1 to 5) \n` +
      `   - "question": string \n` +
      `   - "options": array of 4 strings \n` +
      `   - "correctAnswer": number (0-based index: 0, 1, 2, or 3 corresponding to the correct string in options) \n` +
      `   - "explanation": string (clear 1-2 sentence explanation of why the answer is correct with Indian financial context/₹ where relevant). \n` +
      `3. Do NOT include markdown blocks (\`\`\`json). Output raw clean JSON string ONLY. \n`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    const cleanText = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    const quizArray = JSON.parse(cleanText);

    if (Array.isArray(quizArray) && quizArray.length > 0) {
      return {
        quiz: quizArray,
        isMock: false
      };
    } else {
      return { quiz: getFallbackQuiz(topic), isMock: true };
    }
  } catch (error) {
    console.error("Error generating quiz from Gemini:", error.message);
    return {
      quiz: getFallbackQuiz(topic),
      isMock: true,
      error: error.message
    };
  }
};

module.exports = {
  generateChatResponse,
  generateInsights,
  generateQuiz
};

