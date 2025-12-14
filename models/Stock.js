const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true }, // e.g., TCS, INFY
  price: { type: Number, required: true },                // current price
  change: { type: Number, required: true }                // daily change %
});

module.exports = mongoose.model("Stock", stockSchema);
