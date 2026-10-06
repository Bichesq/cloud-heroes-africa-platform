import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentStudent } from "@/lib/current-student";
import { getPrograms } from "@/lib/store/catalog";
import { ensureDefaultEnrollment } from "@/lib/store/enrollments";
import { getStudentUnits } from "@/lib/store/progress";
import CatalogClient from "./components/CatalogClient";

export const metadata: Metadata = {
  title: "Program Catalogue — Cloud Heroes Africa Learning Platform",
};

export default async function CatalogPage() {
  const student = await currentStudent();
  if (!student) redirect("/SignIn");

  const [programs, enrollments, studentUnits] = await Promise.all([
    getPrograms(),
    ensureDefaultEnrollment(student.id, student.activeProgramId),
    getStudentUnits(student.id),
  ]);
  const enrolledIds = enrollments.map((e) => e.programId);
  const startedUnitIds = new Set(studentUnits.map((u) => u.unitId));
  const statusByUnitId = new Map(studentUnits.map((u) => [u.unitId, u.status]));

  return (
    <CatalogClient
      programs={programs.map((p) => {
        const allUnits = p.modules.flatMap((m) => m.units);
        return {
          id: p.id,
          title: p.title,
          blurb: p.blurb,
          heroImage: p.heroImage,
          language: p.language,
          delivery: p.delivery,
          enrolled: enrolledIds.includes(p.id),
          started: allUnits.some((u) => startedUnitIds.has(u.id)),
          /* Program Catalogue's "Completed 100%" state (requirements §1) — no
           * dedicated backend rollup exists yet, so this is derived here from
           * the per-unit statuses already fetched for `started`, the same way
           * ProgramOverview derives its own per-unit chips. */
          completed:
            allUnits.length > 0 &&
            allUnits.every((u) => {
              const status = statusByUnitId.get(u.id);
              return status === "completed" || status === "verified";
            }),
        };
      })}
    />
  );
}
