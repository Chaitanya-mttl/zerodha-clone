const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/user");
const Trade = require("../models/Trade");

const router = express.Router();

// BUY
router.post("/buy", authMiddleware, async (req, res) => {
  try {
    const { symbol, quantity, price } = req.body;
    if (!symbol || !quantity || quantity <= 0 || !price || price <= 0) {
      return res.status(400).json({ message: "Invalid symbol, quantity, or price" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const cost = price * quantity;
    if (user.balance < cost) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    user.balance -= cost;

    const idx = user.holdings.findIndex(h => h.symbol === symbol);
    if (idx === -1) {
      user.holdings.push({ symbol, quantity, avgPrice: price });
    } else {
      const h = user.holdings[idx];
      const totalQty = h.quantity + quantity;
      const totalCost = h.avgPrice * h.quantity + price * quantity;
      h.quantity = totalQty;
      h.avgPrice = Number((totalCost / totalQty).toFixed(2));
      user.holdings[idx] = h;
    }

    await user.save();

    const trade = new Trade({
      userId: user._id,
      symbol,
      type: "BUY",
      quantity,
      price
    });
    await trade.save();

    res.json({ message: "Buy executed", balance: user.balance, holdings: user.holdings });
  } catch (err) {
    console.error("BUY error:", err);
    res.status(500).json({ message: "Failed to execute buy" });
  }
});

// SELL
router.post("/sell", authMiddleware, async (req, res) => {
  try {
    const { symbol, quantity, price } = req.body;
    if (!symbol || !quantity || quantity <= 0 || !price || price <= 0) {
      return res.status(400).json({ message: "Invalid symbol, quantity, or price" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const idx = user.holdings.findIndex(h => h.symbol === symbol);
    if (idx === -1) {
      return res.status(400).json({ message: "No holdings for symbol" });
    }
    const h = user.holdings[idx];
    if (h.quantity < quantity) {
      return res.status(400).json({ message: "Not enough quantity to sell" });
    }

    const proceeds = price * quantity;
    user.balance += proceeds;

    h.quantity -= quantity;
    if (h.quantity === 0) {
      user.holdings.splice(idx, 1);
    } else {
      user.holdings[idx] = h;
    }

    await user.save();

    const trade = new Trade({
      userId: user._id,
      symbol,
      type: "SELL",
      quantity,
      price,
      avgPrice: h.avgPrice   // ✅ attach avgPrice at time of sell
    });
    await trade.save();

    res.json({ message: "Sell executed", balance: user.balance, holdings: user.holdings });
  } catch (err) {
    console.error("SELL error:", err);
    res.status(500).json({ message: "Failed to execute sell" });
  }
});

// GET trades with avgPrice
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { symbol, side, from, to } = req.query;
    const q = { userId: req.user.id };
    if (symbol) q.symbol = symbol;
    if (side) q.type = side;
    if (from || to) {
      q.createdAt = {};
      if (from) q.createdAt.$gte = new Date(from);
      if (to) q.createdAt.$lte = new Date(to);
    }

    const trades = await Trade.find(q).sort({ createdAt: -1 });

    // ✅ Attach avgPrice from holdings for SELL trades if missing
    const user = await User.findById(req.user.id);
    const enriched = trades.map(t => {
      const obj = t.toObject();
      if (obj.type === "SELL" && !obj.avgPrice) {
        const h = user.holdings.find(hh => hh.symbol === obj.symbol);
        if (h) obj.avgPrice = h.avgPrice;
      }
      return obj;
    });

    res.json(enriched);
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ message: "Failed to fetch trade history" });
  }
});

module.exports = router;
