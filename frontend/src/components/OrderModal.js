import React, { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import { toast } from "react-toastify";

const OrderModal = ({ symbol, price: initialPrice, action, onClose, userHoldings }) => {
  const [quantity, setQuantity] = useState(1);
  const [balance, setBalance] = useState(0);
  const [price, setPrice] = useState(initialPrice ?? null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [topup, setTopup] = useState("");
  const [maxSellable, setMaxSellable] = useState(0);
  const [error, setError] = useState("");

  // ✅ Load user balance and owned quantity (for Sell validation)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userRes = await axiosClient.get("/api/auth/me");
        setBalance(userRes.data.balance);

        if (action === "sell" && userHoldings) {
          const h = userHoldings.find((h) => h.symbol === symbol);
          setMaxSellable(h?.quantity || 0);
        }
      } catch (err) {
        console.error("OrderModal user fetch error:", err);
      }
    };
    loadUser();
  }, [symbol, action, userHoldings]);

  // ✅ Always fetch latest instrument price while modal is open
  useEffect(() => {
    const fetchPrice = async () => {
      setLoadingPrice(true);
      try {
        let instrumentRes;
        try {
          instrumentRes = await axiosClient.get(`/api/stocks/${symbol}`);
        } catch {
          try {
            instrumentRes = await axiosClient.get(`/api/etfs/${symbol}`);
          } catch {
            instrumentRes = await axiosClient.get(`/api/mutualfunds/${symbol}`);
          }
        }
        if (instrumentRes?.data?.price) {
          setPrice(instrumentRes.data.price);
        } else {
          toast.error("Unable to fetch price for instrument");
        }
      } catch (err) {
        console.error("OrderModal price fetch error:", err);
        toast.error("Failed to load instrument price");
      } finally {
        setLoadingPrice(false);
      }
    };

    // Initial fetch
    fetchPrice();
    // Poll every 8s while modal is open
    const interval = setInterval(fetchPrice, 8000);
    return () => clearInterval(interval);
  }, [symbol]);

  const required = price ? price * quantity : 0;

  const onQtyChange = (e) => {
    const q = Number(e.target.value);
    setQuantity(q);

    if (!Number.isInteger(q) || q <= 0) {
      setError("Enter a valid positive quantity.");
    } else if (action === "sell" && q > maxSellable) {
      setError(`You can sell max ${maxSellable}.`);
    } else {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (error) return toast.error(error);
    if (!price || price <= 0) return toast.error("Price not available");
    if (action === "buy" && required > balance) {
      return toast.error("Insufficient balance for this order");
    }

    try {
      const endpoint = action === "buy" ? "/api/trades/buy" : "/api/trades/sell";
      await axiosClient.post(endpoint, { symbol, quantity, price });
      toast.success(`${action.toUpperCase()} order placed for ${symbol}`);
      onClose();
    } catch (err) {
      console.error("Order failed:", err);
      toast.error(err.response?.data?.message || "Order failed");
    }
  };

  const handleTopup = async () => {
    try {
      const amount = Number(topup);
      if (!amount || amount <= 0) return toast.error("Enter a valid amount");
      const res = await axiosClient.post("/api/auth/add-funds", { amount });
      setBalance(res.data.balance);
      setTopup("");
      toast.success("Funds added successfully!");
    } catch (err) {
      console.error("Topup error:", err);
      toast.error("Failed to add funds");
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: "20px auto", padding: "16px" }}>
      <h3 style={{ textAlign: "center" }}>{action === "buy" ? "Buy" : "Sell"} {symbol}</h3>
      <p style={{ color: "#64748b", textAlign: "center" }}>
        {loadingPrice ? "Fetching price..." : `Price: ₹${price != null ? Number(price).toFixed(2) : "-"}`}
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <label>Quantity</label>
        <input
          className="input"
          type="number"
          min={1}
          value={quantity}
          onChange={onQtyChange}
        />

        {/* Balance / Holdings info */}
        <div style={{ fontSize: 14 }}>
          <p><strong>Available Balance:</strong> ₹{balance.toLocaleString("en-IN")}</p>
          {action === "buy" && (
            <>
              <p><strong>Required Balance:</strong> ₹{required ? required.toLocaleString("en-IN") : "-"}</p>
              {required > balance && (
                <p style={{ color: "red" }}>Insufficient balance</p>
              )}
            </>
          )}
          {action === "sell" && (
            <p><strong>Owned Quantity:</strong> {maxSellable}</p>
          )}
        </div>

        {/* Top-up section */}
        {action === "buy" && (
          <div>
            <label>Add Funds</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              <input
                className="input"
                type="number"
                placeholder="Enter amount"
                value={topup}
                onChange={(e) => setTopup(e.target.value)}
                style={{ flex: 1, minWidth: "140px" }}
              />
              <button type="button" className="btn btn-success" onClick={handleTopup}>
                Add
              </button>
            </div>
          </div>
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <button className="btn btn-primary" type="submit" disabled={!!error || loadingPrice} style={{ flex: 1 }}>
            Submit
          </button>
          <button className="btn btn-outline" type="button" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderModal;
