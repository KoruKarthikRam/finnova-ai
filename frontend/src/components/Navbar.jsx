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
            <div className="flex gap-6 text-slate-600 font-medium">
              <Link to="/dashboard" className="hover:text-indigo-600 transition">Dashboard</Link>
              <Link to="/transactions" className="hover:text-indigo-600 transition">Transactions</Link>
              <Link to="/budget" className="hover:text-indigo-600 transition">Budget</Link>
              <Link to="/goals" className="hover:text-indigo-600 transition">Goals</Link>
              <Link to="/learning" className="hover:text-indigo-600 transition">Learning</Link>
              <Link to="/quiz" className="hover:text-indigo-600 transition">AI Quiz</Link>
              <Link to="/reports" className="hover:text-indigo-600 transition">Reports</Link>
              <Link to="/subscriptions" className="hover:text-indigo-600 transition">Subscriptions</Link>
              <Link to="/assistant" className="hover:text-indigo-600 transition">AI Assistant</Link>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-slate-700">Hi, {userName || "User"}</span>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition duration-200 cursor-pointer"
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