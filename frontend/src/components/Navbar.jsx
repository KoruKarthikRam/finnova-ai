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
    { path: "/metals", label: "Gold & Silver", icon: "🪙" },
    { path: "/learning", label: "Learning", icon: "🎓" },
    { path: "/reports", label: "Reports", icon: "📄" },
    { path: "/subscriptions", label: "Subscriptions", icon: "💳" },
    { path: "/assistant", label: "AI Assistant", icon: "🤖" },
  ];

  return (
    <nav className="print:hidden sticky top-0 z-50 px-6 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs text-slate-800 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 p-0.5 shadow-xs group-hover:scale-105 transition duration-200">
            <div className="w-full h-full rounded-[10px] bg-white text-indigo-600 flex items-center justify-center text-sm font-bold">
              ⚡
            </div>
          </div>
          <span className="text-xl font-heading font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-600 transition">
            FinNova <span className="text-indigo-600">AI</span>
          </span>
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <div className="hidden lg:flex items-center gap-1 p-1 rounded-2xl bg-slate-100/80 border border-slate-200">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white"
                      }`}
                    >
                      <span className="text-xs">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="h-6 w-px hidden lg:block bg-slate-200"></div>

              {/* User Pill & Logout */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-600 border border-indigo-500/30 flex items-center justify-center font-bold text-xxs">
                    {userName ? userName.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="hidden sm:inline font-bold text-slate-800">{userName || "User"}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="rounded-xl px-3.5 py-1.5 text-xs font-bold transition duration-200 cursor-pointer bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-bold text-white shadow-xs transition duration-200"
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