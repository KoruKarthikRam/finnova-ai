import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-2xl font-bold text-indigo-600">
        FinNova AI
      </Link>

      <div className="flex gap-6 text-slate-600">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/transactions">Transactions</Link>
        <Link to="/budget">Budget</Link>
        <Link to="/goals">Goals</Link>
        <Link to="/learning">Learning</Link>
        <Link to="/assistant">AI Assistant</Link>
      </div>
    </nav>
  );
}

export default Navbar;