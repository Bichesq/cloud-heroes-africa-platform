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

  return (
    <CatalogClient
      programs={programs.map((p) => ({
        id: p.id,
        title: p.title,
        blurb: p.blurb,
        heroImage: p.heroImage,
        language: p.language,
        delivery: p.delivery,
        enrolled: enrolledIds.includes(p.id),
        started: p.modules.some((m) =>
          m.units.some((u) => startedUnitIds.has(u.id))
        ),
      }))}
    />
  );
}
