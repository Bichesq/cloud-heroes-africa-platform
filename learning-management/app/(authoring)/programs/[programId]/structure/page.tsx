import { notFound } from "next/navigation";
import CourseTree from "@/components/structure/CourseTree";
import { prisma } from "@/lib/prisma";
import { requireProgramPage } from "@/lib/program-access";

/* Course Structure (§6.2) — Figma "Course Structure" frame ("Program
 * Structure"). Anyone with a role on the program sees the tree; Owner /
 * Director / Editor can change it (plan §8). Draft units are shown here —
 * this is the one place they're listed — and hidden from learners. */

export default async function CourseStructurePage({ params }: { params: Promise<{ programId: string }> }) {
  const { programId } = await params;
  const { can } = await requireProgramPage(programId);

  const program = await prisma.lpProgram.findUnique({
    where: { id: programId },
    select: {
      id: true,
      title: true,
      modules: {
        orderBy: [{ order: "asc" }, { id: "asc" }],
        select: {
          id: true,
          title: true,
          description: true,
          units: {
            orderBy: [{ order: "asc" }, { id: "asc" }],
            select: {
              id: true,
              title: true,
              description: true,
              durationMin: true,
              publishedAt: true,
              draft: { select: { updatedAt: true } },
              // Navigable topics only; tag-only rows (Module Area) have no order.
              _count: { select: { topics: { where: { order: { not: null } } } } },
            },
          },
        },
      },
    },
  });
  if (!program) notFound();

  return (
    <div className="max-w-[1092px]">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Program Structure</h1>
        <p className="mt-1.5 text-sm text-cha-muted">Organize {program.title} into modules and ordered units.</p>
      </header>

      <CourseTree
        programId={program.id}
        programTitle={program.title}
        canEdit={can.editStructure}
        modules={program.modules.map((m) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          units: m.units.map((u) => ({
            id: u.id,
            title: u.title,
            description: u.description,
            topics: u._count.topics,
            durationMin: u.durationMin,
            draft: u.publishedAt === null,
            pendingChanges: u.publishedAt !== null && u.draft !== null,
          })),
        }))}
      />
    </div>
  );
}
