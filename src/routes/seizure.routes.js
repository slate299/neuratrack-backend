//src/routes/seizure.routes.js
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

module.exports = router;
