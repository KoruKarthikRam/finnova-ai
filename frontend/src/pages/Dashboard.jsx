import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
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
  AreaChart,
  Area,
} from "recharts";

// Colors for Pie chart slices
const COLORS = [
  "#6366f1", // Indigo
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#14b8a6", // Teal
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
  "#8b5cf6", // Violet
  "#3b82f6", // Blue
  "#64748b", // Slate
];

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [anomalies, setAnomalies] = useState([]);
  const [forecastData, setForecastData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const current = new Date();
        const month = current.getMonth() + 1;
        const year = current.getFullYear();

        const [txRes, budgetRes, goalRes, healthRes] = await Promise.all([
          axios.get("http://localhost:5000/api/transactions", config),
          axios.get(`http://localhost:5000/api/budgets?month=${month}&year=${year}`, config),
          axios.get("http://localhost:5000/api/goals", config),
          axios.get("http://localhost:5000/api/dashboard/health-score", config),
        ]);

        if (txRes.data.success) {
          setTransactions(txRes.data.data);
        }
        if (budgetRes.data.success) {
          setBudgets(budgetRes.data.data);
        }
        if (goalRes.data.success) {
          setGoals(goalRes.data.data);
        }
        if (healthRes.data.success) {
          setHealthData(healthRes.data.data);
        }

        // Fetch anomalies independently to prevent crashing dashboard if AI service is down
        try {
          const anomalyRes = await axios.get("http://localhost:5000/api/ai/anomalies", config);
          if (anomalyRes.data.success) {
            setAnomalies(anomalyRes.data.anomalies || []);
          }
        } catch (anomalyErr) {
          console.error("Failed to load anomalies from AI service:", anomalyErr);
          setAnomalies([]);
        }

        // Fetch forecast independently to prevent crashing dashboard if AI service is down
        try {
          const forecastRes = await axios.get("http://localhost:5000/api/ai/forecast", config);
          if (forecastRes.data.success) {
            setForecastData(forecastRes.data);
          }
        } catch (forecastErr) {
          console.error("Failed to load forecast from AI service:", forecastErr);
          setForecastData(null);
        }

        // Fetch insights independently to prevent delaying main dashboard load
        const fetchInsights = async () => {
          try {
            setInsightsLoading(true);
            const insightsRes = await axios.get("http://localhost:5000/api/ai/insights", config);
            if (insightsRes.data.success) {
              setInsights(insightsRes.data.insights || []);
            }
          } catch (insightsErr) {
            console.error("Failed to load insights from Gemini service:", insightsErr);
            setInsights([]);
          } finally {
            setInsightsLoading(false);
          }
        };
        fetchInsights();
      } catch (err) {
        console.error(err);
        setError("Failed to fetch dashboard metrics");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // 1. Data Aggregation for Charts
  const getMonthlyData = () => {
    const monthlyMap = {};
    transactions.forEach((t) => {
      const dateObj = new Date(t.date);
      // Group by format "Jan 26"
      const monthYear = dateObj.toLocaleString("en-IN", {
        month: "short",
        year: "2-digit",
      });
      if (!monthlyMap[monthYear]) {
        monthlyMap[monthYear] = { month: monthYear, income: 0, expense: 0, savings: 0 };
      }
      if (t.type === "income") {
        monthlyMap[monthYear].income += t.amount;
      } else {
        monthlyMap[monthYear].expense += t.amount;
      }
    });

    // Calculate savings and sort chronologically
    return Object.values(monthlyMap)
      .map((item) => ({
        ...item,
        savings: item.income - item.expense,
      }))
      .sort((a, b) => {
        // Parse date for comparison
        const dateA = new Date("01 " + a.month);
        const dateB = new Date("01 " + b.month);
        return dateA - dateB;
      });
  };

  const getCategoryData = () => {
    const categoryMap = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        if (!categoryMap[t.category]) {
          categoryMap[t.category] = 0;
        }
        categoryMap[t.category] += t.amount;
      });

    return Object.keys(categoryMap).map((cat) => ({
      name: cat,
      value: categoryMap[cat],
    }));
  };

  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();

  const getCombinedMonthlyData = () => {
    const data = [...monthlyData];
    if (
      forecastData &&
      forecastData.forecast &&
      forecastData.forecast.predicted_amount > 0 &&
      forecastData.forecast.next_month
    ) {
      const { next_month, predicted_amount } = forecastData.forecast;
      const monthExists = data.some((item) => item.month === next_month);
      if (!monthExists) {
        data.push({
          month: next_month,
          income: 0,
          expense: predicted_amount,
          isForecast: true,
        });
      }
    }
    return data;
  };
  const combinedMonthlyData = getCombinedMonthlyData();

  // 2. Calculations
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;

  // Budget calculations
  const getSpentAmountForCategory = (cat) => {
    const current = new Date();
    const currentMonth = current.getMonth() + 1;
    const currentYear = current.getFullYear();
    return transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return (
          t.type === "expense" &&
          t.category.toLowerCase() === cat.toLowerCase() &&
          (tDate.getMonth() + 1) === currentMonth &&
          tDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const exceededBudgets = budgets.filter(
    (b) => getSpentAmountForCategory(b.category) > b.limit
  );

  // Format currency helper
  const formatCurrency = (val) => `₹${val.toLocaleString("en-IN")}`;

  if (loading) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center">
        <p className="text-lg font-semibold text-slate-500">Loading your financial dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto mt-10 rounded-xl bg-rose-50 p-6 text-rose-600 border border-rose-100 font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Financial Dashboard</h1>
          <p className="mt-2 text-slate-500">Real-time charts, spending analysis, and AI insights.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/reports"
            className="w-fit rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:border-indigo-200 shadow-xxs transition cursor-pointer flex items-center gap-1.5"
          >
            <span>📄</span> Download Monthly Report
          </Link>
          <Link
            to="/transactions"
            className="w-fit rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm hover:shadow transition cursor-pointer"
          >
            Manage Transactions 💸
          </Link>
        </div>
      </div>

      {transactions.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm border border-slate-100 space-y-5">
          <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-3xl">
            📊
          </div>
          <h3 className="text-2xl font-bold text-slate-800">No Financial Records Found</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Get started by logging your income and monthly expenses on the Transactions page. We will analyze your spending habits and compile your graphs here.
          </p>
          <Link
            to="/transactions"
            className="inline-block rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow transition"
          >
            Add Your First Transaction
          </Link>
        </div>
      ) : (
        /* Main Dashboard Content */
        <>
          {/* Smart Recommendations Engine Widget */}
          <SmartRecommendations />

          {exceededBudgets.length > 0 && (
            <div className="rounded-2xl bg-rose-50 border border-rose-100 p-5 text-rose-700 space-y-2 shadow-sm">
              <h4 className="font-bold flex items-center gap-2 text-base">
                <span>⚠️</span> Budget Exceeded Warning
              </h4>
              <p className="text-sm">
                You have exceeded your monthly budgets in the following categories:{" "}
                <strong className="font-semibold">{exceededBudgets.map((b) => b.category).join(", ")}</strong>. 
                Consider reviewing your recent transactions or scaling back non-essential spending.
              </p>
            </div>
          )}

          {/* Metrics summary grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Income</span>
              <p className="mt-2 text-2xl font-extrabold text-emerald-600">{formatCurrency(totalIncome)}</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Expenses</span>
              <p className="mt-2 text-2xl font-extrabold text-rose-600">{formatCurrency(totalExpense)}</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Balance</span>
              <p className={`mt-2 text-2xl font-extrabold ${balance >= 0 ? "text-indigo-600" : "text-amber-600"}`}>
                {formatCurrency(balance)}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Savings Rate</span>
              <div className="mt-2 flex items-center gap-3">
                <p className="text-2xl font-extrabold text-indigo-600">{savingsRate}%</p>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                    savingsRate >= 30
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : savingsRate >= 10
                      ? "bg-amber-50 text-amber-700 border border-amber-100"
                      : "bg-rose-50 text-rose-700 border border-rose-100"
                  }`}
                >
                  {savingsRate >= 30 ? "Excellent" : savingsRate >= 10 ? "Good" : "Low Savings"}
                </span>
              </div>
            </div>
          </div>

          {/* AI Score & Alerts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-indigo-50/50 p-6 border border-indigo-100/50 flex items-center justify-between shadow-sm">
              <div>
                <h4 className="font-bold text-slate-800">Financial Health Score</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500">Grade:</span>
                  <span className={`text-xs font-bold ${healthData ? healthData.gradeColor : "text-indigo-600"}`}>
                    {healthData ? healthData.grade : "Calculating..."}
                  </span>
                </div>
              </div>
              <span className="text-3xl font-extrabold text-indigo-600">
                {healthData ? `${healthData.score}/100` : "--/100"}
              </span>
            </div>

            <div className="rounded-2xl bg-amber-50/50 p-6 border border-amber-100/50 flex flex-col justify-between shadow-sm gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Anomaly Detections</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    {anomalies.length > 0
                      ? `We flagged ${anomalies.length} transaction(s) that deviate significantly from your typical behavior.`
                      : "No unusual transaction patterns detected."}
                  </p>
                </div>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  anomalies.length > 0 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {anomalies.length > 0 ? `${anomalies.length} Warning(s)` : "Active Scanning"}
                </span>
              </div>
              
              {anomalies.length > 0 && (
                <div className="space-y-2 mt-2">
                  {anomalies.map((anom) => (
                    <div key={anom.id || anom._id} className="bg-white rounded-xl p-3 border border-amber-200/60 shadow-xxs flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{anom.description || "Unlabeled Outlier"}</p>
                        <p className="text-slate-400 font-medium">
                          {new Date(anom.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short"
                          })} • {anom.category}
                        </p>
                        <p className="text-amber-600 mt-1 font-semibold">{anom.reason}</p>
                      </div>
                      <span className="font-extrabold text-sm text-rose-600 ml-4 whitespace-nowrap">
                        -₹{anom.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI Insights Panel */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧠</span>
                <h4 className="font-extrabold text-slate-800 tracking-tight text-base">Personalized AI Insights</h4>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2.5 py-1 rounded-full shadow-xxs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Powered by Gemini AI
              </span>
            </div>

            {insightsLoading ? (
              <div className="space-y-3 py-2">
                <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded animate-pulse w-5/6"></div>
                <div className="h-4 bg-slate-100 rounded animate-pulse w-2/3"></div>
              </div>
            ) : insights.length === 0 ? (
              <p className="text-sm text-slate-400 font-medium">No insights generated yet. Setup budgets and log transactions to see customized advice.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex gap-3 hover:translate-x-0.5 hover:shadow-xxs transition duration-200"
                  >
                    <span className="text-lg shrink-0">💡</span>
                    <p className="text-xs font-semibold text-slate-600 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recharts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly comparison bar chart */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h3 className="text-xl font-bold text-slate-800">Income vs. Expenses Trend</h3>
                {forecastData && forecastData.forecast && forecastData.forecast.predicted_amount > 0 && (
                  <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-100/50 rounded-xl px-4 py-2 flex items-center gap-2.5 shadow-xxs">
                    <span className="text-base">🔮</span>
                    <div className="text-xs">
                      <span className="font-semibold text-slate-500">Next Month Est. ({forecastData.forecast.next_month}): </span>
                      <span className="font-extrabold text-indigo-600 text-sm">
                        {formatCurrency(forecastData.forecast.predicted_amount)}
                      </span>
                      <span className="text-slate-400 font-medium ml-1">
                        ({forecastData.forecast.method === "linear_regression" ? "Linear Regression" : "Avg. Roll"})
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={combinedMonthlyData}>
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      formatter={(value, name, props) => {
                        const isForecast = props.payload.isForecast;
                        if (isForecast && name === "Income") return null;
                        return [
                          formatCurrency(value),
                          isForecast ? `${name} (Forecast)` : name
                        ];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expenses" radius={[4, 4, 0, 0]}>
                      {combinedMonthlyData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.isForecast ? "#a78bfa" : "#f43f5e"}
                          fillOpacity={entry.isForecast ? 0.75 : 1}
                          stroke={entry.isForecast ? "#8b5cf6" : "none"}
                          strokeWidth={entry.isForecast ? 2 : 0}
                          strokeDasharray={entry.isForecast ? "4 4" : "0"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense breakdown pie chart */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4 flex flex-col justify-between">
              <h3 className="text-xl font-bold text-slate-800">Expense Categories</h3>
              {categoryData.length === 0 ? (
                <p className="text-slate-400 text-center py-20">No expenses recorded yet.</p>
              ) : (
                <>
                  <div className="h-60 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend list */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 mt-2">
                    {categoryData.map((item, idx) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        ></span>
                        <span className="truncate">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Savings trend line chart */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 lg:col-span-3 space-y-4">
              <h3 className="text-xl font-bold text-slate-800">Net Savings Growth</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Area
                      type="monotone"
                      dataKey="savings"
                      name="Savings"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorSavings)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent transactions section */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-5 h-fit">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Recent Transactions</h3>
                <Link to="/transactions" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition">
                  View All History →
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {transactions.slice(0, 5).map((item) => (
                  <div key={item._id} className="flex justify-between items-center py-3 hover:bg-slate-50/30 transition px-2 rounded-lg text-sm">
                    <div className="flex items-center gap-4">
                      <span className={`text-xl w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        item.type === "income" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      }`}>
                        {item.type === "income" ? "📈" : "📉"}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800">{item.description || item.category}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(item.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })} • {item.category}
                        </p>
                      </div>
                    </div>
                    <span className={`font-bold text-base whitespace-nowrap ${
                      item.type === "income" ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {item.type === "income" ? "+" : "-"}₹{item.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Savings Goals overview section */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-5 h-fit">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Savings Goals</h3>
                <Link to="/goals" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition">
                  Manage Goals →
                </Link>
              </div>

              {goals.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <span className="text-2xl block">🎯</span>
                  <p className="text-sm font-medium">No savings goals created yet.</p>
                  <p className="text-xs text-slate-400">Create goals to track long-term savings.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {goals.slice(0, 3).map((g) => {
                    const percent = Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100);
                    return (
                      <div key={g._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2.5">
                        <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                          <span className="truncate max-w-[180px]">{g.name}</span>
                          <span className={`${g.status === "completed" ? "text-emerald-600" : "text-indigo-600"}`}>{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              g.status === "completed" ? "bg-emerald-500" : "bg-indigo-600"
                            }`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xxs text-slate-400">
                          <span>Saved: ₹{g.currentAmount.toLocaleString()}</span>
                          <span>Target: ₹{g.targetAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;