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
    const seizures = await prisma.seizure.findMany({
      where: { userId: req.user.id },
    });

    if (seizures.length === 0) {
      return res.json({
        success: true,
        summary: {
          totalSeizures: 0,
          averageDuration: 0,
          mostRecent: null,
          mostCommonTrigger: null,
        },
      });
    }

    const total = seizures.length;
    const averageDuration =
      seizures.reduce((acc, s) => acc + (s.duration || 0), 0) / total;

    // Calculate trigger frequency
    const triggerCounts = {};
    seizures.forEach((seizure) => {
      if (seizure.triggers && Array.isArray(seizure.triggers)) {
        seizure.triggers.forEach((trigger) => {
          triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
        });
      }
    });

    const mostCommonTrigger =
      Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const mostRecent = seizures
      .map((s) => s.occurredAt)
      .sort((a, b) => b - a)[0];

    res.json({
      success: true,
      summary: {
        totalSeizures: total,
        averageDuration: Number(averageDuration.toFixed(2)),
        mostRecent,
        mostCommonTrigger,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
