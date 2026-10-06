import { NextResponse } from "next/server";
import { z } from "zod";
import { currentStudent } from "@/lib/current-student";
import { resolveUnitAccess } from "@/lib/unit-access";
import { completeUnitContent } from "@/lib/unit-completion";

const completeUnitSchema = z.strictObject({
  unitId: z.string().min(1),
});

/* POST — mark a topic-less unit's content as read, cascading to unit
 * "completed" + tokens award. (2026-08-11: Section/Item are gone — the client
 * signals "this unit's content is done" directly by unitId.)
 * Knowledge checks are NOT completed here — passing the KC (via the
 * attempts route) is what flips the unit to "verified".
 *
 * 2026-09-24 (decision-log "Per-topic progress formula"):
 *  - now applies the same token/module gates as the unit page via
 *    resolveUnitAccess — previously a locked unit could be marked complete
 *    (and its tokens awarded) by calling this route directly (SECURITY.md §3);
 *  - units split into Topics complete via POST /api/progress/topics once
 *    every topic is done, so this route refuses them (409) — otherwise the
 *    reading could be "completed" without the topics.
 * Request and success-response shapes are unchanged. */
export async function POST(request: Request) {
  const student = await currentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = completeUnitSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid unit" }, { status: 400 });
  }

  const access = await resolveUnitAccess(student.id, parsed.data.unitId);
  if (!access.ok) {
    return access.reason === "not_found"
      ? NextResponse.json({ error: "Unknown unit" }, { status: 404 })
      : NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { program, unit } = access;

  if (unit.topics.length > 0) {
    return NextResponse.json({ error: "Complete this unit's topics instead" }, { status: 409 });
  }

  const { unitStatus, tokensAwarded } = await completeUnitContent(student.id, unit);

  return NextResponse.json({
    ok: true,
    programId: program.id,
    unitId: unit.id,
    unitStatus,
    tokensAwarded,
  });
}
