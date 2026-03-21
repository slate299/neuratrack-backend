// src/routes/emergency.routes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const emergencyController = require("../controllers/emergency.controller");

// ==================== CONTACT ROUTES ====================
router.get("/contacts", authMiddleware, emergencyController.getContacts);
router.post("/contacts", authMiddleware, emergencyController.createContact);
router.put("/contacts/:id", authMiddleware, emergencyController.updateContact);
router.delete(
  "/contacts/:id",
  authMiddleware,
  emergencyController.deleteContact,
);
router.patch(
  "/contacts/:id/primary",
  authMiddleware,
  emergencyController.setPrimaryContact,
);

// ==================== EMERGENCY EVENT ROUTES ====================
router.post("/alert", authMiddleware, emergencyController.triggerEmergency);
router.get("/events", authMiddleware, emergencyController.getEmergencyEvents);
router.get(
  "/events/:id",
  authMiddleware,
  emergencyController.getEmergencyEvent,
);
router.patch(
  "/events/:id/resolve",
  authMiddleware,
  emergencyController.resolveEmergencyEvent,
);

module.exports = router;
