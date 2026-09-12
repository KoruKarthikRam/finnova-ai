/**
 * Comprehensive Smart Fallback Financial Advisor.
 * Generates rich, multi-paragraph, structured financial advice and context breakdowns
 * when the Gemini API is unreachable or offline.
 */
const generateSmartFallbackResponse = (message, userContext = null) => {
  const query = (message || "").toLowerCase();

  // Helper to build rich user data citations block
  const buildUserDataCitationsBlock = (ctx) => {
    if (!ctx) return "";

    const balance = ctx.balance || 0;
    const totalIncome = ctx.totalIncome || 0;
    const totalExpenses = ctx.totalExpenses || 0;
    const healthScore = ctx.healthScore !== null ? ctx.healthScore : "N/A";

    const categoryBreakdown = ctx.categoryTotals && Object.keys(ctx.categoryTotals).length > 0
      ? Object.entries(ctx.categoryTotals).map(([cat, val]) => `- **${cat}**: ₹${val.toLocaleString('en-IN')}`).join("\n")
      : "- No categorized expense transactions logged yet this month.";

    const budgetStatus = Array.isArray(ctx.budgets) && ctx.budgets.length > 0
      ? ctx.budgets.map(b => `- **${b.category}**: Limit ₹${b.limit.toLocaleString('en-IN')} (Spent: ₹${(b.spent || 0).toLocaleString('en-IN')}) ${b.spent > b.limit ? "⚠️ **OVER BUDGET**" : ""}`).join("\n")
      : "- No active category budgets configured for this month.";

    const goalStatus = Array.isArray(ctx.goals) && ctx.goals.length > 0
      ? ctx.goals.map(g => `- **${g.title}**: ₹${(g.currentAmount || 0).toLocaleString('en-IN')} / ₹${(g.targetAmount || 0).toLocaleString('en-IN')} (${g.targetAmount > 0 ? Math.round(((g.currentAmount || 0) / g.targetAmount) * 100) : 0}% achieved)`).join("\n")
      : "- No active savings goals logged.";

    const subStatus = Array.isArray(ctx.subscriptions) && ctx.subscriptions.length > 0
      ? ctx.subscriptions.map(s => `- **${s.title}**: ₹${(s.amount || 0).toLocaleString('en-IN')}/${s.frequency || 'Monthly'} (${s.category})`).join("\n")
      : "- No recurring subscriptions detected.";

    const recentTx = Array.isArray(ctx.recentTransactions) && ctx.recentTransactions.length > 0
      ? ctx.recentTransactions.slice(0, 5).map(t => `- **${t.date ? t.date.split("T")[0] : "Recent"}**: ${t.description || t.category} — ₹${(t.amount || 0).toLocaleString('en-IN')} (${t.type})`).join("\n")
      : "- No recent transactions logged.";

    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)) : 0;

    return `\n\n---
### 👤 Citing Your Personal Financial Data & Real Examples

Here are concrete examples cited directly from your live account records:

#### 💵 Account Overview & Metrics
- **Current Net Balance**: ₹${balance.toLocaleString('en-IN')}
- **Total Income This Month**: ₹${totalIncome.toLocaleString('en-IN')}
- **Total Expenses This Month**: ₹${totalExpenses.toLocaleString('en-IN')}
- **Calculated Savings Rate**: **${savingsRate}%** (Benchmark: **≥ 30%**)
- **Financial Health Score**: **${healthScore}/100**

#### 🛍️ Your Monthly Category Spending
${categoryBreakdown}

#### 🎯 Active Budgets & Status
${budgetStatus}

#### 🎯 Active Savings Goals
${goalStatus}

#### 💳 Recurring Subscriptions
${subStatus}

#### 🧾 Recent Transaction Examples
${recentTx}
`;
  };

  const citationsBlock = buildUserDataCitationsBlock(userContext);

  // 1. Personalized Context Analysis
  if (userContext && (query.includes("spend") || query.includes("budget") || query.includes("health") || query.includes("balance") || query.includes("transaction") || query.includes("my") || query.includes("score") || query.includes("goal") || query.includes("subscription"))) {
    const balance = userContext.balance || 0;
    const totalIncome = userContext.totalIncome || 0;
    const totalExpenses = userContext.totalExpenses || 0;
    const healthScore = userContext.healthScore !== null ? userContext.healthScore : "N/A";
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)) : 0;

    return `## 📊 Comprehensive Analysis Grounded in Your Personal Data

Here is a detailed analysis citing your live financial transactions, category spending, budgets, and savings goals:

### 💵 Live Summary
- **Current Account Balance**: ₹${balance.toLocaleString('en-IN')}
- **Total Monthly Income**: ₹${totalIncome.toLocaleString('en-IN')}
- **Total Monthly Expenses**: ₹${totalExpenses.toLocaleString('en-IN')}
- **Current Savings Rate**: **${savingsRate}%** (Target benchmark: **≥ 30%**)
- **Financial Health Score**: **${healthScore}/100**
${citationsBlock}

### 💡 Personal Recommendations Citing Your Numbers
1. **Savings Rate Strategy**: ${savingsRate >= 30 ? `Great job! Your savings rate of **${savingsRate}%** meets the 30% benchmark. Route excess cash into equity SIPs.` : `Your current savings rate is **${savingsRate}%**, which is below the recommended 30% target. Review your non-essential spending to increase surplus.`}
2. **Category Budget Management**: Ensure high-spending categories remain strictly within your defined limits.
3. **Emergency Reserve**: Aim to maintain 3 to 6 months of essential living expenses (approx. ₹${(totalExpenses * 3).toLocaleString('en-IN')} to ₹${(totalExpenses * 6).toLocaleString('en-IN')}) in liquid savings.`;
  }

  // 1.5 Topic: Investing in Gold / Groww Direct Link
  if (query.includes("gold") || query.includes("groww") || query.includes("etf") || query.includes("sgb")) {
    return `## 🪙 Investing in Gold & Gold ETFs via Groww

Gold serves as a classic inflation hedge and portfolio stabilizer in Indian financial planning.

---

### 📊 Primary Options for Investing in Gold

| Investment Vehicle | Typical Returns | Expense Ratio / Fees | Tax Efficiency | Recommended Platform |
| :--- | :--- | :--- | :--- | :--- |
| **Gold ETFs (e.g. Gold BeES)** | Tracks 24K Spot Gold (~12-18% 1Y) | Low (~0.12% - 0.5%) | Capital Gains Tax | [Invest Gold ETFs on Groww](https://groww.in/etfs/nippon-india-etf-gold-bees) |
| **Digital Gold & Spot Gold** | Tracks Live Spot Price | 3% GST on Purchase | STCG / LTCG | [Buy Spot Gold on Groww](https://groww.in/gold) |
| **Sovereign Gold Bonds (SGB)** | Spot Rate + 2.5% p.a. Fixed Interest | Zero | **Tax-Free on Maturity** | [Invest SGBs on Groww](https://groww.in/sgb) |

---

### 💡 Key Benefits of Digital Gold & Gold ETFs
1. **Zero Storage & Security Costs**: Avoid locker charges and physical purity risks associated with jewelry.
2. **Fractional Buying**: Start investing from as little as **₹100** in Gold ETFs via SIP or one-time orders.
3. **High Liquidity**: Buy and sell instantly at live market spot rates during stock exchange hours.

---

### 🚀 Direct Groww Redirection
You can directly start your Gold SIP, buy Gold BeES ETF units, or apply for SGB bonds directly on Groww:

👉 [Click here to directly open Groww Gold Portal](https://groww.in/gold)`;
  }

  // 2. Topic: Budgeting / 50-30-20 Rule
  if (query.includes("budget") || query.includes("50/30/20") || query.includes("50-30-20") || query.includes("spend")) {
    return `## 📐 The 50/30/20 Budgeting Rule: Complete Guide

The **50/30/20 rule** is an intuitive financial framework designed to help you balance essential needs, lifestyle desires, and future wealth creation without micromanaging every rupee.

---

### 🧠 Core Component Breakdown

| Category | Ratio | Examples | Purpose |
| :--- | :--- | :--- | :--- |
| **Needs** | **50%** | Rent, groceries, electricity, water, health insurance, essential travel | Non-negotiable living expenses |
| **Wants** | **30%** | Dining out, OTT subscriptions, weekend trips, fashion, gadgets | Lifestyle & leisure choices |
| **Savings** | **20%** | Mutual Fund SIPs, Emergency Reserve, PPF, NPS, debt payoff | Building long-term wealth |

---

### 🔢 Concrete Numerical Example (₹60,000 Take-Home Pay)
- **Needs (50%)**: **₹30,000** reserved for rent, bills, groceries, and medical essentials.
- **Wants (30%)**: **₹18,000** allocated for leisure, shopping, and entertainment.
- **Savings (20%)**: **₹12,000** automatically routed on payday into equity SIPs and emergency funds.

---

### 🛠️ Step-by-Step Execution Plan
1. **Calculate Take-Home Pay**: Determine net monthly salary after PF tax deductions.
2. **Automate Savings First**: Set up auto-debits for your 20% savings on salary day before spending on wants.
3. **Audit Non-Essentials**: Use FinNova transaction tags to ensure wants stay strictly under 30%.`;
  }

  // 3. Topic: Taxes / Section 80C / 80D / Old vs New Regime
  if (query.includes("tax") || query.includes("80c") || query.includes("80d") || query.includes("regime")) {
    return `## 🏛️ Indian Income Tax Masterclass: Old vs New Tax Regime

Choosing the optimal tax regime is one of the fastest ways to maximize take-home income under Indian Tax Laws.

---

### ⚖️ Detailed Comparison Table

| Feature | Old Tax Regime | New Tax Regime |
| :--- | :--- | :--- |
| **Tax Rates** | Higher baseline slab rates | Lower, simplified slab rates |
| **Standard Deduction** | ₹50,000 | ₹75,000 |
| **Section 80C (ELSS, PPF, EPF)** | Claim up to **₹1,50,000** | Not available |
| **Section 80D (Health Insurance)** | Claim up to **₹25,000 - ₹50,000** | Not available |
| **HRA & Home Loan Interest** | Exemptions available | Not available |

---

### 💡 Section 80C Breakdown (Up to ₹1.5 Lakhs)
1. **ELSS Mutual Funds**: 3-year lock-in (shortest among all 80C instruments) with 12-15% historical returns.
2. **PPF (Public Provident Fund)**: 15-year sovereign guarantee, ~7.1% tax-free interest rate (EEE status).
3. **EPF (Employee Provident Fund)**: Mandatory salary deduction yielding ~8.25% return.

---

### 📝 Step-by-Step Tax Saving Strategy
1. **Calculate Total Deductions**: Add 80C (₹1.5L) + 80D (₹25k) + HRA + Home Loan Interest.
2. **Decision Benchmark**: If total deductions exceed **₹3.75 Lakhs**, the **Old Tax Regime** generally yields lower tax liability. Otherwise, choose the **New Tax Regime**.`;
  }

  // 4. Topic: SIP / Mutual Funds / Compounding / Investing
  if (query.includes("sip") || query.includes("mutual fund") || query.includes("invest") || query.includes("compound") || query.includes("stock")) {
    return `## 🚀 The Power of SIPs & Wealth Compounding

A **Systematic Investment Plan (SIP)** allows you to invest a fixed sum into mutual funds every month, harnessing **Rupee Cost Averaging** and **Compound Interest**.

---

### 📈 The Magic of Long-Term Compounding
If you invest **₹10,000/month** at an average return of **12% p.a.**:

- **After 10 Years**: Total Invested: ₹12 Lakhs | Portfolio Value: **₹23.2 Lakhs**
- **After 20 Years**: Total Invested: ₹24 Lakhs | Portfolio Value: **₹99.9 Lakhs**
- **After 30 Years**: Total Invested: ₹36 Lakhs | Portfolio Value: **₹3.53 Crores!**

---

### 🛡️ Recommended Fund Allocation Strategy
1. **Core Holdings (60%)**: Low-cost Nifty 50 Index Funds (expense ratio < 0.2%).
2. **Growth Holdings (30%)**: Flexi Cap or Large & Mid Cap Mutual Funds for multi-sector exposure.
3. **Stability Holdings (10%)**: Liquid Debt Funds for short-term goals.

---

### 🛠️ Step-by-Step Implementation
1. Set up a **Step-Up SIP** to automatically increase monthly investments by 10% each year as your salary increases.
2. Select **Direct Plans** (rather than Regular plans) to eliminate broker commissions and gain 1-1.5% extra compounding returns annually.`;
  }

  // 5. Topic: Emergency Reserve / Savings
  if (query.includes("emergency") || query.includes("cushion") || query.includes("sav")) {
    return `## 🛡️ Building a 6-Month Emergency Safety Cushion

An **emergency fund** is your financial seatbelt. It protects you against sudden job loss, unexpected medical expenses, or family emergencies without forcing you into high-interest debt or distress selling of mutual funds.

---

### 📐 How Much Do You Need?
- **Salaried Professionals**: **3 to 6 months** of essential living expenses.
- **Freelancers / Business Owners**: **6 to 12 months** of essential living expenses.

**Formula**:  
$$\\text{Target Fund} = \\text{Monthly Essential Expenses (Needs)} \\times 6$$

*Example: If essentials cost ₹35,000/month, your target safety reserve is **₹2,10,000**.*

---

### 🏦 Recommended Fund Parking Strategy
- **50% in High-Yield Savings Account**: Instant 24/7 access via UPI or debit card.
- **50% in Liquid Mutual Funds / Short FDs**: Low volatility with T+1 day instant redemption.

---

### 🛠️ Step-by-Step Action Plan
1. Calculate your exact monthly baseline living expenses (rent, groceries, bills, EMIs).
2. Open a separate high-liquidity bank account dedicated strictly to emergency funds.
3. Set up an automated monthly transfer until your target cushion is 100% funded.`;
  }

  // 6. Topic: Loans / CIBIL / Credit Score / EMI
  if (query.includes("cibil") || query.includes("credit") || query.includes("emi") || query.includes("loan")) {
    return `## 💳 Demystifying Credit (CIBIL) Scores & EMI Management

A high **CIBIL credit score (750+)** unlocks lower interest rates on home loans, personal loans, and credit cards, saving you lakhs in long-term interest payouts.

---

### 📊 Key Factors Influencing Your Credit Score

| Factor | Impact Weight | Strategic Recommendation |
| :--- | :--- | :--- |
| **Payment History** | **35%** | Never miss an EMI or credit card bill due date |
| **Credit Utilization** | **30%** | Keep card balance under 30% of total credit limit |
| **Credit History Length** | **15%** | Maintain old credit card accounts active |
| **Credit Mix** | **10%** | Balance secured (home/car) and unsecured credit |

---

### ⚖️ The 40% EMI Rule
Your total monthly EMIs across all loans should **never exceed 40%** of your take-home pay.

$$\\text{Maximum Monthly EMIs} = \\text{Monthly Take-Home Pay} \\times 0.40$$

---

### 🛠️ Step-by-Step Action Plan to Boost CIBIL Score
1. Enable **Auto-Debit** for all credit card bills and loan EMIs to avoid late fees.
2. If your credit limit is ₹1 Lakh, restrict monthly statement balances to under ₹30,000.
3. Check your free annual CIBIL report to dispute and correct any error entries.`;
  }

  // 7. General Comprehensive Personal Finance Guide (Default Fallback)
  return `## 🪙 FinNova Personal Finance & Literacy Roadmap

Welcome to FinNova AI Masterclass! Managing personal finances effectively requires a structured approach across budgeting, emergency reserves, tax optimization, and long-term compounding.

---

### 🗺️ The 4 Pillars of Financial Freedom

#### 1. Smart Budgeting (The 50/30/20 Rule)
- **50% Needs**: Housing rent, groceries, utility bills, essential transportation.
- **30% Wants**: Dining out, travel, shopping, OTT subscriptions.
- **20% Savings**: Automated mutual fund SIPs, debt repayment, emergency reserves.

#### 2. Emergency Seatbelt
- Maintain **3 to 6 months** of essential expenses liquidly accessible in a high-yield savings account or liquid mutual fund to protect against unforeseen events.

#### 3. Tax Optimization (Old vs New Tax Regime)
- Leverage **Section 80C** (ELSS, PPF, EPF up to ₹1.5 Lakhs) and **Section 80D** (Health Insurance up to ₹25,000 - ₹50,000) under the Old Tax Regime, or opt for lower rates under the New Tax Regime.

#### 4. Automated Wealth Compounding (SIPs)
- Invest consistently in low-cost **Nifty 50 Index Funds** and **Flexi Cap Mutual Funds** via monthly Systematic Investment Plans (SIPs) with an annual 10% Step-Up.

---

### 🛠️ Recommended Action Plan for Today
1. Check your **Financial Health Score** on your FinNova Dashboard.
2. Create category budget limits on the Budgets page to track wants vs essentials.
3. Set up an automated monthly SIP transfer on your salary day.`;
};

/**
 * Retrieves the Gemini model with system instructions pre-configured.
 */
const getModel = (modelName = "gemini-1.5-flash-latest") => {
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
    `6. PERSONALIZED FINANCIAL CONTEXT ANALYSIS & DATA CITATION:\n` +
    `   Whenever user financial context (Account Balance, Income, Expenses, Health Score, Category Spending, Budgets, Goals, Subscriptions, Recent Transactions) is present:\n` +
    `   - YOU MUST EXPLICITLY GROUND YOUR RESPONSE IN THEIR EXACT DATA AND CITE SPECIFIC EXAMPLES FROM THEIR TRANSACTIONS/BUDGETS/GOALS/SUBSCRIPTIONS.\n` +
    `   - Cite exact dates, descriptions, amounts, and category limits (e.g. "For example, in your recent transaction on [Date], you spent ₹[Amount] on [Description]...", or "Looking at your Food budget, you have spent ₹[Spent] out of ₹[Limit]...").\n` +
    `   - Compare their actual spending ratios to financial benchmarks (50/30/20 rule, 30% savings rate target).\n` +
    `   - Provide tailored advice connecting theoretical concepts directly to their personal numbers.\n` +
    `7. SCOPE & SAFETY: Cover personal finance, budgeting, tax planning (Old/New Regime, 80C/80D), emergency reserves, debt management (CIBIL, EMIs), mutual funds, SIPs, and retirement (EPF, NPS, PPF). Do NOT provide specific stock tips or definitive legal/tax filing guarantees. Encourage consulting certified financial planners or tax experts for official filings. Decline topics completely unrelated to finance or personal growth politely.`;

  const candidateModels = [modelName, "gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-1.5-pro-latest", "gemini-1.5-pro", "gemini-pro"];
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
    const fallbackText = generateSmartFallbackResponse(message, userContext);
    return {
      text: fallbackText,
      isMock: true
    };
  }

  try {
    const model = getModel();
    if (!model) {
      const fallbackText = generateSmartFallbackResponse(message, userContext);
      return {
        text: fallbackText,
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

      const goalsStr = Array.isArray(userContext.goals) && userContext.goals.length > 0
        ? userContext.goals.map(g => `${g.title}: ₹${g.currentAmount} / ₹${g.targetAmount} (${g.status})`).join(", ")
        : "None";

      const subsStr = Array.isArray(userContext.subscriptions) && userContext.subscriptions.length > 0
        ? userContext.subscriptions.map(s => `${s.title}: ₹${s.amount}/${s.frequency} (${s.category})`).join(", ")
        : "None";

      const recentTxStr = Array.isArray(userContext.recentTransactions) && userContext.recentTransactions.length > 0
        ? userContext.recentTransactions.map(t => `- ${t.date ? t.date.split("T")[0] : ""}: ${t.description || t.category} (₹${t.amount}, ${t.type})`).join("\n")
        : "No recent transactions";

      finalPrompt += `[USER FINANCIAL CONTEXT]\n` +
        `- Current Account Balance: ₹${userContext.balance || 0}\n` +
        `- Total Monthly Income: ₹${userContext.totalIncome || 0}\n` +
        `- Total Monthly Expenses: ₹${userContext.totalExpenses || 0}\n` +
        `- Financial Health Score: ${userContext.healthScore || "N/A"}/100\n` +
        `- Monthly Spending by Category: ${categoryTotalsStr}\n` +
        `- Active Category Budgets: ${activeBudgetsStr}\n` +
        `- Active Savings Goals: ${goalsStr}\n` +
        `- Recurring Subscriptions: ${subsStr}\n` +
        `- Recent User Transactions:\n${recentTxStr}\n` +
        `[END OF USER CONTEXT]\n\n`;
    }

    const mandatoryDirective = 
      `\n\n[MANDATORY SYSTEM DIRECTIVE: Provide an exceptionally detailed, thorough, multi-paragraph, and highly comprehensive response. ` +
      `Break down the topic with: ` +
      `1) Foundational Principles & Core Concepts, ` +
      `2) Explicit Data Citations & Concrete Examples from the User's Personal Account (citing their actual transactions, budget limits, goals, or subscriptions), ` +
      `3) Detailed Mathematical Calculations & Real-World Examples in Indian Rupees (₹), ` +
      `4) Comparison & Analysis (use Markdown Tables where applicable), ` +
      `5) Step-by-Step Actionable Implementation Plan. ` +
      `Do NOT write brief, short, or summarized answers under any circumstances.]`;

    if (finalPrompt) {
      finalPrompt += `User Message: ${message}${mandatoryDirective}`;
    } else {
      finalPrompt = `User Question: ${message}${mandatoryDirective}`;
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
      console.warn("Gemini startChat/sendMessage error, falling back to single-turn or smart fallback:", chatErr.message);
      try {
        const singleResult = await model.generateContent(finalPrompt);
        const singleResponse = await singleResult.response;
        const text = singleResponse.text();

        return {
          text: text,
          isMock: false
        };
      } catch (singleErr) {
        console.warn("Single-turn generateContent also failed. Generating smart fallback response:", singleErr.message);
        const fallbackText = generateSmartFallbackResponse(message, userContext);
        return {
          text: fallbackText,
          isMock: true
        };
      }
    }
  } catch (error) {
    console.error("Error generating response from Gemini:", error.message);
    const fallbackText = generateSmartFallbackResponse(message, userContext);
    return {
      text: fallbackText,
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
    const mockInsights = [
      `Your current net balance is ₹${(userContext.balance || 0).toLocaleString('en-IN')}. Maintaining a healthy liquidity margin prevents short-term cash flow pinches and keeps your daily transaction pipeline stable. We recommend automating 20% transfers into equity index funds on salary day.`,
    ];
    if (userContext.healthScore !== null && userContext.healthScore < 60) {
      mockInsights.push(`Your Financial Health Score is currently at ${userContext.healthScore}/100 (Grade: ${userContext.healthGrade || 'Needs Attention'}). This indicates higher exposure to non-essential spending. Scale back on lifestyle wants by 15% and allocate surplus toward liquid emergency reserves to boost your score.`);
    } else {
      mockInsights.push(`Excellent progress maintaining a strong Financial Health Score of ${userContext.healthScore || 75}/100. Your discipline in keeping fixed needs under control gives you a strong foundation to increase your monthly SIP investments by 10% each year.`);
    }
    if (Array.isArray(userContext.budgets) && userContext.budgets.length > 0) {
      mockInsights.push(`You have active category budget limits configured for this month. Periodically review your actual category spending against set thresholds to ensure non-essential wants remain strictly under 30% of total take-home pay.`);
    } else {
      mockInsights.push(`You currently have no active category budget limits set for this month. Establishing spending limits on high-frequency categories like Food, Entertainment, and Shopping prevents impulse spending and increases your monthly savings rate.`);
    }
    return {
      insights: mockInsights,
      isMock: true
    };
  }

  try {
    const model = getModel();
    if (!model) {
      throw new Error("Failed to initialize Gemini model");
    }

    const prompt = 
      `You are FinNova AI Advisor. Analyze the user's financial context below and generate exactly 3-4 detailed, multi-sentence personalized financial insights and recommendations. ` +
      `Focus on: \n` +
      `- Actionable tips to improve their current Financial Health Score \n` +
      `- Warning them about category budgets they are close to exceeding or have exceeded \n` +
      `- Advising on detected anomalies or high spending categories \n` +
      `- Suggesting steps to meet savings goals or adjust spending based on the next month's forecast. \n\n` +
      `Rules: \n` +
      `1. Use Indian Rupees (₹) for all examples, numbers, and calculations. \n` +
      `2. Make each insight comprehensive and detailed (2-3 full sentences long), providing the exact metric, why it matters, and a clear step-by-step recommendation. \n` +
      `3. Return the response as a valid JSON array of strings ONLY. Example format: \n` +
      `["Detailed multi-sentence insight 1 explaining metric, impact, and actionable step.", "Detailed multi-sentence insight 2...", "Detailed multi-sentence insight 3..."] \n` +
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
    // Fallback to rich multi-sentence insights if LLM fails
    const mockInsights = [
      `Your current balance is ₹${(userContext.balance || 0).toLocaleString('en-IN')}. Maintaining a healthy liquidity margin prevents short-term cash flow pinches and keeps your daily transaction pipeline stable. We recommend automating 20% transfers into index funds on salary day.`,
    ];
    if (userContext.healthScore !== null && userContext.healthScore < 60) {
      mockInsights.push(`Your Financial Health Score is currently at ${userContext.healthScore}/100. This indicates higher exposure to non-essential spending. Scale back on lifestyle wants by 15% and allocate surplus toward liquid emergency reserves to improve your score.`);
    } else {
      mockInsights.push(`Excellent work maintaining a stable Financial Health Score of ${userContext.healthScore || 75}/100. Consider allocating excess monthly savings toward active goals or stepping up your mutual fund SIPs.`);
    }
    if (Array.isArray(userContext.budgets) && userContext.budgets.length > 0) {
      mockInsights.push("Review your active category budgets on the Budgets page to verify you are staying within limits and preventing non-essential spending spikes.");
    } else {
      mockInsights.push("Create category budget limits on the Budgets page to start analyzing your spending limits and increasing your monthly savings rate.");
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

