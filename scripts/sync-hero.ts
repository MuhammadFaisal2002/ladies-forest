// Replaces hero slides with the real banners (local files in /public),
// without touching the rest of the seeded data.
// Run: npx tsx scripts/sync-hero.ts
import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  await prisma.heroSlide.deleteMany();
  await prisma.heroSlide.createMany({
    data: [
      {
        image: "/hero1.webp",
        heading: null,
        subheading: null,
        ctaText: "Shop Now",
        ctaHref: "/shop",
        sortOrder: 0,
      },
      {
        image: "/hero2.webp",
        heading: null,
        subheading: null,
        ctaText: "Shop Now",
        ctaHref: "/shop",
        sortOrder: 1,
      },
    ],
  });
  console.log("Hero slides synced:", await prisma.heroSlide.count());
  await prisma.$disconnect();
}

main();
