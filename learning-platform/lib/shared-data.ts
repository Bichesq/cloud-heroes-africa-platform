import path from "path";

/* Cross-app shared JSON stores (approved-emails, students, support-tickets,
 * audit-log) live in the repo-root data/ directory so Student Hub and the
 * Learning Platform read/write the same records. Mirrors the SHARED_DIR
 * convention in student-hub/lib. Replaced wholesale by the Postgres backend
 * (docs/learning-platform/schema.sql) — only these I/O modules change. */
export const SHARED_DIR =
  process.env.SHARED_DATA_DIR ?? path.resolve(process.cwd(), "..", "data");

export function sharedDataPath(file: string): string {
  return path.join(SHARED_DIR, file);
}

/** Learning-Platform-owned stores stay app-local (learning-platform/data). */
export function localDataPath(file: string): string {
  return path.join(process.cwd(), "data", file);
}
