import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { getProgram } from "@/lib/store/catalog";
import { getStudentUnits } from "@/lib/store/progress";
import { getModuleGatesForProgram } from "@/lib/store/module-access";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* GET — Phase 2 step 3 (admin-safe manual resync action, diagnostic half).
 *
 * Module unlock is read-computed (lib/lp-utils.ts#moduleGates), not a
 * stored flag, so there is no cached "unlock" state that can fall out of
 * sync and need resyncing — the fresh computation IS the resync result,
 * every time it's read. This endpoint exists so Help Desk can pull that
 * live computation directly for a specific student + program, for the
 * exact scenario requirements §8 names ("student says a module didn't
 * unlock") without guessing at what the learner-facing UI is showing them.
 * The mutating half of step 3 — actually fixing a stuck attempt that never
 * got graded — is POST /api/admin/assessments/attempts/[attemptId]/resync.
 */
export async function GET(request: Request) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const studentId = url.searchParams.get("studentId");
  const programId = url.searchParams.get("programId");

  if (!studentId || !UUID_RE.test(studentId) || !programId || !UUID_RE.test(programId)) {
    return NextResponse.json(
      { error: "studentId and programId query params are required and must be UUIDs" },
      { status: 400 }
    );
  }

  const program = await getProgram(programId);
  if (!program) return NextResponse.json({ error: "Unknown program" }, { status: 404 });

  const studentUnitList = await getStudentUnits(studentId);
  const studentUnits = new Map(studentUnitList.map((u) => [u.unitId, u]));

  const gates = await getModuleGatesForProgram(program.modules, studentId, studentUnits);

  const modules = [...program.modules]
    .sort((a, b) => a.order - b.order)
    .map((m) => {
      const gate = gates.get(m.id)!;
      return {
        moduleId: m.id,
        title: m.title,
        order: m.order,
        locked: gate.locked,
        reason: gate.reason,
      };
    });

  return NextResponse.json({ studentId, programId, modules });
}
