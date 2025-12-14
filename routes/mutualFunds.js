const express = require("express");
const MutualFund = require("../models/MutualFund");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Seed sample Mutual Funds
router.post("/seed", authMiddleware, async (req, res) => {
  try {
    const sampleMFs = [
      { symbol: "SBI-BLUECHIP", price: 68.92, change: 0.4 },
      { symbol: "AXIS-GROWTH", price: 42.13, change: -0.1 },
      { symbol: "HDFC-INDEX", price: 21.77, change: 0.2 },
    ];
    await MutualFund.deleteMany({});
    await MutualFund.insertMany(sampleMFs);
    res.json({ message: "Sample Mutual Funds added" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all Mutual Funds
router.get("/", async (req, res) => {
  try {
    const mfs = await MutualFund.find().sort({ symbol: 1 });
    res.json(mfs);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single Mutual Fund
router.get("/:symbol", async (req, res) => {
  try {
    const mf = await MutualFund.findOne({ symbol: req.params.symbol.toUpperCase() });
    if (!mf) return res.status(404).json({ message: "Mutual Fund not found" });
    res.json(mf);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
