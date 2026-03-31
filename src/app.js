// backend/src/app.js

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const { apiLimiter, authLimiter } = require("./middleware/rateLimiter");
const { initSentry, Sentry } = require("./config/sentry");

// Initialize Sentry first (returns true if initialized)
const sentryInitialized = initSentry();

const app = express();

// ========== SECURITY MIDDLEWARE ==========

// Helmet - Sets secure HTTP headers
app.use(helmet());

// CORS - Restrict allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:5173", "http://localhost:4173"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        const msg = "CORS policy does not allow access from this origin.";
        return callback(new Error(msg), false);
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

// Apply rate limiting to all API routes
app.use("/api", apiLimiter);

// Body parser with size limit
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Sentry request handler - only if Sentry is initialized
if (sentryInitialized && Sentry && Sentry.Handlers) {
  app.use(Sentry.Handlers.requestHandler());
}

// ========== TEST ROUTES ==========

app.get("/", (req, res) => {
  res.send("NeuraTrack Backend is running!");
});

// Test rate limiting endpoint
app.get("/api/test-rate-limit", (req, res) => {
  res.json({ success: true, message: "This endpoint is rate limited" });
});

// Test error endpoint (temporary)
app.get("/api/test-error", (req, res) => {
  throw new Error("Test error from NeuraTrack backend!");
});

// ========== ROUTES ==========

// Auth routes with stricter rate limiting
const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authLimiter, authRoutes);

// Auth middleware
const authMiddleware = require("./middleware/auth.middleware");

// Protected test route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.send(`Access granted. User ID: ${req.user.id}`);
});

// Seizure routes - with auth middleware
const seizureRoutes = require("./routes/seizure.routes");
app.use("/api/seizures", authMiddleware, seizureRoutes);

// Medication routes - with auth middleware
const medicationRoutes = require("./routes/medication.routes");
app.use("/api/medications", authMiddleware, medicationRoutes);

// Emergency routes - with auth middleware
const emergencyRoutes = require("./routes/emergency.routes");
app.use("/api/emergency", authMiddleware, emergencyRoutes);

// AI routes - with auth middleware
const aiRoutes = require("./routes/ai.routes");
app.use("/api/ai", authMiddleware, aiRoutes);

// Report routes - with auth middleware
const reportRoutes = require("./routes/report.routes");
app.use("/api/reports", authMiddleware, reportRoutes);

// ========== ERROR HANDLING ==========

// Sentry error handler - only if Sentry is initialized
if (sentryInitialized && Sentry && Sentry.Handlers) {
  app.use(Sentry.Handlers.errorHandler());
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  if (err.status === 429) {
    return res
      .status(429)
      .json({ success: false, message: "Too many requests" });
  }

  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

module.exports = app;
