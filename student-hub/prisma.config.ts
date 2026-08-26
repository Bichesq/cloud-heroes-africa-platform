import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// A prisma.config.ts file disables the CLI's automatic .env loading, so it
// must load .env itself.
loadEnv();

// Points the Prisma CLI at the multi-file schema folder (prisma/schema/).
// student-hub never runs `prisma migrate` — see package.json#scripts and
// docs/plan/2026-08-23-centralize-shared-data.md's migration-ownership
// decision — but `migrations.path` is still set so a stray `migrate`
// invocation would at least look in the right place rather than creating a
// second, wrong-location migration history.
export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
});
