const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientName: String,
    doctorName: String,
    date: String,
    time: String,
    type: String,
    status: { type: String, default: "Pending" },
    department: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
