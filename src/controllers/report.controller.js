// backend/src/controllers/report.controller.js

const prisma = require("../utils/prisma");
const crypto = require("crypto");

/**
 * Generate a shareable link for doctor access
 * POST /api/reports/share
 */
exports.generateShareableLink = async (req, res) => {
  const { expiryDays = 7 } = req.body;
  const userId = req.user.id;

  try {
    // Generate unique token
    const token = crypto.randomBytes(32).toString("hex");

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    // Create shareable link in database
    const shareableLink = await prisma.shareableLink.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    // Generate full URL
    const baseUrl = process.env.APP_URL || "http://localhost:5173";
    const shareableUrl = `${baseUrl}/share/${token}`;

    res.json({
      success: true,
      shareableLink: shareableUrl,
      expiresAt: shareableLink.expiresAt,
      token: shareableLink.token,
    });
  } catch (error) {
    console.error("Error generating shareable link:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get shared report data (public endpoint, no auth)
 * GET /api/reports/shared/:token
 */
exports.getSharedReport = async (req, res) => {
  const { token } = req.params;

  try {
    // Find and validate shareable link
    const shareableLink = await prisma.shareableLink.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!shareableLink) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid share link" });
    }

    // Check if expired
    if (new Date() > shareableLink.expiresAt) {
      return res
        .status(410)
        .json({ success: false, message: "Share link has expired" });
    }

    // Update accessed timestamp
    await prisma.shareableLink.update({
      where: { id: shareableLink.id },
      data: { accessedAt: new Date() },
    });

    // Fetch user's data for the report
    const [seizures, medications, adherence] = await Promise.all([
      prisma.seizure.findMany({
        where: { userId: shareableLink.userId },
        orderBy: { occurredAt: "desc" },
        take: 100,
      }),
      prisma.medication.findMany({
        where: { userId: shareableLink.userId, active: true },
      }),
      prisma.medicationAdherence.findMany({
        where: {
          userId: shareableLink.userId,
          scheduledFor: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { scheduledFor: "desc" },
      }),
    ]);

    // Calculate summary
    const totalSeizures = seizures.length;
    const avgDuration =
      seizures.reduce((sum, s) => sum + (s.duration || 0), 0) /
      (totalSeizures || 1);

    // Get most common trigger
    const triggerCount = new Map();
    seizures.forEach((s) => {
      if (s.triggers && Array.isArray(s.triggers)) {
        s.triggers.forEach((t) =>
          triggerCount.set(t, (triggerCount.get(t) || 0) + 1),
        );
      }
    });
    const mostCommonTrigger =
      triggerCount.size > 0
        ? Array.from(triggerCount.entries()).sort((a, b) => b[1] - a[1])[0][0]
        : "None";

    // Calculate adherence rate
    const totalDoses = adherence.length;
    const takenDoses = adherence.filter((a) => a.status === "taken").length;
    const adherenceRate =
      totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

    // Calculate seizure-free streak
    let seizureFreeStreak = 0;
    if (seizures.length > 0) {
      const lastSeizure = new Date(
        Math.max(...seizures.map((s) => new Date(s.occurredAt))),
      );
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      lastSeizure.setHours(0, 0, 0, 0);
      seizureFreeStreak = Math.floor(
        (today - lastSeizure) / (1000 * 60 * 60 * 24),
      );
    }

    res.json({
      success: true,
      data: {
        user: {
          name: shareableLink.user.name,
          email: shareableLink.user.email,
        },
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
        summary: {
          totalSeizures,
          averageDuration: avgDuration,
          mostCommonTrigger,
          adherenceRate,
          seizureFreeStreak,
        },
        seizures: seizures.map((s) => ({
          id: s.id,
          occurredAt: s.occurredAt,
          durationSeconds: s.duration,
          seizureType: s.seizureType,
          triggers: s.triggers,
          symptoms: s.symptoms,
          postIctalSymptoms: s.postIctalSymptoms,
          notes: s.notes,
        })),
        medications: medications.map((m) => ({
          id: m.id,
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          times: m.times,
          active: m.active,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching shared report:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * List all shareable links for a user
 * GET /api/reports/links
 */
exports.getShareableLinks = async (req, res) => {
  const userId = req.user.id;

  try {
    const links = await prisma.shareableLink.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: links.map((link) => ({
        id: link.id,
        token: link.token,
        expiresAt: link.expiresAt,
        createdAt: link.createdAt,
        accessedAt: link.accessedAt,
        isExpired: new Date() > link.expiresAt,
        url: `${process.env.APP_URL || "http://localhost:5173"}/share/${link.token}`,
      })),
    });
  } catch (error) {
    console.error("Error fetching shareable links:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Revoke a shareable link
 * DELETE /api/reports/links/:id
 */
exports.revokeShareableLink = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const link = await prisma.shareableLink.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!link) {
      return res
        .status(404)
        .json({ success: false, message: "Link not found" });
    }

    await prisma.shareableLink.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true, message: "Link revoked successfully" });
  } catch (error) {
    console.error("Error revoking shareable link:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Send report via email
 * POST /api/reports/email
 */
exports.sendReportEmail = async (req, res) => {
  const { doctorEmail } = req.body;
  const userId = req.user.id;

  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No report file attached" });
  }

  try {
    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // TODO: Integrate with actual email service (nodemailer, SendGrid, etc.)
    // For now, return success with message
    console.log(
      `Email would be sent to ${doctorEmail} from ${user.email} with report attachment`,
    );

    res.json({
      success: true,
      message: `Report would be sent to ${doctorEmail}. Email service not configured.`,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
