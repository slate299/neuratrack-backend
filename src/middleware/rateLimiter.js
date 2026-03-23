// backend/src/middleware/rateLimiter.js

const rateLimit = require("express-rate-limit");

// General API rate limiter - 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Don't specify custom keyGenerator - let it use default which handles IPv6 correctly
  // Add handler to log when limit is hit
  handler: (req, res, next, options) => {
    console.log(`⚠️ Rate limit exceeded for ${req.ip}`);
    res.status(options.statusCode).json(options.message);
  },
});

// Stricter limiter for auth routes - 5 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts, please try again later.",
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for sensitive operations
const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

console.log("✅ Rate limiters initialized");

module.exports = {
  apiLimiter,
  authLimiter,
  sensitiveLimiter,
};
