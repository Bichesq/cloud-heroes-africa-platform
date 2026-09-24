import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { currentStudent } from "@/lib/current-student";
import { getProgram } from "@/lib/store/catalog";
import { getStandaloneAssessment } from "@/lib/store/standalone-assessments";
import {
  getInProgressAttempt,
  getSubmittedAttempts,
} from "@/lib/store/assessment-attempts";
import { getStudentUnits } from "@/lib/store/progress";
import { getModuleGatesForProgram } from "@/lib/store/module-access";
import AssessmentRunner from "./components/AssessmentRunner";

export const metadata: Metadata = {
  title: "Module Assessment — Cloud Heroes Africa Learning Platform",
};

export default async function ModuleAssessmentPage({
  params,
}: {
  params: Promise<{ programId: string; assessmentId: string }>;
}) {
  const { programId, assessmentId } = await params;
  const student = await currentStudent();
  if (!student) redirect("/SignIn");

  const [program, assessment] = await Promise.all([
    getProgram(programId),
    getStandaloneAssessment(assessmentId),
  ]);
  if (!program || !assessment) notFound();

  const [inProgress, submitted] = await Promise.all([
    getInProgressAttempt(assessmentId, student.id),
    getSubmittedAttempts(assessmentId, student.id),
  ]);

  const assessmentModule = assessment.moduleId
    ? program.modules.find((m) => m.id === assessment.moduleId)
    : undefined;

  // Module gate (Phase 2) — a Module Assessment for a locked module isn't
  // reachable by URL either. Existing attempts (in-progress or already
  // submitted) are never retroactively blocked — this only stops a fresh
  // attempt at an assessment for a module the student hasn't earned access
  // to yet. Program-level assessments (assessment.moduleId === null) are
  // never module-gated.
  if (assessmentModule && inProgress === null && submitted.length === 0) {
    const allStudentUnits = await getStudentUnits(student.id);
    const gates = await getModuleGatesForProgram(
      program.modules,
      student.id,
      new Map(allStudentUnits.map((u) => [u.unitId, u]))
    );
    if (gates.get(assessmentModule.id)?.locked) {
      redirect(`/programs/${program.id}`);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* No breadcrumb row — the Figma Assessment View header (Exit + title +
          status) replaces it; see AssessmentHeader. */}
      <AssessmentRunner
        assessmentId={assessment.id}
        programId={program.id}
        title={assessment.title}
        heading={
          assessmentModule
            ? `Module ${assessmentModule.order}: ${assessmentModule.title}`
            : program.title
        }
        description={assessment.description}
        questionsPerAttempt={assessment.questionsPerAttempt}
        timeLimitSeconds={assessment.timeLimitSeconds}
        hasInProgressAttempt={inProgress !== null}
        lastAttempt={
          submitted[0]
            ? {
                passed: submitted[0].passed,
                score: submitted[0].score,
                submittedAt: submitted[0].submittedAt,
              }
            : null
        }
        attemptCount={submitted.length}
        cooldown={
          submitted[0]?.passed === false && submitted[0].nextEligibleAt
            ? submitted[0].nextEligibleAt
            : null
        }
        helpContext={{
          programId: program.id,
          programTitle: program.title,
        }}
      />
    </div>
  );
}
