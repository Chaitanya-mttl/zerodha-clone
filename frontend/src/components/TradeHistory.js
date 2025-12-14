// components/TradeHistory.js
import React, { useEffect, useState, useMemo } from "react";
import axiosClient from "../axiosClient";
import { toast } from "react-toastify";

const TradeHistory = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [symbol, setSymbol] = useState("");
  const [side, setSide] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Unique symbols for dropdown
  const symbols = useMemo(() => {
    const s = new Set(trades.map((t) => t.symbol));
    return Array.from(s).sort();
  }, [trades]);

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const params = {};
      if (symbol) params.symbol = symbol;
      if (side) params.side = side;
      if (from) params.from = from;
      if (to) params.to = to;

      const res = await axiosClient.get("/api/trades", { params });
      setTrades(res.data || []);
      toast.success("Trades loaded successfully!");
    } catch (err) {
      console.error("Trade fetch error:", err);
      toast.error("Failed to load trades.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div className="skeleton">Loading trades...</div>;

  // ✅ Utility to format INR nicely
  const formatINR = (n) => {
    const num = Number(n);
    if (!isFinite(num)) return String(n);
    if (Math.abs(num) >= 1e12) return `${(num / 1e12).toFixed(2)} T`;
    if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(2)} B`;
    if (Math.abs(num) >= 1e7) return `${(num / 1e7).toFixed(2)} Cr`;
    if (Math.abs(num) >= 1e5) return `${(num / 1e5).toFixed(2)} L`;
    return num.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  };

  return (
    <div className="card">
      <h2>Trade History</h2>

      {/* Filters */}
      <div
        className="row"
        style={{
          gap: 12,
          marginBottom: 12,
          flexWrap: "wrap", // ✅ stack filters on mobile
        }}
      >
        <div style={{ flex: "1 1 140px" }}>
          <label><strong>Symbol</strong></label>
          <select className="input" value={symbol} onChange={(e) => setSymbol(e.target.value)}>
            <option value="">All</option>
            {symbols.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: "1 1 140px" }}>
          <label><strong>Side</strong></label>
          <select className="input" value={side} onChange={(e) => setSide(e.target.value)}>
            <option value="">All</option>
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>
        <div style={{ flex: "1 1 140px" }}>
          <label><strong>From</strong></label>
          <input
            className="input"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div style={{ flex: "1 1 140px" }}>
          <label><strong>To</strong></label>
          <input
            className="input"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div style={{ alignSelf: "flex-end", flex: "1 1 100px" }}>
          <button className="btn btn-primary" onClick={fetchTrades} style={{ width: "100%" }}>
            Apply filters
          </button>
        </div>
      </div>

      {trades.length === 0 ? (
        <p>No trades yet.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Symbol</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>P&L</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t, idx) => {
                let pnl = null;
                let pnlPercent = null;
                if (t.type === "SELL" && t.avgPrice) {
                  const diff = Number(t.price) - Number(t.avgPrice);
                  pnl = diff * Number(t.quantity);
                  pnlPercent = (diff / Number(t.avgPrice)) * 100;
                }

                return (
                  <tr key={idx}>
                    <td style={{ color: t.type === "BUY" ? "green" : "red" }}>
                      {t.type}
                    </td>
                    <td>{t.symbol}</td>
                    <td>{t.quantity}</td>
                    <td>{t.price}</td>
                    <td style={{ color: pnl >= 0 ? "green" : "red" }} className="tooltip">
                      {pnl !== null
                        ? `${pnl >= 0 ? "+" : ""}${formatINR(pnl)} (${pnlPercent.toFixed(2)}%)`
                        : "-"}
                      {pnl !== null && (
                        <span className="tooltip-text">
                          P&L = (Sell Price - Avg Price) × Quantity
                        </span>
                      )}
                    </td>
                    <td>
                      {t.createdAt
                        ? new Date(t.createdAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "No timestamp"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TradeHistory;
