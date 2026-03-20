// src/controllers/ai.controller.js
const aiService = require('../services/ai.service');

exports.parseSeizureNote = async (req, res) => {
  try {
    const { noteText } = req.body;
    
    if (!noteText || noteText.length < 5) {
      return res.status(400).json({ 
        success: false, 
        error: 'Note text must be at least 5 characters' 
      });
    }
    
    const parsed = await aiService.parseSeizureNote(noteText);
    
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
};