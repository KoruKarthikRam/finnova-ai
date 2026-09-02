import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/config";

function Assistant() {
  const [messages, setMessages] = useState([
    {
      sender: "assistant",
      text: "Namaste! I am your FinNova AI Assistant. 🪙\n\nHow can I help you improve your financial literacy, optimize your monthly budget, or learn about savings strategies today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [useContext, setUseContext] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Live financial context state to display in sidebar
  const [contextData, setContextData] = useState({
    balance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    budgets: [],
    healthScore: null,
    loading: true,
  });

  const chatEndRef = useRef(null);

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Fetch live context stats to show user what the AI sees
  const fetchLiveContext = async () => {
    try {
      setContextData((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const current = new Date();
      const month = current.getMonth() + 1;
      const year = current.getFullYear();

      const [txRes, budgetRes, healthRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/api/transactions`, config),
        axios.get(`${API_BASE_URL}/api/budgets?month=${month}&year=${year}`, config),
        axios.get(`${API_BASE_URL}/api/dashboard/health-score`, config),
      ]);

      let transactions = [];
      let budgets = [];
      let healthScore = null;

      if (txRes.status === "fulfilled" && txRes.value.data.success) {
        transactions = txRes.value.data.data;
      }
      if (budgetRes.status === "fulfilled" && budgetRes.value.data.success) {
        budgets = budgetRes.value.data.data;
      }
      if (healthRes.status === "fulfilled" && healthRes.value.data.success) {
        healthScore = healthRes.value.data.data?.score;
      }

      // Compute income/expenses
      const currentMonthTransactions = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      });

      const totalIncome = currentMonthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, item) => sum + item.amount, 0);

      const totalExpenses = currentMonthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, item) => sum + item.amount, 0);

      const balance = totalIncome - totalExpenses;

      setContextData({
        balance,
        totalIncome,
        totalExpenses,
        budgets: budgets.map((b) => ({ category: b.category, limit: b.limit })),
        healthScore,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to fetch live context stats for panel:", err);
      setContextData((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchLiveContext();
  }, []);

  // Auto scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    setError("");
    if (!textToSend) setInputMessage("");

    // Add user message to state
    const newUserMessage = {
      sender: "user",
      text: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Map history for Gemini API
      // The API expects { role: 'user'|'assistant', content: string }
      const historyPayload = messages.map((m) => ({
        role: m.sender,
        content: m.text,
      }));

      const response = await axios.post(
        `${API_BASE_URL}/api/ai/chat`,
        {
          message: text,
          history: historyPayload,
          useContext: useContext,
        },
        getAuthConfig()
      );

      if (response.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "assistant",
            text: response.data.text,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to get response from Gemini API. Please make sure the backend server is running and the API key is configured."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Suggestion list
  const suggestionChips = [
    "How can I improve my financial health score?",
    "What are the tax-saving options under Section 80C?",
    "Explain the difference between SIP and Mutual Fund.",
    "Tell me how to start an emergency fund.",
  ];

  // Helper to parse and render basic markdown text safely
  const formatMarkdown = (text) => {
    if (!text) return "";

    // Escape basic HTML elements to prevent raw injection
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headings (### heading)
    html = html.replace(
      /^### (.*?)$/gm,
      '<h4 class="text-base font-bold text-slate-800 mt-4 mb-1.5">$1</h4>'
    );
    html = html.replace(
      /^## (.*?)$/gm,
      '<h3 class="text-lg font-bold text-slate-900 mt-5 mb-2">$1</h3>'
    );
    html = html.replace(
      /^# (.*?)$/gm,
      '<h2 class="text-xl font-bold text-slate-900 mt-6 mb-3">$1</h2>'
    );

    // Bold text (**text**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-slate-900">$1</strong>');

    // Bullet points (* point or - point)
    const lines = html.split("\n");
    let inList = false;
    const processedLines = lines.map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const content = trimmed.substring(2);
        let listLine = "";
        if (!inList) {
          inList = true;
          listLine += '<ul class="list-disc pl-5 my-2 space-y-1 text-slate-700">';
        }
        listLine += `<li>${content}</li>`;
        return listLine;
      } else {
        let listLine = "";
        if (inList) {
          inList = false;
          listLine += "</ul>";
        }
        return listLine + line;
      }
    });

    if (inList) {
      processedLines.push("</ul>");
    }

    html = processedLines.join("\n");

    // Replace double newlines with paragraph tags
    html = html.replace(/\n\n/g, '</p><p class="mt-3">');

    // Replace single newlines with break lines
    html = html.replace(/\n/g, "<br />");

    return `<p class="leading-relaxed text-slate-700 text-sm">${html}</p>`;
  };

  const clearChatHistory = () => {
    if (window.confirm("Are you sure you want to reset your conversation history?")) {
      setMessages([
        {
          sender: "assistant",
          text: "Namaste! I am your FinNova AI Assistant. 🪙\n\nHow can I help you improve your financial literacy, optimize your monthly budget, or learn about savings strategies today?",
          timestamp: new Date(),
        },
      ]);
      setError("");
    }
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(val)) return "₹0";
    return `₹${Number(val).toLocaleString("en-IN")}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">FinNova AI Assistant</h1>
          <p className="mt-2 text-slate-500">
            Ask questions, analyze budgets, and plan investments with conversational AI.
          </p>
        </div>
        <button
          onClick={clearChatHistory}
          className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 transition shadow-xxs cursor-pointer flex items-center gap-2"
        >
          <span>🧹</span> Clear Conversation
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-rose-600 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Chat Section */}
        <div className="lg:col-span-3 flex flex-col h-[70vh] bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
            {messages.map((msg, index) => {
              const isAssistant = msg.sender === "assistant";
              return (
                <div
                  key={index}
                  className={`flex gap-3 max-w-[85%] ${
                    isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"
                  }`}
                >
                  {/* Avatar Icon */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xxs ${
                      isAssistant
                        ? "bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {isAssistant ? "🤖" : "👤"}
                  </div>

                  {/* Bubble content */}
                  <div className="space-y-1">
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-xxs text-sm ${
                        isAssistant
                          ? "bg-slate-50 border border-slate-100/70 text-slate-800"
                          : "bg-indigo-600 text-white"
                      }`}
                    >
                      {isAssistant ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: formatMarkdown(msg.text),
                          }}
                        />
                      ) : (
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      )}
                    </div>

                    {/* Timestamp */}
                    <p
                      className={`text-xxs font-medium text-slate-400 px-1 ${
                        isAssistant ? "text-left" : "text-right"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Loading / Typing indicator */}
            {isLoading && (
              <div className="flex gap-3 mr-auto items-center">
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold shadow-xxs">
                  🤖
                </div>
                <div className="bg-slate-50 border border-slate-100/70 rounded-2xl px-4 py-3 shadow-xxs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/30 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                disabled={isLoading}
                className="px-3.5 py-1.5 rounded-full bg-white border border-slate-150 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition duration-150 cursor-pointer shadow-xxs hover:shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Panel */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="flex gap-3 items-center">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about SIPs, Section 80C deductions, or budgeting..."
                disabled={isLoading}
                rows={1}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 font-medium focus:border-indigo-500 focus:outline-none resize-none disabled:bg-slate-50 disabled:cursor-not-allowed max-h-24 scrollbar-thin"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                className="rounded-xl bg-indigo-600 p-3 text-white hover:bg-indigo-700 transition shadow duration-150 cursor-pointer disabled:bg-slate-200 disabled:cursor-not-allowed disabled:shadow-none shrink-0"
                title="Send Message"
              >
                <svg
                  className="w-5 h-5 transform rotate-90"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Live Context Dashboard Sidebar */}
        <div className="space-y-6">
          
          {/* AI Settings / Context Toggle Card */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-lg">AI Configuration</h3>
            
            <div className="flex items-start gap-3">
              <input
                id="contextToggle"
                type="checkbox"
                checked={useContext}
                onChange={(e) => setUseContext(e.target.checked)}
                className="w-4 h-4 mt-1 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <label htmlFor="contextToggle" className="text-xs font-semibold text-slate-600 select-none leading-snug cursor-pointer">
                Share Financial Context
                <span className="block font-medium text-slate-400 mt-0.5">
                  Allows the assistant to analyze your current balances, budgets, and health score.
                </span>
              </label>
            </div>
          </div>

          {/* Context Snapshot Card */}
          {useContext && (
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <h4 className="font-extrabold text-slate-800 text-sm">Shared Data Snapshot</h4>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>

              {contextData.loading ? (
                <p className="text-xs font-medium text-slate-400 text-center py-4">
                  Fetching active snapshot...
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Balance */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-500">Account Balance</span>
                    <span className={`font-bold ${contextData.balance >= 0 ? "text-indigo-600" : "text-rose-600"}`}>
                      {formatCurrency(contextData.balance)}
                    </span>
                  </div>

                  {/* Health Score */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-500">Health Score</span>
                    <span className="font-bold text-slate-700">
                      {contextData.healthScore !== null ? `${contextData.healthScore}/100` : "N/A"}
                    </span>
                  </div>

                  {/* Monthly totals */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-500">Mo. Income / Exp.</span>
                    <span className="font-bold text-slate-700">
                      {formatCurrency(contextData.totalIncome)} / {formatCurrency(contextData.totalExpenses)}
                    </span>
                  </div>

                  {/* Budgets */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-50">
                    <span className="block font-bold text-slate-600 text-xxs uppercase tracking-wider">Active Budgets</span>
                    {contextData.budgets.length === 0 ? (
                      <span className="text-xxs font-medium text-slate-400">None set for this month</span>
                    ) : (
                      <div className="max-h-24 overflow-y-auto space-y-1 divide-y divide-slate-50 pr-1">
                        {contextData.budgets.map((b, index) => (
                          <div key={index} className="flex justify-between text-xxs py-1">
                            <span className="font-medium text-slate-500 capitalize">{b.category}</span>
                            <span className="font-bold text-slate-700">{formatCurrency(b.limit)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Assistant;