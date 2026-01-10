// src/controllers/ai.controller.js
const { parseSeizureNotes } = require("../services/ai.service");

exports.handleSeizureNotes = async (req, res) => {
  const { notes } = req.body;

  if (!notes) {
    return res.status(400).json({ error: "Notes are required." });
  }

  try {
    const analysis = await parseSeizureNotes(notes);
    res.json(analysis);
  } catch (error) {
    console.error("AI analysis failed:", error);
    res.status(500).json({ error: "AI analysis failed." });
  }
};
