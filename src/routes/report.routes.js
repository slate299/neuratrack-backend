// backend/src/routes/report.routes.js

const express = require("express");
const router = express.Router();
const reportController = require("../controllers/report.controller");
const authMiddleware = require("../middleware/auth.middleware");
const multer = require("multer");

// Configure multer for file uploads (memory storage for email attachments)
const upload = multer({ storage: multer.memoryStorage() });

// Public route - no auth required (for shared reports)
router.get("/shared/:token", reportController.getSharedReport);

// Protected routes - require authentication
router.use(authMiddleware);

// Shareable links management
router.post("/share", reportController.generateShareableLink);
router.get("/links", reportController.getShareableLinks);
router.delete("/links/:id", reportController.revokeShareableLink);

// Email sending
router.post(
  "/email",
  upload.single("report"),
  reportController.sendReportEmail,
);

module.exports = router;
