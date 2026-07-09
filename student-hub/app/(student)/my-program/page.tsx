import { getSession } from "@/lib/auth";
import { getStudent } from "@/lib/mock-api";
import { getProgram, getCompletions, DEFAULT_PROGRAM_ID } from "@/lib/curriculum";
import { redirect } from "next/navigation";
import MyProgramClient from "./components/MyProgramClient";

/**
 * My Program — module/unit breakdown of the student's active program, with
 * a "Mark complete" action per unit. This is the simulated activity source
 * that powers the dashboard's resume banner, progress widget, and streak
 * until a real LMS exists (see lib/curriculum.ts).
 */
export default async function MyProgramPage() {
  const session = await getSession();
  if (!session) redirect("/SignIn");

  const student = await getStudent(session.user.email);
  const program = await getProgram(student?.activeProgramId ?? DEFAULT_PROGRAM_ID);
  const completions = student ? await getCompletions(student.id) : [];

  if (!program) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-3xl bg-cha-surface p-10 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <h1 className="font-display text-[26px] font-extrabold">My Program</h1>
        <p className="text-sm font-medium text-cha-muted">
          You&apos;re not enrolled in a program yet. Explore Programs to get started.
        </p>
      </div>
    );
  }

  return (
    <MyProgramClient
      program={program}
      completedUnitIds={completions.map((c) => c.unitId)}
    />
  );
}
