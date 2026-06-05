const express = require("express");
const router = express.Router();

const { SignUpUser, LoginUser } = require("../UserController");

router.post("/signup", SignUpUser);
router.post("/login", LoginUser);

module.exports = router;
