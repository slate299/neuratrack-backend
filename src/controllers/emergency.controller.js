// src/controllers/emergency.controller.js
const {
  createEmergencyEvent,
  getUserEmergencyContacts,
} = require("../services/emergency.service");

/**
 * Trigger an emergency event
 */
const triggerEmergency = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body || {};

    if (message && typeof message !== "string") {
      return res.status(400).json({ message: "Message must be a string" });
    }

    // Create emergency event
    const event = await createEmergencyEvent(userId, message);

    // Fetch user's emergency contacts
    const contacts = await getUserEmergencyContacts(userId);

    return res.status(201).json({
      message: "Emergency alert triggered (no notifications sent)",
      emergencyEvent: event,
      contactsFound: contacts.length,
      ethicalNotice:
        "NeuraTrack does not contact emergency services automatically.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to trigger emergency" });
  }
};

module.exports = { triggerEmergency };
