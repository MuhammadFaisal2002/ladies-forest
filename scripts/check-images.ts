// Prints each product's title and where its images are hosted.
import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const p = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const products = await p.product.findMany({
    select: { title: true, images: true, status: true },
  });
  for (const prod of products) {
    const hosts = [...new Set(prod.images.map((u) => {
      try {
        return new URL(u, "https://x.local").host || "(local)";
      } catch {
        return "(invalid)";
      }
    }))];
    console.log(`${prod.status}  ${prod.title} -> ${hosts.join(", ") || "(no images)"}`);
  }
  await p.$disconnect();
}
main();
