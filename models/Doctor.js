const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: String,
    specialty: String,
    phone: String,
    email: String,
    status: String,
    patients: Number,
    rating: Number,
    experience: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
