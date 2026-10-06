import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// A prisma.config.ts file disables the CLI's automatic .env loading, so it
// loads .env itself (same as learning-platform/prisma.config.ts).
loadEnv();

// No `migrations` path on purpose: this app never runs `prisma migrate`.
export default defineConfig({
  schema: "prisma/schema",
});
