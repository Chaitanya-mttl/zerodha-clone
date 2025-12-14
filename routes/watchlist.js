const express = require("express");
const router = express.Router();
const User = require("../models/user"); // ✅ make sure filename matches exactly

// TEMP: get first user in DB (replace with auth later)
async function getTestUser() {
  const user = await User.findOne();
  return user;
}

// GET watchlist
router.get("/", async (req, res) => {
  try {
    const user = await getTestUser();
    res.json(user.watchlist || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch watchlist" });
  }
});

// ADD to watchlist
router.post("/add", async (req, res) => {
  try {
    const { symbol } = req.body;
    const user = await getTestUser();

    if (!user.watchlist.find(w => w.symbol === symbol)) {
      user.watchlist.push({ symbol });
      await user.save();
    }

    res.json(user.watchlist);
  } catch (err) {
    res.status(500).json({ error: "Failed to add symbol" });
  }
});

// REMOVE from watchlist
router.post("/remove", async (req, res) => {
  try {
    const { symbol } = req.body;
    const user = await getTestUser();

    user.watchlist = user.watchlist.filter(w => w.symbol !== symbol);
    await user.save();

    res.json(user.watchlist);
  } catch (err) {
    res.status(500).json({ error: "Failed to remove symbol" });
  }
});

module.exports = router;
