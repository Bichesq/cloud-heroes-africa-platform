import { notFound, redirect } from "next/navigation";
import { currentStudent } from "@/lib/current-student";
import { getKnowledgeChecksForUnit } from "@/lib/store/catalog";
import { getStandaloneAssessmentsForScope } from "@/lib/store/standalone-assessments";
import { getCompletedTopicIds } from "@/lib/store/progress";
import { getAttempts } from "@/lib/store/attempts";
import { getNote } from "@/lib/store/notes";
import { resolveUnitAccess } from "@/lib/unit-access";
import type { KcClientState } from "./components/UnitShell";

/* Shared server loader for the unit page and its topic sub-pages
 * (2026-09-23, Unit → Topic routes). Both routes MUST run the exact same
 * access gates — a topic URL is just another way into the unit, so it gets
 * no looser check than the unit URL itself (SECURITY.md §3: identical
 * authorization across every entry point, URL ids are attacker-controlled).
 * 2026-09-24: the gates themselves now live in lib/unit-access.ts, shared
 * with the progress API routes. */

export async function loadUnitContext(programId: string, unitId: string) {
  const student = await currentStudent();
  if (!student) redirect("/SignIn");

  const access = await resolveUnitAccess(student.id, unitId, programId);
  if (!access.ok) {
    if (access.reason === "locked") redirect(`/programs/${access.programId}`);
    notFound();
  }
  const { program, module: unitModule, unit, studentUnit } = access;

  const [note, knowledgeChecks, assessments, completedTopicIds] = await Promise.all([
    getNote(student.id, unitId),
    getKnowledgeChecksForUnit(unitId),
    getStandaloneAssessmentsForScope({ moduleId: unitModule.id, programId: program.id }),
    getCompletedTopicIds(student.id, unitId),
  ]);

  // Per-KC attempt state for this unit's Knowledge Check(s).
  const kcs = await Promise.all(
    knowledgeChecks.map(async (kc) => {
      const attempts = await getAttempts(student.id, kc.id);
      let failRun = 0;
      for (const a of attempts) failRun = a.passed ? 0 : failRun + 1;
      const state: KcClientState = {
        attemptCount: attempts.length,
        failRun,
        passed: attempts.some((a) => a.passed),
      };
      return { kc, state };
    })
  );

  // Module-scoped standalone assessments → Assignments tab stub list.
  const assignments = assessments.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
  }));

  return { program, module: unitModule, unit, studentUnit, note, kcs, assignments, completedTopicIds };
}

export type UnitContext = Awaited<ReturnType<typeof loadUnitContext>>;
