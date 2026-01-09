//src/controllers/medication.controller.js
const prisma = require("../utils/prisma");

// Add medication
exports.addMedication = async (req, res) => {
  const { name, dosage, frequency } = req.body;

  // Basic validation
  if (!name || !dosage || !frequency) {
    return res
      .status(400)
      .json({ message: "Name, dosage, and frequency are required." });
  }

  try {
    const medication = await prisma.medication.create({
      data: {
        name,
        dosage,
        frequency,
        userId: req.user.id,
      },
    });

    res.status(201).json({ message: "Medication added", medication });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all medications for user
exports.getMedications = async (req, res) => {
  try {
    const medications = await prisma.medication.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.json({ medications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
