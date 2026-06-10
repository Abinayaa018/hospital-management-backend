const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    patientName: String,
    date: String,
    amount: Number,
    status: String,
    items: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
