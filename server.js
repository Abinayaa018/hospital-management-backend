const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routers/UserRoutes");
const dataRoutes = require("./routers/DataRoutes");

const app = express();

app.use(express.json());
app.use(cors({
  origin: [
    "https://hospital-management-system-drab-beta.vercel.app",
    "http://localhost:3000"
  ],
  credentials: true
}));

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("✅ Connected to MongoDB successfully");
})
.catch((error) => {
    console.error("❌ Error connecting to MongoDB:", error.message);
});

app.use("/api", userRoutes);
app.use("/api", dataRoutes);

app.get("/", (req, res) => {
    res.send("Kenko Backend Server is Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});