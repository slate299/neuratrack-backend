// src/middleware/auth.middleware.js
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  console.log("Auth middleware called");
  console.log("Headers:", req.headers);

  const authHeader = req.headers["authorization"];
  console.log("Auth header:", authHeader);

  if (!authHeader) {
    console.log("No authorization header");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Bearer <token>
  console.log("Token:", token);

  if (!token) {
    console.log("No token in header");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // Make sure we set req.user properly
    req.user = { id: decoded.userId };
    console.log("req.user set to:", req.user);

    next();
  } catch (err) {
    console.log("Token verification error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
