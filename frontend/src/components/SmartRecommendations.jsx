import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function SmartRecommendations() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://localhost:5000/api/recommendations", getAuthConfig());
      if (res.data.success) {
        setRecommendations(res.data.recommendations || []);
        setMetrics(res.data.metricsSummary || null);
      }
    } catch (err) {
      console.error("Failed to fetch smart recommendations:", err);
      setError("Unable to load smart recommendations.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const getBadgeStyle = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-rose-50 text-rose-600 border-rose-200";
      case "High":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "Medium":
        return "bg-indigo-50 text-indigo-600 border-indigo-200";
      default:
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm animate-pulse space-y-4">
        <div className="h-5 bg-slate-200 rounded w-1/3"></div>
        <div className="h-20 bg-slate-100 rounded-2xl"></div>
      </div>
    );
  }

  if (error || recommendations.length === 0) return null;

  return (
    <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-indigo-900 via-slate-900 to-violet-950 p-6 sm:p-8 text-white shadow-xl space-y-6 relative overflow-hidden">
      <div className="absolute right-0 top-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 relative z-10 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <h3 className="text-xl font-extrabold tracking-tight">Smart Recommendations for You</h3>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Personalized financial masterclasses generated dynamically from your live savings rate and transactions.
          </p>
        </div>

        {metrics && (
          <div className="flex gap-2 text-xxs font-bold shrink-0">
            <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-indigo-300">
              Savings Rate: {metrics.savingsRate}%
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-emerald-300">
              Health: {metrics.healthScore}/100
            </span>
          </div>
        )}
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            onClick={() => navigate(`/learning`)}
            className="group rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 p-5 shadow-sm transition duration-200 flex flex-col justify-between cursor-pointer space-y-3"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 rounded-full text-xxs font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
                  {rec.category}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xxs font-bold border ${getBadgeStyle(rec.priority)}`}>
                  {rec.priority} Priority
                </span>
              </div>

              <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition leading-snug">
                {rec.title}
              </h4>

              <p className="text-xxs text-slate-300 leading-relaxed">
                💡 {rec.reason}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
              <span>{rec.actionText || "Start Module"}</span>
              <span className="group-hover:translate-x-1 transition">→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SmartRecommendations;
