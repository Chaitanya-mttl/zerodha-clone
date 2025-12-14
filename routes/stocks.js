const express = require("express");
const Stock = require("../models/Stock");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Seed sample stocks (protected to avoid spam)
router.post("/seed", authMiddleware, async (req, res) => {
  try {
    const sampleStocks = [
      { symbol: "TCS", price: 3500, change: 1.2 },
      { symbol: "INFY", price: 1500, change: -0.5 },
      { symbol: "HDFC", price: 2800, change: 0.8 },
      { symbol: "RELIANCE", price: 2400, change: -1.1 },
      { symbol: "SBIN", price: 620, change: 0.4 }
    ];

    await Stock.deleteMany({});
    await Stock.insertMany(sampleStocks);

    res.json({ message: "Sample stocks added" });
  } catch (err) {
    console.error("Seed error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all stocks (public)
router.get("/", async (req, res) => {
  try {
    const stocks = await Stock.find().sort({ symbol: 1 });
    res.json(stocks);
  } catch (err) {
    console.error("Get stocks error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single stock by symbol (public)
router.get("/:symbol", async (req, res) => {
  try {
    const stock = await Stock.findOne({ symbol: req.params.symbol.toUpperCase() });
    if (!stock) return res.status(404).json({ message: "Stock not found" });
    res.json(stock);
  } catch (err) {
    console.error("Get stock error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
