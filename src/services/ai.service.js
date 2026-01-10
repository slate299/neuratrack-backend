// src/services/ai.service.js
const { analyzeSeizureNotes } = require("../utils/openai");

exports.parseSeizureNotes = async (notes) => {
  return await analyzeSeizureNotes(notes);
};
