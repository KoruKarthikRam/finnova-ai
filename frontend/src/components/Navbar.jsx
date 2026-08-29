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

  return (
    <nav className="bg-white border-b px-8 py-4 flex items-center justify-between shadow-sm">
      <Link to="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-800 transition duration-200">
        FinNova AI
      </Link>

      <div className="flex items-center gap-6">
        {isLoggedIn ? (
          <>
            <div className="flex gap-5 text-xs font-bold text-slate-600 items-center">
              <Link to="/dashboard" className={`transition py-1 border-b-2 ${location.pathname === "/dashboard" ? "border-indigo-600 text-indigo-600 font-extrabold" : "border-transparent hover:text-indigo-600"}`}>Dashboard</Link>
              <Link to="/transactions" className={`transition py-1 border-b-2 ${location.pathname === "/transactions" ? "border-indigo-600 text-indigo-600 font-extrabold" : "border-transparent hover:text-indigo-600"}`}>Transactions</Link>
              <Link to="/budget" className={`transition py-1 border-b-2 ${location.pathname === "/budget" ? "border-indigo-600 text-indigo-600 font-extrabold" : "border-transparent hover:text-indigo-600"}`}>Budget</Link>
              <Link to="/goals" className={`transition py-1 border-b-2 ${location.pathname === "/goals" ? "border-indigo-600 text-indigo-600 font-extrabold" : "border-transparent hover:text-indigo-600"}`}>Goals</Link>
              <Link to="/learning" className={`transition py-1 border-b-2 ${location.pathname === "/learning" ? "border-indigo-600 text-indigo-600 font-extrabold" : "border-transparent hover:text-indigo-600"}`}>Learning</Link>
              <Link to="/quiz" className={`transition py-1 border-b-2 ${location.pathname === "/quiz" ? "border-indigo-600 text-indigo-600 font-extrabold" : "border-transparent hover:text-indigo-600"}`}>AI Quiz</Link>
              <Link to="/reports" className={`transition py-1 border-b-2 ${location.pathname === "/reports" ? "border-indigo-600 text-indigo-600 font-extrabold" : "border-transparent hover:text-indigo-600"}`}>Reports</Link>
              <Link to="/subscriptions" className={`transition py-1 border-b-2 ${location.pathname === "/subscriptions" ? "border-indigo-600 text-indigo-600 font-extrabold" : "border-transparent hover:text-indigo-600"}`}>Subscriptions</Link>
              <Link to="/assistant" className={`transition py-1 border-b-2 ${location.pathname === "/assistant" ? "border-indigo-600 text-indigo-600 font-extrabold" : "border-transparent hover:text-indigo-600"}`}>AI Assistant</Link>
            </div>
            <div className="h-5 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <span className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xxs font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                AI Core Active
              </span>
              <span className="text-xs font-bold text-slate-700">Hi, {userName || "User"}</span>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition duration-200 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="flex gap-4">
            <Link
              to="/login"
              className="rounded-lg px-4 py-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 transition shadow-sm"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;