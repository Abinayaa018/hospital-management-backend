const express = require("express");
const { getDashboard } = require("../controllers/dashboardController");
const { authenticate, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticate, requireRole(["Admin", "Doctor", "Patient"]), getDashboard);

module.exports = router;
