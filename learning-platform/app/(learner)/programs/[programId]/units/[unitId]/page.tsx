import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Breadcrumbs from "@/app/(learner)/components/Breadcrumbs";
import { currentStudent } from "@/lib/current-student";
import { getKnowledgeChecksForUnit, getProgram } from "@/lib/store/catalog";
import { getStandaloneAssessmentsForScope } from "@/lib/store/standalone-assessments";
import { getStudentUnit } from "@/lib/store/progress";
import { getTokenEntries } from "@/lib/store/tokens";
import { getAttempts } from "@/lib/store/attempts";
import { getNote } from "@/lib/store/notes";
import { tokensBalance } from "@/lib/lp-utils";
import UnitShell, { type KcClientState } from "./components/UnitShell";

export const metadata: Metadata = {
  title: "Unit — Cloud Heroes Africa Learning Platform",
};

export default async function UnitPage({
  params,
  searchParams,
}: {
  params: Promise<{ programId: string; unitId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const [{ programId, unitId }, { view: requestedView }] = await Promise.all([
    params,
    searchParams,
  ]);

  const student = await currentStudent();
  if (!student) redirect("/SignIn");

  const program = await getProgram(programId);
  const module = program?.modules.find((m) => m.units.some((u) => u.id === unitId));
  const unit = module?.units.find((u) => u.id === unitId);
  if (!program || !module || !unit) notFound();

  const [studentUnit, tokens, note, knowledgeChecks, assessments] =
    await Promise.all([
      getStudentUnit(student.id, unitId),
      getTokenEntries(student.id),
      getNote(student.id, unitId),
      getKnowledgeChecksForUnit(unitId),
      getStandaloneAssessmentsForScope({ moduleId: module.id, programId: program.id }),
    ]);

  // Tokens gate — locked units are never reachable by URL either.
  const balance = tokensBalance(tokens);
  if (!studentUnit && balance < unit.tokensRequired) {
    redirect(`/programs/${program.id}`);
  }

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

  const initialView: string =
    requestedView && kcs.some((k) => k.kc.id === requestedView)
      ? requestedView
      : "content";

  return (
    <div className="flex h-full flex-col">
      <Breadcrumbs moduleTitle={module.title} unitLabel={`Unit ${unit.order}`} />
      <UnitShell
        programId={program.id}
        programTitle={program.title}
        moduleId={module.id}
        moduleTitle={module.title}
        unit={{
          id: unit.id,
          title: unit.title,
          order: unit.order,
          description: unit.description,
          heroImage: unit.heroImage,
          durationMin: unit.durationMin,
          tokensAward: unit.tokensAward,
          contentBlocks: unit.contentBlocks,
        }}
        kcs={kcs}
        initialView={initialView}
        initialUnitStatus={studentUnit?.status ?? null}
        initialNote={note?.body ?? ""}
        assignments={assignments}
      />
    </div>
  );
}
