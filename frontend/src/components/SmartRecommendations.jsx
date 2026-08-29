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
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "High":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "Medium":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl glass-card p-6 border border-slate-800 animate-pulse space-y-3">
        <div className="h-5 bg-slate-800 rounded w-1/3"></div>
        <div className="h-16 bg-slate-800/60 rounded-2xl"></div>
      </div>
    );
  }

  if (error || recommendations.length === 0) return null;

  return (
    <div className="rounded-3xl glass-card p-6 sm:p-8 border border-cyan-500/20 shadow-xl space-y-6 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute right-0 top-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 relative z-10 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <h3 className="text-base font-extrabold text-white tracking-tight">Smart Recommendations for You</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            Personalized financial masterclasses generated dynamically from your live telemetry metrics.
          </p>
        </div>

        {metrics && (
          <div className="flex gap-2 text-xxs font-extrabold shrink-0">
            <span className="px-3 py-1 rounded-full bg-[#0b0f17] border border-slate-800 text-cyan-300">
              Savings Rate: {metrics.savingsRate}%
            </span>
            <span className="px-3 py-1 rounded-full bg-[#0b0f17] border border-slate-800 text-emerald-300">
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
            className="group glass-card glass-card-hover rounded-2xl p-5 border border-slate-800/80 shadow-sm transition duration-200 flex flex-col justify-between cursor-pointer space-y-3"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 rounded-full text-xxs font-extrabold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {rec.category}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xxs font-extrabold border ${getBadgeStyle(rec.priority)}`}>
                  {rec.priority} Priority
                </span>
              </div>

              <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition leading-snug">
                {rec.title}
              </h4>

              <p className="text-xxs text-slate-400 leading-relaxed font-medium">
                💡 {rec.reason}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
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
