const express = require("express");
const router = express.Router();

const { SignUpUser } = require("../UserController");

router.post("/signup", SignUpUser);

module.exports = router;

