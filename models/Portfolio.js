const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    quantity: { type: Number, required: true, min: 0 }, // net holdings
    avgPrice: { type: Number, required: true, min: 0 }  // average buy price
  },
  { timestamps: true }
);

module.exports = mongoose.model("Portfolio", portfolioSchema);
