// src/controllers/seizure.controller.js

const prisma = require("../utils/prisma");

// Create seizure
exports.createSeizure = async (req, res) => {
  const {
    occurredAt,
    duration,
    notes,
    triggers,
    symptoms,
    seizureType,
    postIctalSymptoms,
    aiConfidence,
    originalNote,
  } = req.body;

  if (!occurredAt) {
    return res.status(400).json({ message: "occurredAt is required" });
  }

  try {
    const seizure = await prisma.seizure.create({
      data: {
        occurredAt: new Date(occurredAt),
        duration: duration || null,
        notes: notes || null,
        triggers: triggers || null,
        symptoms: symptoms || null,
        seizureType: seizureType || null,
        postIctalSymptoms: postIctalSymptoms || null,
        aiConfidence: aiConfidence || null,
        originalNote: originalNote || null,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Seizure recorded",
      data: seizure,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all seizures for user
exports.getSeizures = async (req, res) => {
  const { limit, offset } = req.query;

  try {
    const seizures = await prisma.seizure.findMany({
      where: { userId: req.user.id },
      orderBy: { occurredAt: "desc" },
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined,
    });

    res.json({
      success: true,
      data: seizures,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get single seizure by ID
exports.getSeizureById = async (req, res) => {
  const { id } = req.params;

  try {
    const seizure = await prisma.seizure.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id,
      },
    });

    if (!seizure) {
      return res
        .status(404)
        .json({ success: false, message: "Seizure not found" });
    }

    res.json({ success: true, data: seizure });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update seizure by ID
exports.updateSeizure = async (req, res) => {
  const { id } = req.params;
  const {
    occurredAt,
    duration,
    notes,
    triggers,
    symptoms,
    seizureType,
    postIctalSymptoms,
    aiConfidence,
    originalNote,
  } = req.body;

  try {
    // Check if seizure exists and belongs to user
    const existingSeizure = await prisma.seizure.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id,
      },
    });

    if (!existingSeizure) {
      return res
        .status(404)
        .json({ success: false, message: "Seizure not found" });
    }

    // Build update data (only include fields that are provided)
    const updateData = {};
    if (occurredAt !== undefined) updateData.occurredAt = new Date(occurredAt);
    if (duration !== undefined) updateData.duration = duration;
    if (notes !== undefined) updateData.notes = notes;
    if (triggers !== undefined) updateData.triggers = triggers;
    if (symptoms !== undefined) updateData.symptoms = symptoms;
    if (seizureType !== undefined) updateData.seizureType = seizureType;
    if (postIctalSymptoms !== undefined)
      updateData.postIctalSymptoms = postIctalSymptoms;
    if (aiConfidence !== undefined) updateData.aiConfidence = aiConfidence;
    if (originalNote !== undefined) updateData.originalNote = originalNote;

    // Update seizure
    const updatedSeizure = await prisma.seizure.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.json({
      success: true,
      message: "Seizure updated",
      data: updatedSeizure,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete seizure by ID
exports.deleteSeizure = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if seizure exists and belongs to user
    const existingSeizure = await prisma.seizure.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id,
      },
    });

    if (!existingSeizure) {
      return res
        .status(404)
        .json({ success: false, message: "Seizure not found" });
    }

    // Delete seizure
    await prisma.seizure.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true, message: "Seizure deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get seizure summary
exports.getSeizureSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Get start of current week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get start of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get start of previous month for trend calculation
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    );

    // Fetch all seizures
    const seizures = await prisma.seizure.findMany({
      where: { userId },
      orderBy: { occurredAt: "asc" },
    });

    if (seizures.length === 0) {
      return res.json({
        success: true,
        data: {
          totalSeizures: 0,
          seizuresThisWeek: 0,
          seizuresThisMonth: 0,
          averageDuration: 0,
          mostCommonTrigger: "No data yet",
          trend: "stable",
          trendPercentage: 0,
          seizureFreeStreak: 0,
        },
      });
    }

    // Calculate total seizures
    const totalSeizures = seizures.length;

    // Calculate average duration (filter out null/0)
    const validDurations = seizures.filter((s) => s.duration && s.duration > 0);
    const averageDuration =
      validDurations.length > 0
        ? Math.round(
            validDurations.reduce((sum, s) => sum + s.duration, 0) /
              validDurations.length,
          )
        : 0;

    // Calculate seizures this week
    const seizuresThisWeek = seizures.filter(
      (s) => new Date(s.occurredAt) >= startOfWeek,
    ).length;

    // Calculate seizures this month
    const seizuresThisMonth = seizures.filter(
      (s) => new Date(s.occurredAt) >= startOfMonth,
    ).length;

    // Calculate most common trigger
    const triggerCounts = {};
    seizures.forEach((seizure) => {
      if (seizure.triggers && Array.isArray(seizure.triggers)) {
        seizure.triggers.forEach((trigger) => {
          triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
        });
      }
    });
    const mostCommonTrigger =
      Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "None";

    // Calculate trend (compare this month to previous month)
    const seizuresThisMonthCount = seizures.filter(
      (s) => new Date(s.occurredAt) >= startOfMonth,
    ).length;
    const seizuresPrevMonthCount = seizures.filter((s) => {
      const date = new Date(s.occurredAt);
      return date >= startOfPrevMonth && date <= endOfPrevMonth;
    }).length;

    let trend = "stable";
    let trendPercentage = 0;

    if (seizuresPrevMonthCount > 0) {
      const percentChange =
        ((seizuresThisMonthCount - seizuresPrevMonthCount) /
          seizuresPrevMonthCount) *
        100;
      trendPercentage = Math.abs(Math.round(percentChange));
      if (percentChange > 5) trend = "increasing";
      else if (percentChange < -5) trend = "decreasing";
    }

    // Calculate seizure-free streak (consecutive days with no seizures)
    let seizureFreeStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all seizure dates
    const seizureDates = seizures.map((s) => {
      const date = new Date(s.occurredAt);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });

    // Check days backwards from today
    let checkDate = new Date(today);
    for (let i = 0; i < 365; i++) {
      const checkTime = checkDate.getTime();
      if (seizureDates.includes(checkTime)) {
        break;
      }
      seizureFreeStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    res.json({
      success: true,
      data: {
        totalSeizures,
        seizuresThisWeek,
        seizuresThisMonth,
        averageDuration,
        mostCommonTrigger,
        trend,
        trendPercentage,
        seizureFreeStreak,
      },
    });
  } catch (error) {
    console.error("Error in getSeizureSummary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch seizure summary",
      error: error.message,
    });
  }
};
