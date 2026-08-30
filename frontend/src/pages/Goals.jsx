import { useState, useEffect } from "react";
import axios from "axios";

function Goals() {
  const [goals, setGoals] = useState([]);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [contribAmounts, setContribAmounts] = useState({}); // track quick contribution inputs per goal

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/goals", getAuthConfig());
      if (response.data.success) {
        setGoals(response.data.data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch savings goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!targetAmount || isNaN(targetAmount) || parseFloat(targetAmount) <= 0) {
      return setError("Please enter a valid positive target amount");
    }

    try {
      const payload = {
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
        deadline,
      };

      const response = await axios.post(
        "http://localhost:5000/api/goals",
        payload,
        getAuthConfig()
      );

      if (response.data.success) {
        setSuccess("Savings goal created successfully!");
        setName("");
        setTargetAmount("");
        setCurrentAmount("");
        setDeadline("");
        setGoals([...goals, response.data.data]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create savings goal");
    }
  };

  const handleAddFunds = async (id, currentVal, targetVal) => {
    const addVal = contribAmounts[id];
    if (!addVal || isNaN(addVal) || parseFloat(addVal) <= 0) {
      alert("Please enter a valid positive contribution amount");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const newAmount = currentVal + parseFloat(addVal);
      const response = await axios.put(
        `http://localhost:5000/api/goals/${id}`,
        { currentAmount: newAmount },
        getAuthConfig()
      );

      if (response.data.success) {
        setSuccess(`Successfully added ₹${addVal} to your savings goal!`);
        // Update list in state
        setGoals(goals.map((g) => (g._id === id ? response.data.data : g)));
        // Reset input field
        setContribAmounts({ ...contribAmounts, [id]: "" });
      }
    } catch (err) {
      setError("Failed to update savings goal");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this savings goal?")) return;

    setError("");
    setSuccess("");

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/goals/${id}`,
        getAuthConfig()
      );

      if (response.data.success) {
        setSuccess("Savings goal removed successfully!");
        setGoals(goals.filter((g) => g._id !== id));
      }
    } catch (err) {
      setError("Failed to delete savings goal");
    }
  };

  const handleContribChange = (id, val) => {
    setContribAmounts({
      ...contribAmounts,
      [id]: val,
    });
  };

  // Aggregated totals
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Savings Goals</h1>
        <p className="mt-2 text-slate-500">Plan ahead, allocate funds, and track your milestone achievements.</p>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Targets</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">₹{totalTarget.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Saved</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">₹{totalSaved.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Overall Savings Rate</p>
          <div className="mt-2 flex items-center gap-3">
            <p className="text-3xl font-bold text-indigo-600">{overallPercent}%</p>
            <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(overallPercent, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creation Form */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 h-fit space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">New Savings Goal</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Goal Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Emergency Fund, Car Deposit"
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-900 font-medium focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Target Amount (₹)</label>
              <input
                type="number"
                required
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="Target value e.g. 50000"
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-900 font-medium focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Initial Deposit (Optional)</label>
              <input
                type="number"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-900 font-medium focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Target Deadline</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-900 font-medium focus:border-indigo-500 focus:outline-none bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 transition duration-200 cursor-pointer"
            >
              Create Goal
            </button>
          </form>
        </div>

        {/* Goals Progress Grid */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Your Goals</h2>

          {loading ? (
            <p className="text-center text-slate-500 py-10 font-semibold">Loading savings goals...</p>
          ) : goals.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <span className="text-3xl block">🎯</span>
              <p>No savings goals created yet.</p>
              <p className="text-xs">Establish your financial targets to build better habits.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map((g) => {
                const percent = Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100);
                const isCompleted = g.status === "completed";
                const isOverdue = new Date(g.deadline) < new Date() && !isCompleted;

                return (
                  <div
                    key={g._id}
                    className="p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4 hover:shadow transition bg-slate-50/50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg leading-snug">{g.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Deadline:{" "}
                          {new Date(g.deadline).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="flex gap-2 items-center">
                        <span
                          className={`text-xxs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                            isCompleted
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : isOverdue
                              ? "bg-rose-50 text-rose-700 border-rose-100"
                              : "bg-blue-50 text-blue-700 border-blue-100"
                          }`}
                        >
                          {isCompleted ? "Completed" : isOverdue ? "Overdue" : "Active"}
                        </span>
                        
                        <button
                          onClick={() => handleDelete(g._id)}
                          className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Remove Goal"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Progress details */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>₹{g.currentAmount.toLocaleString()} saved</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted ? "bg-emerald-500" : "bg-indigo-600"
                          }`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xxs text-slate-400">
                        <span>Target: ₹{g.targetAmount.toLocaleString()}</span>
                        <span>Remaining: ₹{Math.max(g.targetAmount - g.currentAmount, 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Add Funds quick widget (only if not completed) */}
                    {!isCompleted && (
                      <div className="flex gap-2 pt-2 border-t border-slate-100">
                        <input
                          type="number"
                          placeholder="Amount ₹"
                          value={contribAmounts[g._id] || ""}
                          onChange={(e) => handleContribChange(g._id, e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 font-medium focus:border-indigo-500 focus:outline-none"
                        />
                        <button
                          onClick={() => handleAddFunds(g._id, g.currentAmount, g.targetAmount)}
                          className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700 transition cursor-pointer"
                        >
                          Add Savings
                        </button>
                      </div>
                    )}
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

export default Goals;