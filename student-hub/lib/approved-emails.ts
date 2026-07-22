import { promises as fs } from "fs";
import path from "path";
import type { ApprovedEmail } from "@/types";

/* Shared across app surfaces (Student Hub, Learning Platform) — lives in the
 * repo-root data/ directory, not the app-local one. */
const SHARED_DIR =
  process.env.SHARED_DATA_DIR ?? path.resolve(process.cwd(), "..", "data");
const FILE = path.join(SHARED_DIR, "approved-emails.json");

async function read(): Promise<ApprovedEmail[]> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function write(records: ApprovedEmail[]): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(records, null, 2));
}

export async function findApprovedEmail(
  email: string
): Promise<ApprovedEmail | null> {
  const records = await read();
  return (
    records.find(
      (r) =>
        r.email.toLowerCase() === email.toLowerCase() &&
        r.status === "approved"
    ) ?? null
  );
}

export async function revokeEmail(
  email: string,
  updatedBy: string,
  notes?: string
): Promise<void> {
  const records = await read();
  const index = records.findIndex(
    (r) => r.email.toLowerCase() === email.toLowerCase()
  );
  if (index === -1) return;

  records[index] = {
    ...records[index],
    status: "revoked",
    notes: notes ?? records[index].notes,
    updatedBy,
    updatedAt: new Date().toISOString(),
  };

  await write(records);
}