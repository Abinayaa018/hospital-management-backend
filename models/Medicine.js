const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: String,
    category: String,
    stock: Number,
    unit: String,
    price: Number,
    supplier: String,
    expiry: String,
    status: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medicine", medicineSchema);
