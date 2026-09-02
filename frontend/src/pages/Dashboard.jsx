import { useState, useEffect, Component } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../api/config";
import SmartRecommendations from "../components/SmartRecommendations";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#22d3ee", // Cyan
  "#a855f7", // Violet
  "#f43f5e", // Rose
  "#10b981", // Emerald
  "#fbbf24", // Amber
  "#38bdf8", // Sky
  "#c084fc", // Purple
  "#3b82f6", // Blue
  "#94a3b8", // Slate
];

class SectionErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.error("Dashboard section render error:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold text-center">
          ⚠️ Section temporarily unavailable
        </div>
      );
    }
    return this.props.children;
  }
}

function Dashboard() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [healthData, setHealthData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [anomalies, setAnomalies] = useState([]);
  const [forecastData, setForecastData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);

  // Simulator State
  const [wantsCutPercent, setWantsCutPercent] = useState(15);
  const [extraSipMonthly, setExtraSipMonthly] = useState(3000);

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const config = getAuthConfig();
    const current = new Date();
    const month = current.getMonth() + 1;
    const year = current.getFullYear();

    // 1. Fetch unified aggregated summary in 1 single HTTP request
    try {
      setLoading(true);
      setError("");
      const summaryRes = await axios.get(
        `${API_BASE_URL}/api/dashboard/summary?month=${month}&year=${year}`,
        config
      );

      if (summaryRes.data && summaryRes.data.success) {
        const { transactions, budgets, goals, healthData, recommendations } = summaryRes.data.data || {};
        setTransactions(Array.isArray(transactions) ? transactions : []);
        setBudgets(Array.isArray(budgets) ? budgets : []);
        setGoals(Array.isArray(goals) ? goals : []);
        setHealthData(healthData || null);
        setRecommendations(Array.isArray(recommendations) ? recommendations : []);
      } else {
        setError(summaryRes.data?.message || "Failed to fetch dashboard metrics");
      }
    } catch (err) {
      console.error("Dashboard summary fetch error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      setError(
        err.response?.data?.message || "Failed to fetch dashboard metrics. Please check server connection."
      );
    } finally {
      setLoading(false);
    }

    // 2. Fetch heavy AI telemetry & Gemini insights asynchronously in background
    setInsightsLoading(true);
    Promise.allSettled([
      axios.get(`${API_BASE_URL}/api/ai/anomalies`, config),
      axios.get(`${API_BASE_URL}/api/ai/forecast`, config),
      axios.get(`${API_BASE_URL}/api/ai/insights`, config),
    ]).then(([anomalyRes, forecastRes, insightsRes]) => {
      if (anomalyRes.status === "fulfilled" && anomalyRes.value?.data?.success) {
        setAnomalies(Array.isArray(anomalyRes.value.data.anomalies) ? anomalyRes.value.data.anomalies : []);
      }
      if (forecastRes.status === "fulfilled" && forecastRes.value?.data?.success) {
        setForecastData(forecastRes.value.data);
      }
      if (insightsRes.status === "fulfilled" && insightsRes.value?.data?.success) {
        setInsights(Array.isArray(insightsRes.value.data.insights) ? insightsRes.value.data.insights : []);
      }
    }).catch((aiErr) => {
      console.warn("Background AI fetching partial error:", aiErr);
    }).finally(() => {
      setInsightsLoading(false);
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getMonthlyData = () => {
    const monthlyMap = {};
    (transactions || []).forEach((t) => {
      if (!t || !t.date) return;
      const dateObj = new Date(t.date);
      if (isNaN(dateObj.getTime())) return;
      const monthYear = dateObj.toLocaleString("en-IN", { month: "short", year: "2-digit" });
      if (!monthlyMap[monthYear]) {
        monthlyMap[monthYear] = { month: monthYear, income: 0, expense: 0, savings: 0 };
      }
      const amt = Number(t.amount) || 0;
      if (t.type === "income") monthlyMap[monthYear].income += amt;
      else monthlyMap[monthYear].expense += amt;
    });

    return Object.values(monthlyMap)
      .map((item) => ({ ...item, savings: item.income - item.expense }))
      .sort((a, b) => {
        const dA = new Date("01 " + a.month).getTime() || 0;
        const dB = new Date("01 " + b.month).getTime() || 0;
        return dA - dB;
      });
  };

  const getCategoryData = () => {
    const categoryMap = {};
    (transactions || [])
      .filter((t) => t && t.type === "expense")
      .forEach((t) => {
        const cat = String(t.category || "Others");
        const amt = Number(t.amount) || 0;
        if (amt > 0) {
          categoryMap[cat] = (categoryMap[cat] || 0) + amt;
        }
      });

    return Object.keys(categoryMap).map((cat) => ({
      name: cat,
      value: categoryMap[cat],
    }));
  };

  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();

  const getCombinedMonthlyData = () => {
    const data = Array.isArray(monthlyData) ? [...monthlyData] : [];
    const forecastObj = forecastData?.forecast && typeof forecastData.forecast === "object" ? forecastData.forecast : null;
    if (forecastObj) {
      const predAmt = Number(forecastObj.predicted_amount ?? forecastObj.predicted_expense ?? 0);
      const nextM = typeof forecastObj.next_month === "string" && forecastObj.next_month.trim() !== "" ? forecastObj.next_month : null;
      if (predAmt > 0 && nextM) {
        if (!data.some((item) => item && item.month === nextM)) {
          data.push({ month: nextM, income: 0, expense: predAmt, isForecast: true });
        }
      }
    }
    return data;
  };
  const combinedMonthlyData = getCombinedMonthlyData();

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeAnomalies = Array.isArray(anomalies) ? anomalies : [];
  const safeInsights = Array.isArray(insights) ? insights : [];

  const totalIncome = safeTransactions.filter((t) => t && t.type === "income").reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const totalExpense = safeTransactions.filter((t) => t && t.type === "expense").reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;

  // Simulator Math
  const nonEssentialCategories = new Set(["shopping", "entertainment", "others", "gift", "travel", "restaurant", "leisure"]);
  const wantsExpenses = safeTransactions
    .filter((t) => t && t.type === "expense" && nonEssentialCategories.has(String(t.category || "").toLowerCase().trim()))
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const monthlyWantsSavings = Math.round(wantsExpenses * (wantsCutPercent / 100));
  const simulatedAnnualWealthAddition = (monthlyWantsSavings + extraSipMonthly) * 12;
  
  const baseScore = healthData?.score || 65;
  const simulatedScore = Math.min(98, Math.max(0, baseScore + Math.round(wantsCutPercent * 0.4) + Math.round((extraSipMonthly / 1000) * 1.2)));
  const simulatedGrade = simulatedScore >= 85 ? "A+ (Excellent)" : simulatedScore >= 75 ? "A (Optimal)" : simulatedScore >= 60 ? "B (Good)" : "C (Needs Attention)";

  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(val)) return "₹0";
    return `₹${Number(val).toLocaleString("en-IN")}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center space-y-3 flex-col">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400">Loading ZeBeyond analytics dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-16 rounded-3xl glass-card p-8 border border-rose-500/20 text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto text-xl">
          ⚠️
        </div>
        <h3 className="text-base font-extrabold text-white">Dashboard Unavailable</h3>
        <p className="text-xs font-semibold text-rose-300/90 leading-relaxed">
          {error}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => fetchDashboardData()}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition cursor-pointer"
          >
            🔄 Retry Loading
          </button>
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
          >
            Re-login
          </Link>
        </div>
      </div>
    );
  }

  const forecastObj = forecastData?.forecast && typeof forecastData.forecast === "object" ? forecastData.forecast : null;
  const predictedForecastAmt = forecastObj ? Number(forecastObj.predicted_amount ?? forecastObj.predicted_expense ?? 0) : 0;
  const forecastNextMonth = forecastObj && typeof forecastObj.next_month === "string" ? forecastObj.next_month : null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 relative bg-dot-grid">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Financial Analytics Dashboard</h1>
          <p className="mt-1 text-slate-400 text-xs font-medium">ZeBeyond high-tech transaction telemetry, ML anomaly detection, and forecasts.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/reports"
            className="rounded-xl glass-card hover:bg-slate-800/80 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white border border-slate-700/80 transition shadow cursor-pointer flex items-center gap-1.5"
          >
            <span>📄</span> Statement Report
          </Link>
          <Link
            to="/transactions"
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-5 py-2 text-xs font-black text-slate-950 shadow-md glow-cyan transition cursor-pointer"
          >
            Manage Transactions 💸
          </Link>
        </div>
      </div>

      {safeTransactions.length === 0 ? (
        <div className="rounded-3xl glass-card p-12 text-center border border-slate-800/80 space-y-4">
          <div className="mx-auto w-16 h-16 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center text-3xl">
            📊
          </div>
          <h3 className="text-xl font-extrabold text-white">No Telemetry Records Found</h3>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            Log income & expenses to initialize ML anomaly scanning and charts.
          </p>
          <Link
            to="/transactions"
            className="inline-block rounded-xl bg-cyan-500 text-slate-950 px-6 py-2.5 text-xs font-black shadow-md glow-cyan transition"
          >
            + Add First Transaction
          </Link>
        </div>
      ) : (
        <>
          {/* Smart Recommendations Widget */}
          <SectionErrorBoundary>
            <SmartRecommendations initialRecommendations={recommendations} />
          </SectionErrorBoundary>

          {/* Metrics Summary Grid */}
          <SectionErrorBoundary>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-800/80 space-y-2">
                <span className="text-xxs font-extrabold text-slate-400 uppercase tracking-widest">Total Income</span>
                <p className="text-3xl font-black text-emerald-400">{formatCurrency(totalIncome)}</p>
              </div>

              <div className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-800/80 space-y-2">
                <span className="text-xxs font-extrabold text-slate-400 uppercase tracking-widest">Total Expenses</span>
                <p className="text-3xl font-black text-rose-400">{formatCurrency(totalExpense)}</p>
              </div>

              <div className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-800/80 space-y-2">
                <span className="text-xxs font-extrabold text-slate-400 uppercase tracking-widest">Net Surplus</span>
                <p className={`text-3xl font-black ${balance >= 0 ? "text-gradient-cyan" : "text-amber-400"}`}>
                  {formatCurrency(balance)}
                </p>
              </div>

              <div className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-800/80 space-y-2">
                <span className="text-xxs font-extrabold text-slate-400 uppercase tracking-widest">Savings Rate</span>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-black text-cyan-400">{savingsRate}%</p>
                  <span className={`px-2.5 py-0.5 rounded-full text-xxs font-extrabold border ${
                    savingsRate >= 30 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}>
                    {savingsRate >= 30 ? "Optimal" : "Low Savings"}
                  </span>
                </div>
              </div>
            </div>
          </SectionErrorBoundary>

          {/* AI Health & Anomaly Row */}
          <SectionErrorBoundary>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card rounded-3xl p-6 border border-cyan-500/20 flex items-center justify-between shadow-lg">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-white text-sm">Financial Health Score</h4>
                  <p className="text-xs text-slate-400">Grade: <span className="font-extrabold text-cyan-400">{healthData ? (healthData.grade || "N/A") : "Calculating..."}</span></p>
                </div>
                <span className="text-4xl font-black text-gradient-cyan">
                  {healthData && healthData.score !== undefined && healthData.score !== null ? `${healthData.score}/100` : "--/100"}
                </span>
              </div>

              <div className="glass-card rounded-3xl p-6 border border-amber-500/20 flex items-center justify-between shadow-lg">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-white text-sm">ML Anomaly Detection</h4>
                  <p className="text-xs text-slate-400">
                    {safeAnomalies.length > 0 ? `Flagged ${safeAnomalies.length} transaction(s) deviating from behavior.` : "Zero transaction outliers flagged."}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                  safeAnomalies.length > 0 ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                }`}>
                  {safeAnomalies.length > 0 ? `${safeAnomalies.length} Outliers` : "Active Telemetry"}
                </span>
              </div>
            </div>
          </SectionErrorBoundary>

          {/* Interactive What-If Scenario Lab */}
          <SectionErrorBoundary>
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-xl space-y-6 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔮</span>
                    <h3 className="text-base font-extrabold text-white tracking-tight">Interactive What-If Scenario Lab</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">
                    Simulate how lifestyle adjustments & SIP increases instantly boost your Financial Health Score & 1-Year Wealth.
                  </p>
                </div>

                <span className="text-xxs font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full shrink-0">
                  Live Predictive Engine
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                {/* Controls */}
                <div className="space-y-5 lg:col-span-1">
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-300 mb-1.5">
                      <span>Cut Non-Essential Spending:</span>
                      <span className="text-cyan-400 font-extrabold">{wantsCutPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={wantsCutPercent}
                      onChange={(e) => setWantsCutPercent(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <p className="text-xxs text-slate-500 mt-1">Saves {formatCurrency(monthlyWantsSavings)}/mo from non-essentials</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-300 mb-1.5">
                      <span>Add Extra Monthly SIP:</span>
                      <span className="text-emerald-400 font-extrabold">{formatCurrency(extraSipMonthly)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20000"
                      step="1000"
                      value={extraSipMonthly}
                      onChange={(e) => setExtraSipMonthly(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                    <p className="text-xxs text-slate-500 mt-1">Routes surplus directly into compounding index funds</p>
                  </div>
                </div>

                {/* Simulated Results */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-[#0b0f17] border border-cyan-500/30 space-y-1">
                    <span className="text-xxs font-extrabold text-cyan-400 uppercase tracking-wider">Simulated Health Score</span>
                    <p className="text-2xl font-black text-cyan-300">{simulatedScore}/100</p>
                    <p className="text-xxs text-slate-400 font-semibold">{simulatedGrade}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0b0f17] border border-emerald-500/30 space-y-1">
                    <span className="text-xxs font-extrabold text-emerald-400 uppercase tracking-wider">Monthly Extra Surplus</span>
                    <p className="text-2xl font-black text-emerald-300">+{formatCurrency(monthlyWantsSavings)}</p>
                    <p className="text-xxs text-slate-400 font-semibold">Saved from lifestyle wants</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-tr from-indigo-900 to-slate-900 border border-indigo-500/40 space-y-1">
                    <span className="text-xxs font-extrabold text-indigo-300 uppercase tracking-wider">1-Year Wealth Addition</span>
                    <p className="text-2xl font-black text-white">+{formatCurrency(simulatedAnnualWealthAddition)}</p>
                    <p className="text-xxs text-indigo-200 font-semibold">Added to annual savings pool</p>
                  </div>
                </div>
              </div>
            </div>
          </SectionErrorBoundary>

          {/* AI Insights */}
          <SectionErrorBoundary>
            <div className="glass-card rounded-3xl p-6 border border-slate-800/80 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧠</span>
                  <h4 className="font-extrabold text-white text-sm">Gemini AI Advisor Insights</h4>
                </div>
                <span className="flex items-center gap-1.5 text-xxs font-extrabold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  Gemini 3.6 Flash Active
                </span>
              </div>

              {insightsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
                  <div className="p-4 rounded-2xl bg-[#0b0f17] border border-slate-800 space-y-2">
                    <div className="h-3 bg-slate-800 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-800/60 rounded w-1/2"></div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#0b0f17] border border-slate-800 space-y-2">
                    <div className="h-3 bg-slate-800 rounded w-5/6"></div>
                    <div className="h-3 bg-slate-800/60 rounded w-2/3"></div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#0b0f17] border border-slate-800 space-y-2">
                    <div className="h-3 bg-slate-800 rounded w-4/5"></div>
                    <div className="h-3 bg-slate-800/60 rounded w-1/2"></div>
                  </div>
                </div>
              ) : safeInsights.length === 0 ? (
                <p className="text-xs text-slate-400">No insights available.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {safeInsights.map((insight, idx) => {
                    const displayText = typeof insight === "string"
                      ? insight
                      : typeof insight === "object" && insight !== null
                      ? insight.text || insight.insight || insight.description || insight.message || insight.advice || insight.title || JSON.stringify(insight)
                      : String(insight || "");

                    return (
                      <div key={idx} className="p-4 rounded-2xl bg-[#0b0f17] border border-slate-800 text-xs text-slate-300 font-medium leading-relaxed">
                        💡 {displayText}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </SectionErrorBoundary>

          {/* Recharts Grid */}
          <SectionErrorBoundary>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="glass-card rounded-3xl p-6 border border-slate-800/80 lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-extrabold text-white">Monthly Cashflow Telemetry</h3>
                  {predictedForecastAmt > 0 && (
                    <span className="text-xxs font-extrabold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
                      🔮 Next Est ({forecastNextMonth || "Next Month"}): {formatCurrency(predictedForecastAmt)}
                    </span>
                  )}
                </div>
                {combinedMonthlyData.length === 0 ? (
                  <div className="h-72 flex flex-col items-center justify-center text-center p-4">
                    <span className="text-3xl mb-2">📊</span>
                    <p className="text-xs text-slate-400 font-medium">No monthly cashflow telemetry recorded yet.</p>
                  </div>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={combinedMonthlyData}>
                        <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip formatter={(val) => formatCurrency(val)} contentStyle={{ backgroundColor: "#0b0f17", borderColor: "#334155", borderRadius: "12px", color: "#fff" }} />
                        <Legend />
                        <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" name="Expenses" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="glass-card rounded-3xl p-6 border border-slate-800/80 space-y-4 flex flex-col justify-between">
                <h3 className="text-sm font-extrabold text-white">Category Allocation</h3>
                {categoryData.length === 0 ? (
                  <div className="h-56 flex flex-col items-center justify-center text-center p-4">
                    <span className="text-2xl mb-1">🍰</span>
                    <p className="text-xs text-slate-400 font-medium">No expense category data recorded yet.</p>
                  </div>
                ) : (
                  <>
                    <div className="h-56 relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(val) => formatCurrency(val)} contentStyle={{ backgroundColor: "#0b0f17", borderColor: "#334155", borderRadius: "12px", color: "#fff" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xxs font-bold text-slate-400">
                      {categoryData.map((item, idx) => (
                        <div key={item.name} className="flex items-center gap-1.5 truncate">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                          <span className="truncate">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

            </div>
          </SectionErrorBoundary>
        </>
      )}

    </div>
  );
}

export default Dashboard;