// components/Home.js
import React, { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import OrderModal from "./OrderModal";
import { toast } from "react-toastify";

const Home = () => {
  const [tab, setTab] = useState("STOCKS");
  const [stocks, setStocks] = useState([]);
  const [etfs, setEtfs] = useState([
    { symbol: "NIFTYBEES", price: 250.45, change: 0.6 },
    { symbol: "BANKBEES", price: 415.10, change: -0.3 },
    { symbol: "GOLDBEES", price: 57.80, change: 0.2 },
  ]);
  const [mfs, setMfs] = useState([
    { symbol: "SBI-BLUECHIP", price: 68.92, change: 0.4 },
    { symbol: "AXIS-GROWTH", price: 42.13, change: -0.1 },
    { symbol: "HDFC-INDEX", price: 21.77, change: 0.2 },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [action, setAction] = useState(null);

  // ✅ Load stocks initially + auto-refresh every 10s
  useEffect(() => {
    const loadStocks = async () => {
      try {
        const res = await axiosClient.get("/api/stocks");
        setStocks(res.data || []);
      } catch (err) {
        console.error("Stocks fetch error:", err);
      }
    };

    loadStocks();
    const interval = setInterval(loadStocks, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // ✅ Simulate ETF & MF price changes every 15s
  useEffect(() => {
    const interval = setInterval(() => {
      setEtfs((prev) =>
        prev.map((it) => ({
          ...it,
          price: (it.price * (1 + (Math.random() - 0.5) / 100)).toFixed(2),
          change: (Math.random() * 2 - 1).toFixed(2),
        }))
      );
      setMfs((prev) =>
        prev.map((it) => ({
          ...it,
          price: (it.price * (1 + (Math.random() - 0.5) / 100)).toFixed(2),
          change: (Math.random() * 2 - 1).toFixed(2),
        }))
      );
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const openModal = (instrument, act) => {
    setSelectedInstrument(instrument);
    setAction(act);
    setShowModal(true);
  };

  const addToWatchlist = async (symbol) => {
    try {
      await axiosClient.post("/api/watchlist/add", { symbol });
      toast.success(`${symbol} added to watchlist`);
    } catch (err) {
      toast.error("Failed to add to watchlist");
    }
  };

  const instruments = tab === "STOCKS" ? stocks : tab === "ETFs" ? etfs : mfs;

  return (
    <div className="container">
      <div className="card">
        <div className="row" style={{ flexWrap: "wrap", alignItems: "center" }}>
          <h2 style={{ margin: 0, flex: 1 }}>Market</h2>
          <div className="tags">
            <button
              className={`btn ${tab === "STOCKS" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setTab("STOCKS")}
            >
              Stocks
            </button>
            <button
              className={`btn ${tab === "ETFs" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setTab("ETFs")}
            >
              ETFs
            </button>
            <button
              className={`btn ${tab === "MFs" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setTab("MFs")}
            >
              Mutual Funds
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Price</th>
                <th>Change</th>
                <th>Action</th>
                <th>Watchlist</th>
              </tr>
            </thead>
            <tbody>
              {instruments.map((it) => (
                <tr key={it.symbol}>
                  <td>{it.symbol}</td>
                  <td>{it.price?.toFixed ? it.price.toFixed(2) : it.price}</td>
                  <td style={{ color: (it.change ?? 0) >= 0 ? "green" : "red" }}>
                    {(it.change ?? 0) >= 0 ? `+${it.change}%` : `${it.change}%`}
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => openModal(it, "buy")}
                    >
                      Buy
                    </button>{" "}
                    <button
                      className="btn btn-danger"
                      onClick={() => openModal(it, "sell")}
                    >
                      Sell
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline"
                      onClick={() => addToWatchlist(it.symbol)}
                    >
                      +
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedInstrument && (
        <OrderModal
          symbol={selectedInstrument.symbol}
          price={selectedInstrument.price}
          action={action}
          userHoldings={[]}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Home;
