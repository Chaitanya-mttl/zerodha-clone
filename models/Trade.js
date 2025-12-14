const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    symbol: { type: String, required: true },
    type: { type: String, enum: ["BUY", "SELL"], required: true }, // ✅ renamed to type
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    pnl: { type: Number, default: 0 } // optional profit/loss per trade
  },
  { timestamps: true } // adds createdAt and updatedAt
);

module.exports = mongoose.model("Trade", tradeSchema);
