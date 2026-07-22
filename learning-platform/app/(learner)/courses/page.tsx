import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, Trophy } from "lucide-react";
import { currentStudent } from "@/lib/current-student";
import { getPrograms } from "@/lib/store/catalog";
import { ensureDefaultEnrollment } from "@/lib/store/enrollments";
import { getStudentUnits } from "@/lib/store/progress";
import { getPointsEntries } from "@/lib/store/points";
import { pointsBalance, programStats, resumeUnit } from "@/lib/lp-utils";

export const metadata: Metadata = {
  title: "My Courses — Cloud Heroes Africa Learning Platform",
};

/* My Courses — the LP home: every enrolled program with its progress,
 * points, and a resume CTA into the current unit. */
export default async function CoursesPage() {
  const student = await currentStudent();
  if (!student) redirect("/SignIn");

  const [programs, enrollments, studentUnitList, points] = await Promise.all([
    getPrograms(),
    ensureDefaultEnrollment(student.id, student.activeProgramId),
    getStudentUnits(student.id),
    getPointsEntries(student.id),
  ]);

  const studentUnits = new Map(studentUnitList.map((u) => [u.unitId, u]));
  const balance = pointsBalance(points);
  const enrolled = programs.filter((p) =>
    enrollments.some((e) => e.programId === p.id)
  );

  return (
    <div className="mx-auto w-full max-w-[1400px] px-8 pb-16 pt-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl font-extrabold sm:text-5xl">
            My Courses
          </h1>
          <p className="mt-2 text-lg text-cha-muted">
            Pick up where you left off, {student.displayName || student.givenName}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-cha-surface px-5 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <Trophy size={18} className="text-cha-orange" />
          <span className="text-sm font-bold">{balance} points</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {enrolled.map((program) => {
          const stats = programStats(program, studentUnits);
          const resume = resumeUnit(program, studentUnits, balance);
          return (
            <article key={program.id} className="cha-card overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="relative aspect-[16/9] shrink-0 bg-cha-surface-2 sm:aspect-auto sm:w-[240px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={program.heroImage}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col p-6">
                  <h2 className="font-display text-2xl font-extrabold leading-tight">
                    {program.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-cha-muted">
                    {program.blurb}
                  </p>

                  {/* Progress */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-cha-muted">Progress</span>
                      <span className="font-bold">{stats.progressPct}%</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cha-surface-2">
                      <div
                        className="h-full rounded-full bg-cha-orange transition-all"
                        style={{ width: `${stats.progressPct}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-cha-faint">
                      {stats.completedUnits} of {stats.totalUnits} units completed ·{" "}
                      {stats.verifiedUnits} verified
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                    <Link
                      href={`/programs/${program.id}`}
                      className="flex items-center gap-1.5 text-sm font-semibold text-cha-blue hover:underline"
                    >
                      <BookOpen size={16} />
                      Course overview
                    </Link>
                    <Link
                      href={`/programs/${program.id}/resume`}
                      className="flex items-center gap-2 rounded-full bg-cha-orange px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-cha-orange-strong"
                    >
                      {resume ? "Resume learning" : "Review program"}
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {enrolled.length === 0 && (
        <div className="cha-card mt-8 px-8 py-16 text-center">
          <h2 className="font-display text-2xl font-bold">No enrolled programs yet</h2>
          <p className="mt-2 text-cha-muted">
            Browse the catalogue to see what&apos;s available.
          </p>
          <Link
            href="/catalog"
            className="mt-6 inline-block rounded-full bg-cha-orange px-6 py-3 text-sm font-bold text-white hover:bg-cha-orange-strong"
          >
            Explore Programs
          </Link>
        </div>
      )}
    </div>
  );
}
