import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name);
      } catch (e) {
        setUserName("");
      }
    } else {
      setUserName("");
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
  };

  const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/transactions", label: "Transactions", icon: "💸" },
    { path: "/budget", label: "Budget", icon: "⚖️" },
    { path: "/goals", label: "Goals", icon: "🎯" },
    { path: "/learning", label: "Learning", icon: "🎓" },
    { path: "/reports", label: "Reports", icon: "📄" },
    { path: "/subscriptions", label: "Subscriptions", icon: "💳" },
    { path: "/assistant", label: "AI Assistant", icon: "🤖" },
  ];

  return (
    <nav className="print:hidden glass-nav sticky top-0 z-50 px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo - Christoph Nagel Inspired Clean Typography */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-md glow-cyan group-hover:scale-105 transition duration-200">
            <div className="w-full h-full bg-[#05070c] rounded-[10px] flex items-center justify-center text-sm font-bold text-cyan-400">
              ⚡
            </div>
          </div>
          <span className="text-xl font-heading font-semibold text-white tracking-tight group-hover:text-cyan-300 transition">
            FinNova <span className="text-gradient-cyan">AI</span>
          </span>
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <div className="hidden lg:flex items-center gap-1 glass-panel-luxury p-1.5 rounded-2xl border border-white/10 shadow-inner">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                        isActive
                          ? "bg-cyan-500 text-slate-950 shadow-md glow-cyan"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                      }`}
                    >
                      <span className="text-xs">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="h-6 w-px bg-white/10 hidden lg:block"></div>

              {/* User Pill & Logout */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 glass-panel-luxury px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-xxs">
                    {userName ? userName.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="hidden sm:inline text-slate-200">{userName || "User"}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="rounded-xl glass-panel-luxury hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 px-3.5 py-1.5 text-xs font-semibold transition duration-200 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-5 py-2 text-xs font-semibold text-slate-950 shadow-md glow-cyan transition duration-200"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;