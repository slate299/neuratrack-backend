// backend/src/middleware/auth.middleware.js

const jwt = require("jsonwebtoken");

// Input validation helper
const validateToken = (token) => {
  if (!token || typeof token !== "string") return false;
  // Basic JWT format validation (header.payload.signature)
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  // Check each part is not empty
  if (!parts[0] || !parts[1] || !parts[2]) return false;
  return true;
};

const authMiddleware = (req, res, next) => {
  // Only log in development
  if (process.env.NODE_ENV !== "production") {
    console.log("Auth middleware called");
  }

  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  // Check if it's a Bearer token
  if (!authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid token format" });
  }

  const token = authHeader.split(" ")[1];

  // Validate token format
  if (!validateToken(token)) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate decoded has userId
    if (!decoded || !decoded.userId) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token payload" });
    }

    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    console.error("Auth error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Authentication error" });
  }
};

module.exports = authMiddleware;
