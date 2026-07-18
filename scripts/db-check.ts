// Quick sanity check: counts key tables to confirm migration + seed ran.
import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const p = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const [products, variants, categories, settings, slides] = await Promise.all([
    p.product.count(),
    p.variant.count(),
    p.category.count(),
    p.setting.count(),
    p.heroSlide.count(),
  ]);
  console.log({ products, variants, categories, settings, slides });
  await p.$disconnect();
}
main();
