import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Landing = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      toast.success("Login successful!");
      navigate("/home");
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      toast.error("User not found. Please create an account.");
    }
  };

  return (
    <div className="card" style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>Welcome to the Zerodha Clone</h1>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div>
          <label>Email:</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button className="btn btn-primary" type="submit">Login</button>
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => navigate("/register")}
          >
            Create Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default Landing;
