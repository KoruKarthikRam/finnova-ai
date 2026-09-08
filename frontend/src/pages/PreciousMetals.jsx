import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/config";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";

function PreciousMetals() {
  const [ratesData, setRatesData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Calculator State
  const [calcMetal, setCalcMetal] = useState("gold");
  const [calcPurity, setCalcPurity] = useState("24K");
  const [calcWeight, setCalcWeight] = useState(10);
  const [calcUnit, setCalcUnit] = useState("gram");
  const [calcIncludeGst, setCalcIncludeGst] = useState(true);
  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // Selected City Filter
  const [selectedCity, setSelectedCity] = useState("All");

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchRates = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const config = getAuthConfig();
      const [liveRes, historyRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/metals/live`, config),
        axios.get(`${API_BASE_URL}/api/metals/history`, config)
      ]);

      if (liveRes.data && liveRes.data.success) {
        setRatesData(liveRes.data);
      } else {
        setError("Failed to load live metal rates.");
      }

      if (historyRes.data && historyRes.data.success) {
        setHistoryData(historyRes.data.trend || []);
      }
    } catch (err) {
      console.error("Error fetching metal rates:", err);
      setError("Unable to connect to live bullion service. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCalculate = async () => {
    setCalcLoading(true);
    try {
      const config = getAuthConfig();
      const res = await axios.post(
        `${API_BASE_URL}/api/metals/calculate`,
        {
          metal: calcMetal,
          purity: calcPurity,
          weight: Number(calcWeight) || 0,
          unit: calcUnit,
          includeGst: calcIncludeGst
        },
        config
      );
      if (res.data && res.data.success) {
        setCalcResult(res.data.data);
      }
    } catch (err) {
      console.error("Calculation error:", err);
    } finally {
      setCalcLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  useEffect(() => {
    if (ratesData) {
      handleCalculate();
    }
  }, [calcMetal, calcPurity, calcWeight, calcUnit, calcIncludeGst, ratesData]);

  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(val)) return "₹0";
    return `₹${Number(val).toLocaleString("en-IN")}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center flex-col space-y-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500">Fetching live Gold & Silver market rates in INR...</p>
      </div>
    );
  }

  if (error || !ratesData) {
    return (
      <div className="max-w-md mx-auto mt-16 rounded-3xl bg-white p-8 border border-rose-200 text-center space-y-4 shadow-md">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
          ⚠️
        </div>
        <h3 className="text-base font-extrabold text-slate-900">Rates Unavailable</h3>
        <p className="text-xs font-semibold text-rose-600 leading-relaxed">{error}</p>
        <button
          onClick={() => fetchRates()}
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition cursor-pointer"
        >
          🔄 Retry Loading Rates
        </button>
      </div>
    );
  }

  const { gold, silver, goldSilverRatio, cities, timestamp } = ratesData;
  const filteredCities = selectedCity === "All" ? cities : cities.filter(c => c.city === selectedCity);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 relative px-4 sm:px-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-slate-100 p-6 sm:p-8 rounded-3xl border border-amber-200/60 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Live Gold & Silver Rates <span className="text-amber-600 font-extrabold">(INR ₹)</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Real-time 24K, 22K, 18K Gold and Fine Silver spot pricing across major Indian cities with bullion calculator.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xxs font-extrabold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE MARKET
          </div>

          <button
            onClick={() => fetchRates(true)}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span className={refreshing ? "animate-spin" : ""}>🔄</span>
            <span>{refreshing ? "Updating..." : "Refresh Rates"}</span>
          </button>
        </div>
      </div>

      {/* Main Rate Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 24K Gold Card */}
        <div className="bg-gradient-to-b from-amber-500/10 via-white to-white rounded-3xl p-6 border border-amber-300/60 shadow-xs space-y-4 relative overflow-hidden group hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xxs font-black uppercase tracking-wider">
                24K Gold (99.9%)
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                {formatCurrency(gold.rates["24K"].perGram)} <span className="text-xs text-slate-500 font-bold">/ gram</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center text-xl font-bold">
              👑
            </div>
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600">
            <div className="flex justify-between">
              <span>Per 10 Grams:</span>
              <span className="font-extrabold text-slate-900">{formatCurrency(gold.rates["24K"].per10Gram)}</span>
            </div>
            <div className="flex justify-between">
              <span>Per Sovereign (8g):</span>
              <span className="font-extrabold text-slate-900">{formatCurrency(gold.rates["24K"].perSovereign)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-xxs font-extrabold pt-1">
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              +{formatCurrency(gold.change24h.amount)} ({gold.change24h.percent}%) 24h
            </span>
            <span className="text-slate-400">Day Range: ₹{gold.dayRange.low} - ₹{gold.dayRange.high}</span>
          </div>
        </div>

        {/* 22K Gold Card */}
        <div className="bg-gradient-to-b from-yellow-500/10 via-white to-white rounded-3xl p-6 border border-yellow-300/60 shadow-xs space-y-4 relative overflow-hidden group hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xxs font-black uppercase tracking-wider">
                22K Gold (Jewelry 91.6%)
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                {formatCurrency(gold.rates["22K"].perGram)} <span className="text-xs text-slate-500 font-bold">/ gram</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 text-yellow-700 flex items-center justify-center text-xl font-bold">
              ✨
            </div>
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600">
            <div className="flex justify-between">
              <span>Per 10 Grams:</span>
              <span className="font-extrabold text-slate-900">{formatCurrency(gold.rates["22K"].per10Gram)}</span>
            </div>
            <div className="flex justify-between">
              <span>Per Sovereign (8g):</span>
              <span className="font-extrabold text-slate-900">{formatCurrency(gold.rates["22K"].perSovereign)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-xxs font-extrabold pt-1">
            <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              Standard Indian Hallmark
            </span>
          </div>
        </div>

        {/* 18K Gold Card */}
        <div className="bg-gradient-to-b from-orange-500/10 via-white to-white rounded-3xl p-6 border border-orange-200/60 shadow-xs space-y-4 relative overflow-hidden group hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xxs font-black uppercase tracking-wider">
                18K Gold (75.0%)
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                {formatCurrency(gold.rates["18K"].perGram)} <span className="text-xs text-slate-500 font-bold">/ gram</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-700 flex items-center justify-center text-xl font-bold">
              🏆
            </div>
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600">
            <div className="flex justify-between">
              <span>Per 10 Grams:</span>
              <span className="font-extrabold text-slate-900">{formatCurrency(gold.rates["18K"].per10Gram)}</span>
            </div>
            <div className="flex justify-between">
              <span>Per Sovereign (8g):</span>
              <span className="font-extrabold text-slate-900">{formatCurrency(gold.rates["18K"].perSovereign)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-xxs font-extrabold pt-1">
            <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              Lightweight & Diamond Ornaments
            </span>
          </div>
        </div>

        {/* Fine Silver Card */}
        <div className="bg-gradient-to-b from-slate-200/40 via-white to-white rounded-3xl p-6 border border-slate-300 shadow-xs space-y-4 relative overflow-hidden group hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-xxs font-black uppercase tracking-wider">
                Fine Silver (99.9%)
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                ₹{silver.rates.perGram} <span className="text-xs text-slate-500 font-bold">/ gram</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center text-xl font-bold">
              ⚪
            </div>
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600">
            <div className="flex justify-between">
              <span>Per 100 Grams:</span>
              <span className="font-extrabold text-slate-900">{formatCurrency(silver.rates.per100Gram)}</span>
            </div>
            <div className="flex justify-between">
              <span>Per 1 KG:</span>
              <span className="font-extrabold text-indigo-600">{formatCurrency(silver.rates.perKg)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-xxs font-extrabold pt-1">
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              +₹{silver.change24h.amount} ({silver.change24h.percent}%) 24h
            </span>
          </div>
        </div>

      </div>

      {/* Calculator & Price Trend Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Bullion Value Calculator */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧮</span>
                <h3 className="text-base font-extrabold text-slate-900">Indian Bullion Calculator</h3>
              </div>
              <span className="text-xxs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Live Valuation
              </span>
            </div>

            {/* Inputs */}
            <div className="space-y-4 text-xs font-bold text-slate-700">
              {/* Metal Selection */}
              <div>
                <label className="block mb-1 text-slate-600">Select Metal:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCalcMetal("gold")}
                    className={`py-2 rounded-xl border text-xs font-extrabold transition cursor-pointer ${
                      calcMetal === "gold"
                        ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    🟡 Gold
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcMetal("silver")}
                    className={`py-2 rounded-xl border text-xs font-extrabold transition cursor-pointer ${
                      calcMetal === "silver"
                        ? "bg-slate-700 text-white border-slate-800 shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    ⚪ Silver
                  </button>
                </div>
              </div>

              {/* Purity (Gold only) */}
              {calcMetal === "gold" && (
                <div>
                  <label className="block mb-1 text-slate-600">Purity Grade:</label>
                  <select
                    value={calcPurity}
                    onChange={(e) => setCalcPurity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="24K">24K Gold (99.9% Fine)</option>
                    <option value="22K">22K Gold (91.6% Jewelry Standard)</option>
                    <option value="18K">18K Gold (75.0% Hallmarked)</option>
                  </select>
                </div>
              )}

              {/* Weight & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-600">Weight Quantity:</label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-extrabold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-600">Unit Measurement:</label>
                  <select
                    value={calcUnit}
                    onChange={(e) => setCalcUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="gram">Grams (g)</option>
                    <option value="sovereign">Sovereign / Pavan (8g)</option>
                    <option value="tola">Tola (11.66g)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="ounce">Troy Ounce (31.10g)</option>
                  </select>
                </div>
              </div>

              {/* GST Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-600 font-semibold">Include 3% Indian GST:</span>
                <button
                  type="button"
                  onClick={() => setCalcIncludeGst(!calcIncludeGst)}
                  className={`w-12 h-6 rounded-full p-1 transition duration-200 cursor-pointer ${
                    calcIncludeGst ? "bg-amber-500" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition duration-200 transform ${
                      calcIncludeGst ? "translate-x-6" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          </div>

          {/* Calculator Output */}
          {calcResult && (
            <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white space-y-2 shadow-sm">
              <div className="flex justify-between items-center text-amber-100 text-xxs font-extrabold uppercase tracking-wider">
                <span>Calculated Estimated Cost</span>
                <span>{calcResult.convertedGramWeight} grams ({calcResult.purity})</span>
              </div>
              <div className="text-3xl font-black">
                {formatCurrency(calcResult.totalAmount)}
              </div>
              <div className="flex justify-between items-center text-xxs text-amber-100 pt-1 border-t border-amber-400/50">
                <span>Base: {formatCurrency(calcResult.baseAmount)}</span>
                <span>GST (3%): +{formatCurrency(calcResult.gstAmount)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Price Trend Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">7-Day Gold Trend (₹ / Gram 24K)</h3>
              <p className="text-xs text-slate-500">Intraday spot market price trajectory</p>
            </div>
            <div className="text-xs font-extrabold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Ratio: {goldSilverRatio} (Au/Ag)
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={["auto", "auto"]} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString("en-IN")}`, "24K Gold Rate"]}
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#f59e0b", borderRadius: "12px", color: "#0f172a" }}
                />
                <Area type="monotone" dataKey="gold24kPerGram" stroke="#d97706" strokeWidth={3} fillOpacity={1} fill="url(#goldGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-t border-slate-100 pt-3 text-xxs font-bold text-slate-600">
            <div>
              <span className="text-slate-400 block">7D Low</span>
              <span className="text-slate-900 font-extrabold">
                {historyData.length > 0 ? formatCurrency(Math.min(...historyData.map(h => h.gold24kPerGram))) : "--"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">7D High</span>
              <span className="text-slate-900 font-extrabold">
                {historyData.length > 0 ? formatCurrency(Math.max(...historyData.map(h => h.gold24kPerGram))) : "--"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Silver (Per KG)</span>
              <span className="text-indigo-600 font-extrabold">{formatCurrency(silver.rates.perKg)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">USD/INR Base</span>
              <span className="text-slate-900 font-extrabold">₹{ratesData.usdInrRate || "83.95"}</span>
            </div>
          </div>
        </div>

      </div>

      {/* City-wise Benchmark Rates Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏙️</span>
              <h3 className="text-base font-extrabold text-slate-900">City-wise Gold & Silver Benchmark Rates</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard local market pricing per 10 grams (Gold) and 1 KG (Silver) incorporating regional duties.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Filter City:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="All">All Cities</option>
              {cities.map((c) => (
                <option key={c.city} value={c.city}>{c.city}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-xxs tracking-wider">
                <th className="py-3 px-4">City Hub</th>
                <th className="py-3 px-4">24K Gold (10g)</th>
                <th className="py-3 px-4">22K Gold (10g)</th>
                <th className="py-3 px-4">Silver (1 KG)</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCities.map((c) => (
                <tr key={c.city} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    {c.city}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-amber-700">{formatCurrency(c.gold24kPer10g)}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{formatCurrency(c.gold22kPer10g)}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{formatCurrency(c.silverPerKg)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xxs font-extrabold border border-emerald-100">
                      Active Spot
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Asset Allocation & Investment Insights */}
      <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/5 to-purple-500/10 rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-amber-200/40 pb-3">
          <span className="text-xl">🤖</span>
          <h3 className="text-base font-extrabold text-slate-900">AI Bullion Portfolio Guidance</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium text-slate-700 leading-relaxed">
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-amber-200/60 space-y-1">
            <span className="font-extrabold text-amber-800 block">💡 Ideal Portfolio Allocation</span>
            <p className="text-slate-600">Financial planners recommend allocating 5% - 15% of your total net worth into physical gold or Sovereign Gold Bonds (SGB) as a hedge against equity market volatility.</p>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-indigo-200/60 space-y-1">
            <span className="font-extrabold text-indigo-800 block">📊 Gold-to-Silver Ratio ({goldSilverRatio})</span>
            <p className="text-slate-600">Historically, a ratio above 80 indicates Silver is relatively undervalued compared to Gold, offering potential upside for long-term commodity accumulation.</p>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-purple-200/60 space-y-1">
            <span className="font-extrabold text-purple-800 block">🛡️ Inflation Protection</span>
            <p className="text-slate-600">Gold in INR has delivered an average annual CAGR of 9.5% over the past 20 years in India, consistently outperforming domestic consumer CPI inflation.</p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default PreciousMetals;
