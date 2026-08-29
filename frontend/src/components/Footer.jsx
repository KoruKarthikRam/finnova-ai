import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="print:hidden bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20 py-12 px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="text-2xl font-extrabold text-white flex items-center gap-2">
              <span className="text-indigo-500">FinNova</span> AI
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              An AI-powered personal finance assistant & financial literacy masterclass engine tailored for Indian Rupee (₹) budgeting, Section 80C/80D tax optimization, and wealth compounding.
            </p>

            {/* Tech Badges */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xxs font-bold border border-slate-700">React 18 + Vite</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xxs font-bold border border-slate-700">Tailwind CSS v4</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xxs font-bold border border-slate-700">Node Express</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xxs font-bold border border-slate-700">Python FastAPI</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xxs font-bold border border-slate-700">Gemini 3.6 Flash</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xxs font-bold border border-slate-700">RAG Vector Search</span>
            </div>
          </div>

          {/* Core Modules Links */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Application Modules</h4>
            <ul className="space-y-2 font-medium">
              <li><Link to="/dashboard" className="hover:text-indigo-400 transition">Financial Dashboard</Link></li>
              <li><Link to="/transactions" className="hover:text-indigo-400 transition">Transactions Tracker</Link></li>
              <li><Link to="/budget" className="hover:text-indigo-400 transition">Category Budgets</Link></li>
              <li><Link to="/goals" className="hover:text-indigo-400 transition">Savings Goals</Link></li>
              <li><Link to="/subscriptions" className="hover:text-indigo-400 transition">Recurring Subscriptions</Link></li>
            </ul>
          </div>

          {/* Intelligence & Learning Links */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">AI & Learning</h4>
            <ul className="space-y-2 font-medium">
              <li><Link to="/learning" className="hover:text-indigo-400 transition">Learning Masterclass Hub</Link></li>
              <li><Link to="/quiz" className="hover:text-indigo-400 transition">AI-Generated Quizzes</Link></li>
              <li><Link to="/reports" className="hover:text-indigo-400 transition">Intelligent Monthly Reports</Link></li>
              <li><Link to="/assistant" className="hover:text-indigo-400 transition">AI Assistant Chat</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xxs text-slate-500">
          <p>© 2026 FinNova AI. All rights reserved. 25-Day Roadmap Completed.</p>
          <a
            href="https://github.com/KoruKarthikRam/finnova-ai.git"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-400 transition font-bold flex items-center gap-1.5 text-slate-300"
          >
            <span>💻</span> GitHub Repository: KoruKarthikRam/finnova-ai
          </a>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
