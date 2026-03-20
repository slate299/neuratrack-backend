// src/routes/ai.routes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const aiController = require("../controllers/ai.controller");

// POST /api/ai/parse-seizure-note
router.post("/parse-seizure-note", auth, aiController.parseSeizureNote);

// GET /api/ai/training-data?days=90
router.get("/training-data", auth, aiController.getTrainingData);

// GET /api/ai/predict-risk?days=7
router.get("/predict-risk", auth, aiController.predictRisk);

// GET /api/ai/medication-insights
router.get("/medication-insights", auth, aiController.getMedicationInsights);

// GET /api/ai/smart-reminder?medicationId=1
router.get("/smart-reminder", auth, aiController.getSmartReminder);

// ==================== PHASE B6: CHAT ASSISTANT ====================
// POST /api/ai/chat
router.post("/chat", auth, aiController.chat);

// GET /api/ai/conversations?limit=20
router.get("/conversations", auth, aiController.getConversations);

module.exports = router;
