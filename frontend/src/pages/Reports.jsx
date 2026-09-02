import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/config";

function Reports() {
  const current = new Date();
  const [selectedMonth, setSelectedMonth] = useState(current.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(current.getFullYear());
  
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const years = [current.getFullYear() - 1, current.getFullYear(), current.getFullYear() + 1];

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchReport = async (month, year) => {
    try {
      setIsLoading(true);
      setError("");
      const response = await axios.get(
        `${API_BASE_URL}/api/reports/monthly?month=${month}&year=${year}`,
        getAuthConfig()
      );

      if (response.data.success) {
        setReport(response.data);
      } else {
        throw new Error("Failed to compile statement report");
      }
    } catch (err) {
      console.error("Failed to load report:", err);
      setError("Unable to generate monthly financial report.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(selectedMonth, selectedYear);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(val)) return "₹0";
    return `₹${Number(val).toLocaleString("en-IN")}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Top Controls Header (Hidden on Print) */}
      <div className="print:hidden flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>📄</span> Intelligent Monthly Reports
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Compile executive statements, category audits, and AI forecasts into printable PDFs.
          </p>
        </div>

        {/* Month / Year Selector & Print Button */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => {
              const m = Number(e.target.value);
              setSelectedMonth(m);
              fetchReport(m, selectedYear);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 shadow-xxs"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => {
              const y = Number(e.target.value);
              setSelectedYear(y);
              fetchReport(selectedMonth, y);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 shadow-xxs"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <span>🖨️</span> Print / Save PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 text-rose-600 text-xs font-semibold text-center print:hidden">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center space-y-3 shadow-sm print:hidden">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-600">Compiling executive financial report...</p>
        </div>
      ) : report ? (
        /* Printable Executive Statement Sheet */
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-md space-y-8 print:shadow-none print:border-none print:p-0 print:m-0 text-slate-800">
          
          {/* Statement Branding & Metadata Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-slate-900 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-indigo-600 tracking-tight">FinNova AI</span>
                <span className="text-xxs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  Executive Statement
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">Monthly Financial Audit & Performance Summary</p>
            </div>

            <div className="text-left sm:text-right text-xs space-y-1 font-medium text-slate-600">
              <p><strong className="text-slate-900">Period:</strong> {report.reportHeader.statementPeriod}</p>
              <p><strong className="text-slate-900">Statement ID:</strong> {report.reportHeader.statementId}</p>
              <p className="text-xxs text-slate-400">Generated on: {new Date(report.reportHeader.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-xxs font-extrabold text-slate-400 uppercase tracking-wider">Total Income</span>
              <p className="text-xl font-extrabold text-emerald-600">{formatCurrency(report.financialSummary.totalIncome)}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-xxs font-extrabold text-slate-400 uppercase tracking-wider">Total Expenses</span>
              <p className="text-xl font-extrabold text-rose-600">{formatCurrency(report.financialSummary.totalExpenses)}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-xxs font-extrabold text-slate-400 uppercase tracking-wider">Net Surplus</span>
              <p className={`text-xl font-extrabold ${report.financialSummary.netSavings >= 0 ? "text-indigo-600" : "text-amber-600"}`}>
                {formatCurrency(report.financialSummary.netSavings)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1">
              <span className="text-xxs font-extrabold text-indigo-500 uppercase tracking-wider">Health Score</span>
              <div className="flex items-center gap-2">
                <p className="text-xl font-extrabold text-indigo-700">{report.healthAssessment.score}/100</p>
                <span className="text-xxs font-bold text-indigo-600 uppercase">({report.healthAssessment.grade})</span>
              </div>
            </div>
          </div>

          {/* Category Spending Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Expense Category Distribution
            </h3>

            {report.categoryBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No expenses recorded for this statement period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-extrabold">
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Total Amount</th>
                      <th className="py-2.5 px-3">% Share of Expenses</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {report.categoryBreakdown.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{item.category}</td>
                        <td className="py-2.5 px-3 text-slate-900 font-bold">{formatCurrency(item.amount)}</td>
                        <td className="py-2.5 px-3 text-indigo-600 font-bold">{item.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Budget Adherence Section */}
          {report.budgetAdherence && report.budgetAdherence.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Monthly Category Budget Audit
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.budgetAdherence.map((b, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-150 bg-slate-50/30 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{b.category}</p>
                      <p className="text-xxs text-slate-400">Limit: {formatCurrency(b.limit)} • Spent: {formatCurrency(b.spent)}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xxs font-extrabold ${
                      b.isExceeded ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {b.isExceeded ? "Exceeded" : `${b.usagePercentage}% Used`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Advisor Guidance Box */}
          {report.advisorInsights && report.advisorInsights.length > 0 && (
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
              <h4 className="font-extrabold text-indigo-900 text-xs flex items-center gap-2">
                <span>🧠</span> Gemini AI Advisor Recommendations
              </h4>
              <ul className="space-y-2">
                {report.advisorInsights.map((insight, idx) => {
                  const displayText = typeof insight === "string"
                    ? insight
                    : typeof insight === "object" && insight !== null
                    ? insight.text || insight.insight || insight.description || insight.message || insight.advice || insight.title || JSON.stringify(insight)
                    : String(insight || "");

                  return (
                    <li key={idx} className="text-xs text-indigo-900 flex items-start gap-2 leading-relaxed">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{displayText}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* ML Forecast Summary */}
          {report.forecast && report.forecast.predicted_amount > 0 && (
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 text-xs flex justify-between items-center">
              <div>
                <span className="font-extrabold text-purple-900 block">Next Month Machine Learning Forecast</span>
                <span className="text-xxs text-purple-700">Projected expenditure for {report.forecast.next_month}</span>
              </div>
              <span className="text-base font-black text-purple-900">{formatCurrency(report.forecast.predicted_amount)}</span>
            </div>
          )}

          {/* Statement Footer Signoff */}
          <div className="pt-6 border-t border-slate-200 text-center text-xxs text-slate-400 space-y-1">
            <p>FinNova AI Personal Finance Assistant • Confidential Financial Record</p>
            <p>This report is generated for personal budgeting and financial literacy tracking.</p>
          </div>

        </div>
      ) : null}

    </div>
  );
}

export default Reports;
