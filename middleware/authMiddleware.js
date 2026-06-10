const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../utils/generateToken");

function getToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== "string") return null;
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

function authenticate(req, res, next) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: "Authentication required" });

  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user?.role) return res.status(401).json({ message: "Authentication required" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Access denied" });
    next();
  };
}

module.exports = { authenticate, requireRole };
