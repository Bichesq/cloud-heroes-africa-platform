import { PrismaClient } from "@prisma/client";

/* Singleton PrismaClient — Next.js dev hot-reload re-evaluates modules on
 * every edit, so without this a new client (and a new connection pool)
 * would be created on every request during development. Same pattern as
 * learning-platform/lib/prisma.ts. */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
