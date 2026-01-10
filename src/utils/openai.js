// src/utils/openai.js
const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.analyzeSeizureNotes = async (notes) => {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `Analyze these seizure notes for possible triggers (no diagnosis): "${notes}". Respond in JSON with keys: possibleTriggers (array), confidence (low/medium/high).`,
        },
      ],
    });

    const message = response.choices[0].message.content;

    // Ensure AI returns valid JSON
    return JSON.parse(message);
  } catch (error) {
    console.error("AI analysis error:", error);
    return { possibleTriggers: [], confidence: "unknown" };
  }
};
