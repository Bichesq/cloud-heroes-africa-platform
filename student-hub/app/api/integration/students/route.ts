import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyIntegrationRequest } from "@/lib/integration-auth";
import { upsertStudent } from "@/lib/mock-api";

/* Student-write API — student-hub is the sole authoritative writer for
 * Student rows (2026-08-24 decision,
 * docs/plan/2026-08-23-centralize-shared-data.md). This endpoint covers
 * upsert-on-first-login (create if absent, update lastLogin otherwise) —
 * what learning-platform's lib/students.ts#upsertStudent now calls instead
 * of writing to Postgres directly, fixing the pre-existing split-brain-writer
 * problem where both apps independently upserted the same row.
 *
 * Deliberately NOT scoped narrowly to just this one caller: designed as the
 * general student-write surface so that "Administration" (per
 * docs/decision-log.md, the eventual real owner of admin-status fields),
 * once built, calls the same API rather than requiring a second redesign —
 * see app/api/integration/students/[id]/route.ts for the admin-update half
 * of that surface. */

const upsertLoginSchema = z.strictObject({
  email: z.string().email(),
  givenName: z.string(),
  familyName: z.string(),
  approvedEmailId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const denied = verifyIntegrationRequest(req);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = upsertLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const { student, isNew } = await upsertStudent(parsed.data);
  return NextResponse.json({ student, isNew });
}
