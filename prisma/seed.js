const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt"); // <- add this
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("test1234", 10); // choose any test password

  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {}, // do nothing if exists
    create: {
      email: "test@example.com",
      password: hashedPassword, // store hashed password
      name: "Test User",
    },
  });

  console.log({ user });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
