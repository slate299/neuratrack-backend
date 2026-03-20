// src/controllers/ai.controller.js
const aiService = require("../services/ai.service");

exports.parseSeizureNote = async (req, res) => {
  try {
    const { noteText } = req.body;
    const userId = req.user?.id; // Use optional chaining

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    if (!noteText || noteText.length < 5) {
      return res.status(400).json({
        success: false,
        error: "Note text must be at least 5 characters",
      });
    }

    const parsed = await aiService.parseSeizureNote(noteText);
    const savedSeizure = await aiService.saveParsedSeizure(
      userId,
      noteText,
      parsed,
    );

    res.json({
      success: true,
      parsed,
      saved: {
        id: savedSeizure.id,
        occurredAt: savedSeizure.occurredAt,
      },
      originalNote: noteText,
    });
  } catch (error) {
    console.error("AI parsing error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to parse seizure note",
      details: error.message,
    });
  }
};

// ==================== PHASE B3: TRAINING DATA API ====================
exports.getTrainingData = async (req, res) => {
  try {
    console.log("getTrainingData called");
    console.log("req.user:", req.user);

    const userId = req.user?.id;

    if (!userId) {
      console.log("No userId found in req.user");
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const days = parseInt(req.query.days) || 90;

    console.log("Fetching training data for user:", userId, "days:", days);

    const result = await aiService.getTrainingData(userId, days);

    console.log("Result received, sending response");

    // Make sure res is working
    if (!res || typeof res.json !== "function") {
      console.error("Response object is invalid!");
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Training data error:", error);
    console.error("Error stack:", error.stack);

    // Safely send error response
    if (res && typeof res.status === "function") {
      res.status(500).json({
        success: false,
        error: "Failed to fetch training data",
        details: error.message,
      });
    } else {
      console.error("Cannot send error response - res invalid");
    }
  }
};

// ==================== PHASE B4: PATTERN PREDICTOR ====================
exports.predictRisk = async (req, res) => {
  try {
    console.log("predictRisk called");

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const days = parseInt(req.query.days) || 7;

    console.log("Predicting risk for user:", userId, "days:", days);

    const result = await aiService.predictRisk(userId, days);

    res.json(result);
  } catch (error) {
    console.error("Prediction error:", error);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      success: false,
      error: "Failed to predict risk",
      details: error.message,
    });
  }
};

// ==================== PHASE B5: MEDICATION ASSISTANT ====================

exports.getMedicationInsights = async (req, res) => {
  try {
    console.log("getMedicationInsights called");

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const result = await aiService.getMedicationInsights(userId);

    res.json(result);
  } catch (error) {
    console.error("Medication insights error:", error);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      success: false,
      error: "Failed to get medication insights",
      details: error.message,
    });
  }
};

exports.getSmartReminder = async (req, res) => {
  try {
    console.log("getSmartReminder called");

    const userId = req.user?.id;
    const medicationId = req.query.medicationId
      ? parseInt(req.query.medicationId)
      : null;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const result = await aiService.getSmartReminder(userId, medicationId);

    res.json(result);
  } catch (error) {
    console.error("Smart reminder error:", error);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      success: false,
      error: "Failed to get smart reminder",
      details: error.message,
    });
  }
};

// ==================== PHASE B6: CHAT ASSISTANT ====================

exports.chat = async (req, res) => {
  try {
    console.log("chat called");

    const userId = req.user?.id;
    const { message } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    if (!message || message.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: "Message must be at least 2 characters",
      });
    }

    console.log("User message:", message);

    const result = await aiService.chat(userId, message);

    res.json(result);
  } catch (error) {
    console.error("Chat error:", error);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      success: false,
      error: "Failed to process chat message",
      details: error.message,
    });
  }
};

exports.getConversations = async (req, res) => {
  try {
    console.log("getConversations called");

    const userId = req.user?.id;
    const limit = parseInt(req.query.limit) || 20;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const result = await aiService.getConversations(userId, limit);

    res.json(result);
  } catch (error) {
    console.error("Get conversations error:", error);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      success: false,
      error: "Failed to get conversations",
      details: error.message,
    });
  }
};
