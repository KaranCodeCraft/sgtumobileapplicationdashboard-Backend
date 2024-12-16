const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware to verify the token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided. Access denied." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded token data to the request object
    next();
  } catch (err) {
    res
      .status(403)
      .json({ message: "Invalid or expired token. Access denied." });
  }
};

// Function to generate a token
const generateToken = (payload, expiresIn = "1h") => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Middleware to get user data from the token
const getUserFromToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided. Access denied." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded token data to the request object
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token." });
  }
};

// Function to check if the user has a specific role (e.g., admin)
const checkRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res
        .status(403)
        .json({ message: "Access denied. Insufficient permissions." });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  generateToken,
  getUserFromToken,
  checkRole,
};
