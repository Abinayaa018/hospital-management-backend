const express = require("express");
const controller = require("../controllers/appointmentController");
const { authenticate, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);
router.get("/", requireRole(["Admin", "Doctor", "Patient"]), controller.getAll);
router.post("/", requireRole(["Admin", "Doctor", "Patient"]), controller.create);
router.put("/:id", requireRole(["Admin", "Doctor"]), controller.update);
router.delete("/:id", requireRole(["Admin"]), controller.remove);

module.exports = router;
