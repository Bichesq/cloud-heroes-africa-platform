import { promises as fs } from "fs";
import type { ApprovedEmail } from "@/types";
import { sharedDataPath } from "./shared-data";

/* Read-only view of the admin-managed approved-email list shared with
 * Student Hub (repo-root data/approved-emails.json). LP never mutates it —
 * approvals/revocations are Administration's job. */

const FILE = sharedDataPath("approved-emails.json");

async function read(): Promise<ApprovedEmail[]> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
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
