import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Breadcrumbs from "@/app/(learner)/components/Breadcrumbs";
import { currentStudent } from "@/lib/current-student";
import { getKnowledgeChecksForUnits, getProgram } from "@/lib/store/catalog";
import { getStandaloneAssessmentsForScope } from "@/lib/store/standalone-assessments";
import { getStudentUnits } from "@/lib/store/progress";
import { getTokenEntries } from "@/lib/store/tokens";
import { getModuleGatesForProgram } from "@/lib/store/module-access";
import { moduleStats, tokensBalance } from "@/lib/lp-utils";
import ModuleContentView from "./components/ModuleContentView";

export const metadata: Metadata = {
  title: "Module — Cloud Heroes Africa Learning Platform",
};

export default async function ModulePage({
  params,
}: {
  params: Promise<{ programId: string; moduleId: string }>;
}) {
  const { programId, moduleId } = await params;
  const student = await currentStudent();
  if (!student) redirect("/SignIn");

  const program = await getProgram(programId);
  const module = program?.modules.find((m) => m.id === moduleId);
  if (!program || !module) notFound();

  const [studentUnitList, tokens, knowledgeChecks, assessments] = await Promise.all([
    getStudentUnits(student.id),
    getTokenEntries(student.id),
    getKnowledgeChecksForUnits(module.units.map((u) => u.id)),
    getStandaloneAssessmentsForScope({ moduleId: module.id, programId: program.id }),
  ]);

  const studentUnits = new Map(studentUnitList.map((u) => [u.unitId, u]));

  // Module gate (Phase 2, same rule/entry point as the unit page) — a
  // locked module's content view is never reachable by URL either.
  const gates = await getModuleGatesForProgram(program.modules, student.id, studentUnits);
  if (gates.get(module.id)?.locked) {
    redirect(`/programs/${program.id}`);
  }

  const balance = tokensBalance(tokens);
  const stats = moduleStats(module, studentUnits);
  const moduleIndex = [...program.modules].sort((a, b) => a.order - b.order).findIndex((m) => m.id === module.id);

  const units = [...module.units]
    .sort((a, b) => a.order - b.order)
    .map((u) => {
      const su = studentUnits.get(u.id);
      return {
        id: u.id,
        title: u.title,
        description: u.description,
        order: u.order,
        durationMin: u.durationMin,
        tokensRequired: u.tokensRequired,
        status: su?.status ?? null,
        locked: !su && balance < u.tokensRequired,
      };
    });

  const nextUnit =
    units.find((u) => !u.locked && u.status !== "completed" && u.status !== "verified") ??
    units[0] ??
    null;

  const assessment = assessments[0] ?? null;
  const instructor = module.units[0]?.creators[0] ?? program.creators[0];
  const totalDurationMin = module.units.reduce((sum, u) => sum + u.durationMin, 0);

  return (
    <>
      <Breadcrumbs moduleTitle={module.title} />
      <ModuleContentView
        programId={program.id}
        moduleTitle={module.title}
        moduleDescription={module.description}
        moduleIndex={moduleIndex}
        language={program.language.toUpperCase()}
        instructor={instructor ?? null}
        heroImage={module.units[0]?.heroImage || program.heroImage}
        stats={stats}
        totalDurationMin={totalDurationMin}
        knowledgeCheckCount={knowledgeChecks.length}
        assessment={assessment ? { id: assessment.id, title: assessment.title } : null}
        units={units}
        nextUnitId={nextUnit?.id ?? null}
      />
    </>
  );
}
