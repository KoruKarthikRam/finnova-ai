import { useState, useEffect } from "react";

function Learning() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCalculator, setActiveCalculator] = useState("50-30-20");
  const [activeLessonModal, setActiveLessonModal] = useState(null);
  
  // Progress tracking via localStorage
  const [completedLessons, setCompletedLessons] = useState(() => {
    try {
      const saved = localStorage.getItem("finnova_completed_lessons");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Calculators State
  const [income503020, setIncome503020] = useState(60000);
  const [sipMonthly, setSipMonthly] = useState(5000);
  const [sipYears, setSipYears] = useState(10);
  const [sipRate, setSipRate] = useState(12);

  const [annualTaxIncome, setAnnualTaxIncome] = useState(1000000);

  useEffect(() => {
    try {
      localStorage.setItem("finnova_completed_lessons", JSON.stringify(completedLessons));
    } catch (e) {
      console.error("Failed to save learning progress:", e);
    }
  }, [completedLessons]);

  const toggleLessonCompletion = (lessonId, e) => {
    if (e) e.stopPropagation();
    setCompletedLessons((prev) =>
      prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  // Comprehensive Curriculum Data
  const categories = ["All", "Budgeting", "Savings", "Taxes", "Loans", "Investments", "Retirement"];

  const lessons = [
    {
      id: "budgeting-50-30-20",
      category: "Budgeting",
      title: "Budgeting 101: The 50/30/20 Rule",
      difficulty: "Beginner",
      readTime: "4 min read",
      summary: "Divide your net take-home income into 50% Needs, 30% Wants, and 20% Savings for effortless financial balance.",
      keyTakeaways: [
        "Needs (50%): Rent, groceries, electricity, essential medical bills.",
        "Wants (30%): Dining out, OTT subscriptions, weekend trips, fashion.",
        "Savings (20%): Emergency funds, SIP investments, debt repayment."
      ],
      caseStudy: "Amit earns ₹60,000/month after tax. Following 50/30/20, he allocates ₹30,000 for essentials, ₹18,000 for leisure, and automatically routes ₹12,000 into mutual fund SIPs on payday.",
      actionChecklist: [
        "Calculate your net monthly take-home salary after PF deductions.",
        "List your fixed non-negotiable monthly expenses (Needs).",
        "Set up an automated ₹20% transfer to a separate savings or investment account on salary day."
      ],
      fullContent: `
### Understanding the 50/30/20 Rule

The 50/30/20 rule is a intuitive, straightforward budgeting blueprint popularized by Senator Elizabeth Warren. It helps you manage your finances without obsessing over every single penny.

#### 1. 50% for Needs (Essential Expenses)
Needs are expenses you cannot avoid. They keep your life running safely and healthily:
- Housing rent or monthly home loan EMIs.
- Basic groceries and water/electricity utility bills.
- Essential healthcare premiums and mandatory transportation costs.

#### 2. 30% for Wants (Lifestyle Choices)
Wants are non-essential expenses that enhance your lifestyle. You can live without them, but they make life enjoyable:
- Weekend dinners, movie tickets, and coffee runs.
- Subscriptions to Netflix, Spotify, or gym memberships.
- Vacation travel and upgrading personal electronics.

#### 3. 20% for Savings & Wealth Building
This portion builds your financial future and protects you against uncertainties:
- Funding a 6-month emergency reserve.
- Monthly SIPs in diversified mutual funds or index funds.
- Prepaying high-interest debts like credit card balances.
      `
    },
    {
      id: "savings-emergency-fund",
      category: "Savings",
      title: "Emergency Fund: Building a 6-Month Cushion",
      difficulty: "Beginner",
      readTime: "5 min read",
      summary: "Protect yourself against sudden job loss, medical emergencies, or home repairs without liquidating investments.",
      keyTakeaways: [
        "Aim for 3 to 6 months of living expenses liquidly accessible.",
        "Keep 50% in a High-Yield Savings Account and 50% in Liquid Mutual Funds.",
        "Never invest emergency funds in volatile stocks or locked-in tax funds."
      ],
      caseStudy: "Priya spent ₹1.2 Lakhs on an unexpected medical procedure. Because she had a 6-month emergency fund, she avoided taking high-interest personal loans at 15% interest.",
      actionChecklist: [
        "Calculate your monthly essential expense baseline (e.g. ₹35,000).",
        "Multiply by 6 to find your target emergency corpus (₹2.1 Lakhs).",
        "Park the corpus in a separate high-liquidity bank account."
      ],
      fullContent: `
### Why You Need an Emergency Fund

An emergency fund is your financial seatbelt. Without one, a single unplanned event—such as a job lay-off, medical emergency, or major car repair—can force you into high-interest credit card debt or force you to prematurely sell your long-term mutual funds during a market dip.

#### Ideal Fund Size
- **Salaried Professional (Stable job)**: 3 to 6 months of total expenses.
- **Freelancer / Business Owner**: 6 to 12 months of total expenses.

#### Where to Park Your Emergency Fund
1. **High-Yield Savings Bank Account**: Instant 24/7 access via UPI or Debit Card.
2. **Liquid Funds / Fixed Deposits**: Low volatility with 1-day redemption features.
      `
    },
    {
      id: "taxes-old-vs-new-regime",
      category: "Taxes",
      title: "Demystifying Indian Taxes: Old vs New Tax Regime",
      difficulty: "Intermediate",
      readTime: "6 min read",
      summary: "Understand tax slabs, standard deductions, and choose the most optimal regime based on your investments.",
      keyTakeaways: [
        "New Tax Regime offers lower tax rates with simplified tax slabs.",
        "Old Tax Regime allows deductions under 80C, 80D, HRA, and Home Loan interest.",
        "If total deductions exceed ₹3.75 Lakhs, Old Regime is generally more beneficial."
      ],
      caseStudy: "Karthik earns ₹12 Lakhs annually and claims ₹1.5L (80C) + ₹25k (80D) + ₹1.5L (HRA). By calculating both regimes, he saved ₹18,200 by choosing the Old Tax Regime.",
      actionChecklist: [
        "Collect your Form 16 and list all eligible investment proofs.",
        "Compare net taxable income under both Old and New Tax Regimes.",
        "Submit your chosen regime declaration to your HR at the start of the financial year."
      ],
      fullContent: `
### Choosing Between Old and New Tax Regimes

With recent Union Budget updates, Indian taxpayers can select either regime every financial year (for salaried employees).

#### Old Tax Regime Features
- Higher baseline tax rates, but supports extensive exemptions:
  - **Section 80C**: Up to ₹1.5 Lakhs (EPF, PPF, ELSS, Insurance).
  - **Section 80D**: Up to ₹25,000 to ₹50,000 for health insurance.
  - **Section 10(13A)**: House Rent Allowance (HRA) exemption.
  - **Section 24(b)**: Home loan interest up to ₹2 Lakhs.

#### New Tax Regime Features
- Default regime with lower slab rates and a standard deduction of ₹75,000.
- No requirement to lock money into tax-saving schemes if you prefer liquidity.
      `
    },
    {
      id: "taxes-80c-80d-mastery",
      category: "Taxes",
      title: "Mastering Section 80C & 80D Tax Deductions",
      difficulty: "Intermediate",
      readTime: "5 min read",
      summary: "Maximize your legal tax savings under the Income Tax Act with strategic investment allocations.",
      keyTakeaways: [
        "Section 80C cap is ₹1,50,000 per financial year.",
        "ELSS Mutual Funds have the shortest 80C lock-in period (3 years).",
        "Section 80D offers additional deductions for self and senior citizen parents."
      ],
      caseStudy: "Rohan invested ₹1.5L in ELSS (80C) and paid ₹25,000 for medical insurance (80D). In the 30% tax bracket, this saved him ₹54,600 in direct tax payouts.",
      actionChecklist: [
        "Start an automated monthly ELSS SIP of ₹12,500 to max out 80C by March.",
        "Purchase health insurance for your parents to claim Section 80D benefits."
      ],
      fullContent: `
### Section 80C Breakdown
Section 80C lets you reduce up to ₹1,50,000 from your taxable income under the Old Tax Regime.

| Scheme | Lock-in Period | Risk Profile | Returns |
| :--- | :--- | :--- | :--- |
| **ELSS Mutual Funds** | 3 Years | High (Market Linked) | 12 - 15% (Historical) |
| **PPF (Public Provident Fund)** | 15 Years | Zero (Govt Backed) | ~7.1% Tax-Free |
| **EPF (Employee Provident Fund)**| Retirement | Zero (Govt Backed) | ~8.25% |
| **Tax Saver FD** | 5 Years | Zero (Bank Guaranteed)| ~6.5 - 7.5% |

### Section 80D Breakdown
Allows deduction for health insurance premiums:
- **Self & Family**: Up to ₹25,000.
- **Parents (Below 60)**: Extra ₹25,000.
- **Parents (Senior Citizens 60+)**: Extra ₹50,000.
      `
    },
    {
      id: "loans-cibil-emi-management",
      category: "Loans",
      title: "Demystifying EMIs & Improving Credit (CIBIL) Score",
      difficulty: "Intermediate",
      readTime: "5 min read",
      summary: "Maintain a high CIBIL score (750+) to unlock lower interest rates and quick loan approvals.",
      keyTakeaways: [
        "CIBIL score ranges from 300 to 900; 750+ is considered excellent.",
        "Keep Credit Card Utilization below 30% of your total limit.",
        "Never miss an EMI repayment date to protect credit history."
      ],
      caseStudy: "Neha maintained a 785 CIBIL score. When applying for a home loan, her bank offered an interest rate discount of 0.40%, saving her ₹4.8 Lakhs over a 20-year tenure.",
      actionChecklist: [
        "Enable Auto-Debit for all credit card bills and loan EMIs.",
        "Check your free annual CIBIL report for error corrections.",
        "Keep your total monthly EMIs below 40% of your take-home pay."
      ],
      fullContent: `
### What Affects Your CIBIL Credit Score?

1. **Repayment History (35%)**: Paying bills and EMIs on time is the single largest factor.
2. **Credit Utilization Ratio (30%)**: If your credit limit is ₹1 Lakh, try not to spend more than ₹30,000 in a billing cycle.
3. **Credit History Length (15%)**: Older credit accounts demonstrate long-term creditworthiness.
4. **Credit Mix (10%)**: A balanced mix of secured loans (home/car) and unsecured loans (credit card/personal).

### The EMI Formula
$$EMI = \\frac{P \\times R \\times (1+R)^N}{(1+R)^N - 1}$$
*Where P = Principal, R = Monthly interest rate, N = Tenure in months.*
      `
    },
    {
      id: "investments-sip-power",
      category: "Investments",
      title: "SIP vs Lump Sum: Power of Rupee Cost Averaging",
      difficulty: "Advanced",
      readTime: "6 min read",
      summary: "Learn how regular automated investments smooth market volatility and harness compounding over time.",
      keyTakeaways: [
        "SIP eliminates the need to time market ups and downs.",
        "Rupee Cost Averaging buys more units when markets drop.",
        "Starting 5 years earlier can double your final retirement corpus."
      ],
      caseStudy: "Vikram invested ₹10,000/month via SIP for 15 years at 12% expected return. Total invested: ₹18 Lakhs. Final portfolio value: ₹50.4 Lakhs!",
      actionChecklist: [
        "Choose 1-2 low-cost Nifty 50 Index Funds or Flexi Cap Funds.",
        "Setup a Step-Up SIP (increase investment by 10% every year as salary rises)."
      ],
      fullContent: `
### What is Rupee Cost Averaging?

When you invest via Systematic Investment Plan (SIP), your fixed monthly amount buys:
- **Fewer units** when prices are high.
- **More units** when market prices crash.

Over long horizons, this automatically lowers your average cost per unit without requiring emotional decision-making.

#### The Magic of Compounding
If you invest **₹10,000/month** at an average return of 12% per annum:
- **After 10 Years**: ₹23.2 Lakhs (Invested: ₹12 Lakhs)
- **After 20 Years**: ₹99.9 Lakhs (Invested: ₹24 Lakhs)
- **After 30 Years**: ₹3.53 Crores! (Invested: ₹36 Lakhs)
      `
    },
    {
      id: "investments-mutual-funds",
      category: "Investments",
      title: "Mutual Funds Unlocked: Equity vs Debt Funds",
      difficulty: "Intermediate",
      readTime: "5 min read",
      summary: "Match your investment horizon with the appropriate mutual fund asset class.",
      keyTakeaways: [
        "Equity Funds (High Risk/Reward): Recommended for goals > 5 years.",
        "Debt Funds (Low Risk/Stable): Ideal for short-term goals < 3 years.",
        "Hybrid Funds: Combine equity and debt for balanced growth."
      ],
      caseStudy: "Sanjay allocated 70% to Equity Mutual Funds for his daughter's college education 12 years away, and 30% to Debt Funds for a car purchase in 2 years.",
      actionChecklist: [
        "Define your financial goal timeline (Short-term vs Long-term).",
        "Select Direct Plan mutual funds to avoid distributor commission drag."
      ],
      fullContent: `
### Mutual Fund Categories Explained

#### 1. Equity Mutual Funds
Invests in stock markets. High volatility in short terms, but best asset class to beat inflation over 5+ years.
- **Large Cap Funds**: Top 100 Indian companies (Stable growth).
- **Flexi Cap Funds**: Invests across large, mid, and small companies dynamically.
- **Index Funds**: Tracks Nifty 50 or Sensex with minimal expense ratios (< 0.2%).

#### 2. Debt Mutual Funds
Invests in corporate bonds, government securities, and money market instruments.
- Offers stability and liquid returns higher than regular savings accounts.
      `
    },
    {
      id: "retirement-nps-epf-fire",
      category: "Retirement",
      title: "Retirement & Compounding: NPS, EPF, & FIRE Movement",
      difficulty: "Advanced",
      readTime: "6 min read",
      summary: "Build a inflation-proof retirement fund early and explore the FIRE (Financial Independence, Retire Early) framework.",
      keyTakeaways: [
        "The 25x Rule: Aim for a retirement corpus equal to 25 times your annual expenses.",
        "National Pension System (NPS) offers extra ₹50,000 tax deduction under 80CCD(1B).",
        "EPF compounding yields tax-free interest backed by the Indian Government."
      ],
      caseStudy: "Ananya calculates her annual living expense as ₹6 Lakhs. Her target FIRE corpus is ₹1.5 Crores (25 x ₹6L), allowing a safe withdrawal rate of 4% per year.",
      actionChecklist: [
        "Open an NPS Tier-1 account to claim additional tax benefits.",
        "Check your UAN Portal to verify monthly EPF contributions from your employer."
      ],
      fullContent: `
### The FIRE Movement (Financial Independence, Retire Early)

The FIRE movement advocates aggressive saving and investing to achieve financial freedom long before traditional retirement age (60).

#### The 4% Withdrawal Rule
Once your retirement portfolio reaches **25 times your annual living expenses**, you can safely withdraw 4% each year to cover living costs without depleting the core principal.

#### Essential Indian Retirement Vehicles
1. **EPF (Employees' Provident Fund)**: Mandatory 12% salary contribution matched by employer.
2. **NPS (National Pension System)**: Low-cost market-linked retirement scheme with additional ₹50,000 tax deduction under Sec 80CCD(1B).
3. **PPF (Public Provident Fund)**: 15-year sovereign guarantee scheme with exempt-exempt-exempt (EEE) tax status.
      `
    }
  ];

  // Filtering Logic
  const filteredLessons = lessons.filter((lesson) => {
    const matchesCategory = selectedCategory === "All" || lesson.category === selectedCategory;
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.keyTakeaways.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const completionPercentage = Math.round((completedLessons.length / lessons.length) * 100);

  // Helper formatting function
  const formatCurrency = (val) => `₹${Math.round(val).toLocaleString("en-IN")}`;

  // Calculators Math
  // 50-30-20
  const needs50 = income503020 * 0.5;
  const wants30 = income503020 * 0.3;
  const savings20 = income503020 * 0.2;

  // SIP Math
  const monthlyRate = sipRate / 12 / 100;
  const totalMonths = sipYears * 12;
  const totalInvestedSip = sipMonthly * totalMonths;
  const sipFutureValue =
    sipMonthly *
    ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) *
    (1 + monthlyRate);
  const sipEstimatedGains = Math.max(0, sipFutureValue - totalInvestedSip);

  // Tax Estimate Math
  const calculateOldTax = (income) => {
    let taxable = Math.max(0, income - 50000 - 150000 - 25000 - 50000); // Std Ded + 80C + 80D + HRA
    let tax = 0;
    if (taxable > 1000000) tax += (taxable - 1000000) * 0.30 + 112500;
    else if (taxable > 500000) tax += (taxable - 500000) * 0.20 + 12500;
    else if (taxable > 250000) tax += (taxable - 250000) * 0.05;
    return tax;
  };

  const calculateNewTax = (income) => {
    let taxable = Math.max(0, income - 75000); // New Std Ded ₹75,000
    let tax = 0;
    if (taxable <= 300000) return 0;
    if (taxable <= 700000) return 0; // Rebate u/s 87A
    if (taxable > 1500000) tax += (taxable - 1500000) * 0.30 + 150000;
    else if (taxable > 1200000) tax += (taxable - 1200000) * 0.20 + 90000;
    else if (taxable > 900000) tax += (taxable - 900000) * 0.15 + 45000;
    else if (taxable > 600000) tax += (taxable - 600000) * 0.10 + 15000;
    else if (taxable > 300000) tax += (taxable - 300000) * 0.05;
    return tax;
  };

  const oldTaxVal = calculateOldTax(annualTaxIncome);
  const newTaxVal = calculateNewTax(annualTaxIncome);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-violet-900 to-slate-900 p-8 sm:p-10 text-white overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3.5 py-1 text-xs font-semibold text-indigo-200 border border-indigo-400/30">
            <span>📚</span> FinNova Academy
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Financial Literacy & Masterclass Hub
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Master budgeting, tax optimization, mutual funds, loans, and wealth compounding with beginner-friendly guides tailored to Indian financial laws.
          </p>

          {/* User Progress Bar */}
          <div className="pt-4 max-w-md">
            <div className="flex justify-between items-center text-xs font-bold mb-1.5">
              <span className="text-indigo-200">Your Financial Literacy Progress</span>
              <span className="text-emerald-400">{completedLessons.length} / {lessons.length} Modules ({completionPercentage}%)</span>
            </div>
            <div className="h-3 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-500 rounded-full"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Financial Tools Widget */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span>🧮</span> Interactive Concept Calculators
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Experiment with numbers to visualize allocations, growth, and tax choices in real-time.
            </p>
          </div>
          
          {/* Calculator Selector Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl shrink-0">
            <button
              onClick={() => setActiveCalculator("50-30-20")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeCalculator === "50-30-20"
                  ? "bg-white text-indigo-600 shadow-xxs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              50/30/20 Allocator
            </button>
            <button
              onClick={() => setActiveCalculator("sip")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeCalculator === "sip"
                  ? "bg-white text-indigo-600 shadow-xxs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              SIP Growth
            </button>
            <button
              onClick={() => setActiveCalculator("tax")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeCalculator === "tax"
                  ? "bg-white text-indigo-600 shadow-xxs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tax Regime Quick View
            </button>
          </div>
        </div>

        {/* 1. 50/30/20 Calculator */}
        {activeCalculator === "50-30-20" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700">
                Monthly Net Salary: <span className="text-indigo-600 font-extrabold text-base ml-1">{formatCurrency(income503020)}</span>
              </label>
              <input
                type="range"
                min="15000"
                max="300000"
                step="5000"
                value={income503020}
                onChange={(e) => setIncome503020(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-xxs text-slate-400">Drag to test your monthly take-home income</p>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-900 space-y-1">
                <span className="text-xxs font-extrabold uppercase tracking-wider text-indigo-600">Needs (50%)</span>
                <p className="text-xl font-black">{formatCurrency(needs50)}</p>
                <p className="text-xxs text-indigo-700">Rent, groceries, bills, insurance</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-900 space-y-1">
                <span className="text-xxs font-extrabold uppercase tracking-wider text-amber-600">Wants (30%)</span>
                <p className="text-xl font-black">{formatCurrency(wants30)}</p>
                <p className="text-xxs text-amber-700">Dining, movies, shopping, trips</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-900 space-y-1">
                <span className="text-xxs font-extrabold uppercase tracking-wider text-emerald-600">Savings (20%)</span>
                <p className="text-xl font-black">{formatCurrency(savings20)}</p>
                <p className="text-xxs text-emerald-700">SIPs, emergency fund, investments</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. SIP Calculator */}
        {activeCalculator === "sip" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Monthly SIP Amount: <span className="text-indigo-600 font-bold">{formatCurrency(sipMonthly)}</span>
                </label>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={sipMonthly}
                  onChange={(e) => setSipMonthly(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tenure: <span className="text-indigo-600 font-bold">{sipYears} Years</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={sipYears}
                  onChange={(e) => setSipYears(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Expected Return: <span className="text-indigo-600 font-bold">{sipRate}% p.a.</span>
                </label>
                <input
                  type="range"
                  min="6"
                  max="18"
                  step="0.5"
                  value={sipRate}
                  onChange={(e) => setSipRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                <span className="text-xxs font-extrabold uppercase text-slate-500">Total Invested</span>
                <p className="text-xl font-bold text-slate-800">{formatCurrency(totalInvestedSip)}</p>
                <p className="text-xxs text-slate-400">Principal out-of-pocket</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-1">
                <span className="text-xxs font-extrabold uppercase text-emerald-600">Est. Interest Returns</span>
                <p className="text-xl font-bold text-emerald-700">+{formatCurrency(sipEstimatedGains)}</p>
                <p className="text-xxs text-emerald-600">Wealth generated by compounding</p>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white space-y-1">
                <span className="text-xxs font-extrabold uppercase text-indigo-200">Total Expected Corpus</span>
                <p className="text-xl font-extrabold">{formatCurrency(sipFutureValue)}</p>
                <p className="text-xxs text-indigo-200">Projected portfolio value</p>
              </div>
            </div>
          </div>
        )}

        {/* 3. Tax Regime Estimator */}
        {activeCalculator === "tax" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700">
                Annual Gross Income: <span className="text-indigo-600 font-extrabold text-base ml-1">{formatCurrency(annualTaxIncome)}</span>
              </label>
              <input
                type="range"
                min="300000"
                max="3000000"
                step="50000"
                value={annualTaxIncome}
                onChange={(e) => setAnnualTaxIncome(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-xxs text-slate-400">Assumes standard ₹1.5L (80C) + ₹25k (80D) + ₹50k HRA for Old Regime calculation</p>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className={`p-5 rounded-2xl border transition ${oldTaxVal < newTaxVal ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20" : "bg-slate-50 border-slate-200"}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-extrabold text-sm text-slate-800">Old Tax Regime</span>
                  {oldTaxVal < newTaxVal && <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-xxs font-bold">Recommended</span>}
                </div>
                <p className="text-2xl font-black text-slate-900">{formatCurrency(oldTaxVal)}</p>
                <p className="text-xxs text-slate-500 mt-1">Est. annual tax liability with full deductions</p>
              </div>

              <div className={`p-5 rounded-2xl border transition ${newTaxVal <= oldTaxVal ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20" : "bg-slate-50 border-slate-200"}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-extrabold text-sm text-slate-800">New Tax Regime</span>
                  {newTaxVal <= oldTaxVal && <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-xxs font-bold">Recommended</span>}
                </div>
                <p className="text-2xl font-black text-slate-900">{formatCurrency(newTaxVal)}</p>
                <p className="text-xxs text-slate-500 mt-1">Est. annual tax liability with ₹75,000 std deduction</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition duration-200 shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[280px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lessons (e.g., 80C, SIP, CIBIL)..."
            className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs focus:border-indigo-500 focus:outline-none shadow-xxs"
          />
          <span className="absolute left-3.5 top-3 text-slate-400 text-xs">🔍</span>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => {
          const isCompleted = completedLessons.includes(lesson.id);
          return (
            <div
              key={lesson.id}
              onClick={() => setActiveLessonModal(lesson)}
              className={`group relative rounded-3xl border bg-white p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between cursor-pointer ${
                isCompleted ? "border-emerald-200 bg-emerald-50/20" : "border-slate-100 hover:border-indigo-200"
              }`}
            >
              <div className="space-y-4">
                {/* Top Badge Row */}
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 rounded-full text-xxs font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100">
                    {lesson.category}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xxs font-semibold text-slate-400">{lesson.readTime}</span>
                    <button
                      onClick={(e) => toggleLessonCompletion(lesson.id, e)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                        isCompleted
                          ? "bg-emerald-500 text-white shadow-xxs"
                          : "bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600"
                      }`}
                      title={isCompleted ? "Mark as Incomplete" : "Mark as Completed"}
                    >
                      ✓
                    </button>
                  </div>
                </div>

                {/* Title & Difficulty */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      lesson.difficulty === "Beginner" ? "bg-emerald-500" : lesson.difficulty === "Intermediate" ? "bg-amber-500" : "bg-rose-500"
                    }`} />
                    <span className="text-xxs font-bold text-slate-400 uppercase tracking-wide">{lesson.difficulty}</span>
                  </div>
                  <h3 className="mt-1 text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                    {lesson.title}
                  </h3>
                </div>

                {/* Summary */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  {lesson.summary}
                </p>

                {/* Takeaways bullets */}
                <div className="space-y-1.5 pt-2 border-t border-slate-50">
                  <span className="text-xxs font-extrabold text-slate-400 uppercase tracking-wider">Key Highlights</span>
                  <ul className="space-y-1">
                    {lesson.keyTakeaways.map((point, idx) => (
                      <li key={idx} className="text-xxs text-slate-700 flex items-start gap-1.5 leading-snug">
                        <span className="text-indigo-500 font-bold shrink-0">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-5 mt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition flex items-center gap-1">
                  Start Lesson →
                </span>
                {isCompleted && (
                  <span className="text-xxs font-bold text-emerald-600 flex items-center gap-1">
                    <span>✓</span> Completed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredLessons.length === 0 && (
        <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center space-y-3">
          <span className="text-4xl">🔎</span>
          <h3 className="text-lg font-bold text-slate-800">No learning modules matched your search</h3>
          <p className="text-xs text-slate-500">Try searching for keywords like "tax", "SIP", "80C", or select another category filter.</p>
        </div>
      )}

      {/* Lesson Detail Modal */}
      {activeLessonModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-8">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-6 sm:p-8 text-white relative">
              <button
                onClick={() => setActiveLessonModal(null)}
                className="absolute right-5 top-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-0.5 rounded-full text-xxs font-extrabold uppercase tracking-wider bg-indigo-500/30 border border-indigo-400/30 text-indigo-200">
                  {activeLessonModal.category}
                </span>
                <span className="text-xxs text-slate-300 font-semibold">{activeLessonModal.readTime}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold">{activeLessonModal.title}</h2>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto scrollbar-thin">
              
              {/* Overview */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-slate-700 text-xs leading-relaxed">
                <strong>Module Overview:</strong> {activeLessonModal.summary}
              </div>

              {/* Full Content Markdown format */}
              <div className="prose prose-slate max-w-none text-xs text-slate-700 space-y-4">
                {activeLessonModal.fullContent.split("\n\n").map((para, idx) => {
                  if (para.startsWith("### ")) {
                    return <h3 key={idx} className="text-base font-bold text-slate-900 mt-4 mb-2">{para.replace("### ", "")}</h3>;
                  }
                  if (para.startsWith("#### ")) {
                    return <h4 key={idx} className="text-sm font-bold text-slate-800 mt-3 mb-1.5">{para.replace("#### ", "")}</h4>;
                  }
                  return <p key={idx} className="leading-relaxed">{para}</p>;
                })}
              </div>

              {/* Case Study */}
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-2">
                <h4 className="font-extrabold text-amber-900 text-xs flex items-center gap-1.5">
                  <span>💡</span> Real-World Example
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {activeLessonModal.caseStudy}
                </p>
              </div>

              {/* Action Checklist */}
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-3">
                <h4 className="font-extrabold text-emerald-900 text-xs flex items-center gap-1.5">
                  <span>✅</span> Action Items for Today
                </h4>
                <ul className="space-y-2">
                  {activeLessonModal.actionChecklist.map((item, idx) => (
                    <li key={idx} className="text-xs text-emerald-800 flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-800 text-xxs font-bold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={() => {
                  toggleLessonCompletion(activeLessonModal.id);
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  completedLessons.includes(activeLessonModal.id)
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                }`}
              >
                <span>{completedLessons.includes(activeLessonModal.id) ? "✓ Completed" : "Mark as Completed"}</span>
              </button>

              <button
                onClick={() => setActiveLessonModal(null)}
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
              >
                Close Lesson
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Learning;