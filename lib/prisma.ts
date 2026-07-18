import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Tolerate a DATABASE_URL pasted with surrounding quotes (common mistake
// when copying from .env into hosting dashboards).
const connectionString = (process.env.DATABASE_URL ?? "").replace(
  /^["']|["']$/g,
  "",
);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      // Small pool: build workers + serverless functions each create their
      // own pool, and the free-tier database caps concurrent connections.
      max: 3,
      idleTimeoutMillis: 10_000,
    }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
