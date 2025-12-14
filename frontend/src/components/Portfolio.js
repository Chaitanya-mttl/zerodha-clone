// components/Portfolio.js
import React, { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import OrderModal from "./OrderModal";

const Portfolio = () => {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [action, setAction] = useState(null);
  const [isDark, setIsDark] = useState(false);

  // ✅ Load holdings initially + auto-refresh every 10s
  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        const res = await axiosClient.get("/api/portfolio");
        setHoldings(res.data || []);
      } catch (err) {
        console.error("Holdings fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
    const interval = setInterval(fetchHoldings, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // ✅ Theme detection
  useEffect(() => {
    const themeAttr =
      document.documentElement.getAttribute("data-theme") ||
      document.body.getAttribute("data-theme");

    if (themeAttr) {
      setIsDark(themeAttr.toLowerCase() === "dark");
    } else {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDark(mq?.matches ?? false);
      const onChange = (e) => setIsDark(e.matches);
      mq?.addEventListener ? mq.addEventListener("change", onChange) : mq?.addListener(onChange);
      return () => {
        mq?.removeEventListener ? mq.removeEventListener("change", onChange) : mq?.removeListener(onChange);
      };
    }
  }, []);

  const openModal = (instrument, act) => {
    setSelectedInstrument(instrument);
    setAction(act);
    setShowModal(true);
  };

  if (loading) return <div className="skeleton">Loading portfolio...</div>;

  // Totals
  const totalInvested = holdings.reduce(
    (sum, h) => sum + Number(h.avgPrice) * Number(h.quantity),
    0
  );
  const totalCurrent = holdings.reduce(
    (sum, h) => sum + Number(h.ltp) * Number(h.quantity),
    0
  );
  const overallPnl = totalCurrent - totalInvested;

  // Compute per-row absolute and percentage P&L
  const rows = holdings.map((h) => {
    const diff = Number(h.ltp) - Number(h.avgPrice);
    const pnl = diff * Number(h.quantity);
    const pnlPercent = Number(h.avgPrice) > 0 ? (diff / Number(h.avgPrice)) * 100 : 0;
    return { ...h, pnl, pnlPercent };
  });

  // Determine top gainer/loser by percentage
  let maxPercent = -Infinity;
  let minPercent = Infinity;
  rows.forEach((r) => {
    if (r.pnlPercent > maxPercent) maxPercent = r.pnlPercent;
    if (r.pnlPercent < minPercent) minPercent = r.pnlPercent;
  });

  const allProfitable = rows.every((r) => r.pnlPercent >= 0);

  // Adaptive colors
  const gainBg = isDark ? "rgba(0, 200, 83, 0.10)" : "rgba(46, 204, 113, 0.12)";
  const lossBg = isDark ? "rgba(244, 67, 54, 0.10)" : "rgba(231, 76, 60, 0.12)";
  const gainBorder = isDark ? "rgba(0, 200, 83, 0.65)" : "rgba(39, 174, 96, 0.65)";
  const lossBorder = isDark ? "rgba(244, 67, 54, 0.65)" : "rgba(192, 57, 43, 0.65)";

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
      <h2>Portfolio</h2>
      {rows.length === 0 ? (
        <p className="empty">No holdings yet. Buy your first stock!</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Qty</th>
                <th>Avg price</th>
                <th>LTP</th>
                <th>P&L</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const highlightStyle =
                  r.pnlPercent === maxPercent
                    ? { backgroundColor: gainBg, borderLeft: `3px solid ${gainBorder}` }
                    : !allProfitable && r.pnlPercent === minPercent
                    ? { backgroundColor: lossBg, borderLeft: `3px solid ${lossBorder}` }
                    : {};

                return (
                  <tr key={r.symbol} style={highlightStyle}>
                    <td>{r.symbol}</td>
                    <td>{r.quantity}</td>
                    <td>{r.avgPrice}</td>
                    <td>{r.ltp}</td>
                    <td style={{ color: r.pnl >= 0 ? "green" : "red" }} className="tooltip">
                      {r.pnl >= 0 ? `+${formatINR(r.pnl)}` : formatINR(r.pnl)}{" "}
                      ({r.pnlPercent >= 0 ? `+${r.pnlPercent.toFixed(2)}%` : `${r.pnlPercent.toFixed(2)}%`})
                      {r.pnlPercent === maxPercent ? " 🟢" : !allProfitable && r.pnlPercent === minPercent ? " 🔴" : ""}
                      <span className="tooltip-text">
                        P&L = (LTP - Avg Price) × Quantity
                      </span>
                    </td>
                    <td style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => openModal({ symbol: r.symbol, ltp: r.ltp }, "buy")}
                        style={{ flex: 1, minWidth: "80px" }}
                      >
                        Buy
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => openModal({ symbol: r.symbol, ltp: r.ltp }, "sell")}
                        style={{ flex: 1, minWidth: "80px" }}
                      >
                        Sell
                      </button>
                    </td>
                  </tr>
                );
              })}
              <tr style={{ fontWeight: "bold" }}>
                <td colSpan={2}>Totals</td>
                <td>Invested: ₹{formatINR(totalInvested)}</td>
                <td>Current: ₹{formatINR(totalCurrent)}</td>
                <td style={{ color: overallPnl >= 0 ? "green" : "red" }}>
                  {overallPnl >= 0 ? `+₹${formatINR(overallPnl)}` : `₹${formatINR(overallPnl)}`}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedInstrument && (
        <OrderModal
          symbol={selectedInstrument.symbol}
          price={selectedInstrument.ltp}
          action={action}
          userHoldings={holdings}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Portfolio;
