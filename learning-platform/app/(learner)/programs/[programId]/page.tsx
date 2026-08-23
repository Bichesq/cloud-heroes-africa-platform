import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Breadcrumbs from "@/app/(learner)/components/Breadcrumbs";
import { currentStudent } from "@/lib/current-student";
import { getProgram, getReadinessAssessments } from "@/lib/store/catalog";
import { getStudentUnits } from "@/lib/store/progress";
import { getTokenEntries } from "@/lib/store/tokens";
import { getGoals } from "@/lib/store/goals";
import { getResults } from "@/lib/store/readiness-results";
import { latestReadiness, tokensBalance, programStats } from "@/lib/lp-utils";
import ProgramOverview, { type OverviewUnit } from "./components/ProgramOverview";
import ReadinessCard from "./components/ReadinessCard";

export const metadata: Metadata = {
  title: "Program — Cloud Heroes Africa Learning Platform",
};

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  const student = await currentStudent();
  if (!student) redirect("/SignIn");

  const program = await getProgram(programId);
  if (!program) notFound();

  const [studentUnitList, tokens, goals, readinessAssessments] =
    await Promise.all([
      getStudentUnits(student.id),
      getTokenEntries(student.id),
      getGoals(student.id),
      getReadinessAssessments(program.id),
    ]);

  const readiness = readinessAssessments[0] ?? null;
  const readinessResults = readiness
    ? await getResults(student.id, readiness.id)
    : [];

  const studentUnits = new Map(studentUnitList.map((u) => [u.unitId, u]));
  const goalByUnit = new Map(goals.map((g) => [g.unitId, g]));
  const balance = tokensBalance(tokens);
  const stats = programStats(program, studentUnits);

  const modules = [...program.modules]
    .sort((a, b) => a.order - b.order)
    .map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      units: [...m.units]
        .sort((a, b) => a.order - b.order)
        .map((u): OverviewUnit => {
          const su = studentUnits.get(u.id);
          const goal = goalByUnit.get(u.id);
          return {
            id: u.id,
            title: u.title,
            description: u.description,
            order: u.order,
            durationMin: u.durationMin,
            tokensAward: u.tokensAward,
            tokensRequired: u.tokensRequired,
            status: su?.status ?? null,
            completedAt: su?.completedAt ?? null,
            verifiedAt: su?.verifiedAt ?? null,
            goalTargetDate: goal?.targetDate ?? null,
          };
        }),
    }));

  return (
    <>
      <Breadcrumbs />
      <div className="mx-auto w-full max-w-[1200px] px-8 pb-16 pt-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <h1 className="font-display text-4xl font-extrabold">{program.title}</h1>
            <p className="mt-2 max-w-2xl text-cha-muted">{program.blurb}</p>
            <p className="mt-3 text-sm text-cha-faint">
              By {program.creators.map((c) => c.name).join(", ")} · {program.language.toUpperCase()} ·
              Self-Paced Learning
            </p>
          </div>
          <div className="cha-card flex shrink-0 items-center gap-6 px-6 py-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-cha-faint">
                Progress
              </div>
              <div className="font-display text-2xl font-extrabold">
                {stats.progressPct}%
              </div>
            </div>
            <div className="h-10 w-px bg-cha-border" />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-cha-faint">
                Tokens
              </div>
              <div className="font-display text-2xl font-extrabold text-cha-orange">
                {balance}
              </div>
            </div>
            <div className="h-10 w-px bg-cha-border" />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-cha-faint">
                Verified units
              </div>
              <div className="font-display text-2xl font-extrabold text-cha-success">
                {stats.verifiedUnits}
              </div>
            </div>
          </div>
        </div>

        {/* Readiness */}
        {readiness && (
          <div className="mt-8">
            <ReadinessCard
              programId={program.id}
              assessmentId={readiness.id}
              title={readiness.title}
              description={readiness.description}
              summary={latestReadiness(readinessResults)}
            />
          </div>
        )}

        {/* Modules */}
        <ProgramOverview programId={program.id} modules={modules} balance={balance} />
      </div>
    </>
  );
}
