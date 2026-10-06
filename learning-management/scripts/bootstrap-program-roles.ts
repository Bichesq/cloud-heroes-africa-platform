/* One-off bootstrap: give an existing program its first Owner and/or
 * Director (plan 2026-09-21 Risks: "Getting the first Owner/Director
 * bootstrapped for each existing program needs a one-off backfill step").
 * Settings & Access (sub-step 2) manages these lists afterwards.
 *
 * Usage (from learning-management/):
 *   npm run bootstrap:roles -- --program cloud-practitioner --owner a@cloudheroes.africa [--director b@cloudheroes.africa]
 *
 * Idempotent. Authors are created by email only; their Entra oid is bound
 * on first sign-in (lib/authors.ts). Arguments are validated with zod —
 * nothing is written unless every argument is valid (SECURITY.md §10). */
import "dotenv/config";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const email = z.email().max(254).transform((e) => e.toLowerCase().trim());
const argsSchema = z
  .strictObject({
    program: z.string().min(1).max(200),
    owner: email.optional(),
    director: email.optional(),
  })
  .refine((a) => a.owner || a.director, { message: "Pass --owner and/or --director" });

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key?.startsWith("--") || value === undefined) throw new Error(`Bad argument near "${key}"`);
    out[key.slice(2)] = value;
  }
  return out;
}

async function ensureAuthor(address: string) {
  return prisma.lpAuthor.upsert({
    where: { email: address },
    create: { email: address },
    update: {},
    select: { id: true, email: true },
  });
}

async function main() {
  const parsed = argsSchema.safeParse(parseArgs(process.argv.slice(2)));
  if (!parsed.success) {
    console.error("Invalid arguments:", parsed.error.issues.map((i) => i.message).join("; "));
    process.exit(1);
  }
  const { program: programId, owner, director } = parsed.data;

  const program = await prisma.lpProgram.findUnique({ where: { id: programId }, select: { id: true, title: true } });
  if (!program) {
    console.error(`No program with id "${programId}".`);
    process.exit(1);
  }

  if (owner) {
    const author = await ensureAuthor(owner);
    await prisma.lpProgramOwner.upsert({
      where: { programId_authorId: { programId, authorId: author.id } },
      create: { programId, authorId: author.id },
      update: {},
    });
    console.log(`Owner    ${author.email} → ${program.title}`);
  }
  if (director) {
    const author = await ensureAuthor(director);
    await prisma.lpProgramDirector.upsert({
      where: { programId_authorId: { programId, authorId: author.id } },
      create: { programId, authorId: author.id },
      update: {},
    });
    console.log(`Director ${author.email} → ${program.title}`);
  }
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
