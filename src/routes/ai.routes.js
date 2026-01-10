// src/routes/ai.routes.js
const express = require("express");
const router = express.Router();

const { handleSeizureNotes } = require("../controllers/ai.controller");

// POST /api/ai/parse-seizure-notes
router.post("/parse-seizure-notes", handleSeizureNotes);

module.exports = router;
