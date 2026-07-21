// Creates (or resets the password of) an admin user.
// Run: npx tsx scripts/create-admin.ts [email] [password] [name]
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomBytes } from "crypto";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const email = (process.argv[2] ?? "admin@ladiesforest.com").toLowerCase();
  const password = process.argv[3] ?? randomBytes(9).toString("base64url");
  const name = process.argv[4] ?? "Store Owner";

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, name, passwordHash, role: "ADMIN" },
  });

  console.log("Admin user ready:");
  console.log("  email:   ", email);
  console.log("  password:", password);
  await prisma.$disconnect();
}

main();
