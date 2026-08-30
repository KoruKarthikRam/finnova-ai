import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/config";

function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [category, setCategory] = useState("Food");
  const [limit, setLimit] = useState("");
  
  const current = new Date();
  const [selectedMonth, setSelectedMonth] = useState(current.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(current.getFullYear());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const categories = [
    "Food",
    "Transport",
    "Rent",
    "Shopping",
    "Bills",
    "Entertainment",
    "Healthcare",
    "Education",
    "Others",
  ];

  const months = [
    { value: 1, name: "January" },
    { value: 2, name: "February" },
    { value: 3, name: "March" },
    { value: 4, name: "April" },
    { value: 5, name: "May" },
    { value: 6, name: "June" },
    { value: 7, name: "July" },
    { value: 8, name: "August" },
    { value: 9, name: "September" },
    { value: 10, name: "October" },
    { value: 11, name: "November" },
    { value: 12, name: "December" },
  ];

  const years = [current.getFullYear() - 1, current.getFullYear(), current.getFullYear() + 1];

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch budgets for selected month/year
      const budgetRes = await axios.get(
        `${API_BASE_URL}/api/budgets?month=${selectedMonth}&year=${selectedYear}`,
        getAuthConfig()
      );

      // Fetch all transactions to calculate matching category spends
      const transactionRes = await axios.get(
        `${API_BASE_URL}/api/transactions`,
        getAuthConfig()
      );

      if (budgetRes.data.success) {
        setBudgets(budgetRes.data.data);
      }
      if (transactionRes.data.success) {
        setTransactions(transactionRes.data.data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load budget and spending details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  // Calculate spent amount for a specific category in selected month & year
  const getSpentAmount = (cat) => {
    return transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        const tMonth = tDate.getMonth() + 1;
        const tYear = tDate.getFullYear();
        return (
          t.type === "expense" &&
          t.category.toLowerCase() === cat.toLowerCase() &&
          tMonth === selectedMonth &&
          tYear === selectedYear
        );
      })
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!limit || isNaN(limit) || parseFloat(limit) < 0) {
      return setError("Please enter a valid positive budget limit");
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/budgets`,
        {
          category,
          limit: parseFloat(limit),
          month: selectedMonth,
          year: selectedYear,
        },
        getAuthConfig()
      );

      if (response.data.success) {
        setSuccess("Budget limit set successfully!");
        setLimit("");
        // Reload list
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save budget limit");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this budget limit?")) return;

    setError("");
    setSuccess("");

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/budgets/${id}`,
        getAuthConfig()
      );

      if (response.data.success) {
        setSuccess("Budget limit removed successfully!");
        setBudgets(budgets.filter((b) => b._id !== id));
      }
    } catch (err) {
      setError("Failed to delete budget limit");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Category Budgets</h1>
          <p className="mt-2 text-slate-500">Set limits and track utilization metrics per month.</p>
        </div>

        {/* Date Selector controls */}
        <div className="flex gap-3 bg-white border border-slate-100 p-2 rounded-xl shadow-sm w-fit">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-1.5 rounded-lg text-sm bg-slate-50 border border-slate-100 text-slate-900 font-semibold outline-none cursor-pointer"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-1.5 rounded-lg text-sm bg-slate-50 border border-slate-100 text-slate-900 font-semibold outline-none cursor-pointer"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-rose-600 text-sm font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-600 text-sm font-medium">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Budget Setting Form */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 h-fit space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Set Category Limit</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Select Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-900 font-medium focus:border-indigo-500 focus:outline-none bg-white cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Monthly Limit (₹)</label>
              <input
                type="number"
                required
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="Limit amount e.g. 5000"
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-900 font-medium focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <p className="text-xs text-slate-400">
                This limit will be applied specifically to <strong>{months.find((m) => m.value === selectedMonth)?.name} {selectedYear}</strong>.
              </p>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 transition duration-200 cursor-pointer"
            >
              Apply Limit
            </button>
          </form>
        </div>

        {/* Budget Progress Lists */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">
            Limits for {months.find((m) => m.value === selectedMonth)?.name} {selectedYear}
          </h2>

          {loading ? (
            <p className="text-center text-slate-500 py-10 font-semibold">Loading budget records...</p>
          ) : budgets.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <span className="text-3xl block">📋</span>
              <p>No budget limits configured for this month.</p>
              <p className="text-xs">Use the panel on the left to set custom category limits.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {budgets.map((b) => {
                const spent = getSpentAmount(b.category);
                const percent = Math.min(Math.round((spent / b.limit) * 100), 150); // cap visual width
                const displayPercent = Math.round((spent / b.limit) * 100);
                const isOverBudget = spent > b.limit;

                // Color coding for progress bars
                let progressColor = "bg-emerald-500";
                let textBadgeColor = "bg-emerald-50 text-emerald-700 border border-emerald-100";
                
                if (displayPercent > 90) {
                  progressColor = "bg-rose-500";
                  textBadgeColor = "bg-rose-50 text-rose-700 border border-rose-100";
                } else if (displayPercent > 70) {
                  progressColor = "bg-amber-500";
                  textBadgeColor = "bg-amber-50 text-amber-700 border border-amber-100";
                }

                return (
                  <div key={b._id} className="p-4 rounded-xl border border-slate-100 hover:shadow-sm transition space-y-3 bg-slate-50/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-bold text-slate-800">{b.category}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Spent: <strong>₹{spent.toLocaleString()}</strong> of ₹{b.limit.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${textBadgeColor}`}>
                          {displayPercent}% {isOverBudget ? "Overspent" : "Used"}
                        </span>
                        
                        <button
                          onClick={() => handleDelete(b._id)}
                          className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Remove Budget"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar background */}
                    <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${progressColor} transition-all duration-500 rounded-full`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      ></div>
                    </div>

                    {/* Description message */}
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Remaining: ₹{Math.max(b.limit - spent, 0).toLocaleString()}</span>
                      {isOverBudget && (
                        <span className="text-rose-600 font-bold">⚠️ Exceeded by ₹{(spent - b.limit).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Budget;