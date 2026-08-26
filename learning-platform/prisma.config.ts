import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// A prisma.config.ts file disables the CLI's automatic .env loading, so it
// must load .env itself (mirrors scripts/migrate-to-postgres.ts's existing
// dotenv usage).
loadEnv();

// Points the Prisma CLI at the multi-file schema folder (prisma/schema/) —
// package.json#prisma is deprecated as of Prisma 6.19, removed in 7.
export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
});
