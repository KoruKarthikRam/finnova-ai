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
    <div className="space-y-16 py-4 relative">

      {/* HERO SECTION WITH CLEAN LIGHT GRADIENT */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 border border-slate-200/80 shadow-sm p-8 sm:p-16 lg:p-24 text-center">
        
        {/* Subtle Ambient Accent Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/5 blur-[140px] pointer-events-none rounded-full"></div>

        {/* Badge */}
        <div className="relative z-10 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold tracking-wide mb-6 shadow-2xs">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
          </span>
          Modern Engineering Suite for Intelligent Wealth Management
        </div>

        {/* Headline Typography */}
        <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            Elevating Personal Finance through <br className="hidden sm:inline" />
            <span className="text-indigo-600 font-extrabold">Automated AI & ML Tools</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto font-normal leading-relaxed tracking-normal">
            FinNova AI integrates real-time expense analytics, Scikit-Learn anomaly detection, RAG vector tax intelligence, and interactive wealth calculators into a unified luxury experience.
          </p>
        </div>

        {/* Hero Action CTA Buttons */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 mt-8">
          {isLoggedIn ? (
            <Link
              to="/dashboard"
              className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 text-xs font-bold shadow-md transition duration-200"
            >
              Open Financial Dashboard →
            </Link>
          ) : (
            <>
              <a
                href="#tools-studio"
                className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 text-xs font-bold shadow-md transition duration-200"
              >
                Explore Web Tools Studio ↓
              </a>
              <Link
                to="/login"
                className="rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-8 py-3.5 text-xs font-bold shadow-2xs transition duration-200"
              >
                Sign In to Platform
              </Link>
            </>
          )}
        </div>

        {/* Performance Metrics Strip */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 pt-8 border-t border-slate-200/80 max-w-5xl mx-auto">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <p className="text-2xl sm:text-3xl font-heading font-bold text-slate-900">100%</p>
            <p className="text-xxs font-bold text-slate-500 uppercase tracking-wider">Automated ML Audits</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <p className="text-2xl sm:text-3xl font-heading font-bold text-indigo-600">RAG Vector</p>
            <p className="text-xxs font-bold text-slate-500 uppercase tracking-wider">Tax Knowledge Base</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <p className="text-2xl sm:text-3xl font-heading font-bold text-violet-600">0 - 100</p>
            <p className="text-xxs font-bold text-slate-500 uppercase tracking-wider">Health Diagnostic Engine</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <p className="text-2xl sm:text-3xl font-heading font-bold text-emerald-600">Gemini 3.6</p>
            <p className="text-xxs font-bold text-slate-500 uppercase tracking-wider">AI Intelligence Active</p>
          </div>
        </div>

      </section>

      {/* INTERACTIVE WEB TOOLS STUDIO SHOWCASE */}
      <section id="tools-studio" className="relative rounded-3xl overflow-hidden bg-white border border-slate-200/80 p-8 sm:p-14 space-y-10 shadow-2xs">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto relative z-10">
          <span className="px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xxs font-bold tracking-widest uppercase">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-slate-900 tracking-tight">
            Web Tools & Intelligence Suite
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm font-normal leading-relaxed">
            Select a category to filter our suite of financial intelligence, machine learning, and automated web tools.
          </p>
        </div>

        {/* Interactive Filter Tabs */}
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
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeCategory === tab.key
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
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
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* Header row: Icon & Tag */}
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{tool.icon}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xxs font-bold border ${tool.color}`}>
                    {tool.tag}
                  </span>
                </div>

                {/* Tool Title & Description */}
                <div className="space-y-1.5">
                  <h3 className="text-lg font-heading font-bold text-slate-900 tracking-tight">{tool.title}</h3>
                  <p className="text-xs text-slate-600 font-normal leading-relaxed">{tool.desc}</p>
                </div>
              </div>

              {/* Bottom Metrics & Launch Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xxs font-bold text-slate-400">{tool.metrics}</span>
                
                <Link
                  to={tool.path}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
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
      <section className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 rounded-3xl p-8 sm:p-12 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-heading font-bold text-white">Ready to streamline your financial workflow?</h3>
          <p className="text-indigo-100 text-xs sm:text-sm font-normal">Start using FinNova AI's full web tools suite with automated anomaly detection.</p>
        </div>

        <Link
          to={isLoggedIn ? "/dashboard" : "/register"}
          className="shrink-0 rounded-2xl bg-white hover:bg-indigo-50 text-indigo-700 px-6 py-3.5 text-xs font-bold shadow-xs transition duration-200"
        >
          {isLoggedIn ? "Access Dashboard Now" : "Get Started Free"}
        </Link>
      </section>

    </div>
  );
}

export default Home;