// src/services/emergency.service.js
const prisma = require("../utils/prisma");
const twilioService = require("./twilio.service");

/**
 * Get all emergency contacts for a user (primary first)
 * @param {number} userId
 */
const getEmergencyContacts = async (userId) => {
  const contacts = await prisma.emergencyContact.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Sort so primary contact is first
  return contacts.sort((a, b) => {
    if (a.isPrimary === b.isPrimary) return 0;
    return a.isPrimary ? -1 : 1;
  });
};

/**
 * Create a new emergency contact
 * @param {number} userId
 * @param {Object} data
 */
const createEmergencyContact = async (
  userId,
  { name, phone, relationship },
) => {
  // Check if this is the first contact
  const contactCount = await prisma.emergencyContact.count({
    where: { userId },
  });
  const isPrimary = contactCount === 0;

  return prisma.emergencyContact.create({
    data: {
      userId,
      name,
      phone,
      relationship,
      isPrimary,
    },
  });
};

/**
 * Update an emergency contact
 * @param {number} userId
 * @param {number} contactId
 * @param {Object} data
 */
const updateEmergencyContact = async (
  userId,
  contactId,
  { name, phone, relationship },
) => {
  // Verify contact belongs to user
  const existing = await prisma.emergencyContact.findFirst({
    where: { id: contactId, userId },
  });

  if (!existing) {
    throw new Error("Contact not found");
  }

  return prisma.emergencyContact.update({
    where: { id: contactId },
    data: { name, phone, relationship },
  });
};

/**
 * Delete an emergency contact
 * @param {number} userId
 * @param {number} contactId
 */
const deleteEmergencyContact = async (userId, contactId) => {
  // Verify contact belongs to user
  const existing = await prisma.emergencyContact.findFirst({
    where: { id: contactId, userId },
  });

  if (!existing) {
    throw new Error("Contact not found");
  }

  // If deleting primary contact, make another contact primary if exists
  if (existing.isPrimary) {
    const anotherContact = await prisma.emergencyContact.findFirst({
      where: { userId, id: { not: contactId } },
    });

    if (anotherContact) {
      await prisma.emergencyContact.update({
        where: { id: anotherContact.id },
        data: { isPrimary: true },
      });
    }
  }

  await prisma.emergencyContact.delete({
    where: { id: contactId },
  });
};

/**
 * Set a contact as primary (others become non-primary)
 * @param {number} userId
 * @param {number} contactId
 */
const setPrimaryContact = async (userId, contactId) => {
  // Verify contact belongs to user
  const contact = await prisma.emergencyContact.findFirst({
    where: { id: contactId, userId },
  });

  if (!contact) {
    throw new Error("Contact not found");
  }

  // Unset all primary contacts
  await prisma.emergencyContact.updateMany({
    where: { userId },
    data: { isPrimary: false },
  });

  // Set the new primary
  return prisma.emergencyContact.update({
    where: { id: contactId },
    data: { isPrimary: true },
  });
};

/**
 * Create a new emergency event for a user
 * @param {number} userId
 * @param {string} [message]
 * @param {Object} [options]
 */
const createEmergencyEvent = async (userId, message, options = {}) => {
  const { location, autoTriggered = false, contactsNotified = [] } = options;

  return prisma.emergencyEvent.create({
    data: {
      userId,
      message: message || "SOS triggered",
      status: "triggered",
      location: location || null,
      autoTriggered,
      contactsNotified: contactsNotified.length > 0 ? contactsNotified : null,
    },
  });
};

/**
 * Get all emergency events for a user
 * @param {number} userId
 * @param {number} limit
 */
const getEmergencyEvents = async (userId, limit = 20) => {
  return prisma.emergencyEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

/**
 * Get a specific emergency event
 * @param {number} userId
 * @param {number} eventId
 */
const getEmergencyEvent = async (userId, eventId) => {
  const event = await prisma.emergencyEvent.findFirst({
    where: { id: eventId, userId },
  });

  if (!event) {
    throw new Error("Emergency event not found");
  }

  return event;
};

/**
 * Resolve an emergency event
 * @param {number} userId
 * @param {number} eventId
 * @param {string} notes
 */
const resolveEmergencyEvent = async (userId, eventId, notes = null) => {
  const event = await prisma.emergencyEvent.findFirst({
    where: { id: eventId, userId },
  });

  if (!event) {
    throw new Error("Emergency event not found");
  }

  return prisma.emergencyEvent.update({
    where: { id: eventId },
    data: {
      status: "resolved",
      resolvedAt: new Date(),
      notes: notes || null,
    },
  });
};

/**
 * Trigger SOS with SMS notifications
 */
const triggerSOSWithSMS = async (userId, userName, options = {}) => {
  const { message, location, autoTriggered = false } = options;

  // Get emergency contacts
  const contacts = await getEmergencyContacts(userId);

  if (contacts.length === 0) {
    throw new Error("No emergency contacts added");
  }

  // Create emergency event
  const event = await createEmergencyEvent(userId, message, {
    location,
    autoTriggered,
    contactsNotified: contacts.map((c) => ({ name: c.name, phone: c.phone })),
  });

  // Send SMS via Twilio
  const smsResult = await twilioService.sendEmergencyAlert(userName, contacts, {
    location,
    message,
    timestamp: event.createdAt,
  });

  return {
    eventId: event.id,
    sms: smsResult,
    contactsNotified: contacts.map((c) => ({ name: c.name, phone: c.phone })),
    timestamp: event.createdAt,
  };
};

// Keep original function for backward compatibility
const getUserEmergencyContacts = async (userId) => {
  return getEmergencyContacts(userId);
};

module.exports = {
  // Contacts
  getEmergencyContacts,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  setPrimaryContact,
  getUserEmergencyContacts, // Legacy support

  // Events
  createEmergencyEvent,
  getEmergencyEvents,
  getEmergencyEvent,
  resolveEmergencyEvent,

  // SOS with SMS
  triggerSOSWithSMS,
};
