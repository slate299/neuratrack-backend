// src/services/emergency.service.js
const prisma = require("../utils/prisma"); // adjust path if needed

/**
 * Create a new emergency event for a user
 * @param {number} userId
 * @param {string} [message]
 */
const createEmergencyEvent = async (userId, message) => {
  return prisma.emergencyEvent.create({
    data: {
      userId,
      message,
    },
  });
};

/**
 * Fetch all emergency contacts for a user
 * @param {number} userId
 */
const getUserEmergencyContacts = async (userId) => {
  return prisma.emergencyContact.findMany({
    where: { userId },
  });
};

module.exports = {
  createEmergencyEvent,
  getUserEmergencyContacts,
};
