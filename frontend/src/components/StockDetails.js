// components/StockDetails.js
import React, { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import { useParams } from "react-router-dom";

const StockDetails = () => {
  const { symbol } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axiosClient.get(`/api/stocks/${symbol}`);
        setDetails(res.data);
      } catch (err) {
        console.error("Stock details fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [symbol]);

  if (loading) return <div className="skeleton">Loading {symbol}...</div>;
  if (!details) return <p className="empty">No stock data found.</p>;

  return (
    <div className="card" style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center" }}>{symbol} Details</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "15px" }}>
        <p><strong>Price:</strong> ₹{details.price}</p>
        <p><strong>Change:</strong> {details.change}%</p>
      </div>
    </div>
  );
};

export default StockDetails;
