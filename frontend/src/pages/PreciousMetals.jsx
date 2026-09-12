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

const getGrowwGoldUrl = (symbol) => {
  switch (symbol?.toUpperCase()) {
    case "GOLDBEES":
      return "https://groww.in/etfs/nippon-india-etf-gold-bees";
    case "HDFCMFGETF":
      return "https://groww.in/etfs/hdfc-gold-exchange-traded-fund";
    case "SETFGOLD":
      return "https://groww.in/etfs/sbi-etf-gold";
    case "KOTAKGOLD":
      return "https://groww.in/etfs/kotak-gold-etf";
    case "TITAN":
      return "https://groww.in/stocks/titan-company-ltd";
    case "MUTHOOTFIN":
      return "https://groww.in/stocks/muthoot-finance-ltd";
    case "MANAPPURAM":
      return "https://groww.in/stocks/manappuram-finance-ltd";
    case "SGB-DEC31":
    case "SGB":
      return "https://groww.in/sgb";
    default:
      return "https://groww.in/gold";
  }
};

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

  // Page Theme & Typography Style Customization State
  const [pageTheme, setPageTheme] = useState("royal-gold"); // "royal-gold", "silver-platinum", "emerald-wealth", "ivory-light"
  const [fontStyle, setFontStyle] = useState("cinzel"); // "cinzel", "space", "jakarta"

  // Live Stock Graph State
  const [selectedStockSymbol, setSelectedStockSymbol] = useState("GOLDBEES");
  const [stockTimeframe, setStockTimeframe] = useState("1D");
  const [curveStyle, setCurveStyle] = useState("linear"); // "linear" for sharp vector curves, "monotone" for smooth
  const [graphTheme, setGraphTheme] = useState("light"); // "light" for premium crisp light theme, "dark" for dark mode
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

  // Compute Day Range position percentage for meter bar
  const dayRangeProgress = useMemo(() => {
    if (!stockGraphData || !stockGraphData.dayHigh || !stockGraphData.dayLow) return 50;
    const { dayLow, dayHigh, currentPrice } = stockGraphData;
    if (dayHigh === dayLow) return 50;
    const pct = ((currentPrice - dayLow) / (dayHigh - dayLow)) * 100;
    return Math.min(100, Math.max(0, Number(pct.toFixed(1))));
  }, [stockGraphData]);

  if (loading) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center flex-col space-y-4 bg-slate-950 text-white rounded-3xl p-8">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin"></div>
          <span className="absolute text-xl">🪙</span>
        </div>
        <p className="text-sm font-extrabold text-amber-400 tracking-wide animate-pulse font-sans">
          Fetching Live Indian Bullion & Stock Exchange Data...
        </p>
      </div>
    );
  }

  if (error || !ratesData) {
    return (
      <div className="max-w-md mx-auto mt-16 rounded-3xl bg-slate-900 p-8 border border-rose-500/30 text-center space-y-4 shadow-2xl text-white">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-2xl font-bold border border-rose-500/30">
          ⚠️
        </div>
        <h3 className="text-lg font-black text-white">Market Feed Unavailable</h3>
        <p className="text-xs font-semibold text-rose-300 leading-relaxed">{error}</p>
        <button
          onClick={() => fetchRates()}
          className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition cursor-pointer shadow-lg shadow-amber-500/20"
        >
          🔄 Retry Connecting to Bullion Server
        </button>
      </div>
    );
  }

  const { gold, silver, goldSilverRatio, cities, stocks } = ratesData;
  const filteredCities = selectedCity === "All" ? cities : cities.filter(c => c.city === selectedCity);
  const filteredStocks = (stocks || []).filter(s => stockCategory === "All" || s.category === stockCategory);

  const isLight = pageTheme === "ivory-light" || graphTheme === "light";

  // Dynamic Theme & Typography Utilities
  const headingFontClass = fontStyle === "cinzel" ? "font-cinzel" : fontStyle === "space" ? "font-space" : "font-sans font-black";
  const numFontClass = "font-mono-wealth";

  const getThemeStyles = () => {
    switch (pageTheme) {
      case "silver-platinum":
        return {
          bg: "bg-slate-950 text-white",
          banner: "bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-slate-400/40 shadow-2xl glow-silver",
          bannerAccent: "text-slate-200 shimmer-silver-text",
          card: "bg-gradient-to-br from-slate-900/90 via-slate-800/50 to-slate-950 border-slate-600/60 text-white shadow-xl hover:border-slate-300 backdrop-blur-md",
          sectionCard: "bg-slate-900/95 border-slate-800 text-white shadow-xl backdrop-blur-xl",
          textAccent: "text-slate-200",
          badge: "bg-slate-800 text-slate-200 border-slate-700",
          input: "bg-slate-950 border-slate-700 text-white focus:ring-slate-400",
          tableRowHover: "hover:bg-slate-800/60",
          textMuted: "text-slate-400",
          textPrimary: "text-white"
        };
      case "emerald-wealth":
        return {
          bg: "bg-slate-950 text-white",
          banner: "bg-gradient-to-r from-slate-950 via-emerald-950/60 to-slate-950 border-emerald-500/40 shadow-2xl glow-emerald",
          bannerAccent: "text-emerald-400 font-extrabold",
          card: "bg-gradient-to-br from-slate-900/90 via-emerald-950/40 to-slate-950 border-emerald-500/30 text-white shadow-xl hover:border-emerald-400 backdrop-blur-md",
          sectionCard: "bg-slate-900/95 border-slate-800 text-white shadow-xl backdrop-blur-xl",
          textAccent: "text-emerald-400",
          badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
          input: "bg-slate-950 border-slate-700 text-white focus:ring-emerald-500",
          tableRowHover: "hover:bg-emerald-950/40",
          textMuted: "text-slate-400",
          textPrimary: "text-white"
        };
      case "ivory-light":
        return {
          bg: "bg-slate-100 text-slate-900",
          banner: "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 border-amber-400 shadow-xl text-slate-950",
          bannerAccent: "text-slate-950 font-black",
          card: "bg-white/95 border-slate-200/90 text-slate-900 shadow-md hover:border-amber-400 backdrop-blur-md",
          sectionCard: "bg-white/95 border-slate-200/90 text-slate-900 shadow-md",
          textAccent: "text-amber-800 font-black",
          badge: "bg-amber-100 text-amber-900 border-amber-300",
          input: "bg-white border-slate-200 text-slate-900 focus:ring-amber-500",
          tableRowHover: "hover:bg-amber-50/60",
          textMuted: "text-slate-500",
          textPrimary: "text-slate-900"
        };
      case "royal-gold":
      default:
        return {
          bg: "bg-slate-950 text-white",
          banner: "bg-gradient-to-r from-slate-950 via-amber-950/60 to-slate-950 border-amber-500/40 shadow-2xl glow-gold",
          bannerAccent: "text-amber-400 shimmer-gold-text",
          card: "bg-gradient-to-br from-slate-900/90 via-amber-950/30 to-slate-950 border-amber-500/30 text-white shadow-xl hover:border-amber-400 backdrop-blur-md",
          sectionCard: "bg-slate-900/95 border-slate-800 text-white shadow-xl backdrop-blur-xl",
          textAccent: "text-amber-400",
          badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          input: "bg-slate-950 border-slate-700 text-white focus:ring-amber-500",
          tableRowHover: "hover:bg-amber-950/40",
          textMuted: "text-slate-400",
          textPrimary: "text-white"
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <div className={`min-h-screen transition-colors duration-500 py-6 px-4 sm:px-6 relative ${theme.bg}`}>
      <div className={`max-w-7xl mx-auto space-y-8 pb-16 relative ${
        fontStyle === "cinzel" ? "font-outfit" : fontStyle === "space" ? "font-space" : "font-sans"
      }`}>
      
      {/* Dynamic Theme & Font Glassmorphic Header Banner */}
      <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border shadow-2xl backdrop-blur-xl transition-all duration-500 ${theme.banner} space-y-6`}>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 rounded-2xl bg-amber-500/20 border border-amber-500/30 shadow-inner">
                🪙
              </span>
              <div>
                <h1 className={`text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2 ${headingFontClass} ${pageTheme === "ivory-light" ? "text-slate-950" : "text-white"}`}>
                  Live Gold & Silver Bullion Hub <span className={`text-lg ${numFontClass} ${theme.bannerAccent}`}>(INR ₹)</span>
                </h1>
                <p className={`text-xs sm:text-sm font-medium mt-0.5 ${pageTheme === "ivory-light" ? "text-amber-950/80" : "text-slate-300"}`}>
                  Real-time Indian spot pricing for 24K, 22K, 18K Gold, Fine Silver, Gold ETFs & sharp vector stock graphs.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Live Ticker Pulse Badge */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xxs font-extrabold shadow-sm font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              SPOT MARKET ACTIVE
            </div>

            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xxs font-extrabold ${numFontClass} ${theme.badge}`}>
              Au/Ag Ratio: {goldSilverRatio}
            </div>

            <button
              onClick={() => fetchRates(true)}
              disabled={refreshing}
              className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-extrabold text-white transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span className={refreshing ? "animate-spin" : ""}>🔄</span>
              <span>{refreshing ? "Updating Market..." : "Refresh Feed"}</span>
            </button>

            <a
              href="https://groww.in/gold"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black transition shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer border border-emerald-300/60"
            >
              <span>⚡ Invest in Gold on Groww</span>
              <span>↗</span>
            </a>
          </div>
        </div>

        {/* Live Theme & Font Customization Toolbar */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs font-bold">
          {/* Theme Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`font-extrabold flex items-center gap-1.5 shrink-0 ${pageTheme === "ivory-light" ? "text-slate-950" : "text-amber-300"}`}>
              🎨 Page Theme:
            </span>
            <div className="flex flex-wrap items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-700/80">
              {[
                { id: "royal-gold", label: "👑 Royal 24K Gold", activeClass: "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md" },
                { id: "silver-platinum", label: "⚪ Silver Platinum", activeClass: "bg-gradient-to-r from-slate-300 to-slate-400 text-slate-950 font-black shadow-md" },
                { id: "emerald-wealth", label: "💎 Emerald Wealth", activeClass: "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black shadow-md" },
                { id: "ivory-light", label: "☀️ Ivory Light", activeClass: "bg-white text-slate-950 font-black shadow-md" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPageTheme(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xxs transition cursor-pointer ${
                    pageTheme === t.id
                      ? t.activeClass
                      : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Style Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`font-extrabold flex items-center gap-1.5 shrink-0 ${pageTheme === "ivory-light" ? "text-slate-950" : "text-amber-300"}`}>
              ✍️ Typography Style:
            </span>
            <div className="flex flex-wrap items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-700/80">
              {[
                { id: "cinzel", label: "🏛️ Royal Serif", fontClass: "font-cinzel" },
                { id: "space", label: "⚡ Cyber Finance", fontClass: "font-space" },
                { id: "jakarta", label: "✨ Modern Editorial", fontClass: "font-sans" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFontStyle(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xxs transition cursor-pointer ${f.fontClass} ${
                    fontStyle === f.id
                      ? "bg-amber-500 text-slate-950 font-black shadow-md"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Rate Cards Grid (Dark Luxury Glass Aesthetic) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 24K Gold Card */}
        <div className="bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-950 rounded-3xl p-6 border border-amber-500/30 hover:border-amber-400/80 shadow-xl space-y-4 relative overflow-hidden group hover:-translate-y-1 transition duration-300 text-white backdrop-blur-md">
          <div className="flex justify-between items-start">
            <div>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xxs font-black uppercase tracking-wider">
                24K Gold (99.9% Fine)
              </span>
              <h3 className="text-2xl font-black text-white mt-2.5 tracking-tight font-mono">
                {formatCurrency(gold.rates["24K"].perGram)} <span className="text-xs text-slate-400 font-bold font-sans">/ g</span>
              </h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-xl font-bold shadow-inner">
              👑
            </div>
          </div>

          <div className="space-y-1.5 border-t border-slate-800 pt-3 text-xs font-semibold text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">10 Grams (1 Tola):</span>
              <span className="font-extrabold text-white font-mono">{formatCurrency(gold.rates["24K"].per10Gram)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sovereign (8g Pavan):</span>
              <span className="font-extrabold text-white font-mono">{formatCurrency(gold.rates["24K"].perSovereign)}</span>
            </div>
          </div>

          {/* Mini Sparkline Vector */}
          <div className="h-8 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <Line type="linear" dataKey="gold24kPerGram" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center text-xxs font-extrabold pt-1 border-t border-slate-800/80">
            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-mono">
              +{formatCurrency(gold.change24h.amount)} ({gold.change24h.percent}%) 24h
            </span>
            <span className="text-slate-400 font-mono">Range: ₹{gold.dayRange.low} - ₹{gold.dayRange.high}</span>
          </div>

          <a
            href="https://groww.in/gold"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-2 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md border border-emerald-300/40"
          >
            <span>Buy 24K Gold on Groww</span>
            <span>↗</span>
          </a>
        </div>

        {/* 22K Gold Card */}
        <div className="bg-gradient-to-br from-slate-900 via-yellow-950/20 to-slate-950 rounded-3xl p-6 border border-yellow-500/30 hover:border-yellow-400/80 shadow-xl space-y-4 relative overflow-hidden group hover:-translate-y-1 transition duration-300 text-white backdrop-blur-md">
          <div className="flex justify-between items-start">
            <div>
              <span className="px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xxs font-black uppercase tracking-wider">
                22K Gold (Jewelry 91.6%)
              </span>
              <h3 className="text-2xl font-black text-white mt-2.5 tracking-tight font-mono">
                {formatCurrency(gold.rates["22K"].perGram)} <span className="text-xs text-slate-400 font-bold font-sans">/ g</span>
              </h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 flex items-center justify-center text-xl font-bold shadow-inner">
              ✨
            </div>
          </div>

          <div className="space-y-1.5 border-t border-slate-800 pt-3 text-xs font-semibold text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">10 Grams:</span>
              <span className="font-extrabold text-white font-mono">{formatCurrency(gold.rates["22K"].per10Gram)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sovereign (8g Pavan):</span>
              <span className="font-extrabold text-white font-mono">{formatCurrency(gold.rates["22K"].perSovereign)}</span>
            </div>
          </div>

          {/* Mini Sparkline Vector */}
          <div className="h-8 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <Line type="linear" dataKey="gold24kPerGram" stroke="#eab308" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center text-xxs font-extrabold pt-1 border-t border-slate-800/80">
            <span className="text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
              Standard Indian Hallmark
            </span>
          </div>
        </div>

        {/* 18K Gold Card */}
        <div className="bg-gradient-to-br from-slate-900 via-orange-950/20 to-slate-950 rounded-3xl p-6 border border-orange-500/30 hover:border-orange-400/80 shadow-xl space-y-4 relative overflow-hidden group hover:-translate-y-1 transition duration-300 text-white backdrop-blur-md">
          <div className="flex justify-between items-start">
            <div>
              <span className="px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xxs font-black uppercase tracking-wider">
                18K Gold (75.0% Hallmarked)
              </span>
              <h3 className="text-2xl font-black text-white mt-2.5 tracking-tight font-mono">
                {formatCurrency(gold.rates["18K"].perGram)} <span className="text-xs text-slate-400 font-bold font-sans">/ g</span>
              </h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center text-xl font-bold shadow-inner">
              🏆
            </div>
          </div>

          <div className="space-y-1.5 border-t border-slate-800 pt-3 text-xs font-semibold text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">10 Grams:</span>
              <span className="font-extrabold text-white font-mono">{formatCurrency(gold.rates["18K"].per10Gram)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sovereign (8g Pavan):</span>
              <span className="font-extrabold text-white font-mono">{formatCurrency(gold.rates["18K"].perSovereign)}</span>
            </div>
          </div>

          {/* Mini Sparkline Vector */}
          <div className="h-8 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <Line type="linear" dataKey="gold24kPerGram" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center text-xxs font-extrabold pt-1 border-t border-slate-800/80">
            <span className="text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
              Diamond & Daily Wear Ornaments
            </span>
          </div>
        </div>

        {/* Fine Silver Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800/40 to-slate-950 rounded-3xl p-6 border border-slate-400/30 hover:border-slate-300 shadow-xl space-y-4 relative overflow-hidden group hover:-translate-y-1 transition duration-300 text-white backdrop-blur-md">
          <div className="flex justify-between items-start">
            <div>
              <span className="px-2.5 py-1 rounded-full bg-slate-700 text-slate-200 border border-slate-600 text-xxs font-black uppercase tracking-wider">
                Fine Silver (99.9%)
              </span>
              <h3 className="text-2xl font-black text-white mt-2.5 tracking-tight font-mono">
                ₹{silver.rates.perGram} <span className="text-xs text-slate-400 font-bold font-sans">/ g</span>
              </h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-slate-700/50 border border-slate-500 text-slate-200 flex items-center justify-center text-xl font-bold shadow-inner">
              ⚪
            </div>
          </div>

          <div className="space-y-1.5 border-t border-slate-800 pt-3 text-xs font-semibold text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">100 Grams:</span>
              <span className="font-extrabold text-white font-mono">{formatCurrency(silver.rates.per100Gram)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">1 KG Bar:</span>
              <span className="font-extrabold text-indigo-400 font-mono">{formatCurrency(silver.rates.perKg)}</span>
            </div>
          </div>

          {/* Mini Sparkline Vector */}
          <div className="h-8 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <Line type="linear" dataKey="silverPerGram" stroke="#cbd5e1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center text-xxs font-extrabold pt-1 border-t border-slate-800/80 font-mono">
            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              +₹{silver.change24h.amount} ({silver.change24h.percent}%) 24h
            </span>
          </div>
        </div>

      </div>

      {/* Calculator & Price Trend Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Bullion Value Calculator (Enhanced UI with presets) */}
        <div className={`lg:col-span-5 rounded-3xl p-6 sm:p-7 border shadow-md space-y-6 flex flex-col justify-between ${theme.sectionCard}`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧮</span>
                <h3 className={`text-base font-extrabold ${headingFontClass} ${theme.textPrimary}`}>Indian Bullion Calculator</h3>
              </div>
              <span className={`text-xxs font-extrabold px-2.5 py-1 rounded-full border ${theme.badge}`}>
                Live Valuation
              </span>
            </div>

            {/* Metal Selection */}
            <div className="space-y-3 text-xs font-bold">
              <div>
                <label className={`block mb-1.5 ${theme.textMuted}`}>Select Commodity Metal:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCalcMetal("gold")}
                    className={`py-2.5 rounded-xl border text-xs font-black transition cursor-pointer ${
                      calcMetal === "gold"
                        ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black"
                        : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    🟡 Gold
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcMetal("silver")}
                    className={`py-2.5 rounded-xl border text-xs font-black transition cursor-pointer ${
                      calcMetal === "silver"
                        ? "bg-slate-300 text-slate-950 border-slate-400 shadow-md font-black"
                        : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    ⚪ Silver
                  </button>
                </div>
              </div>

              {/* Purity (Gold only) */}
              {calcMetal === "gold" && (
                <div>
                  <label className={`block mb-1 ${theme.textMuted}`}>Gold Purity Grade:</label>
                  <select
                    value={calcPurity}
                    onChange={(e) => setCalcPurity(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border font-extrabold focus:outline-none focus:ring-2 ${theme.input}`}
                  >
                    <option value="24K">24K Gold (99.9% Fine Bullion)</option>
                    <option value="22K">22K Gold (91.6% Jewelry Standard)</option>
                    <option value="18K">18K Gold (75.0% Hallmarked)</option>
                  </select>
                </div>
              )}

              {/* Quick Preset Weight Chips */}
              <div>
                <label className={`block mb-1 ${theme.textMuted}`}>Quick Quantity Presets:</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "1g", weight: 1, unit: "gram" },
                    { label: "8g (Pavan)", weight: 1, unit: "sovereign" },
                    { label: "10g (Tola)", weight: 10, unit: "gram" },
                    { label: "100g", weight: 100, unit: "gram" },
                    { label: "1 kg", weight: 1, unit: "kg" }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setCalcWeight(preset.weight);
                        setCalcUnit(preset.unit);
                      }}
                      className={`px-2.5 py-1 rounded-lg border text-xxs font-extrabold transition cursor-pointer ${theme.badge}`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight & Unit */}
              <div className="grid grid-cols-2 gap-3 min-w-0">
                <div className="min-w-0">
                  <label className={`block mb-1 truncate ${theme.textMuted}`}>Weight Quantity:</label>
                  <input
                    type="number"
                    min="0.1"
                    max="10000000"
                    step="any"
                    value={calcWeight}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val.length > 9) val = val.slice(0, 9);
                      setCalcWeight(val);
                    }}
                    className={`w-full min-w-0 max-w-full px-3 py-2.5 rounded-xl border font-black focus:outline-none focus:ring-2 ${numFontClass} overflow-hidden truncate ${theme.input}`}
                  />
                </div>
                <div className="min-w-0">
                  <label className={`block mb-1 truncate ${theme.textMuted}`}>Unit Measurement:</label>
                  <select
                    value={calcUnit}
                    onChange={(e) => setCalcUnit(e.target.value)}
                    className={`w-full min-w-0 max-w-full px-3 py-2.5 rounded-xl border font-bold focus:outline-none focus:ring-2 truncate ${theme.input}`}
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
                <span className={`font-semibold ${theme.textMuted}`}>Include 3% Indian GST:</span>
                <button
                  type="button"
                  onClick={() => setCalcIncludeGst(!calcIncludeGst)}
                  className={`w-12 h-6 rounded-full p-1 transition duration-200 cursor-pointer ${
                    calcIncludeGst ? "bg-amber-500" : "bg-slate-600"
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
            <div className={`mt-4 p-5 rounded-2xl space-y-3 shadow-lg border min-w-0 max-w-full overflow-hidden ${
              pageTheme === "ivory-light"
                ? "bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 text-white border-amber-500/30"
                : "bg-slate-950/80 border-amber-500/40 text-white"
            }`}>
              <div className="flex justify-between items-center text-amber-300 text-xxs font-extrabold uppercase tracking-wider min-w-0 gap-2">
                <span className="shrink-0">Calculated Valuation</span>
                <span className={`truncate text-right ${numFontClass}`} title={`${calcResult.convertedGramWeight} grams (${calcResult.purity})`}>
                  {calcResult.convertedGramWeight.toLocaleString("en-IN")} grams ({calcResult.purity})
                </span>
              </div>
              <div className={`text-2xl sm:text-3xl font-black text-amber-400 truncate max-w-full overflow-hidden ${numFontClass}`} title={formatCurrency(calcResult.totalAmount)}>
                {formatCurrency(calcResult.totalAmount)}
              </div>
              <div className={`flex justify-between items-center text-xxs text-slate-300 pt-2 border-t border-slate-800 min-w-0 gap-2 overflow-hidden ${numFontClass}`}>
                <span className="truncate">Base Cost: {formatCurrency(calcResult.baseAmount)}</span>
                <span className="truncate text-right">GST (3%): +{formatCurrency(calcResult.gstAmount)}</span>
              </div>

              <a
                href="https://groww.in/gold"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full pt-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md border border-emerald-300/50 min-w-0 overflow-hidden"
              >
                <span className="truncate px-1">Invest {formatCurrency(calcResult.totalAmount)} in Gold on Groww</span>
                <span className="shrink-0">↗</span>
              </a>
            </div>
          )}
        </div>

        {/* 7-Day Spot Price Trend Chart */}
        <div className={`lg:col-span-7 rounded-3xl p-6 sm:p-7 border shadow-md space-y-4 flex flex-col justify-between ${theme.sectionCard}`}>
          <div className="flex justify-between items-center border-b border-slate-700/40 pb-3">
            <div>
              <h3 className={`text-base font-extrabold ${headingFontClass} ${theme.textPrimary}`}>7-Day Gold Spot Trend (₹ / Gram 24K)</h3>
              <p className={`text-xs ${theme.textMuted}`}>Intraday spot market sharp vector price trajectory</p>
            </div>
            <div className={`text-xs font-extrabold px-3 py-1 rounded-full border ${numFontClass} ${theme.badge}`}>
              Ratio: {goldSilverRatio} (Au/Ag)
            </div>
          </div>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.7} vertical={false} />
                <XAxis dataKey="date" stroke="#475569" fontSize={11} fontWeight={700} tickLine={false} />
                <YAxis domain={["auto", "auto"]} stroke="#475569" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString("en-IN")}`, "24K Gold Rate"]}
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#f59e0b", borderRadius: "12px", color: "#0f172a", fontWeight: "bold" }}
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

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-t border-slate-100 pt-3 text-xxs font-bold text-slate-600 font-mono">
            <div>
              <span className="text-slate-400 block font-sans">7D Low</span>
              <span className="text-slate-900 font-extrabold">
                {historyData.length > 0 ? formatCurrency(Math.min(...historyData.map(h => h.gold24kPerGram))) : "--"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-sans">7D High</span>
              <span className="text-slate-900 font-extrabold">
                {historyData.length > 0 ? formatCurrency(Math.max(...historyData.map(h => h.gold24kPerGram))) : "--"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-sans">Silver (Per KG)</span>
              <span className="text-indigo-600 font-extrabold">{formatCurrency(silver.rates.perKg)}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-sans">USD/INR Base</span>
              <span className="text-slate-900 font-extrabold">₹{ratesData.usdInrRate || "83.95"}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Live Gold & ETF Interactive Sharp Vector Stock Graph Section */}
      <div
        ref={stockGraphRef}
        className={`rounded-3xl p-6 sm:p-8 border transition-all duration-300 shadow-xl space-y-6 relative overflow-hidden backdrop-blur-xl ${
          isLight
            ? "bg-gradient-to-b from-white via-slate-50/80 to-amber-50/20 border-slate-200/90 text-slate-900"
            : "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-slate-800 text-white"
        }`}
      >
        {/* Ambient Background Glows */}
        <div className={`absolute -right-16 -top-16 w-80 h-80 rounded-full blur-3xl pointer-events-none ${isLight ? "bg-amber-500/10" : "bg-amber-500/10"}`}></div>
        <div className={`absolute -left-16 -bottom-16 w-80 h-80 rounded-full blur-3xl pointer-events-none ${isLight ? "bg-emerald-500/10" : "bg-emerald-500/10"}`}></div>

        {/* Section Header */}
        <div className={`flex flex-col lg:flex-row justify-between lg:items-center gap-4 border-b pb-5 relative z-10 ${isLight ? "border-slate-200" : "border-slate-800"}`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className={`text-2xl p-1.5 rounded-xl border ${isLight ? "bg-amber-100 border-amber-200 text-amber-900" : "bg-amber-500/20 border-amber-500/30 text-amber-400"}`}>📈</span>
              <h2 className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                Live Gold Asset & ETF Stock Graph
                {isLiveStream && stockTimeframe === "1D" && (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 text-xxs font-extrabold animate-pulse font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    LIVE STREAMING
                  </span>
                )}
              </h2>
            </div>
            <p className={`text-xs font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              Real-time sharp vector intraday tick chart & technical indicators for Gold spot, Gold ETFs, NBFC equities & Sovereign Gold Bonds.
            </p>
          </div>

          {/* Timeframe Controls, Curve Style Toggle, Light/Dark Theme Toggle & Live Stream Toggle */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Background Theme Switcher (Light vs Dark) */}
            <div className={`flex items-center p-1 rounded-2xl border ${isLight ? "bg-slate-200/70 border-slate-300" : "bg-slate-800/90 border-slate-700"}`}>
              <button
                type="button"
                onClick={() => setGraphTheme("light")}
                className={`px-3 py-1.5 rounded-xl text-xxs font-black transition cursor-pointer flex items-center gap-1 ${
                  graphTheme === "light"
                    ? "bg-amber-500 text-slate-950 shadow-md font-black"
                    : isLight ? "text-slate-700 hover:text-slate-900" : "text-slate-400 hover:text-white"
                }`}
              >
                ☀️ Light Theme
              </button>
              <button
                type="button"
                onClick={() => setGraphTheme("dark")}
                className={`px-3 py-1.5 rounded-xl text-xxs font-black transition cursor-pointer flex items-center gap-1 ${
                  graphTheme === "dark"
                    ? "bg-amber-500 text-slate-950 shadow-md font-black"
                    : isLight ? "text-slate-700 hover:text-slate-900" : "text-slate-400 hover:text-white"
                }`}
              >
                🌙 Dark Theme
              </button>
            </div>

            {/* Curve Style Switcher (Sharp vs Smooth) */}
            <div className={`flex items-center p-1 rounded-2xl border ${isLight ? "bg-slate-200/70 border-slate-300" : "bg-slate-800/90 border-slate-700"}`}>
              <button
                type="button"
                onClick={() => setCurveStyle("linear")}
                className={`px-3 py-1.5 rounded-xl text-xxs font-black transition cursor-pointer flex items-center gap-1 ${
                  curveStyle === "linear"
                    ? "bg-amber-500 text-slate-950 shadow-md font-black"
                    : isLight ? "text-slate-700 hover:text-slate-900" : "text-slate-400 hover:text-white"
                }`}
              >
                ⚡ Sharp Vector
              </button>
              <button
                type="button"
                onClick={() => setCurveStyle("monotone")}
                className={`px-3 py-1.5 rounded-xl text-xxs font-black transition cursor-pointer flex items-center gap-1 ${
                  curveStyle === "monotone"
                    ? "bg-amber-500 text-slate-950 shadow-md font-black"
                    : isLight ? "text-slate-700 hover:text-slate-900" : "text-slate-400 hover:text-white"
                }`}
              >
                🌊 Smooth Wave
              </button>
            </div>

            {stockTimeframe === "1D" && (
              <button
                type="button"
                onClick={() => setIsLiveStream(!isLiveStream)}
                className={`px-3 py-1.5 rounded-xl text-xxs font-extrabold border transition flex items-center gap-1.5 cursor-pointer ${
                  isLiveStream
                    ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                    : "bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300"
                }`}
              >
                <span>{isLiveStream ? "🔴 Live Stream ON" : "⏸️ Stream Paused"}</span>
              </button>
            )}

            <div className={`flex items-center p-1 rounded-2xl border ${isLight ? "bg-slate-200/70 border-slate-300" : "bg-slate-800/90 border-slate-700"}`}>
              {["1D", "1W", "1M", "1Y"].map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setStockTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    stockTimeframe === tf
                      ? "bg-amber-500 text-slate-950 shadow-xs"
                      : isLight ? "text-slate-700 hover:text-slate-900" : "text-slate-400 hover:text-white"
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
          <span className={`text-xs font-bold mr-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>Quick Select:</span>
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
                  ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md scale-[1.02]"
                  : isLight
                  ? "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900 shadow-2xs"
                  : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Live Metrics Header Bar & Day Range Meter */}
        {stockGraphData && (
          <div className="space-y-4 relative z-10">
            <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
              isLight ? "bg-white/90 border-slate-200/90 text-slate-900" : "bg-slate-800/60 border-slate-800 text-white"
            }`}>
              <div className="flex items-baseline gap-3">
                <div>
                  <span className="text-xxs font-extrabold text-amber-600 uppercase tracking-wider block font-sans">
                    {stockGraphData.name} ({stockGraphData.category} • {stockGraphData.exchange})
                  </span>
                  <div className={`text-3xl font-black tracking-tight mt-0.5 font-mono ${isLight ? "text-slate-900" : "text-white"}`}>
                    {formatCurrency(stockGraphData.currentPrice)}
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-sm font-black px-3 py-1 rounded-xl border font-mono ${
                  stockGraphData.isPositive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}>
                  <span>{stockGraphData.isPositive ? "▲ +" : "▼ "}</span>
                  <span>{formatCurrency(stockGraphData.change24h)}</span>
                  <span>({stockGraphData.isPositive ? "+" : ""}{stockGraphData.changePercent}%)</span>
                </div>
              </div>

              {/* Technical Metrics Summary Grid */}
              <div className={`grid grid-cols-3 sm:grid-cols-6 gap-3 text-xxs font-bold border-t md:border-t-0 pt-3 md:pt-0 ${
                isLight ? "border-slate-200" : "border-slate-700"
              }`}>
                <div className="space-y-0.5">
                  <span className={`block font-sans ${isLight ? "text-slate-500" : "text-slate-400"}`}>Open</span>
                  <span className={`font-extrabold font-mono ${isLight ? "text-slate-900" : "text-slate-200"}`}>{formatCurrency(stockGraphData.openPrice)}</span>
                </div>
                <div className="space-y-0.5">
                  <span className={`block font-sans ${isLight ? "text-slate-500" : "text-slate-400"}`}>Day High</span>
                  <span className="text-emerald-600 font-extrabold font-mono">{formatCurrency(stockGraphData.dayHigh)}</span>
                </div>
                <div className="space-y-0.5">
                  <span className={`block font-sans ${isLight ? "text-slate-500" : "text-slate-400"}`}>Day Low</span>
                  <span className="text-rose-600 font-extrabold font-mono">{formatCurrency(stockGraphData.dayLow)}</span>
                </div>
                <div className="space-y-0.5">
                  <span className={`block font-sans ${isLight ? "text-slate-500" : "text-slate-400"}`}>VWAP</span>
                  <span className="text-amber-600 font-extrabold font-mono">{formatCurrency(stockGraphData.vwap)}</span>
                </div>
                <div className="space-y-0.5">
                  <span className={`block font-sans ${isLight ? "text-slate-500" : "text-slate-400"}`}>52W Range</span>
                  <span className={`font-extrabold font-mono ${isLight ? "text-slate-900" : "text-slate-200"}`}>₹{stockGraphData.fiftyTwoWeekLow} - ₹{stockGraphData.fiftyTwoWeekHigh}</span>
                </div>
                <div className="space-y-0.5">
                  <span className={`block font-sans ${isLight ? "text-slate-500" : "text-slate-400"}`}>Volume</span>
                  <span className="text-indigo-600 font-extrabold font-mono">{stockGraphData.volume}</span>
                </div>
              </div>
            </div>

            {/* Day Range Visual Meter Bar */}
            <div className={`px-5 py-3 rounded-xl border text-xxs font-bold space-y-1.5 ${
              isLight ? "bg-white/80 border-slate-200/90" : "bg-slate-800/40 border-slate-800"
            }`}>
              <div className={`flex justify-between items-center font-mono ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                <span>Day Low: ₹{stockGraphData.dayLow}</span>
                <span className="text-amber-600 font-black font-sans">Price Range Position ({dayRangeProgress}%)</span>
                <span>Day High: ₹{stockGraphData.dayHigh}</span>
              </div>
              <div className={`w-full h-2 rounded-full relative overflow-hidden ${isLight ? "bg-slate-200" : "bg-slate-700"}`}>
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${dayRangeProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Main Chart Canvas */}
        <div className="h-80 w-full relative z-10 pt-2">
          {stockGraphLoading ? (
            <div className="flex h-full items-center justify-center flex-col space-y-2">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className={`text-xs font-bold ${isLight ? "text-slate-600" : "text-slate-400"}`}>Loading live graph data for {selectedStockSymbol}...</p>
            </div>
          ) : stockGraphData && stockGraphData.points ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stockGraphData.points}>
                <defs>
                  <linearGradient id="stockGradPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={stockGraphData.symbol === "SPOT_24K" ? "#d97706" : stockGraphData.isPositive ? "#059669" : "#e11d48"} stopOpacity={isLight ? 0.25 : 0.4} />
                    <stop offset="95%" stopColor={stockGraphData.symbol === "SPOT_24K" ? "#d97706" : stockGraphData.isPositive ? "#059669" : "#e11d48"} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#e2e8f0" : "#334155"} opacity={0.7} vertical={false} />
                <XAxis dataKey="timeLabel" stroke={isLight ? "#475569" : "#64748b"} fontSize={10} fontWeight={700} tickLine={false} />
                <YAxis domain={["auto", "auto"]} stroke={isLight ? "#475569" : "#64748b"} fontSize={10} fontWeight={700} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className={`p-3.5 rounded-2xl shadow-2xl text-xs space-y-1.5 font-sans border ${
                          isLight
                            ? "bg-white/95 border-slate-200 text-slate-900 shadow-amber-900/10"
                            : "bg-slate-950/95 border-slate-700 text-white"
                        }`}>
                          <div className="flex justify-between items-center gap-4 text-xxs font-black font-mono text-slate-500">
                            <span>{data.timeLabel}</span>
                            <span className="text-amber-600">LIVE TICK</span>
                          </div>
                          <div className="text-xl font-black text-amber-600 font-mono">₹{Number(data.price).toLocaleString("en-IN")}</div>
                          <div className={`grid grid-cols-2 gap-x-4 gap-y-0.5 text-xxs border-t pt-1.5 font-mono ${
                            isLight ? "border-slate-100 text-slate-600" : "border-slate-800 text-slate-300"
                          }`}>
                            <span>High: <strong className="text-emerald-600">₹{data.high}</strong></span>
                            <span>Low: <strong className="text-rose-600">₹{data.low}</strong></span>
                            <span className="col-span-2">Vol: <strong className={isLight ? "text-slate-900" : "text-slate-200"}>{data.volume?.toLocaleString("en-IN")}</strong></span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {stockGraphData.openPrice && (
                  <ReferenceLine y={stockGraphData.openPrice} stroke={isLight ? "#64748b" : "#94a3b8"} strokeDasharray="3 3" label={{ value: `Open ₹${stockGraphData.openPrice}`, fill: isLight ? '#64748b' : '#94a3b8', fontSize: 10, position: 'insideTopLeft' }} />
                )}
                <Area
                  type={curveStyle}
                  dataKey="price"
                  stroke={stockGraphData.symbol === "SPOT_24K" ? "#d97706" : stockGraphData.isPositive ? "#059669" : "#e11d48"}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#stockGradPos)"
                  activeDot={{ r: 6, fill: stockGraphData.isPositive ? "#059669" : "#e11d48", stroke: "#ffffff", strokeWidth: 2 }}
                   {/* City-wise Benchmark Rates Table */}
      <div className={`rounded-3xl p-6 sm:p-8 border shadow-md space-y-6 ${theme.sectionCard}`}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-700/40 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏙️</span>
              <h3 className={`text-base font-extrabold ${headingFontClass} ${theme.textPrimary}`}>City-wise Gold & Silver Benchmark Rates</h3>
            </div>
            <p className={`text-xs mt-0.5 ${theme.textMuted}`}>
              Standard local market pricing per 10 grams (Gold) and 1 KG (Silver) incorporating regional duties.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${theme.textMuted}`}>Filter City Hub:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-extrabold focus:outline-none focus:ring-2 ${theme.input}`}
            >
              <option value="All">All Major Cities</option>
              {cities.map((c) => (
                <option key={c.city} value={c.city}>{c.city}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className={`border-b border-slate-700/60 uppercase text-xxs tracking-wider ${theme.textMuted}`}>
                <th className="py-3 px-4">City Hub</th>
                <th className="py-3 px-4">24K Gold (10g)</th>
                <th className="py-3 px-4">22K Gold (10g)</th>
                <th className="py-3 px-4">Silver (1 KG)</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredCities.map((c) => (
                <tr key={c.city} className={`transition ${theme.tableRowHover}`}>
                  <td className={`py-3.5 px-4 font-black flex items-center gap-2 ${theme.textPrimary}`}>
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    {c.city}
                  </td>
                  <td className={`py-3.5 px-4 font-black ${numFontClass} ${theme.textAccent}`}>{formatCurrency(c.gold24kPer10g)}</td>
                  <td className={`py-3.5 px-4 font-bold ${numFontClass} ${theme.textPrimary}`}>{formatCurrency(c.gold22kPer10g)}</td>
                  <td className={`py-3.5 px-4 font-bold ${numFontClass} ${theme.textPrimary}`}>{formatCurrency(c.silverPerKg)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className={`px-2.5 py-1 rounded-full text-xxs font-extrabold border ${numFontClass} ${theme.badge}`}>
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
      <div className={`rounded-3xl p-6 sm:p-8 border shadow-md space-y-6 ${theme.sectionCard}`}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-700/40 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📈</span>
              <h3 className={`text-lg font-black ${headingFontClass} ${theme.textPrimary}`}>Live Gold ETFs & Gold-Linked Stocks</h3>
            </div>
            <p className={`text-xs mt-0.5 font-medium ${theme.textMuted}`}>
              Real-time NSE/BSE spot tracking for Gold Exchange Traded Funds (ETFs), Gold Mining & NBFC Equities, and Sovereign Gold Bonds (SGBs).
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/60 p-1 rounded-2xl border border-slate-700/80 text-xs font-bold">
            {["All", "ETF", "Equity", "SGB"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setStockCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                  stockCategory === cat
                    ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80"
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
              className={`rounded-2xl p-5 transition-all duration-300 space-y-3 shadow-2xs hover:shadow-lg group flex flex-col justify-between border ${
                pageTheme === "ivory-light"
                  ? "bg-slate-50 hover:bg-white border-slate-200 hover:border-amber-400 text-slate-900"
                  : "bg-slate-950/60 hover:bg-slate-900 border-slate-800 hover:border-amber-500/60 text-white"
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`px-2 py-0.5 rounded-md text-xxs font-black tracking-wider uppercase border ${
                      stock.category === "ETF"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : stock.category === "Equity"
                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    }`}>
                      {stock.category} • {stock.exchange}
                    </span>
                    <h4 className={`text-base font-black mt-2 tracking-tight ${headingFontClass} ${theme.textPrimary}`}>
                      {stock.symbol}
                    </h4>
                    <p className={`text-xxs font-semibold truncate max-w-[160px] ${theme.textMuted}`} title={stock.name}>
                      {stock.name}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xxs font-extrabold border ${numFontClass} ${
                    stock.isPositive
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                  }`}>
                    {stock.isPositive ? "+" : ""}{stock.changePercent}%
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-700/40">
                  <div className={`text-2xl font-black ${numFontClass} ${theme.textPrimary}`}>
                    {formatCurrency(stock.price)}
                  </div>
                  <div className={`text-xxs font-semibold mt-0.5 flex justify-between ${numFontClass} ${theme.textMuted}`}>
                    <span>24h Change:</span>
                    <span className={stock.isPositive ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
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
                        stroke={stock.isPositive ? "#059669" : "#e11d48"}
                        strokeWidth={2.2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className={`space-y-1 p-2.5 rounded-xl border text-xxs font-semibold ${numFontClass} ${
                  pageTheme === "ivory-light" ? "bg-white border-slate-200 text-slate-700" : "bg-slate-900 border-slate-800 text-slate-300"
                }`}>
                  <div className="flex justify-between">
                    <span>1Y CAGR Return:</span>
                    <span className="font-extrabold text-emerald-400">{stock.oneYearReturn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Day Range:</span>
                    <span className={`font-bold ${theme.textPrimary}`}>₹{stock.dayLow} - ₹{stock.dayHigh}</span>
                  </div>
                  <div className="flex justify-between pt-0.5 border-t border-slate-800/60 text-slate-400">
                    <span>Underlying:</span>
                    <span className="truncate max-w-[110px] text-slate-300 font-medium">{stock.underlying}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2">
                <a
                  href={stock.growwUrl || getGrowwGoldUrl(stock.symbol)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md border border-emerald-300/40"
                >
                  <span>⚡ Invest on Groww</span>
                  <span>↗</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleSelectStock(stock.symbol)}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs group-hover:bg-amber-500 group-hover:text-slate-950"
                >
                  <span>📈 View Stock Graph</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Asset Allocation & Investment Guidance */}
      <div className={`rounded-3xl p-6 sm:p-8 border shadow-md space-y-4 ${theme.sectionCard}`}>
        <div className="flex items-center gap-2 border-b border-slate-700/40 pb-3">
          <span className="text-xl">🤖</span>
          <h3 className={`text-base font-extrabold ${headingFontClass} ${theme.textPrimary}`}>AI Bullion Portfolio Guidance</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium leading-relaxed">
          <div className={`p-4 rounded-2xl border space-y-1 ${
            pageTheme === "ivory-light" ? "bg-amber-50/80 border-amber-200 text-slate-800" : "bg-slate-950/60 border-amber-500/30 text-slate-200"
          }`}>
            <span className="font-extrabold text-amber-400 block">💡 Ideal Portfolio Allocation</span>
            <p className={theme.textMuted}>Financial planners recommend allocating 5% - 15% of your total net worth into physical gold or Sovereign Gold Bonds (SGB) as a hedge against equity market volatility.</p>
          </div>
          <div className={`p-4 rounded-2xl border space-y-1 ${
            pageTheme === "ivory-light" ? "bg-indigo-50/80 border-indigo-200 text-slate-800" : "bg-slate-950/60 border-indigo-500/30 text-slate-200"
          }`}>
            <span className="font-extrabold text-indigo-400 block">📊 Gold-to-Silver Ratio ({goldSilverRatio})</span>
            <p className={theme.textMuted}>Historically, a ratio above 80 indicates Silver is relatively undervalued compared to Gold, offering potential upside for long-term commodity accumulation.</p>
          </div>
          <div className={`p-4 rounded-2xl border space-y-1 ${
            pageTheme === "ivory-light" ? "bg-purple-50/80 border-purple-200 text-slate-800" : "bg-slate-950/60 border-purple-500/30 text-slate-200"
          }`}>
            <span className="font-extrabold text-purple-400 block">🛡️ Inflation Protection</span>
            <p className={theme.textMuted}>Gold in INR has delivered an average annual CAGR of 9.5% over the past 20 years in India, consistently outperforming domestic consumer CPI inflation.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between sm:items-center pt-3 border-t border-slate-700/40 gap-3">
          <p className={`text-xs font-bold ${theme.textPrimary}`}>Ready to invest in Gold ETFs, Bullion, or SGBs?</p>
          <a
            href="https://groww.in/gold"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black transition shadow-md flex items-center justify-center gap-2 cursor-pointer border border-emerald-300/40"
          >
            <span>Start Gold Investment on Groww</span>
            <span>↗</span>
        </div>
      </div>
    </div>
    </div>
  );
}

export default PreciousMetals;
