import { Link } from "react-router-dom";

function Home() {
  const isLoggedIn = !!localStorage.getItem("token");

  const features = [
    {
      title: "Real-Time Expense & Budget Tracking",
      description: "Log income and monthly expenses seamlessly with instant category breakdown graphs and dynamic overspend alerts.",
      icon: "📊",
      badge: "Core Engine",
    },
    {
      title: "AI Anomaly Detection",
      description: "Scikit-Learn IsolationForest algorithms continuously scan your transactions to catch double-charges and unusual spending.",
      icon: "🛡️",
      badge: "Machine Learning",
    },
    {
      title: "Financial Health Score (0-100)",
      description: "Automated scoring engine evaluates your savings rate, emergency fund adequacy, and debt-to-income ratio in real-time.",
      icon: "🩺",
      badge: "Smart Diagnostics",
    },
    {
      title: "RAG Vector Knowledge Search",
      description: "Retrieval-Augmented Generation indexes Indian tax laws (Section 80C/80D), SIP compounding, and personal loan strategies.",
      icon: "🧠",
      badge: "Chroma Vector DB",
    },
    {
      title: "Interactive Masterclasses & AI Quizzes",
      description: "Learn budgeting, tax regimes, and mutual funds with built-in calculators and AI-generated quiz practice.",
      icon: "🎓",
      badge: "Financial Literacy",
    },
    {
      title: "Automated Subscription Scanning",
      description: "Detect repeating monthly bills (Netflix, Airtel, Rent) automatically and track upcoming payment due dates.",
      icon: "💳",
      badge: "Bill Manager",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-20 py-8">
      
      {/* Hero Section */}
      <div className="relative rounded-3xl glass-card p-8 sm:p-16 overflow-hidden border border-slate-800/80 text-center space-y-8">
        
        {/* Ambient Gradient Mesh Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-20 w-[600px] h-[300px] bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-pink-600/10 blur-[100px] pointer-events-none rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[250px] bg-emerald-500/10 blur-[90px] pointer-events-none rounded-full"></div>

        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold shadow-sm relative z-10">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Next-Gen AI Wealth & Financial Intelligence Engine
        </div>

        {/* Hero Headline */}
        <div className="space-y-4 max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Master Your Money with <br />
            <span className="text-gradient-indigo">Intelligent AI & Machine Learning</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            FinNova AI combines transaction tracking, ML anomaly detection, Indian tax optimization, SIP growth forecasting, and personalized AI masterclasses into one luxury platform.
          </p>
        </div>

        {/* Hero Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
          {isLoggedIn ? (
            <Link
              to="/dashboard"
              className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-8 py-4 text-sm font-extrabold text-white shadow-xl glow-indigo transition duration-200"
            >
              Open Financial Dashboard →
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-8 py-4 text-sm font-extrabold text-white shadow-xl glow-indigo transition duration-200"
              >
                Start Free FinNova AI Account
              </Link>
              <Link
                to="/login"
                className="rounded-2xl glass-card hover:bg-slate-800/80 px-8 py-4 text-sm font-extrabold text-slate-300 hover:text-white border border-slate-700/80 transition duration-200"
              >
                Sign In to Account
              </Link>
            </>
          )}
        </div>

        {/* Live Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-slate-800/60 relative z-10">
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-white">100%</p>
            <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Automated AI Audits</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-gradient-emerald">₹0.00</p>
            <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Hidden Subscription Fees</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-indigo-400">6+</p>
            <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Interactive Masterclasses</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-purple-400">Gemini 3.6</p>
            <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider">LLM Intelligence</p>
          </div>
        </div>

      </div>

      {/* Feature Showcase Grid */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-white tracking-tight">
            Comprehensive Financial Core
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Everything you need to analyze monthly budgets, reduce expenses, optimize Section 80C taxes, and compound wealth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-800/80 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-2xl flex items-center justify-center">
                    {feat.icon}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xxs font-extrabold uppercase tracking-wider bg-slate-800 text-indigo-400 border border-slate-700">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-white leading-snug">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/50 flex items-center text-xs font-bold text-indigo-400">
                <span>Explore Feature →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Home;