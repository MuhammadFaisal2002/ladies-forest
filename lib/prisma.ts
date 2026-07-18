import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
      // Small pool: build workers + serverless functions each create their
      // own pool, and the free-tier database caps concurrent connections.
      max: 3,
      idleTimeoutMillis: 10_000,
    }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
