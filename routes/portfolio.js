const express = require("express");
const router = express.Router();   // ✅ you forgot this line
const Trade = require("../models/Trade");
const auth = require("../middleware/authMiddleware");

// GET portfolio holdings
router.get("/", auth, async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.user.id }); // ✅ use userId

    const holdings = {};

    trades.forEach((trade) => {
      if (!holdings[trade.symbol]) {
        holdings[trade.symbol] = { quantity: 0, totalCost: 0 };
      }

      if (trade.type === "BUY") {
        holdings[trade.symbol].quantity += trade.quantity;
        holdings[trade.symbol].totalCost += trade.quantity * trade.price;
      } else if (trade.type === "SELL") {
        holdings[trade.symbol].quantity -= trade.quantity;
        holdings[trade.symbol].totalCost -= trade.quantity * trade.price;
      }
    });

    const result = Object.keys(holdings).map((symbol) => {
      const h = holdings[symbol];
      const avgPrice = h.quantity > 0 ? h.totalCost / h.quantity : 0;
      const ltp = avgPrice + 10; // placeholder for live price
      return {
        symbol,
        quantity: h.quantity,
        avgPrice: Number(avgPrice.toFixed(2)),
        ltp: Number(ltp.toFixed(2)),
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Portfolio error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


router.post("/sell", async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const holding = user.holdings.find(h => h.symbol === symbol);

    if (!holding || holding.quantity < quantity) {
      return res.status(400).json({ message: "Not enough units to sell" });
    }

    // Decrease holding
    holding.quantity -= quantity;

    // Increase wallet balance
    const stockPrice = await getPrice(symbol); // mock or API
    user.balance += stockPrice * quantity;

    // Remove holding if quantity becomes 0
    if (holding.quantity === 0) {
      user.holdings = user.holdings.filter(h => h.symbol !== symbol);
    }

    await user.save();

    res.json({
      message: "Sell successful",
      balance: user.balance,
      holdings: user.holdings,
    });
  } catch (err) {
    console.error("Sell error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
