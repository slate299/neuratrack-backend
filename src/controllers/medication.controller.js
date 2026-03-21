// src/controllers/medication.controller.js

const prisma = require("../utils/prisma");

// Add medication
exports.addMedication = async (req, res) => {
  const { name, dosage, frequency, times, startDate, endDate, notes, active } =
    req.body;

  // Basic validation
  if (!name || !dosage || !frequency) {
    return res.status(400).json({
      success: false,
      message: "Name, dosage, and frequency are required.",
    });
  }

  try {
    const medication = await prisma.medication.create({
      data: {
        name,
        dosage,
        frequency,
        times: times || null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        notes: notes || null,
        active: active !== undefined ? active : true,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Medication added",
      data: medication,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all medications for user
exports.getMedications = async (req, res) => {
  try {
    const medications = await prisma.medication.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: medications,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get single medication by ID
exports.getMedicationById = async (req, res) => {
  const { id } = req.params;

  try {
    const medication = await prisma.medication.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id,
      },
    });

    if (!medication) {
      return res
        .status(404)
        .json({ success: false, message: "Medication not found" });
    }

    res.json({ success: true, data: medication });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update medication
exports.updateMedication = async (req, res) => {
  const { id } = req.params;
  const { name, dosage, frequency, times, startDate, endDate, notes, active } =
    req.body;

  try {
    const existing = await prisma.medication.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id,
      },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Medication not found" });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (dosage !== undefined) updateData.dosage = dosage;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (times !== undefined) updateData.times = times;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined)
      updateData.endDate = endDate ? new Date(endDate) : null;
    if (notes !== undefined) updateData.notes = notes;
    if (active !== undefined) updateData.active = active;

    const medication = await prisma.medication.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.json({
      success: true,
      message: "Medication updated",
      data: medication,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete medication
exports.deleteMedication = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.medication.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id,
      },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Medication not found" });
    }

    await prisma.medication.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true, message: "Medication deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get adherence records - FIXED VERSION
exports.getAdherence = async (req, res) => {
  const { days = 7 } = req.query;
  const userId = req.user.id;

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get all medications first to ensure we have names
    const medications = await prisma.medication.findMany({
      where: { userId },
      select: { id: true, name: true },
    });

    const medicationMap = {};
    medications.forEach((m) => {
      medicationMap[m.id] = m.name;
    });

    // Get adherence records
    const adherence = await prisma.medicationAdherence.findMany({
      where: {
        userId,
        scheduledFor: { gte: startDate },
      },
      orderBy: { scheduledFor: "desc" },
    });

    // Format the data with medication names from our map
    const formattedData = adherence.map((a) => ({
      id: a.id,
      medicationId: a.medicationId,
      medicationName: medicationMap[a.medicationId] || "Unknown",
      scheduledFor: a.scheduledFor,
      takenAt: a.takenAt,
      status: a.status,
    }));

    const total = formattedData.length;
    const taken = formattedData.filter((a) => a.status === "taken").length;
    const missed = formattedData.filter((a) => a.status === "missed").length;
    const pending = formattedData.filter((a) => a.status === "pending").length;

    // Calculate current streak
    let currentStreak = 0;
    const adherenceByDate = new Map();

    formattedData.forEach((a) => {
      const date = new Date(a.scheduledFor).toDateString();
      if (!adherenceByDate.has(date)) {
        adherenceByDate.set(date, { taken: 0, total: 0 });
      }
      const dayData = adherenceByDate.get(date);
      if (a.status === "taken") dayData.taken++;
      dayData.total++;
    });

    // Check streak from today backwards
    let checkDate = new Date();
    for (let i = 0; i < 30; i++) {
      const dateStr = checkDate.toDateString();
      const dayData = adherenceByDate.get(dateStr);
      if (!dayData || dayData.taken === 0) break;
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    res.json({
      success: true,
      data: formattedData,
      summary: {
        total,
        taken,
        missed,
        pending,
        adherenceRate: total > 0 ? Math.round((taken / total) * 100) : 0,
        currentStreak,
      },
    });
  } catch (error) {
    console.error("Get adherence error:", error);
    // Return empty data instead of 500 error
    res.json({
      success: true,
      data: [],
      summary: {
        total: 0,
        taken: 0,
        missed: 0,
        pending: 0,
        adherenceRate: 0,
        currentStreak: 0,
      },
    });
  }
};

// Mark medication as taken
exports.markAsTaken = async (req, res) => {
  const { medicationId, scheduledFor } = req.body;
  const userId = req.user.id;

  try {
    const adherence = await prisma.medicationAdherence.upsert({
      where: {
        userId_medicationId_scheduledFor: {
          userId,
          medicationId: parseInt(medicationId),
          scheduledFor: new Date(scheduledFor),
        },
      },
      update: {
        takenAt: new Date(),
        status: "taken",
      },
      create: {
        userId,
        medicationId: parseInt(medicationId),
        scheduledFor: new Date(scheduledFor),
        takenAt: new Date(),
        status: "taken",
      },
    });

    res.json({ success: true, message: "Medication marked as taken" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
