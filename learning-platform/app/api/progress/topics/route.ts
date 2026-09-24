import { NextResponse } from "next/server";
import { z } from "zod";
import { currentStudent } from "@/lib/current-student";
import { resolveUnitAccess } from "@/lib/unit-access";
import { completeUnitContent } from "@/lib/unit-completion";
import { getCompletedTopicIds, getStudentUnit, markTopicComplete } from "@/lib/store/progress";
import { allTopicsComplete } from "@/lib/topic-progress";

const completeTopicSchema = z.strictObject({
  unitId: z.string().min(1).max(200),
  topicId: z.uuid(),
});

/* POST — the student pressed Next on a topic (decision-log
 * 2026-09-24 "Per-topic progress formula"; Sept 21 "per-topic granularity").
 * Records the completion; once every navigable topic of the unit is done it
 * runs the same unit-completion cascade as POST /api/progress (status
 * "completed" + tokens). Passing the KC is still what verifies the unit.
 *
 * Access (SECURITY.md §3): same token/module gates as the unit page, and the
 * topic must be one of *this unit's* navigable topics — unit.topics is loaded
 * through the unit's own relation, so a topic id from any other unit is
 * rejected. Rate limiting is deliberately deferred to a cross-route follow-up
 * (plan Open Question 3) — no LP write route has one yet. */
export async function POST(request: Request) {
  const student = await currentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = completeTopicSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid topic" }, { status: 400 });
  }
  const { unitId, topicId } = parsed.data;

  const access = await resolveUnitAccess(student.id, unitId);
  if (!access.ok) {
    return access.reason === "not_found"
      ? NextResponse.json({ error: "Unknown unit" }, { status: 404 })
      : NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { unit } = access;

  if (!unit.topics.some((t) => t.id === topicId)) {
    return NextResponse.json({ error: "Unknown topic" }, { status: 404 });
  }

  await markTopicComplete(student.id, unit.id, topicId);
  const completedTopicIds = await getCompletedTopicIds(student.id, unit.id);

  let unitStatus = (await getStudentUnit(student.id, unit.id))?.status ?? null;
  let tokensAwarded = 0;
  if (allTopicsComplete(unit.topics.map((t) => t.id), completedTopicIds)) {
    ({ unitStatus, tokensAwarded } = await completeUnitContent(student.id, unit));
  }

  // Only report ids of this unit's current navigable topics.
  const navigable = new Set(unit.topics.map((t) => t.id));
  return NextResponse.json({
    completedTopicIds: completedTopicIds.filter((id) => navigable.has(id)),
    unitStatus,
    tokensAwarded,
  });
}
