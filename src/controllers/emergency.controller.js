// src/controllers/emergency.controller.js
const emergencyService = require("../services/emergency.service");
const prisma = require("../utils/prisma");

// ==================== CONTACTS ====================

/**
 * Get all emergency contacts
 */
const getContacts = async (req, res) => {
  try {
    const userId = req.user.id;
    const contacts = await emergencyService.getEmergencyContacts(userId);
    res.json({ success: true, data: contacts });
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create a new emergency contact
 */
const createContact = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, relationship } = req.body;

    if (!name || !phone || !relationship) {
      return res.status(400).json({
        success: false,
        error: "Name, phone, and relationship are required",
      });
    }

    const contact = await emergencyService.createEmergencyContact(userId, {
      name,
      phone,
      relationship,
    });

    res.json({ success: true, data: contact });
  } catch (error) {
    console.error("Create contact error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update an emergency contact
 */
const updateContact = async (req, res) => {
  try {
    const userId = req.user.id;
    const contactId = parseInt(req.params.id);
    const { name, phone, relationship } = req.body;

    const contact = await emergencyService.updateEmergencyContact(
      userId,
      contactId,
      { name, phone, relationship },
    );

    res.json({ success: true, data: contact });
  } catch (error) {
    console.error("Update contact error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete an emergency contact
 */
const deleteContact = async (req, res) => {
  try {
    const userId = req.user.id;
    const contactId = parseInt(req.params.id);

    await emergencyService.deleteEmergencyContact(userId, contactId);
    res.json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Delete contact error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Set a contact as primary
 */
const setPrimaryContact = async (req, res) => {
  try {
    const userId = req.user.id;
    const contactId = parseInt(req.params.id);

    const contact = await emergencyService.setPrimaryContact(userId, contactId);
    res.json({ success: true, data: contact });
  } catch (error) {
    console.error("Set primary contact error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==================== EMERGENCY EVENTS ====================

/**
 * Trigger an emergency alert (SOS)
 */
const triggerEmergency = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message, location, autoTriggered = false } = req.body || {};

    // Get user info for name
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    // Get emergency contacts
    const contacts = await emergencyService.getEmergencyContacts(userId);

    if (contacts.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No emergency contacts added. Please add contacts first.",
      });
    }

    // Create emergency event
    const event = await emergencyService.createEmergencyEvent(userId, message, {
      location,
      autoTriggered,
      contactsNotified: contacts.map((c) => ({ name: c.name, phone: c.phone })),
    });

    // Send SMS via Twilio
    let smsResult = null;
    try {
      const twilioService = require("../services/twilio.service");
      const userName = user.name || user.email;

      smsResult = await twilioService.sendEmergencyAlert(userName, contacts, {
        location,
        message,
        timestamp: event.createdAt,
      });

      console.log(
        `📱 SOS SMS sent: ${smsResult.sentCount}/${smsResult.totalCount} successful`,
      );
    } catch (twilioError) {
      console.error("Twilio SMS error:", twilioError.message);
      // Don't fail the whole request if SMS fails
    }

    return res.status(201).json({
      success: true,
      data: {
        eventId: event.id,
        contactsNotified: contacts.map((c) => ({
          name: c.name,
          phone: c.phone,
        })),
        timestamp: event.createdAt,
        smsSent: smsResult ? smsResult.sentCount : 0,
        message:
          smsResult && smsResult.sentCount > 0
            ? `Emergency alert triggered! SMS sent to ${smsResult.sentCount} contact(s).`
            : "Emergency alert triggered (SMS delivery may have failed - check Twilio configuration)",
      },
    });
  } catch (error) {
    console.error("Trigger emergency error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get all emergency events
 */
const getEmergencyEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    const events = await emergencyService.getEmergencyEvents(userId, limit);
    res.json({ success: true, data: events });
  } catch (error) {
    console.error("Get emergency events error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get a specific emergency event
 */
const getEmergencyEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = parseInt(req.params.id);

    const event = await emergencyService.getEmergencyEvent(userId, eventId);
    res.json({ success: true, data: event });
  } catch (error) {
    console.error("Get emergency event error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Resolve an emergency event
 */
const resolveEmergencyEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = parseInt(req.params.id);
    const { notes } = req.body;

    const event = await emergencyService.resolveEmergencyEvent(
      userId,
      eventId,
      notes,
    );
    res.json({ success: true, data: event });
  } catch (error) {
    console.error("Resolve emergency event error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  // Contacts
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  setPrimaryContact,

  // Events
  triggerEmergency,
  getEmergencyEvents,
  getEmergencyEvent,
  resolveEmergencyEvent,
};
