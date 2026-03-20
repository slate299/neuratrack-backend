// gemini.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    this.model = this.genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    console.log("✅ Gemini service initialized");
  }

  async generateContent(prompt) {
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  async generateJsonResponse(prompt) {
    const jsonModel = this.genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    });

    const result = await jsonModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the response in case it has markdown code blocks
    const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanJson);
  }
}

module.exports = new GeminiService();
