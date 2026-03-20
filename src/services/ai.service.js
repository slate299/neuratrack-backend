// src/services/ai.service.js
const gemini = require('../../gemini');

class AIService {
  async parseSeizureNote(noteText) {
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
    
    return await gemini.generateJsonResponse(prompt);
  }

  async generateMedicationInsight(adherenceData) {
    // Will implement in Phase B5
    return { insight: "Coming soon!" };
  }

  async chatWithContext(message, userData) {
    // Will implement in Phase B6
    return { response: "Coming soon!" };
  }
}

module.exports = new AIService();