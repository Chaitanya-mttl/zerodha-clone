// components/Dashboard.js
import React, { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [topup, setTopup] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosClient.get("/api/auth/me");
        setUser(res.data);
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const addFunds = async () => {
    try {
      const res = await axiosClient.post("/api/auth/add-funds", { amount: Number(topup) });
      setUser((u) => ({ ...u, balance: res.data.balance }));
      setTopup("");
    } catch (err) {
      console.error("Add funds error:", err);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Dashboard</h2>
        {user ? (
          <div className="row" style={{ flexWrap: "wrap" }}>
            <div className="col" style={{ minWidth: "260px" }}>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="col" style={{ minWidth: "260px" }}>
              <p><strong>Available balance:</strong> ₹{(user.balance ?? 0).toLocaleString("en-IN")}</p>
              <div className="row" style={{ flexWrap: "wrap" }}>
                <input
                  className="input"
                  placeholder="Add amount (₹)"
                  type="number"
                  value={topup}
                  onChange={(e) => setTopup(e.target.value)}
                  style={{ flex: 1, minWidth: "140px" }}
                />
                <button className="btn btn-success" onClick={addFunds}>Add funds</button>
              </div>
            </div>
          </div>
        ) : (
          <p>Loading profile...</p>
        )}
        <div style={{ marginTop: 12 }}>
          <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
