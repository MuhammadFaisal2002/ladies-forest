// Sets the store's WhatsApp number setting.
// Run: npx tsx scripts/set-whatsapp.ts 923102339100
import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const number = process.argv[2];
  if (!number) throw new Error("Usage: npx tsx scripts/set-whatsapp.ts <number>");
  await prisma.setting.upsert({
    where: { key: "whatsappNumber" },
    update: { value: number },
    create: { key: "whatsappNumber", value: number },
  });
  console.log("whatsappNumber set to", number);
  await prisma.$disconnect();
}
main();
