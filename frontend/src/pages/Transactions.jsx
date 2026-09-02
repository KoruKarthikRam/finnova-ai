import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/config";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isEssential, setIsEssential] = useState(true);
  const [suggestedCategory, setSuggestedCategory] = useState("");


  // Filter States
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Categories lists
  const expenseCategories = [
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

  const incomeCategories = ["Salary", "Investment", "Gift", "Refund", "Others"];

  // Helper to fetch authorization config
  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/transactions`,
        getAuthConfig()
      );
      if (response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Sync category default on type switch
  useEffect(() => {
    if (type === "expense") {
      setCategory("Food");
    } else {
      setCategory("Salary");
    }
  }, [type]);

  // Debounced API call to classify description
  useEffect(() => {
    if (!description.trim() || description.length < 3) {
      setSuggestedCategory("");
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/classify`,
          { description },
          getAuthConfig()
        );
        if (response.data.success) {
          const suggested = response.data.category;
          const currentCategories = type === "expense" ? expenseCategories : incomeCategories;
          if (currentCategories.some((cat) => cat.toLowerCase() === suggested.toLowerCase())) {
            const matchedCat = currentCategories.find(
              (cat) => cat.toLowerCase() === suggested.toLowerCase()
            );
            setSuggestedCategory(matchedCat);
          } else {
            setSuggestedCategory("");
          }
        }
      } catch (err) {
        console.error("Failed to fetch classification suggestion:", err);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [description, type]);

  const handleApplySuggestion = () => {
    if (suggestedCategory) {
      setCategory(suggestedCategory);
      setSuggestedCategory("");
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return setError("Please enter a valid positive amount");
    }

    try {
      const payload = {
        type,
        amount: parseFloat(amount),
        category,
        description,
        date,
        isEssential: type === "expense" ? isEssential : true, // Income is always essential contextually
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/transactions`,
        payload,
        getAuthConfig()
      );

      if (response.data.success) {
        setSuccess("Transaction added successfully!");
        setTransactions([response.data.data, ...transactions]);
        // Reset form
        setAmount("");
        setDescription("");
        setDate(new Date().toISOString().split("T")[0]);
        setIsEssential(true);
        setSuggestedCategory("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create transaction");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;

    setError("");
    setSuccess("");

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/transactions/${id}`,
        getAuthConfig()
      );

      if (response.data.success) {
        setSuccess("Transaction deleted successfully!");
        setTransactions(transactions.filter((item) => item._id !== id));
      }
    } catch (err) {
      setError("Failed to delete transaction");
    }
  };

  // Filter & Search Logic
  const filteredTransactions = transactions.filter((item) => {
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    const matchesSearch =
      searchTerm === "" ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesCategory && matchesSearch;
  });

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const netSavings = totalIncome - totalExpense;

  const allCategories = Array.from(new Set([...expenseCategories, ...incomeCategories]));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Transactions Hub</h1>
        <p className="mt-2 text-slate-500">Record, filter, and track your daily financial activities.</p>
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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Income</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">₹{(totalIncome || 0).toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Expenses</p>
          <p className="mt-2 text-3xl font-bold text-rose-600">₹{(totalExpense || 0).toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Net Savings</p>
          <p className={`mt-2 text-3xl font-bold ${netSavings >= 0 ? "text-indigo-600" : "text-amber-600"}`}>
            ₹{(netSavings || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form Column */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 h-fit space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Add Transaction</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Transaction Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`py-2 rounded-lg font-semibold border transition cursor-pointer text-center ${
                    type === "expense"
                      ? "bg-rose-50 text-rose-600 border-rose-300 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Expense 💸
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`py-2 rounded-lg font-semibold border transition cursor-pointer text-center ${
                    type === "income"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-300 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Income 💰
                </button>
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-900 font-medium focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Category dropdown */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-900 font-medium focus:border-indigo-500 focus:outline-none bg-white cursor-pointer"
              >
                {type === "expense"
                  ? expenseCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))
                  : incomeCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Dinner at cafe, Monthly salary"
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-900 font-medium focus:border-indigo-500 focus:outline-none"
              />
              {suggestedCategory && (
                <div className="mt-1.5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleApplySuggestion}
                    className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md px-2.5 py-1.5 hover:bg-indigo-100 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>✨ AI Suggests Category:</span> <strong>{suggestedCategory}</strong>
                    <span className="text-xxs text-indigo-400 bg-indigo-100/50 px-1 rounded hover:bg-indigo-200">(Click to Apply)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Date input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-900 font-medium focus:border-indigo-500 focus:outline-none bg-white"
              />
            </div>

            {/* Essential Checkbox (Only for Expense) */}
            {type === "expense" && (
              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="isEssential"
                  checked={isEssential}
                  onChange={(e) => setIsEssential(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="isEssential" className="text-sm text-slate-700 font-semibold cursor-pointer select-none">
                  Mark as Essential Spending (Need)
                </label>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="w-full mt-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 transition duration-200 cursor-pointer"
            >
              Add Transaction
            </button>
          </form>
        </div>

        {/* History Column */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800">History</h2>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search description/category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-900 font-medium focus:border-indigo-500 focus:outline-none w-full sm:w-64"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-4 text-sm font-medium border-b border-slate-100 pb-4">
            <div>
              <span className="text-slate-500 mr-2">Type:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 text-slate-900 font-medium outline-none cursor-pointer"
              >
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div>
              <span className="text-slate-500 mr-2">Category:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 text-slate-900 font-medium outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transaction List */}
          {loading ? (
            <p className="text-center text-slate-500 py-10 font-semibold">Loading transaction records...</p>
          ) : filteredTransactions.length === 0 ? (
            <p className="text-center text-slate-400 py-10">No transactions match your search/filter.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-400 font-semibold border-b border-slate-100">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Description</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3 text-center">Essential</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTransactions.map((item) => (
                    <tr key={item._id} className="text-slate-700 hover:bg-slate-50/50 transition">
                      <td className="py-3.5 font-medium whitespace-nowrap">
                        {new Date(item.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5">
                        <p className="font-semibold text-slate-800">{item.description || "N/A"}</p>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            item.type === "income"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        {item.type === "expense" ? (
                          item.isEssential ? (
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">Need</span>
                          ) : (
                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">Want</span>
                          )
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td
                        className={`py-3.5 text-right font-bold text-base ${
                          item.type === "income" ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {item.type === "income" ? "+" : "-"}₹{(item.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 text-center">
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                          title="Delete Transaction"
                        >
                          <svg
                            className="w-5 h-5 inline"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Transactions;