import { notFound } from "next/navigation";
import PersonListCard from "@/components/people/PersonListCard";
import ProgramSetupForm from "@/components/program-setup/ProgramSetupForm";
import { listPeople, toPersonOption } from "@/lib/people";
import { prisma } from "@/lib/prisma";
import { requireProgramPage } from "@/lib/program-access";

/* Program Setup (§6.1) for an existing program. Anyone with a role sees it;
 * Owner / Director / Editor can edit it; only Owner / Director can change the
 * Creator (plan §7). Instructors sit below the Figma's Setup card as a
 * labelled custom section — the frame has no Instructors control, §6.1 does. */

export default async function ProgramSetupPage({
  params,
  searchParams,
}: {
  params: Promise<{ programId: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { programId } = await params;
  const { created } = await searchParams;
  const { can } = await requireProgramPage(programId);

  const program = await prisma.lpProgram.findUnique({
    where: { id: programId },
    select: {
      id: true,
      title: true,
      blurb: true,
      thumbnailKey: true,
      updatedAt: true,
      creatorAuthor: { select: { id: true, name: true, email: true } },
      instructors: {
        select: { author: { select: { id: true, name: true, email: true } } },
        orderBy: { addedAt: "asc" },
      },
    },
  });
  if (!program) notFound();

  const people = can.editSetup ? await listPeople() : program.creatorAuthor ? [toPersonOption(program.creatorAuthor)] : [];

  return (
    <div className="max-w-[1092px]">
      <header>
        <p className="text-xs font-bold tracking-wide text-cha-faint uppercase">{program.title}</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold">Program Setup</h1>
        <p className="mt-1.5 text-sm text-cha-muted">
          Define the program details, content owner, and assigned instructors.
        </p>
      </header>

      <ProgramSetupForm
        program={{
          id: program.id,
          title: program.title,
          description: program.blurb,
          creatorAuthorId: program.creatorAuthor?.id ?? null,
          thumbnailUrl: program.thumbnailKey
            ? `/api/programs/${program.id}/thumbnail?v=${program.updatedAt.getTime()}`
            : null,
        }}
        canEdit={can.editSetup}
        canChangeCreator={can.changeCreator}
        people={people}
        justCreated={created === "1"}
      />

      <div className="cha-card-outline mt-6 max-w-[618px] rounded-[18px] p-7">
        <PersonListCard
          programId={program.id}
          list="instructor"
          title="Instructors"
          noun="Instructor"
          emptyText="No instructors assigned yet."
          people={program.instructors.map((i) => toPersonOption(i.author))}
          candidates={can.editSetup ? people : []}
          canManage={can.editSetup}
        />
        <p className="mt-3 text-xs text-cha-muted">
          Instructors can change over time without changing who&apos;s credited as the Creator.
        </p>
      </div>
    </div>
  );
}
