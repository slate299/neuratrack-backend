const prisma = require("./prisma");

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("Prisma connected successfully!");
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
