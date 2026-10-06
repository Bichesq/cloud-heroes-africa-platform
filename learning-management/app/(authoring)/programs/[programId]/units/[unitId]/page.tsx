import { notFound } from "next/navigation";
import UnitEditor from "@/components/unit-editor/UnitEditorForm";
import { displayName, formatUpdated } from "@/lib/format";
import { listPeople, toPersonOption } from "@/lib/people";
import { prisma } from "@/lib/prisma";
import { requireProgramPage } from "@/lib/program-access";
import { unitId as unitIdSchema } from "@/lib/validation";

/* Unit Editor (plan §9) — Figma "Unit Editor" frame. Opened from Course
 * Structure. Anyone with a role on the program can view it; Owner /
 * Director / Editor can save and publish. The form shows the pending draft
 * when there is one (decision #8), otherwise the live unit. */

export default async function UnitEditorPage({ params }: { params: Promise<{ programId: string; unitId: string }> }) {
  const { programId, unitId } = await params;
  const { can } = await requireProgramPage(programId);
  if (!unitIdSchema.safeParse(unitId).success) notFound();

  const unit = await prisma.lpUnit.findFirst({
    where: { id: unitId, module: { programId } },
    select: {
      id: true,
      moduleId: true,
      title: true,
      description: true,
      durationMin: true,
      tokensAward: true,
      tokensRequired: true,
      creatorAuthorId: true,
      thumbnailKey: true,
      publishedAt: true,
      contentSourceName: true,
      contentSourceBytes: true,
      creatorAuthor: { select: { id: true, name: true, email: true } },
      module: {
        select: {
          program: {
            select: {
              title: true,
              modules: { orderBy: [{ order: "asc" }, { id: "asc" }], select: { id: true, title: true } },
            },
          },
        },
      },
      _count: { select: { topics: { where: { order: { not: null } } } } },
      draft: {
        select: {
          title: true,
          description: true,
          durationMin: true,
          tokensAward: true,
          tokensRequired: true,
          creatorAuthorId: true,
          thumbnailKey: true,
          contentSourceName: true,
          contentSourceBytes: true,
          updatedAt: true,
          updatedBy: { select: { name: true, email: true } },
          creator: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
  if (!unit) notFound();

  const d = unit.draft;
  const current = d ?? unit;
  const creatorAuthorId = d ? d.creatorAuthorId : unit.creatorAuthorId;
  const creator = d ? d.creator : unit.creatorAuthor;
  const people = can.editStructure && can.changeCreator ? await listPeople() : creator ? [toPersonOption(creator)] : [];
  const version = (d?.updatedAt ?? unit.publishedAt ?? new Date(0)).getTime();
  const thumbnailUrl =
    d?.thumbnailKey
      ? `/api/programs/${programId}/units/${unit.id}/thumbnail?draft=1&v=${version}`
      : unit.thumbnailKey
        ? `/api/programs/${programId}/units/${unit.id}/thumbnail?v=${version}`
        : null;

  return (
    <div className="max-w-[1092px]">
      <header>
        <p className="text-xs font-bold tracking-wide text-cha-faint uppercase">{unit.module.program.title}</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold">Unit Editor</h1>
        <p className="mt-1.5 text-sm text-cha-muted">Edit unit details, learning content, and delivery settings.</p>
      </header>

      <UnitEditor
        version={version}
        canEdit={can.editStructure}
        canChangeCreator={can.changeCreator}
        people={people}
        unit={{
          id: unit.id,
          programId,
          programTitle: unit.module.program.title,
          moduleId: unit.moduleId,
          modules: unit.module.program.modules.map((m, i) => ({ id: m.id, label: `Module ${i + 1}: ${m.title}` })),
          title: current.title,
          description: current.description,
          durationMin: current.durationMin,
          tokensAward: current.tokensAward,
          tokensRequired: current.tokensRequired,
          creatorAuthorId,
          thumbnailUrl,
          published: unit.publishedAt !== null,
          hasDraft: d !== null,
          draftNote: d ? `saved ${formatUpdated(d.updatedAt)}${d.updatedBy ? ` by ${displayName(d.updatedBy)}` : ""}` : null,
          content: {
            live: { name: unit.contentSourceName, bytes: unit.contentSourceBytes, topics: unit._count.topics },
            pending: d?.contentSourceName ? { name: d.contentSourceName, bytes: d.contentSourceBytes ?? 0 } : null,
          },
        }}
      />
    </div>
  );
}
