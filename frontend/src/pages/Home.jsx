import { Link } from "react-router-dom";

function Home() {
  const isLoggedIn = !!localStorage.getItem("token");

  const featureCards = [
    {
      title: "Real-Time Expense & Budget Engine",
      desc: "Instant income & expense categorization with live overspend budget alerts.",
      icon: "📊",
      tag: "CORE SYSTEM",
      color: "border-cyan-500/30 text-cyan-400"
    },
    {
      title: "ML Anomaly Detection",
      desc: "Scikit-Learn IsolationForest scans transactions for double-charges & outliers.",
      icon: "🛡️",
      tag: "SCIKIT-LEARN ML",
      color: "border-violet-500/30 text-violet-400"
    },
    {
      title: "Financial Health Score (0-100)",
      desc: "Evaluates savings rate, emergency fund adequacy, and debt ratios in real-time.",
      icon: "🩺",
      tag: "DIAGNOSTICS",
      color: "border-emerald-500/30 text-emerald-400"
    },
    {
      title: "RAG Vector Knowledge Search",
      desc: "Chroma/TF-IDF indexes Indian tax laws (80C/80D), SIP growth, & EMI rules.",
      icon: "🧠",
      tag: "RAG VECTOR DB",
      color: "border-cyan-500/30 text-cyan-400"
    },
    {
      title: "Masterclasses & Calculators",
      desc: "Interactive tools for 50/30/20 budget allocation, SIP compounding, & Tax regimes.",
      icon: "🎓",
      tag: "LITERACY HUB",
      color: "border-pink-500/30 text-pink-400"
    },
    {
      title: "Automated Subscription Scanner",
      desc: "Detects repeating monthly bills (Netflix, Airtel, Rent) & flags upcoming due dates.",
      icon: "💳",
      tag: "BILL MANAGER",
      color: "border-amber-500/30 text-amber-400"
    },
    {
      title: "Intelligent Monthly Reports",
      desc: "Compiles monthly financial statements with 1-click printable PDF export.",
      icon: "📄",
      tag: "EXECUTIVE PDF",
      color: "border-cyan-500/30 text-cyan-400"
    },
    {
      title: "AI-Generated Quizzes",
      desc: "Test your financial knowledge with step player, AI explanations, & score cards.",
      icon: "✍️",
      tag: "GEMINI 3.6",
      color: "border-purple-500/30 text-purple-400"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-24 py-8 relative">
      
      {/* Hero Section with Ambient Halo Light Ring & Dot Grid */}
      <div className="relative rounded-3xl glass-card bg-dot-grid p-8 sm:p-20 overflow-hidden border border-slate-800/80 text-center space-y-8">
        
        {/* ZeBeyond Halo Ambient Lighting Ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-violet-600/10 blur-[130px] pointer-events-none rounded-full"></div>

        {/* Floating Cyber Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold shadow-sm relative z-10">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
          Next-Gen Engineering Platform for Personal Wealth
        </div>

        {/* Hero Sora Headline */}
        <div className="space-y-4 max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl sm:text-7xl font-black text-white tracking-tight leading-[1.1]">
            Empowering Wealth with <br />
            <span className="text-gradient-cyan">Automated AI & ML Intelligence</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            FinNova AI unites real-time expense tracking, Scikit-Learn anomaly detection, Indian tax optimization, RAG knowledge retrieval, and AI masterclasses into one high-tech platform.
          </p>
        </div>

        {/* Hero Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
          {isLoggedIn ? (
            <Link
              to="/dashboard"
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-8 py-4 text-xs font-black text-slate-950 shadow-xl glow-cyan transition duration-200"
            >
              Open Financial Dashboard →
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-8 py-4 text-xs font-black text-slate-950 shadow-xl glow-cyan transition duration-200"
              >
                Launch FinNova AI Engine
              </Link>
              <Link
                to="/login"
                className="rounded-2xl glass-card hover:bg-slate-800/80 px-8 py-4 text-xs font-bold text-slate-300 hover:text-white border border-slate-700/80 transition duration-200"
              >
                Sign In to Platform
              </Link>
            </>
          )}
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-slate-800/60 relative z-10">
          <div className="space-y-1">
            <p className="text-3xl font-black text-white">100%</p>
            <p className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Automated ML Audits</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-gradient-cyan">₹0.00</p>
            <p className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Hidden Subscription Fees</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-violet-400">6+</p>
            <p className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Interactive Masterclasses</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-emerald-400">Gemini 3.6</p>
            <p className="text-xxs font-bold text-slate-400 uppercase tracking-widest">LLM Core Active</p>
          </div>
        </div>

      </div>

      {/* INFINITE MOVING CARDS MARQUEE SECTION */}
      <div className="space-y-6 overflow-hidden">
        <div className="text-center space-y-2">
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xxs font-extrabold uppercase tracking-widest">
            FEATURE SHOWCASE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Explore Platform Intelligence
          </h2>
          <p className="text-slate-400 text-xs">Hover over any card to pause sliding animation</p>
        </div>

        {/* Marquee Track Container */}
        <div className="relative w-full overflow-hidden py-4">
          {/* Edge Blur Fades */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#07090e] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#07090e] to-transparent z-10 pointer-events-none"></div>

          {/* Animated Marquee Flex Container */}
          <div className="animate-marquee flex gap-6">
            {/* Duplicate array for seamless infinite loop */}
            {[...featureCards, ...featureCards].map((card, idx) => (
              <div
                key={idx}
                className="w-80 shrink-0 glass-card glass-card-hover rounded-3xl p-6 border border-slate-800/80 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-3xl">{card.icon}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xxs font-extrabold border ${card.color}`}>
                      {card.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white leading-snug">{card.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{card.desc}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold text-cyan-400">
                  <span>Explore Engine</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

export default Home;