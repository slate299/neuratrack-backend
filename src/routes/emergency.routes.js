// src/routes/emergency.routes.js
const express = require("express");
const { triggerEmergency } = require("../controllers/emergency.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// POST /api/emergency/alert
router.post("/alert", authMiddleware, triggerEmergency);

module.exports = router;
