#!/usr/bin/env node
// Copies prisma-shared/*.prisma into every Prisma-using app's prisma/schema/
// folder. This repo's checkout has `core.symlinks=false` and no
// .gitattributes override (verified 2026-08-26), which makes Git's Windows
// symlink support degrade a symlink into a plain text file containing the
// link target on any teammate's checkout in the same state — so this
// copy-based fallback is used instead of the symlinked-schema mechanism
// originally proposed in docs/shared-schema-audit.md.
//
// Run before every `prisma generate` / `prisma migrate` in learning-platform
// and student-hub (wired into each app's package.json scripts) — never run
// standalone as the only step, and never hand-edit the copied files.

import { readdirSync, copyFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(ROOT, "..");
const SHARED_DIR = join(REPO_ROOT, "prisma-shared");
const TARGETS = [
  join(REPO_ROOT, "learning-platform", "prisma", "schema"),
  join(REPO_ROOT, "student-hub", "prisma", "schema"),
];

const files = readdirSync(SHARED_DIR).filter((f) => f.endsWith(".prisma"));

for (const target of TARGETS) {
  mkdirSync(target, { recursive: true });
  for (const file of files) {
    copyFileSync(join(SHARED_DIR, file), join(target, file));
  }
}

console.log(
  `[sync-shared-prisma] copied ${files.length} shared file(s) into ${TARGETS.length} app schema folder(s).`
);
