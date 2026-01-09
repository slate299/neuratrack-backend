//src/routes/medication.routes.js
const express = require("express");
const router = express.Router();
const medicationController = require("../controllers/medication.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { validateMedication } = require("../middleware/validators");

// Protect all medication routes
router.use(authMiddleware);

// Add a new medication
router.post("/", validateMedication, medicationController.addMedication);

// Get all medications for authenticated user
router.get("/", medicationController.getMedications);

module.exports = router;
