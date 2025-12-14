// components/Watchlist.js
import React, { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import OrderModal from "./OrderModal";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Watchlist = () => {
  const [symbols, setSymbols] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const navigate = useNavigate();

  // ✅ Fetch watchlist initially + auto-refresh every 12s
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const res = await axiosClient.get("/api/watchlist");
        setSymbols(res.data || []);
      } catch (err) {
        console.error("Error fetching watchlist:", err);
      }
    };

    fetchWatchlist();
    const interval = setInterval(fetchWatchlist, 12000); // refresh every 12s
    return () => clearInterval(interval);
  }, []);

  const removeSymbol = async (sym) => {
    try {
      const res = await axiosClient.post("/api/watchlist/remove", { symbol: sym });
      setSymbols(res.data);
      toast.success(`${sym} removed from watchlist`);
    } catch (err) {
      toast.error("Failed to remove symbol");
    }
  };

  const openModal = (sym) => {
    setSelectedSymbol(sym);
    setShowModal(true);
  };

  return (
    <div className="card">
      <h2>Watchlist</h2>

      {symbols.length === 0 ? (
        <p className="empty">
          Watchlist is empty.{" "}
          <button
            className="btn btn-primary"
            onClick={() => navigate("/home")}
          >
            Click here to add investment
          </button>
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {symbols.map((item) => (
            <li
              key={item.symbol}
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <button
                className="btn btn-outline"
                onClick={() => removeSymbol(item.symbol)}
                style={{ flex: "0 0 auto" }}
              >
                -
              </button>
              <span style={{ flex: "1 1 auto", minWidth: "80px" }}>
                {item.symbol}{" "}
                {item.price && (
                  <span style={{ fontSize: "14px", color: "#64748b" }}>
                    ₹{Number(item.price).toFixed(2)}
                  </span>
                )}
              </span>
              <button
                className="btn btn-primary"
                onClick={() => openModal(item.symbol)}
                style={{ flex: "1 1 auto", minWidth: "80px" }}
              >
                Buy
              </button>
              <button
                className="btn btn-danger"
                onClick={() => openModal(item.symbol)}
                style={{ flex: "1 1 auto", minWidth: "80px" }}
              >
                Sell
              </button>
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <OrderModal
          symbol={selectedSymbol}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Watchlist;
