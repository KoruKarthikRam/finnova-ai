import { Link, useLocation } from "react-router-dom";

function Footer() {
  const location = useLocation();
  const isMainPage = location.pathname === "/";

  return (
    <footer className={`print:hidden text-xs border-t mt-20 py-12 px-8 transition-colors ${
      isMainPage
        ? "bg-slate-900 text-slate-400 border-slate-800"
        : "bg-white text-slate-600 border-slate-200"
    }`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className={`text-2xl font-extrabold flex items-center gap-2 ${isMainPage ? "text-white" : "text-slate-900"}`}>
              <span className="text-indigo-600">FinNova</span> AI
            </Link>
            <p className={`text-xs leading-relaxed max-w-sm ${isMainPage ? "text-slate-400" : "text-slate-500"}`}>
              An AI-powered personal finance assistant & financial literacy masterclass engine tailored for Indian Rupee (₹) budgeting, Section 80C/80D tax optimization, and wealth compounding.
            </p>

            {/* Tech Badges */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xxs font-bold border ${isMainPage ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-slate-100 text-slate-700 border-slate-200"}`}>React 18 + Vite</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xxs font-bold border ${isMainPage ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-slate-100 text-slate-700 border-slate-200"}`}>Tailwind CSS v4</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xxs font-bold border ${isMainPage ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-slate-100 text-slate-700 border-slate-200"}`}>Node Express</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xxs font-bold border ${isMainPage ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-slate-100 text-slate-700 border-slate-200"}`}>Python FastAPI</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xxs font-bold border ${isMainPage ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-slate-100 text-slate-700 border-slate-200"}`}>Gemini AI</span>
            </div>
          </div>

          {/* Core Modules Links */}
          <div className="space-y-3">
            <h4 className={`font-extrabold text-xs uppercase tracking-wider ${isMainPage ? "text-white" : "text-slate-900"}`}>Application Modules</h4>
            <ul className="space-y-2 font-medium">
              <li><Link to="/dashboard" className="hover:text-indigo-600 transition">Financial Dashboard</Link></li>
              <li><Link to="/transactions" className="hover:text-indigo-600 transition">Transactions Tracker</Link></li>
              <li><Link to="/budget" className="hover:text-indigo-600 transition">Category Budgets</Link></li>
              <li><Link to="/goals" className="hover:text-indigo-600 transition">Savings Goals</Link></li>
              <li><Link to="/subscriptions" className="hover:text-indigo-600 transition">Recurring Subscriptions</Link></li>
            </ul>
          </div>

          {/* Intelligence & Learning Links */}
          <div className="space-y-3">
            <h4 className={`font-extrabold text-xs uppercase tracking-wider ${isMainPage ? "text-white" : "text-slate-900"}`}>AI & Learning</h4>
            <ul className="space-y-2 font-medium">
              <li><Link to="/learning" className="hover:text-indigo-600 transition">Learning Masterclass Hub</Link></li>
              <li><Link to="/reports" className="hover:text-indigo-600 transition">Intelligent Monthly Reports</Link></li>
              <li><Link to="/assistant" className="hover:text-indigo-600 transition">AI Assistant Chat</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className={`pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-xxs ${isMainPage ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-400"}`}>
          <p>© 2026 FinNova AI. All rights reserved.</p>
          <a
            href="https://github.com/KoruKarthikRam/finnova-ai.git"
            target="_blank"
            rel="noopener noreferrer"
            className={`hover:text-indigo-600 transition font-bold flex items-center gap-1.5 ${isMainPage ? "text-slate-300" : "text-slate-700"}`}
          >
            <span>💻</span> GitHub Repository: KoruKarthikRam/finnova-ai
          </a>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
