import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budget from "./pages/Budget";
import Goals from "./pages/Goals";
import Learning from "./pages/Learning";
import Assistant from "./pages/Assistant";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <main className="min-h-screen bg-slate-100 p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/assistant" element={<Assistant />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;