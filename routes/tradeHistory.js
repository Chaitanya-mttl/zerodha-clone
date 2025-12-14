const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Trade = require("../models/Trade");

// GET /api/trades/history?symbol=INFY&from=2025-01-01&to=2025-12-31&side=BUY
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const { symbol, from, to, side } = req.query;

    const q = { userId: req.user.id };
    if (symbol) q.symbol = symbol;
    if (side && (side === "BUY" || side === "SELL")) q.side = side;

    // Date range
    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);
    if (from || to) q.createdAt = dateFilter;

    const trades = await Trade.find(q).sort({ createdAt: -1 });
    res.json(trades);
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ message: "Failed to fetch trade history" });
  }
});

module.exports = router;
