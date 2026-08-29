import { useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const isLoggedIn = !!localStorage.getItem("token");
  const [activeCategory, setActiveCategory] = useState("all");

  const webTools = [
    {
      id: "assistant",
      title: "RAG AI Assistant",
      category: "ml",
      desc: "Natural language financial advisor powered by RAG vector retrieval & Indian tax knowledge base.",
      icon: "🤖",
      tag: "VECTOR SEARCH",
      color: "border-cyan-500/30 text-cyan-300 bg-cyan-500/10",
      path: "/assistant",
      metrics: "Vector Index Active"
    },
    {
      id: "anomaly",
      title: "ML Anomaly Detector",
      category: "ml",
      desc: "Scikit-Learn IsolationForest model scanning real-time transaction streams for double charges & outliers.",
      icon: "🛡️",
      tag: "SCIKIT-LEARN ML",
      color: "border-violet-500/30 text-violet-300 bg-violet-500/10",
      path: "/transactions",
      metrics: "Real-time Fraud Audit"
    },
    {
      id: "health",
      title: "Financial Health Diagnostics",
      category: "calculators",
      desc: "Live 0-100 score engine analyzing emergency savings, debt-to-income ratio, & expense velocity.",
      icon: "🩺",
      tag: "DIAGNOSTICS",
      color: "border-emerald-500/30 text-emerald-300 bg-emerald-500/10",
      path: "/dashboard",
      metrics: "Live Health Index"
    },
    {
      id: "budget",
      title: "Smart Budget Allocation",
      category: "calculators",
      desc: "50/30/20 rule engine with automated category cap tracking & instant overspend warnings.",
      icon: "⚖️",
      tag: "BUDGET ENGINE",
      color: "border-amber-500/30 text-amber-300 bg-amber-500/10",
      path: "/budget",
      metrics: "Category Cap Guard"
    },
    {
      id: "masterclasses",
      title: "Literacy & Compounding Calculators",
      category: "calculators",
      desc: "Interactive tools for SIP compounding, EMI calculation, emergency funds & tax regime optimization.",
      icon: "🎓",
      tag: "LITERACY HUB",
      color: "border-pink-500/30 text-pink-300 bg-pink-500/10",
      path: "/learning",
      metrics: "6 Interactive Modules"
    },
    {
      id: "subscriptions",
      title: "Subscription Manager",
      category: "automation",
      desc: "Automated recurring merchant bill scanner flagging duplicate services & due date alerts.",
      icon: "💳",
      tag: "BILL AUDITOR",
      color: "border-indigo-500/30 text-indigo-300 bg-indigo-500/10",
      path: "/subscriptions",
      metrics: "Auto-recurring Audit"
    },
    {
      id: "reports",
      title: "Executive Statement Reports",
      category: "automation",
      desc: "Instant monthly financial health summary compilation with 1-click printable PDF export.",
      icon: "📄",
      tag: "PDF EXPORT",
      color: "border-sky-500/30 text-sky-300 bg-sky-500/10",
      path: "/reports",
      metrics: "Executive PDF Ready"
    },
    {
      id: "quiz",
      title: "AI Interactive Quizzes",
      category: "ml",
      desc: "Dynamic financial knowledge quiz engine with instant step player & detailed AI explanations.",
      icon: "✍️",
      tag: "GEMINI 3.6",
      color: "border-purple-500/30 text-purple-300 bg-purple-500/10",
      path: "/quiz",
      metrics: "Adaptive Questioning"
    },
    {
      id: "goals",
      title: "Wealth Goal Planner",
      category: "calculators",
      desc: "Milestone progress tracker with SIP contribution projections for long-term target accumulation.",
      icon: "🎯",
      tag: "WEALTH TRACKER",
      color: "border-teal-500/30 text-teal-300 bg-teal-500/10",
      path: "/goals",
      metrics: "Milestone Engine"
    }
  ];

  const filteredTools = activeCategory === "all"
    ? webTools
    : webTools.filter((t) => t.category === activeCategory);

  return (
    <div className="space-y-24 py-4 relative selection:bg-cyan-500/20">

      {/* HERO SECTION WITH REALISTIC BACKGROUND WALLPAPER */}
      <section className="relative rounded-3xl overflow-hidden bg-hero-wallpaper border border-white/10 shadow-2xl p-8 sm:p-16 lg:p-24 text-center">
        
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/10 blur-[140px] pointer-events-none rounded-full"></div>

        {/* Realistic Badge */}
        <div className="relative z-10 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide backdrop-blur-md mb-6 shadow-sm">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
          Modern Engineering Suite for Intelligent Wealth Management
        </div>

        {/* Refined Headline Typography (Plus Jakarta Sans & Outfit) */}
        <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-medium text-slate-100 tracking-tight leading-[1.12]">
            Elevating Personal Finance through <br className="hidden sm:inline" />
            <span className="text-gradient-cyan font-semibold">Automated AI & ML Tools</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto font-normal leading-relaxed tracking-normal">
            FinNova AI integrates real-time expense analytics, Scikit-Learn anomaly detection, RAG vector tax intelligence, and interactive wealth calculators into a unified luxury experience.
          </p>
        </div>

        {/* Hero Action CTA Buttons */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 mt-8">
          {isLoggedIn ? (
            <Link
              to="/dashboard"
              className="rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-8 py-3.5 text-xs font-semibold shadow-lg glow-cyan transition duration-200"
            >
              Open Financial Dashboard →
            </Link>
          ) : (
            <>
              <a
                href="#tools-studio"
                className="rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-8 py-3.5 text-xs font-semibold shadow-lg glow-cyan transition duration-200"
              >
                Explore Web Tools Studio ↓
              </a>
              <Link
                to="/login"
                className="rounded-2xl glass-panel-luxury hover:bg-slate-800/80 px-8 py-3.5 text-xs font-medium text-slate-200 hover:text-white border border-white/10 transition duration-200"
              >
                Sign In to Platform
              </Link>
            </>
          )}
        </div>

        {/* Refined Performance Metrics Strip */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 pt-8 border-t border-white/10 max-w-5xl mx-auto">
          <div className="glass-panel-luxury p-4 rounded-2xl border border-white/5 space-y-1">
            <p className="text-2xl sm:text-3xl font-heading font-medium text-slate-100">100%</p>
            <p className="text-xxs font-semibold text-slate-400 uppercase tracking-wider">Automated ML Audits</p>
          </div>
          <div className="glass-panel-luxury p-4 rounded-2xl border border-white/5 space-y-1">
            <p className="text-2xl sm:text-3xl font-heading font-medium text-cyan-400">RAG Vector</p>
            <p className="text-xxs font-semibold text-slate-400 uppercase tracking-wider">Tax Knowledge Base</p>
          </div>
          <div className="glass-panel-luxury p-4 rounded-2xl border border-white/5 space-y-1">
            <p className="text-2xl sm:text-3xl font-heading font-medium text-violet-400">0 - 100</p>
            <p className="text-xxs font-semibold text-slate-400 uppercase tracking-wider">Health Diagnostic Engine</p>
          </div>
          <div className="glass-panel-luxury p-4 rounded-2xl border border-white/5 space-y-1">
            <p className="text-2xl sm:text-3xl font-heading font-medium text-emerald-400">Gemini 3.6</p>
            <p className="text-xxs font-semibold text-slate-400 uppercase tracking-wider">AI Intelligence Active</p>
          </div>
        </div>

      </section>

      {/* INTERACTIVE WEB TOOLS STUDIO SHOWCASE (REALISTIC BACKGROUND) */}
      <section id="tools-studio" className="relative rounded-3xl overflow-hidden bg-tools-wallpaper border border-white/10 p-8 sm:p-14 space-y-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto relative z-10">
          <span className="px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xxs font-semibold tracking-widest uppercase">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-medium text-white tracking-tight">
            Web Tools & Intelligence Suite
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm font-normal leading-relaxed">
            Select a category to filter our suite of financial intelligence, machine learning, and automated web tools.
          </p>
        </div>

        {/* Interactive Filter Tabs (Awwwards Style) */}
        <div className="flex flex-wrap items-center justify-center gap-2 relative z-10">
          {[
            { key: "all", label: "All Web Tools" },
            { key: "ml", label: "Intelligence & ML" },
            { key: "calculators", label: "Calculators & Diagnostics" },
            { key: "automation", label: "Automation & Reports" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeCategory === tab.key
                  ? "bg-cyan-500 text-slate-950 shadow-md glow-cyan"
                  : "glass-panel-luxury text-slate-300 hover:text-white border border-white/10 hover:border-cyan-500/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Web Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="glass-panel-luxury glass-panel-hover rounded-2xl p-6 border border-white/10 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* Header row: Icon & Tag */}
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{tool.icon}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xxs font-semibold border ${tool.color}`}>
                    {tool.tag}
                  </span>
                </div>

                {/* Tool Title & Description */}
                <div className="space-y-1.5">
                  <h3 className="text-lg font-heading font-medium text-white tracking-tight">{tool.title}</h3>
                  <p className="text-xs text-slate-300 font-normal leading-relaxed">{tool.desc}</p>
                </div>
              </div>

              {/* Bottom Metrics & Launch Button */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xxs font-semibold text-slate-400">{tool.metrics}</span>
                
                <Link
                  to={tool.path}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
                >
                  <span>Launch Tool</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* PLATFORM SUMMARY BANNER */}
      <section className="glass-panel-luxury rounded-3xl p-8 sm:p-12 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-heading font-medium text-white">Ready to streamline your financial workflow?</h3>
          <p className="text-slate-300 text-xs sm:text-sm font-normal">Start using FinNova AI's full web tools suite with automated anomaly detection.</p>
        </div>

        <Link
          to={isLoggedIn ? "/dashboard" : "/register"}
          className="shrink-0 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-3.5 text-xs font-semibold shadow-lg glow-cyan transition duration-200"
        >
          {isLoggedIn ? "Access Dashboard Now" : "Get Started Free"}
        </Link>
      </section>

    </div>
  );
}

export default Home;