//src/services/seizure.service.js
const prisma = require("../utils/prisma");

exports.createSeizure = async (userId, seizureData) => {
  return prisma.seizure.create({
    data: { ...seizureData, userId },
  });
};

exports.getSeizuresByUser = async (userId) => {
  return prisma.seizure.findMany({
    where: { userId },
    orderBy: { occurredAt: "desc" },
  });
};

exports.getSeizureSummary = async (userId) => {
  const seizures = await prisma.seizure.findMany({ where: { userId } });
  if (!seizures.length) return {};

  const total = seizures.length;
  const avgDuration =
    seizures.reduce((sum, s) => sum + (s.duration || 0), 0) / total;
  const mostRecent = seizures.map((s) => s.occurredAt).sort((a, b) => b - a)[0];

  return { totalSeizures: total, averageDuration: avgDuration, mostRecent };
};
