const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri = process.env.MONGO_URI?.trim();

  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined. Set it in backend/.env or your hosting environment.");
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB successfully");
}

module.exports = connectDB;
