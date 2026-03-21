// src/routes/medication.routes.js

const express = require("express");
const router = express.Router();
const medicationController = require("../controllers/medication.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { validateMedication } = require("../middleware/validators");

// Protect all medication routes
router.use(authMiddleware);

// Medication CRUD
router.post("/", validateMedication, medicationController.addMedication);
router.get("/", medicationController.getMedications);
router.get("/:id", medicationController.getMedicationById);
router.put("/:id", medicationController.updateMedication);
router.delete("/:id", medicationController.deleteMedication);

// Adherence routes
router.get("/adherence", medicationController.getAdherence);
router.post("/adherence/mark", medicationController.markAsTaken);

module.exports = router;
