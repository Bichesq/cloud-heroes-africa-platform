import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Breadcrumbs from "@/app/(learner)/components/Breadcrumbs";
import { currentStudent } from "@/lib/current-student";
import { getAssessment, getProgram } from "@/lib/store/catalog";
import { getResults } from "@/lib/store/results";
import { latestReadiness } from "@/lib/lp-utils";
import ReadinessRunner from "./components/ReadinessRunner";

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
    getAssessment(assessmentId),
    getResults(student.id, assessmentId),
  ]);
  if (!program || !assessment || assessment.kind !== "readiness") notFound();

  return (
    <div className="flex h-full flex-col">
      <Breadcrumbs moduleTitle={program.title} unitLabel="Exam Readiness" />
      <ReadinessRunner
        assessmentId={assessment.id}
        programId={program.id}
        title={assessment.title}
        description={assessment.description}
        questions={assessment.config.questions ?? []}
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
