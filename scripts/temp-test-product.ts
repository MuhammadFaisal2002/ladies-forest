// Creates or removes a temporary product for local feature testing.
// Run: npx tsx scripts/temp-test-product.ts create|delete
import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const SLUG = "temp-test-product";

async function main() {
  const mode = process.argv[2] ?? "create";
  if (mode === "delete") {
    await prisma.product.deleteMany({ where: { slug: SLUG } });
    console.log("temp product deleted");
  } else {
    await prisma.product.deleteMany({ where: { slug: SLUG } });
    await prisma.product.create({
      data: {
        title: "Test Cotton Bra (TEMP)",
        slug: SLUG,
        description: "Temporary product for testing.",
        images: ["/hero2.webp"],
        basePrice: 999,
        status: "ACTIVE",
        featured: true,
        tags: ["test"],
        options: { create: [{ name: "Size", values: ["34", "36"], sortOrder: 0 }] },
        variants: {
          create: [
            { optionValues: { Size: "34" }, title: "34", price: 999, stock: 5 },
            { optionValues: { Size: "36" }, title: "36", price: 999, stock: 5 },
          ],
        },
      },
    });
    console.log("temp product created:", SLUG);
  }
  await prisma.$disconnect();
}
main();
