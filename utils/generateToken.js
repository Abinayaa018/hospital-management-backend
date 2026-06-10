const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET?.trim() || "change_this_secret";
const jwtExpiresIn = "7d";

function generateToken(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
}

module.exports = { generateToken, jwtSecret };
