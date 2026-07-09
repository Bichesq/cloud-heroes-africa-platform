import { getSession } from "@/lib/auth";
import { getStudent } from "@/lib/mock-api";
import { getProgram, getCompletions, markUnitComplete, DEFAULT_PROGRAM_ID } from "@/lib/curriculum";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.strictObject({ unitId: z.string().trim().min(1) });

/**
 * Marks a unit complete for the current student. This is the POC's
 * simulated activity source — the single place a real LMS integration
 * would replace later (see lib/curriculum.ts). Idempotent: completing an
 * already-complete unit is a no-op.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid unit id" }, { status: 400 });
  }

  const student = await getStudent(session.user.email);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const program = await getProgram(student.activeProgramId ?? DEFAULT_PROGRAM_ID);
  const unitExists = program?.modules.some((m) =>
    m.units.some((u) => u.id === parsed.data.unitId)
  );
  if (!program || !unitExists) {
    return NextResponse.json({ error: "Unit not found in active program" }, { status: 400 });
  }

  const before = await getCompletions(student.id);
  const alreadyComplete = before.some((c) => c.unitId === parsed.data.unitId);
  const completion = await markUnitComplete(student.id, parsed.data.unitId);

  if (!alreadyComplete) {
    await logAudit({
      studentId: student.id,
      actor: session.user.email,
      actorRole: "student",
      action: "progress.unit_complete",
      changes: [{ field: "unitId", from: null, to: parsed.data.unitId }],
    });
  }

  return NextResponse.json({ ok: true, completion });
}
