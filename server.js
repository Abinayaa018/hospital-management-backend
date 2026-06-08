const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routers/UserRoutes");
const dataRoutes = require("./routers/DataRoutes");

const app = express();

app.use(express.json());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://hospital-management-system-drab-beta.vercel.app",
  "http://localhost:3000"
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    if (/\.vercel\.app$/.test(origin)) return callback(null, true)
    callback(new Error(`CORS policy does not allow access from origin ${origin}`))
  },
  credentials: true,
};

app.use(cors(corsOptions));

const mongoUri = process.env.MONGO_URI?.trim();
if (!mongoUri) {
  console.error("❌ MONGO_URI is not defined. Set it in backend/.env or Render environment variables.");
  process.exit(1);
}

mongoose.connect(mongoUri)
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