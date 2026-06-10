const express = require("express");
const controller = require("../controllers/patientController");
const { authenticate, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);
router.get("/", requireRole(["Admin", "Doctor", "Patient"]), controller.getAll);
router.post("/", requireRole(["Admin"]), controller.create);
router.put("/:id", requireRole(["Admin"]), controller.update);
router.delete("/:id", requireRole(["Admin"]), controller.remove);

module.exports = router;
