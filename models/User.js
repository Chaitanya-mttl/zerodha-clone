const mongoose = require("mongoose");

// Each holding in the user's portfolio
const holdingSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  quantity: { type: Number, required: true },
  avgPrice: { type: Number, required: true }
});

// User schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 0 }, // ✅ funds available
    holdings: [holdingSchema],             // ✅ portfolio holdings
    watchlist: [{ symbol: String }]        // ✅ optional watchlist
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
