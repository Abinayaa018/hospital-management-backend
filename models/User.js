const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstname: String,
    lastname: String,
    email: { type: String, required: true, unique: true },
    password: String,
    role: { type: String, default: "Patient" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
