//src/controllers/seizure.controller.js
const prisma = require("../utils/prisma");

// Create seizure
exports.createSeizure = async (req, res) => {
  const { occurredAt, duration, notes } = req.body;

  if (!occurredAt) {
    return res.status(400).json({ message: "occurredAt is required" });
  }

  try {
    const seizure = await prisma.seizure.create({
      data: {
        occurredAt: new Date(occurredAt),
        duration: duration || null,
        notes: notes || null,
        userId: req.user.id,
      },
    });

    res.status(201).json({ message: "Seizure recorded", seizure });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all seizures for user
exports.getSeizures = async (req, res) => {
  try {
    const seizures = await prisma.seizure.findMany({
      where: { userId: req.user.id },
      orderBy: { occurredAt: "desc" },
    });

    res.json({ seizures });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get seizure summary
exports.getSeizureSummary = async (req, res) => {
  try {
    const seizures = await prisma.seizure.findMany({
      where: { userId: req.user.id },
    });

    if (seizures.length === 0) {
      return res.json({ message: "No seizures recorded yet", summary: {} });
    }

    const total = seizures.length;
    const averageDuration =
      seizures.reduce((acc, s) => acc + (s.duration || 0), 0) / total;

    const mostRecent = seizures
      .map((s) => s.occurredAt)
      .sort((a, b) => b - a)[0];

    res.json({
      summary: {
        totalSeizures: total,
        averageDuration: Number(averageDuration.toFixed(2)),
        mostRecent,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
