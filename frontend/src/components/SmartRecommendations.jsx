import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../api/config";

function SmartRecommendations({ initialRecommendations = null }) {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState(initialRecommendations || []);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(!initialRecommendations);
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
      const res = await axios.get(`${API_BASE_URL}/api/recommendations`, getAuthConfig());
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
    if (initialRecommendations && Array.isArray(initialRecommendations)) {
      setRecommendations(initialRecommendations);
      setIsLoading(false);
    } else {
      fetchRecommendations();
    }
  }, [initialRecommendations]);

  const getBadgeStyle = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "High":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Medium":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl bg-white p-6 border border-slate-200 animate-pulse space-y-3 shadow-xs">
        <div className="h-5 bg-slate-200 rounded w-1/3"></div>
        <div className="h-16 bg-slate-100 rounded-2xl"></div>
      </div>
    );
  }

  if (error || recommendations.length === 0) return null;

  return (
    <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 relative z-10 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Smart Recommendations for You</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Personalized financial masterclasses generated dynamically from your live metrics.
          </p>
        </div>

        {metrics && (
          <div className="flex gap-2 text-xxs font-extrabold shrink-0">
            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-indigo-600">
              Savings Rate: {metrics.savingsRate}%
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-emerald-600">
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
            className="group bg-slate-50 hover:bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-200 shadow-xxs hover:shadow-sm transition duration-200 flex flex-col justify-between cursor-pointer space-y-3"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 rounded-full text-xxs font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100">
                  {rec.category}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xxs font-extrabold border ${getBadgeStyle(rec.priority)}`}>
                  {rec.priority} Priority
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                {rec.title}
              </h4>

              <p className="text-xxs text-slate-600 leading-relaxed font-medium">
                💡 {rec.reason}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
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
