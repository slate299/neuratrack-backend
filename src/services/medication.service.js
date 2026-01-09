const prisma = require("../utils/prisma");

exports.createMedication = async (userId, medicationData) => {
  return prisma.medication.create({
    data: { ...medicationData, userId },
  });
};

exports.getMedicationsByUser = async (userId) => {
  return prisma.medication.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};
