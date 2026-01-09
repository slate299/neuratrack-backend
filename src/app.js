//src/app.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("NeuraTrack Backend is running!");
});

// Auth routes
const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

// Auth middleware
const authMiddleware = require("./middleware/auth.middleware");

// Protected test route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.send(`Access granted. User ID: ${req.user.id}`);
});

// Seizure routes
const seizureRoutes = require("./routes/seizure.routes");
app.use("/api/seizures", seizureRoutes);

// Medication routes
const medicationRoutes = require("./routes/medication.routes");
app.use("/api/medications", medicationRoutes);

module.exports = app;
