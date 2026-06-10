const express = require("express");
const { getAllUsers, getUserById, updateUser, deleteUser } = require("../controllers/userController");
const { authenticate, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate, requireRole(["Admin"]));
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
