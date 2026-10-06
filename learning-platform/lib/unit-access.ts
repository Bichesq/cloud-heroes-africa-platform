import type { LpModule, LpProgram, LpUnit, StudentUnit } from "@/types";
import { getPrograms } from "@/lib/store/catalog";
import { getStudentUnit, getStudentUnits } from "@/lib/store/progress";
import { getTokenEntries } from "@/lib/store/tokens";
import { getModuleGatesForProgram } from "@/lib/store/module-access";
import { locateUnit, tokensBalance } from "@/lib/lp-utils";

/* Single source of truth for "may this student work on this unit?" —
 * shared by the unit/topic pages (load-unit.ts) and the progress API routes
 * (2026-09-24, decision-log "Per-topic progress formula"). Before this, only
 * the page enforced the token/module gates, so POST /api/progress could mark
 * a locked unit complete (and award its tokens) by calling the API directly.
 * SECURITY.md §3: every entry point applies the same check, ids from the
 * URL/body are attacker-controlled, default deny.
 *
 * Gates (unchanged from the page's original logic):
 *  - tokens: a unit with tokensRequired > balance can't be *started*;
 *  - module: a unit in a locked module can't be *started*.
 * Existing progress on a unit (a StudentUnit row) is never retroactively
 * locked out — both gates only stop fresh entry. */

export type UnitAccess =
  | {
      ok: true;
      program: LpProgram;
      module: LpModule;
      unit: LpUnit;
      studentUnit: StudentUnit | null;
    }
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "locked"; programId: string };

export async function resolveUnitAccess(
  studentId: string,
  unitId: string,
  /** When given (page routes), the unit must belong to this program. */
  expectedProgramId?: string
): Promise<UnitAccess> {
  const programs = await getPrograms();
  const location = locateUnit(programs, unitId);
  if (!location) return { ok: false, reason: "not_found" };
  const { program, module, unit } = location;
  if (expectedProgramId !== undefined && program.id !== expectedProgramId) {
    return { ok: false, reason: "not_found" };
  }

  const studentUnit = await getStudentUnit(studentId, unit.id);
  if (!studentUnit) {
    const balance = tokensBalance(await getTokenEntries(studentId));
    if (balance < unit.tokensRequired) {
      return { ok: false, reason: "locked", programId: program.id };
    }

    const allStudentUnits = await getStudentUnits(studentId);
    const gates = await getModuleGatesForProgram(
      program.modules,
      studentId,
      new Map(allStudentUnits.map((u) => [u.unitId, u]))
    );
    if (gates.get(module.id)?.locked) {
      return { ok: false, reason: "locked", programId: program.id };
    }
  }

  return { ok: true, program, module, unit, studentUnit };
}
