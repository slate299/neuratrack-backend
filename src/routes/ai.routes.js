// src/routes/ai.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const aiController = require('../controllers/ai.controller');

// POST /api/ai/parse-seizure-note
router.post('/parse-seizure-note', auth, aiController.parseSeizureNote);

module.exports = router;