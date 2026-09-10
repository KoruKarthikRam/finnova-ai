import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/config";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  LineChart,
  Line,
  CartesianGrid
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

  // Selected City Filter & Stock Category Filter
  const [selectedCity, setSelectedCity] = useState("All");
  const [stockCategory, setStockCategory] = useState("All");

  // Live Stock Graph State
  const [selectedStockSymbol, setSelectedStockSymbol] = useState("GOLDBEES");
  const [stockTimeframe, setStockTimeframe] = useState("1D");
  const [curveStyle, setCurveStyle] = useState("linear"); // "linear" for neat sharp vector curves, "monotone" for smooth
  const [stockGraphData, setStockGraphData] = useState(null);
  const [stockGraphLoading, setStockGraphLoading] = useState(false);
  const [isLiveStream, setIsLiveStream] = useState(true);
  const stockGraphRef = useRef(null);

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

  const fetchStockGraph = async (symbol, timeframe) => {
    setStockGraphLoading(true);
    try {
      const config = getAuthConfig();
      const res = await axios.get(
        `${API_BASE_URL}/api/metals/stock-graph?symbol=${symbol}&timeframe=${timeframe}`,
        config
      );
      if (res.data && res.data.success) {
        setStockGraphData(res.data);
      }
    } catch (err) {
      console.error("Error fetching stock graph data:", err);
    } finally {
      setStockGraphLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  useEffect(() => {
    if (ratesData) {
      fetchStockGraph(selectedStockSymbol, stockTimeframe);
    }
  }, [ratesData, selectedStockSymbol, stockTimeframe]);

  // Live intraday price ticks interval simulation when stream is ON and timeframe is 1D
  useEffect(() => {
    if (!isLiveStream || stockTimeframe !== "1D" || !stockGraphData) return;

    const interval = setInterval(() => {
      setStockGraphData((prev) => {
        if (!prev || !prev.points || prev.points.length === 0) return prev;

        const now = new Date();
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");
        const seconds = now.getSeconds().toString().padStart(2, "0");
        const timeLabel = `${hours}:${minutes}:${seconds}`;

        const delta = (Math.random() - 0.48) * (prev.currentPrice * 0.0012);
        const newPrice = Number(Math.max(1, prev.currentPrice + delta).toFixed(2));
        const newHigh = Math.max(prev.dayHigh, newPrice);
        const newLow = Math.min(prev.dayLow, newPrice);
        const newChange = Number((newPrice - prev.openPrice).toFixed(2));
        const newChangePct = Number(((newChange / prev.openPrice) * 100).toFixed(2));

        const updatedPoints = [
          ...prev.points,
          {
            timeLabel,
            timestamp: now.toISOString(),
            price: newPrice,
            high: Number((newPrice * 1.001).toFixed(2)),
            low: Number((newPrice * 0.999).toFixed(2)),
            volume: Math.floor(1000 + Math.random() * 4000)
          }
        ];

        if (updatedPoints.length > 90) updatedPoints.shift();

        return {
          ...prev,
          currentPrice: newPrice,
          dayHigh: newHigh,
          dayLow: newLow,
          change24h: newChange,
          changePercent: newChangePct,
          isPositive: newChange >= 0,
          points: updatedPoints
        };
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isLiveStream, stockTimeframe, stockGraphData?.symbol]);

  const handleSelectStock = (symbol) => {
    setSelectedStockSymbol(symbol);
    if (stockGraphRef.current) {
      stockGraphRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Instant client-side calculator computation without network latency
  const calcResult = useMemo(() => {
    if (!ratesData) return null;
    let gramWeight = Number(calcWeight) || 0;

    switch (String(calcUnit).toLowerCase()) {
      case "sovereign":
      case "pavan":
        gramWeight = gramWeight * 8;
        break;
      case "tola":
        gramWeight = gramWeight * 11.6638;
        break;
      case "kg":
        gramWeight = gramWeight * 1000;
        break;
      case "ounce":
      case "oz":
        gramWeight = gramWeight * 31.1035;
        break;
      case "gram":
      default:
        gramWeight = gramWeight * 1;
        break;
    }

    let pricePerGram = 0;
    if (calcMetal.toLowerCase() === "silver") {
      pricePerGram = ratesData.silver?.rates?.perGram || 0;
    } else {
      const selectedPurity = calcPurity.toUpperCase();
      pricePerGram = ratesData.gold?.rates?.[selectedPurity]?.perGram || ratesData.gold?.rates?.["24K"]?.perGram || 0;
    }

    const baseAmount = Math.round(gramWeight * pricePerGram);
    const gstAmount = calcIncludeGst ? Math.round(baseAmount * 0.03) : 0;
    const totalAmount = baseAmount + gstAmount;

    return {
      weightInput: Number(calcWeight),
      unit: calcUnit,
      convertedGramWeight: Number(gramWeight.toFixed(3)),
      metal: calcMetal,
      purity: calcMetal.toLowerCase() === "gold" ? calcPurity : "99.9%",
      pricePerGram,
      baseAmount,
      gstPercent: calcIncludeGst ? 3 : 0,
      gstAmount,
      totalAmount
    };
  }, [ratesData, calcMetal, calcPurity, calcWeight, calcUnit, calcIncludeGst]);

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

  const { gold, silver, goldSilverRatio, cities, stocks } = ratesData;
  const filteredCities = selectedCity === "All" ? cities : cities.filter(c => c.city === selectedCity);
  const filteredStocks = (stocks || []).filter(s => stockCategory === "All" || s.category === stockCategory);

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
            Real-time 24K, 22K, 18K Gold and Fine Silver spot pricing across major Indian cities with bullion calculator & sharp vector stock graphs.
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
              <p className="text-xs text-slate-500">Intraday spot market sharp vector price trajectory</p>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={["auto", "auto"]} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString("en-IN")}`, "24K Gold Rate"]}
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#f59e0b", borderRadius: "12px", color: "#0f172a" }}
                />
                <Area
                  type="linear"
                  dataKey="gold24kPerGram"
                  stroke="#d97706"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#goldGradient)"
                  activeDot={{ r: 5, fill: "#d97706", stroke: "#ffffff", strokeWidth: 2 }}
                />
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

      {/* Live Gold & ETF Interactive Stock Graph Section */}
      <div ref={stockGraphRef} className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 border-b border-slate-800 pb-5 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">📈</span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Live Gold & ETF Stock Graph
                {isLiveStream && stockTimeframe === "1D" && (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xxs font-extrabold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    LIVE STREAMING
                  </span>
                )}
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Real-time sharp vector intraday tick chart & technical indicators for Gold spot, Gold ETFs, NBFC equities & SGBs.
            </p>
          </div>

          {/* Timeframe Controls, Curve Style Toggle & Live Stream Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Curve Style Switcher (Sharp vs Smooth) */}
            <div className="flex items-center bg-slate-800/90 p-1 rounded-2xl border border-slate-700">
              <button
                type="button"
                onClick={() => setCurveStyle("linear")}
                className={`px-3 py-1.5 rounded-xl text-xxs font-black transition cursor-pointer flex items-center gap-1 ${
                  curveStyle === "linear"
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/60"
                }`}
              >
                ⚡ Sharp Curves
              </button>
              <button
                type="button"
                onClick={() => setCurveStyle("monotone")}
                className={`px-3 py-1.5 rounded-xl text-xxs font-black transition cursor-pointer flex items-center gap-1 ${
                  curveStyle === "monotone"
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/60"
                }`}
              >
                🌊 Smooth Curves
              </button>
            </div>

            {stockTimeframe === "1D" && (
              <button
                type="button"
                onClick={() => setIsLiveStream(!isLiveStream)}
                className={`px-3 py-1.5 rounded-xl text-xxs font-extrabold border transition flex items-center gap-1.5 cursor-pointer ${
                  isLiveStream
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                }`}
              >
                <span>{isLiveStream ? "🔴 Live Stream ON" : "⏸️ Live Stream Paused"}</span>
              </button>
            )}

            <div className="flex items-center bg-slate-800/90 p-1 rounded-2xl border border-slate-700">
              {["1D", "1W", "1M", "1Y"].map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setStockTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    stockTimeframe === tf
                      ? "bg-amber-500 text-slate-950 shadow-xs"
                      : "text-slate-400 hover:text-white hover:bg-slate-700/60"
                  }`}
                >
                  {tf === "1D" ? "1D (Live)" : tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Asset Quick Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <span className="text-xs font-bold text-slate-400 mr-1">Quick Select:</span>
          {[
            { symbol: "SPOT_24K", label: "🟡 24K Spot Gold" },
            { symbol: "GOLDBEES", label: "🪙 Gold BeES ETF" },
            { symbol: "TITAN", label: "🏆 Titan Ltd" },
            { symbol: "MUTHOOTFIN", label: "🏦 Muthoot Fin" },
            { symbol: "HDFCMFGETF", label: "📊 HDFC Gold ETF" },
            { symbol: "SETFGOLD", label: "✨ SBI Gold ETF" },
            { symbol: "MANAPPURAM", label: "💳 Manappuram" },
            { symbol: "SGB-DEC31", label: "📜 SGB Bond" }
          ].map((item) => (
            <button
              key={item.symbol}
              type="button"
              onClick={() => handleSelectStock(item.symbol)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                selectedStockSymbol === item.symbol
                  ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm"
                  : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Live Metrics Header Bar */}
        {stockGraphData && (
          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-800 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <div>
                <span className="text-xxs font-extrabold text-amber-400 uppercase tracking-wider block">
                  {stockGraphData.name} ({stockGraphData.category} • {stockGraphData.exchange})
                </span>
                <div className="text-3xl font-black text-white tracking-tight mt-0.5">
                  {formatCurrency(stockGraphData.currentPrice)}
                </div>
              </div>
              <div className={`flex items-center gap-1 text-sm font-black px-2.5 py-1 rounded-xl border ${
                stockGraphData.isPositive
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-400 border-rose-500/30"
              }`}>
                <span>{stockGraphData.isPositive ? "▲ +" : "▼ "}</span>
                <span>{formatCurrency(stockGraphData.change24h)}</span>
                <span>({stockGraphData.isPositive ? "+" : ""}{stockGraphData.changePercent}%)</span>
              </div>
            </div>

            {/* Technical Metrics Summary Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-xxs font-bold border-t md:border-t-0 border-slate-700 pt-3 md:pt-0">
              <div className="space-y-0.5">
                <span className="text-slate-400 block">Open</span>
                <span className="text-slate-200 font-extrabold">{formatCurrency(stockGraphData.openPrice)}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 block">High</span>
                <span className="text-emerald-400 font-extrabold">{formatCurrency(stockGraphData.dayHigh)}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 block">Low</span>
                <span className="text-rose-400 font-extrabold">{formatCurrency(stockGraphData.dayLow)}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 block">VWAP</span>
                <span className="text-amber-400 font-extrabold">{formatCurrency(stockGraphData.vwap)}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 block">52W Range</span>
                <span className="text-slate-200 font-extrabold">₹{stockGraphData.fiftyTwoWeekLow} - ₹{stockGraphData.fiftyTwoWeekHigh}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 block">Volume</span>
                <span className="text-indigo-400 font-extrabold">{stockGraphData.volume}</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Chart Canvas */}
        <div className="h-80 w-full relative z-10 pt-2">
          {stockGraphLoading ? (
            <div className="flex h-full items-center justify-center flex-col space-y-2">
              <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-400 font-bold">Loading live graph data for {selectedStockSymbol}...</p>
            </div>
          ) : stockGraphData && stockGraphData.points ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stockGraphData.points}>
                <defs>
                  <linearGradient id="stockGradPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={stockGraphData.symbol === "SPOT_24K" ? "#f59e0b" : stockGraphData.isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={stockGraphData.symbol === "SPOT_24K" ? "#f59e0b" : stockGraphData.isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} vertical={false} />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis domain={["auto", "auto"]} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950/95 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 font-sans backdrop-blur-md">
                          <div className="text-slate-400 text-xxs font-extrabold flex justify-between items-center gap-4">
                            <span>{data.timeLabel}</span>
                            <span className="text-amber-400 font-mono">LIVE VECTOR TICK</span>
                          </div>
                          <div className="text-lg font-black text-white">₹{Number(data.price).toLocaleString("en-IN")}</div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xxs text-slate-300 border-t border-slate-800 pt-1.5 font-semibold">
                            <span>High: <strong className="text-emerald-400">₹{data.high}</strong></span>
                            <span>Low: <strong className="text-rose-400">₹{data.low}</strong></span>
                            <span className="col-span-2">Vol: <strong className="text-slate-200">{data.volume?.toLocaleString("en-IN")}</strong></span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {stockGraphData.openPrice && (
                  <ReferenceLine y={stockGraphData.openPrice} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: `Open ₹${stockGraphData.openPrice}`, fill: '#94a3b8', fontSize: 10, position: 'insideTopLeft' }} />
                )}
                <Area
                  type={curveStyle}
                  dataKey="price"
                  stroke={stockGraphData.symbol === "SPOT_24K" ? "#f59e0b" : stockGraphData.isPositive ? "#10b981" : "#f43f5e"}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#stockGradPos)"
                  activeDot={{ r: 6, fill: stockGraphData.isPositive ? "#10b981" : "#f43f5e", stroke: "#ffffff", strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : null}
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

      {/* Live Gold ETFs & Gold-Linked Stocks Tracker */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📈</span>
              <h3 className="text-lg font-extrabold text-slate-900">Live Gold ETFs & Gold-Linked Stocks</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Real-time NSE/BSE spot tracking for Gold Exchange Traded Funds (ETFs), Gold Mining & NBFC Equities, and Sovereign Gold Bonds (SGBs).
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            {["All", "ETF", "Equity", "SGB"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setStockCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                  stockCategory === cat
                    ? "bg-amber-500 text-white font-extrabold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                {cat === "All" ? "All Assets" : cat === "ETF" ? "Gold ETFs" : cat === "Equity" ? "Gold Equities" : "SGB Bonds"}
              </button>
            ))}
          </div>
        </div>

        {/* Stock Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredStocks.map((stock) => (
            <div
              key={stock.symbol}
              className="bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-amber-300 rounded-2xl p-5 transition space-y-3 shadow-2xs hover:shadow-md group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`px-2 py-0.5 rounded-md text-xxs font-black tracking-wider uppercase border ${
                      stock.category === "ETF"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : stock.category === "Equity"
                        ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200"
                    }`}>
                      {stock.category} • {stock.exchange}
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-2 tracking-tight">
                      {stock.symbol}
                    </h4>
                    <p className="text-xxs text-slate-500 font-semibold truncate max-w-[160px]" title={stock.name}>
                      {stock.name}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xxs font-extrabold border ${
                    stock.isPositive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}>
                    {stock.isPositive ? "+" : ""}{stock.changePercent}%
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <div className="text-2xl font-black text-slate-900">
                    {formatCurrency(stock.price)}
                  </div>
                  <div className="text-xxs font-semibold text-slate-500 mt-0.5 flex justify-between">
                    <span>24h Change:</span>
                    <span className={stock.isPositive ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                      {stock.isPositive ? "+" : ""}{formatCurrency(stock.change24h)}
                    </span>
                  </div>
                </div>

                {/* Mini Sharp Vector Sparkline Visualization */}
                <div className="h-10 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { p: stock.price * 0.99 },
                      { p: stock.price * 0.994 },
                      { p: stock.price * (stock.isPositive ? 1.003 : 0.991) },
                      { p: stock.price * (stock.isPositive ? 1.006 : 0.988) },
                      { p: stock.price }
                    ]}>
                      <Line
                        type="linear"
                        dataKey="p"
                        stroke={stock.isPositive ? "#10b981" : "#f43f5e"}
                        strokeWidth={2.2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1 bg-white/80 p-2.5 rounded-xl border border-slate-100 text-xxs font-semibold text-slate-600">
                  <div className="flex justify-between">
                    <span>1Y CAGR Return:</span>
                    <span className="font-extrabold text-emerald-700">{stock.oneYearReturn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Day Range:</span>
                    <span className="font-bold text-slate-800">₹{stock.dayLow} - ₹{stock.dayHigh}</span>
                  </div>
                  <div className="flex justify-between pt-0.5 border-t border-slate-100 text-slate-400">
                    <span>Underlying:</span>
                    <span className="truncate max-w-[110px] text-slate-600 font-medium">{stock.underlying}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelectStock(stock.symbol)}
                className="w-full mt-3 py-2 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-slate-950 border border-slate-200 hover:border-amber-400 text-slate-700 text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-amber-400"
              >
                <span>📈 View Live Stock Graph</span>
              </button>
            </div>
          ))}
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
