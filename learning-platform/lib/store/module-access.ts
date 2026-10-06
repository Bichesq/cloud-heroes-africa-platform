import { moduleGates, type ModuleGate } from "@/lib/lp-utils";
import { getModuleAssessmentsForModules } from "./standalone-assessments";
import { getPassedAssessmentIds } from "./assessment-attempts";
import type { LpModule, StudentUnit } from "@/types";

/** Single entry point for Phase 2 module gating — every caller (program
 * overview, unit page, module assessment page, admin diagnostic endpoint)
 * derives the identical lock state from the identical live sources this
 * way, instead of re-deriving the moduleId → passed map independently. See
 * lib/lp-utils.ts#moduleGates for why this is read-computed rather than a
 * stored flag. */
export async function getModuleGatesForProgram(
  modules: LpModule[],
  studentId: string,
  studentUnits: Map<string, StudentUnit>
): Promise<Map<string, ModuleGate>> {
  const moduleAssessments = await getModuleAssessmentsForModules(modules.map((m) => m.id));
  const passedIds = await getPassedAssessmentIds(
    studentId,
    moduleAssessments.map((a) => a.id)
  );

  const moduleAssessmentPassed = new Map<string, boolean>();
  const firstPublished = new Map<string, string>();
  for (const a of moduleAssessments) {
    if (!a.moduleId) continue;
    if (a.firstPublishedAt) firstPublished.set(a.moduleId, a.firstPublishedAt);
    const passed = passedIds.has(a.id);
    moduleAssessmentPassed.set(
      a.moduleId,
      (moduleAssessmentPassed.get(a.moduleId) ?? false) || passed
    );
  }

  return moduleGates(modules, studentUnits, moduleAssessmentPassed, firstPublished);
}
