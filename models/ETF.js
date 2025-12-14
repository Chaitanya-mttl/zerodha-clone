const mongoose = require("mongoose");

const etfSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true, uppercase: true, trim: true },
  price: { type: Number, required: true },
  change: { type: Number, default: 0 } // daily change %
}, { timestamps: true });

module.exports = mongoose.model("ETF", etfSchema);
