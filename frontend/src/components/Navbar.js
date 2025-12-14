import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Zerodha Clone</h2>

        {/* Hamburger toggle for mobile */}
        <button
          className="btn btn-outline"
          id="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ marginLeft: "auto" }}
        >
          ☰
        </button>
      </div>

      {/* Links container */}
      <div
        className={`navbar-links ${menuOpen ? "show" : ""}`}
        style={{
          display: menuOpen ? "flex" : "flex",
          flexDirection: menuOpen ? "column" : "row",
          gap: "20px",
          alignItems: "center",
          marginTop: menuOpen ? "10px" : "0",
        }}
      >
        <Link to="/home">Home</Link>
        <Link to="/portfolio">Portfolio</Link>
        <Link to="/trades">Trades</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/watchlist">Watchlist</Link>
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
