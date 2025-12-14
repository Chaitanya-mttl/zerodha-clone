const express = require("express");
const ETF = require("../models/ETF");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Seed sample ETFs
router.post("/seed", authMiddleware, async (req, res) => {
  try {
    const sampleETFs = [
      { symbol: "NIFTYBEES", price: 250.45, change: 0.6 },
      { symbol: "BANKBEES", price: 415.10, change: -0.3 },
      { symbol: "GOLDBEES", price: 57.80, change: 0.2 },
    ];
    await ETF.deleteMany({});
    await ETF.insertMany(sampleETFs);
    res.json({ message: "Sample ETFs added" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all ETFs
router.get("/", async (req, res) => {
  try {
    const etfs = await ETF.find().sort({ symbol: 1 });
    res.json(etfs);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single ETF
router.get("/:symbol", async (req, res) => {
  try {
    const etf = await ETF.findOne({ symbol: req.params.symbol.toUpperCase() });
    if (!etf) return res.status(404).json({ message: "ETF not found" });
    res.json(etf);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
