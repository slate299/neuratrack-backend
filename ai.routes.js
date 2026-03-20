// ai.routes.js
const express = require('express');
const router = express.Router();
const auth = require('./auth.middleware');
const gemini = require('./gemini');

// POST /api/ai/parse-seizure-note
router.post('/parse-seizure-note', auth, async (req, res) => {
  try {
    const { noteText } = req.body;
    
    if (!noteText || noteText.length < 5) {
      return res.status(400).json({ 
        success: false, 
        error: 'Note text must be at least 5 characters' 
      });
    }

    const prompt = `
      Extract structured seizure data from this patient note.
      Return ONLY valid JSON with these fields:
      {
        "seizureType": "Focal Onset Aware OR Focal Onset Impaired Awareness OR Generalized Onset Motor OR Generalized Onset Non-Motor OR Unknown",
        "durationSeconds": number or null,
        "triggers": ["array", "of", "triggers"],
        "symptoms": ["array", "of", "symptoms"],
        "postIctalSymptoms": ["array", "of", "symptoms"],
        "timestamp": "ISO string or null",
        "confidence": number between 0-1
      }
      
      Note: "${noteText}"
    `;
    
    const parsed = await gemini.generateJsonResponse(prompt);
    
    res.json({
      success: true,
      parsed,
      originalNote: noteText
    });
    
  } catch (error) {
    console.error('AI parsing error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to parse seizure note' 
    });
  }
});

module.exports = router;