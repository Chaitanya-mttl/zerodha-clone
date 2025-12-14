const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");
const stockRoutes = require("./routes/stocks");
const tradeRoutes = require("./routes/trades");
const portfolioRoutes = require("./routes/portfolio");
const etfRoutes = require("./routes/etfs");
const mutualFundRoutes = require("./routes/mutualFunds");
// const auth = require("./middleware/auth"); 
const watchlistRoutes = require("./routes/watchlist");


dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
// app.use("/api/auth", authRoutes);
// app.use("/api/stocks", stockRoutes);
// app.use("/api/trades", tradeRoutes);
// app.use("/api/portfolio", portfolioRoutes);
app.use("/api/auth", require("./routes/auth"));
app.use("/api/stocks", require("./routes/stocks"));
app.use("/api/trades", require("./routes/trades"));
app.use("/api/portfolio", require("./routes/portfolio"));
app.use("/api/etfs", require("./routes/etfs"));
// app.use("/api/etfs", etfRoutes);
app.use("/api/mutualfunds", require("./routes/mutualFunds"));
// app.use("/api/mutualfunds", mutualFundRoutes);
// app.use(auth, watchlistRoutes);
app.use("/api/watchlist", require("./routes/watchlist"));
app.use("/api/trades", require("./routes/tradeHistory")); // alongside your existing trades routes


// Test route
app.get("/", (req, res) => {
  res.send("Zerodha Clone Backend Running 🚀");
});

// Connect DB + Start Server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch(err => console.error(err));

// Example protected route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You accessed a protected route!",
    userId: req.user.id
  });
});
