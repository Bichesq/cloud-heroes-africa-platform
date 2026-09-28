import { notFound } from "next/navigation";
import PersonListCard from "@/components/people/PersonListCard";
import ContributorsTable from "@/components/settings/ContributorsTable";
import { formatDate } from "@/lib/format";
import { listPeople, toPersonOption } from "@/lib/people";
import { prisma } from "@/lib/prisma";
import { requireProgramPage } from "@/lib/program-access";

/* Settings & Access (§6.5) — Figma ContentArea "Settings & Access":
 * Permissions Guidelines card, then a config card with Program Director and
 * Program Owner, then the Contributors table.
 *
 * Divergence from the frame (recorded in plan §7): Director and Owner are
 * add/remove lists, not single dropdowns (2026-09-17 decision).
 *
 * Anyone with a role on the program can see who else has access. Directors
 * manage Directors and Owners; Owners and Directors manage Contributors
 * (plan §7). Every change is re-checked in its server action. */

const GUIDELINES = [
  {
    role: "Editors",
    text: "Can create, edit, structure modules, update quizzes and directly publish courses under review.",
  },
  {
    role: "Reviewers",
    text: "Can inspect learning pathways, preview active markdown nodes, suggest edits, and approve program progression.",
  },
  {
    role: "Viewers",
    text: "Read-only platform access to explore current drafts, review final content metrics, and inspect historical grades.",
  },
];

const personSelect = { select: { id: true, name: true, email: true } } as const;

export default async function SettingsAccessPage({ params }: { params: Promise<{ programId: string }> }) {
  const { programId } = await params;
  const { can } = await requireProgramPage(programId);

  const program = await prisma.lpProgram.findUnique({
    where: { id: programId },
    select: {
      id: true,
      title: true,
      directors: { select: { author: personSelect }, orderBy: { addedAt: "asc" } },
      owners: { select: { author: personSelect }, orderBy: { addedAt: "asc" } },
      contributors: { select: { role: true, addedAt: true, author: personSelect }, orderBy: { addedAt: "asc" } },
    },
  });
  if (!program) notFound();

  const people = can.manageContributors || can.manageDirectorsOwners ? await listPeople() : [];

  return (
    <div className="max-w-[1096px]">
      <header>
        <p className="text-xs font-bold tracking-wide text-cha-faint uppercase">{program.title}</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold">Settings &amp; Access</h1>
        <p className="mt-1.5 text-sm text-cha-muted">
          Configure roles, assign directors, and manage contributor teams.
        </p>
      </header>

      <section aria-labelledby="guidelines-heading" className="cha-card-outline mt-8 rounded-[18px] p-7">
        <h2 id="guidelines-heading" className="font-display text-lg font-extrabold">
          Permissions Guidelines
        </h2>
        <dl className="mt-4 flex flex-col gap-4">
          {GUIDELINES.map((g) => (
            <div key={g.role}>
              <dt className="text-sm font-bold text-cha-ink">{g.role}</dt>
              <dd className="mt-0.5 text-sm text-cha-muted">{g.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="cha-card-outline mt-6 grid gap-8 rounded-[18px] p-7 md:grid-cols-2">
        <PersonListCard
          programId={program.id}
          list="director"
          title="Program Director"
          noun="Director"
          emptyText="No directors."
          people={program.directors.map((d) => toPersonOption(d.author))}
          candidates={people}
          canManage={can.manageDirectorsOwners}
          protectLast
        />
        <PersonListCard
          programId={program.id}
          list="owner"
          title="Program Owner"
          noun="Owner"
          emptyText="No owners yet."
          people={program.owners.map((o) => toPersonOption(o.author))}
          candidates={people}
          canManage={can.manageDirectorsOwners}
        />
      </div>

      <div className="cha-card-outline mt-6 rounded-[18px] p-7">
        <ContributorsTable
          programId={program.id}
          rows={program.contributors.map((c) => ({
            ...toPersonOption(c.author),
            role: c.role,
            addedLabel: formatDate(c.addedAt),
          }))}
          candidates={people}
          canManage={can.manageContributors}
        />
      </div>
    </div>
  );
}
