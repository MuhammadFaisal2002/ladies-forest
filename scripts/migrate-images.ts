// One-time migration: re-hosts every cdn.shopify.com product image on
// Cloudinary and updates the database URLs, so the store survives the old
// Shopify account being closed. Safe to re-run (skips non-Shopify URLs).
// Run: npx tsx scripts/migrate-images.ts
import "dotenv/config";
import { createHash } from "crypto";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME!;
const KEY = process.env.CLOUDINARY_API_KEY!;
const SECRET = process.env.CLOUDINARY_API_SECRET!;
const FOLDER = "ladies-forest/products";

const isShopify = (url: string) => url.includes("cdn.shopify.com");

async function uploadFromUrl(sourceUrl: string): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `folder=${FOLDER}&timestamp=${timestamp}${SECRET}`;
  const signature = createHash("sha1").update(toSign).digest("hex");

  const body = new FormData();
  // Cloudinary can fetch a remote URL itself — no local download needed.
  body.append("file", sourceUrl);
  body.append("api_key", KEY);
  body.append("timestamp", String(timestamp));
  body.append("folder", FOLDER);
  body.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,
    { method: "POST", body },
  );
  const json = (await res.json()) as {
    secure_url?: string;
    error?: { message?: string };
  };
  if (!res.ok || !json.secure_url) {
    throw new Error(json.error?.message ?? `HTTP ${res.status}`);
  }
  return json.secure_url;
}

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, title: true, images: true },
  });

  const cache = new Map<string, string>(); // old url -> new url
  let migrated = 0;
  let failed = 0;

  for (const product of products) {
    let changed = false;
    const newImages: string[] = [];

    for (const url of product.images) {
      if (!isShopify(url)) {
        newImages.push(url);
        continue;
      }
      try {
        let newUrl = cache.get(url);
        if (!newUrl) {
          newUrl = await uploadFromUrl(url);
          cache.set(url, newUrl);
        }
        newImages.push(newUrl);
        changed = true;
        migrated++;
        console.log(`  ok  ${product.title}: ...${url.slice(-40)}`);
      } catch (e) {
        failed++;
        newImages.push(url); // keep the old URL on failure
        console.error(
          `  FAIL ${product.title}: ${(e as Error).message} (${url.slice(-40)})`,
        );
      }
    }

    if (changed) {
      try {
        await prisma.product.update({
          where: { id: product.id },
          data: { images: newImages },
        });
      } catch (e) {
        // Product edited/deleted while migrating — skip it, safe to re-run.
        console.error(
          `  SKIP update for "${product.title}": ${(e as Error).message.split("\n")[0]}`,
        );
      }
    }
  }

  // Order item snapshots also reference Shopify URLs — update the ones we
  // migrated so invoices keep their thumbnails.
  const items = await prisma.orderItem.findMany({
    where: { image: { contains: "cdn.shopify.com" } },
    select: { id: true, image: true },
  });
  for (const item of items) {
    if (!item.image) continue;
    try {
      let newUrl = cache.get(item.image);
      if (!newUrl) {
        newUrl = await uploadFromUrl(item.image);
        cache.set(item.image, newUrl);
      }
      await prisma.orderItem.update({
        where: { id: item.id },
        data: { image: newUrl },
      });
      console.log(`  ok  order-item thumbnail ...${item.image.slice(-40)}`);
    } catch (e) {
      console.error(`  FAIL order-item: ${(e as Error).message}`);
    }
  }

  console.log(
    `\nDone: ${migrated} images migrated, ${failed} failed, ${items.length} order-item thumbnails checked.`,
  );
  await prisma.$disconnect();
}

main();
