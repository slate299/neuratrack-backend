// src/routes/seizure.routes.js

const express = require("express");
const router = express.Router();
const seizureController = require("../controllers/seizure.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { validateSeizure } = require("../middleware/validators");

// Protect all seizure routes
router.use(authMiddleware);

// Create a new seizure
router.post("/", validateSeizure, seizureController.createSeizure);

// Get all seizures for authenticated user
router.get("/", seizureController.getSeizures);

// Get seizure summary
router.get("/summary", seizureController.getSeizureSummary);

// Get single seizure by ID
router.get("/:id", seizureController.getSeizureById);

// Update seizure by ID
router.put("/:id", seizureController.updateSeizure);

// Delete seizure by ID
router.delete("/:id", seizureController.deleteSeizure);

module.exports = router;
