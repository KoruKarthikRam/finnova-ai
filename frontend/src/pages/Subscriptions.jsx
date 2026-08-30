import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/config";

function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [totalOverhead, setTotalOverhead] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Custom manual subscription modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [customCategory, setCustomCategory] = useState("Entertainment");
  const [customDueDate, setCustomDueDate] = useState("");

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await axios.get(`${API_BASE_URL}/api/subscriptions`, getAuthConfig());
      if (response.data.success) {
        setSubscriptions(response.data.subscriptions || []);
        setTotalOverhead(response.data.totalMonthlyOverhead || 0);
      }
    } catch (err) {
      console.error("Failed to load detected subscriptions:", err);
      setError("Unable to load detected subscriptions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleAddCustomSubscription = (e) => {
    e.preventDefault();
    if (!customTitle.trim() || !customAmount || Number(customAmount) <= 0) return;

    const newSub = {
      title: customTitle.trim(),
      category: customCategory,
      amount: Number(customAmount),
      frequency: "Monthly",
      occurrences: 1,
      last_paid: new Date().toISOString().split("T")[0],
      next_due: customDueDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      confidence: 1.0,
      isCustom: true
    };

    setSubscriptions((prev) => [newSub, ...prev]);
    setTotalOverhead((prev) => prev + Number(customAmount));

    // Reset form
    setCustomTitle("");
    setCustomAmount("");
    setCustomDueDate("");
    setShowAddModal(false);
  };

  const formatCurrency = (val) => `₹${(val || 0).toLocaleString("en-IN")}`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>💳</span> Recurring Bills & Subscriptions Manager
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            Automated AI scanning detects repeating monthly subscriptions, upcoming bill due dates, and cost overheads.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-fit rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm transition cursor-pointer flex items-center gap-1.5"
        >
          <span>➕</span> Add Custom Plan
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Recurring Overhead</span>
            <p className="text-3xl font-black text-rose-600 mt-1">{formatCurrency(totalOverhead)}</p>
            <p className="text-xxs text-slate-400 mt-1">Fixed monthly commitment</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl font-bold">
            📉
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Tracked Plans</span>
            <p className="text-3xl font-black text-indigo-600 mt-1">{subscriptions.length} Subscriptions</p>
            <p className="text-xxs text-slate-400 mt-1">OTT, Broadband, Rent, Gym</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl font-bold">
            📱
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Annual Projected Spend</span>
            <p className="text-3xl font-black text-slate-800 mt-1">{formatCurrency(totalOverhead * 12)}</p>
            <p className="text-xxs text-slate-400 mt-1">Yearly subscription total</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-bold">
            📅
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 text-rose-600 text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {/* Main Subscriptions List */}
      {isLoading ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center space-y-3 shadow-sm">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-600">Scanning transaction history for recurring subscriptions...</p>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-3xl">
            💳
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Active Subscriptions Detected</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Log recurring bills on your Transactions page (e.g. Netflix, Airtel, Rent), or click <strong>Add Custom Plan</strong> above to track subscription payments.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition shadow cursor-pointer"
          >
            + Add First Subscription
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <span>🤖</span> Auto-Detected & Tracked Subscriptions
            </h2>
            <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
              {subscriptions.length} Active Items
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((sub, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-3 py-1 rounded-full text-xxs font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {sub.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xxs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {sub.isCustom ? "Manual Plan" : "AI Detected"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">{sub.title}</h3>
                    <p className="text-2xl font-black text-rose-600 mt-1">{formatCurrency(sub.amount)} <span className="text-xs font-bold text-slate-400">/ mo</span></p>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="pt-4 border-t border-slate-50 space-y-2 text-xxs text-slate-500 font-medium">
                  <div className="flex justify-between">
                    <span>Billing Frequency:</span>
                    <span className="font-bold text-slate-700">{sub.frequency}</span>
                  </div>
                  {sub.last_paid && (
                    <div className="flex justify-between">
                      <span>Last Paid:</span>
                      <span className="font-bold text-slate-700">{sub.last_paid}</span>
                    </div>
                  )}
                  {sub.next_due && (
                    <div className="flex justify-between text-indigo-600 font-bold">
                      <span>Next Est. Due Date:</span>
                      <span>{sub.next_due}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* AI Optimization Tip Box */}
          <div className="p-6 rounded-3xl bg-indigo-900 text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">💡 Subscription Optimization Tip</span>
              <p className="text-xs text-slate-200 leading-relaxed max-w-2xl">
                You spend <strong className="text-white font-black">{formatCurrency(totalOverhead)}</strong> monthly on recurring bills. Reviewing unused OTT streaming channels or unused gym plans can save you up to <strong className="text-emerald-400 font-black">{formatCurrency(totalOverhead * 0.3 * 12)}</strong> per year!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Subscription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-slate-900 text-lg">Add Custom Subscription Plan</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs font-bold transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomSubscription} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Plan / Service Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, Spotify, Gym, Rent"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Cost (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 499"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none"
                >
                  <option value="Entertainment">Entertainment</option>
                  <option value="Bills">Bills & Utilities</option>
                  <option value="Rent">Rent & Housing</option>
                  <option value="Healthcare">Health & Fitness</option>
                  <option value="Shopping">Shopping & Tech</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Next Billing Due Date</label>
                <input
                  type="date"
                  value={customDueDate}
                  onChange={(e) => setCustomDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow"
                >
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Subscriptions;
