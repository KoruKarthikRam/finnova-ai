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

  // CSV Import Modal & Parsing State
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [parsedPreview, setParsedPreview] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  const fallbackClassify = (desc) => {
    const text = (desc || "").toLowerCase();
    const rules = [
      { category: "Food", words: ["food", "lunch", "dinner", "burger", "pizza", "restaurant", "swiggy", "zomato", "grocery", "groceries", "blinkit", "zepto", "instamart", "cafe", "tea", "coffee"] },
      { category: "Transport", words: ["uber", "ola", "petrol", "fuel", "diesel", "metro", "bus", "train", "flight", "taxi", "rapido", "auto", "irctc", "toll"] },
      { category: "Rent", words: ["rent", "landlord", "pg", "flat", "apartment", "maintenance"] },
      { category: "Shopping", words: ["amazon", "flipkart", "myntra", "ajio", "zara", "h&m", "clothes", "shoes", "decathlon", "shopping"] },
      { category: "Bills", words: ["electricity", "bill", "water", "gas", "recharge", "wifi", "broadband", "jio", "airtel", "utility"] },
      { category: "Entertainment", words: ["netflix", "spotify", "movie", "cinema", "pvr", "bookmyshow", "hotstar", "gaming", "steam"] },
      { category: "Healthcare", words: ["doctor", "medicine", "pharmacy", "hospital", "clinic", "health", "apollo", "medplus"] },
      { category: "Education", words: ["course", "udemy", "coursera", "school", "college", "tuition", "books", "exam", "fee"] },
      { category: "Salary", words: ["salary", "paycheck", "stipend", "payroll", "wages"] },
      { category: "Investment", words: ["investment", "stock", "crypto", "dividend", "mutual fund", "sip"] },
    ];
    for (const item of rules) {
      if (item.words.some((w) => text.includes(w))) return item.category;
    }
    return "Others";
  };

  const handleParseCsv = (rawContent) => {
    if (!rawContent || !rawContent.trim()) {
      setParsedPreview([]);
      return;
    }

    const lines = rawContent.trim().split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const headerLine = lines[0].toLowerCase();
    const headers = headerLine.split(",").map(h => h.trim().replace(/^["']|["']$/g, ''));

    const dateIdx = headers.findIndex(h => h.includes("date") || h.includes("txn date"));
    const descIdx = headers.findIndex(h => h.includes("desc") || h.includes("narration") || h.includes("details") || h.includes("particulars"));
    const amtIdx = headers.findIndex(h => h.includes("amount") || h.includes("val"));
    const typeIdx = headers.findIndex(h => h.includes("type") || h.includes("cr/dr") || h.includes("credit/debit"));
    const catIdx = headers.findIndex(h => h.includes("cat"));

    const dataLines = lines.slice(1);
    const parsed = [];

    dataLines.forEach((line, index) => {
      const cols = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(",");
      const cleanCols = cols.map(c => c.trim().replace(/^["']|["']$/g, ''));

      const rawDesc = descIdx >= 0 ? cleanCols[descIdx] : (cleanCols[1] || `Transaction #${index + 1}`);
      let rawAmtStr = amtIdx >= 0 ? cleanCols[amtIdx] : cleanCols[2] || "0";
      rawAmtStr = rawAmtStr.replace(/[^0-9.-]/g, '');
      let amtNum = Math.abs(parseFloat(rawAmtStr) || 0);

      let rawType = "expense";
      if (typeIdx >= 0 && cleanCols[typeIdx]) {
        const tVal = cleanCols[typeIdx].toLowerCase();
        if (tVal.includes("cr") || tVal.includes("credit") || tVal.includes("income")) {
          rawType = "income";
        }
      } else if (parseFloat(rawAmtStr) < 0) {
        rawType = "expense";
      }

      let rawDate = dateIdx >= 0 ? cleanCols[dateIdx] : new Date().toISOString().split("T")[0];
      const parsedDateObj = new Date(rawDate);
      const safeDateStr = !isNaN(parsedDateObj.getTime()) ? parsedDateObj.toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

      let rawCat = catIdx >= 0 && cleanCols[catIdx] ? cleanCols[catIdx] : fallbackClassify(rawDesc);

      if (amtNum > 0) {
        parsed.push({
          id: index,
          selected: true,
          date: safeDateStr,
          description: rawDesc,
          amount: amtNum,
          type: rawType,
          category: rawCat,
          isEssential: rawType === "expense" ? true : true
        });
      }
    });

    setParsedPreview(parsed);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result;
      setCsvText(content);
      handleParseCsv(content);
    };
    reader.readAsText(file);
  };

  const handleBulkImportSubmit = async () => {
    const selectedRows = parsedPreview.filter(p => p.selected);
    if (selectedRows.length === 0) {
      alert("Please select at least 1 transaction to import.");
      return;
    }

    try {
      setIsImporting(true);
      const payload = selectedRows.map(r => ({
        type: r.type,
        amount: r.amount,
        category: r.category,
        description: r.description,
        date: r.date,
        isEssential: r.isEssential
      }));

      const response = await axios.post(`${API_BASE_URL}/api/transactions/bulk`, { transactions: payload }, getAuthConfig());
      if (response.data.success) {
        setSuccess(`Successfully batch imported ${response.data.data.length} transactions!`);
        setTransactions([...response.data.data, ...transactions]);
        setShowImportModal(false);
        setCsvText("");
        setParsedPreview([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to batch import transactions");
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportCsv = () => {
    if (transactions.length === 0) {
      alert("No transaction records available to export.");
      return;
    }

    const headers = ["Date", "Type", "Amount (INR)", "Category", "Description", "Essential"];
    const rows = transactions.map(t => [
      t.date ? new Date(t.date).toISOString().split("T")[0] : "",
      t.type || "expense",
      t.amount || 0,
      `"${(t.category || "").replace(/"/g, '""')}"`,
      `"${(t.description || "").replace(/"/g, '""')}"`,
      t.isEssential ? "Need" : "Want"
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `FinNova_Transactions_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Transactions Hub</h1>
          <p className="mt-2 text-slate-500">Record, filter, and batch import daily financial activities.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 shadow-xxs"
          >
            <span>📥</span> Import Bank Statement (CSV)
          </button>
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xxs"
          >
            <span>📤</span> Export CSV
          </button>
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

      {/* CSV Bank Statement Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Batch Import Bank Statement CSV</h3>
                <p className="text-xs text-slate-500 mt-0.5">Upload or paste a CSV file to auto-parse and classify transactions.</p>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-xs font-bold text-slate-800">Choose CSV File</span>
                  <p className="text-xxs text-slate-400">Supports HDFC, ICICI, SBI, Axis, Paytm & custom CSVs</p>
                </div>
                <input
                  type="file"
                  accept=".csv, text/csv"
                  onChange={handleFileUpload}
                  className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Or Paste CSV Content</label>
                <textarea
                  rows={3}
                  value={csvText}
                  onChange={(e) => {
                    setCsvText(e.target.value);
                    handleParseCsv(e.target.value);
                  }}
                  placeholder="Date, Description, Amount, Type, Category&#10;2026-09-01, Swiggy Dinner, 450, Expense, Food&#10;2026-09-02, Salary Credit, 75000, Income, Salary"
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-mono text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {parsedPreview.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-slate-800">
                      Preview Parsed Records ({parsedPreview.filter(p => p.selected).length} / {parsedPreview.length} Selected)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const allSelected = parsedPreview.every(p => p.selected);
                        setParsedPreview(parsedPreview.map(p => ({ ...p, selected: !allSelected })));
                      }}
                      className="text-xxs font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Toggle All
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 sticky top-0 font-bold text-slate-700">
                        <tr>
                          <th className="p-2 text-center">Import</th>
                          <th className="p-2">Date</th>
                          <th className="p-2">Description</th>
                          <th className="p-2">Type</th>
                          <th className="p-2">Category</th>
                          <th className="p-2 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedPreview.map((row, idx) => (
                          <tr key={idx} className={row.selected ? "bg-white" : "bg-slate-50 opacity-50"}>
                            <td className="p-2 text-center">
                              <input
                                type="checkbox"
                                checked={row.selected}
                                onChange={(e) => {
                                  const updated = [...parsedPreview];
                                  updated[idx].selected = e.target.checked;
                                  setParsedPreview(updated);
                                }}
                                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                              />
                            </td>
                            <td className="p-2 font-mono text-xxs whitespace-nowrap">{row.date}</td>
                            <td className="p-2 font-semibold text-slate-800 truncate max-w-[160px]">{row.description}</td>
                            <td className="p-2">
                              <span className={`px-2 py-0.5 rounded text-xxs font-bold ${row.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {row.type}
                              </span>
                            </td>
                            <td className="p-2 font-medium text-slate-600">{row.category}</td>
                            <td className="p-2 text-right font-bold">₹{row.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkImportSubmit}
                disabled={isImporting || parsedPreview.filter(p => p.selected).length === 0}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-extrabold hover:bg-indigo-700 transition shadow disabled:opacity-50 cursor-pointer"
              >
                {isImporting ? "Batch Importing..." : `Import Selected (${parsedPreview.filter(p => p.selected).length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;