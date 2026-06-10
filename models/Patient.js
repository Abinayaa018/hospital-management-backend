const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: String,
    age: Number,
    gender: String,
    phone: String,
    email: String,
    status: String,
    lastVisit: String,
    condition: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
