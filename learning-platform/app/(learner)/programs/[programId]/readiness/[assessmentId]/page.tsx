import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { currentStudent } from "@/lib/current-student";
import { getProgram, getReadinessAssessment } from "@/lib/store/catalog";
import { getResults } from "@/lib/store/readiness-results";
import { latestReadiness } from "@/lib/lp-utils";
import ReadinessRunner, { type ReadinessQuestionView } from "./components/ReadinessRunner";

export const metadata: Metadata = {
  title: "Exam Readiness — Cloud Heroes Africa Learning Platform",
};

export default async function ReadinessPage({
  params,
}: {
  params: Promise<{ programId: string; assessmentId: string }>;
}) {
  const { programId, assessmentId } = await params;
  const student = await currentStudent();
  if (!student) redirect("/SignIn");

  const [program, assessment, results] = await Promise.all([
    getProgram(programId),
    getReadinessAssessment(assessmentId),
    getResults(student.id, assessmentId),
  ]);
  if (!program || !assessment) notFound();

  // Only prompt + options reach the browser. The results route grades
  // against the server's own config, and readiness shows no per-question
  // feedback, so shipping correctOptionId/explanation would only hand the
  // answer key to anyone opening devtools (SECURITY.md: least exposure).
  const questions: ReadinessQuestionView[] = (assessment.config.questions ?? []).map((q) => ({
    id: q.id,
    prompt: q.prompt,
    options: q.options,
  }));

  return (
    <div className="flex h-full flex-col">
      {/* No breadcrumb row — the shared Assessment View header replaces it. */}
      <ReadinessRunner
        assessmentId={assessment.id}
        programId={program.id}
        title={assessment.title}
        description={assessment.description}
        questions={questions}
        levels={assessment.config.levels ?? []}
        summary={latestReadiness(results)}
        helpContext={{
          programId: program.id,
          programTitle: program.title,
        }}
      />
    </div>
  );
}
