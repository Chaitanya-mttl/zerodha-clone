import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Portfolio from "./components/Portfolio";
import TradeHistory from "./components/TradeHistory";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./components/Login";
import Landing from "./components/Landing";
import Home from "./components/Home";
import Register from "./components/Register";
import Watchlist from "./components/Watchlist";
import "./App.css";

function App() {
  const [dark, setDark] = useState(false);

  // ✅ Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDark(true);
    }
  }, []);

  // ✅ Save theme whenever it changes
  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <Router>
      <div className={dark ? "dark-theme" : "light-theme"} style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        
        {/* Toolbar for theme toggle */}
        <div className="toolbar" style={{ flexShrink: 0 }}>
          <button className="btn btn-outline" onClick={() => setDark(!dark)}>
            {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        {/* Navbar always visible */}
        <Navbar />

        {/* Main content area */}
        <div style={{ flex: 1, width: "100%", padding: "10px" }}>
          <Routes>
            <Route path="/" element={<Landing />} />   {/* ✅ Default landing */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} /> 
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/trades" element={<TradeHistory />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/watchlist" element={<Watchlist />} />
          </Routes>
        </div>

        {/* Toast notifications */}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
