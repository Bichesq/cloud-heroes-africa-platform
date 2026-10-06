import Link from "next/link";
import { buttonVariants, Card, Chip, Table } from "@heroui/react";
import { FolderOpen, Plus } from "lucide-react";
import { displayName, formatUpdated } from "@/lib/format";
import { learnerProgramUrl } from "@/lib/learner-link";
import { capabilitiesFor } from "@/lib/permissions";
import { canCreatePrograms, getAuthorPrograms } from "@/lib/program-access";
import { requireAuthor } from "@/lib/session";

/* Programs — Figma "Create Course View (For Admins)" → Programs frame:
 * page header, a summary line ("4 programs · 2 published · 2 drafts") with
 * "+ Create Program", then an 18px-radius bordered table (Program Name with
 * "Creator: …", Status badge, Modules, Last Updated, Edit / View).
 *
 * Lists only programs this author holds a role on (decision #2). Create
 * Program appears for Directors (plan §7). Edit appears for roles that can
 * edit Program Setup; others get Details (the same screen, read-only). View
 * opens the learner app and only exists for published programs. */

export default async function ProgramsPage() {
  const author = await requireAuthor();
  const [programs, canCreate] = await Promise.all([getAuthorPrograms(author.id), canCreatePrograms(author.id)]);
  const published = programs.filter((p) => p.published).length;

  return (
    <div className="max-w-[1092px]">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Programs</h1>
        <p className="mt-1.5 text-sm text-cha-muted">Create and manage the learning programs owned by your team.</p>
      </header>

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-sm">
          <span className="font-bold">
            {programs.length} program{programs.length === 1 ? "" : "s"}
          </span>
          <span className="ml-3 text-cha-muted">
            {published} published · {programs.length - published} draft{programs.length - published === 1 ? "" : "s"}
          </span>
        </p>
        {canCreate && (
          <Link href="/programs/new" className={`${buttonVariants({ size: "sm" })} rounded-md font-bold`}>
            <Plus size={15} aria-hidden />
            Create Program
          </Link>
        )}
      </div>

      {programs.length === 0 ? (
        <Card className="mt-4">
          <Card.Content className="flex flex-col items-center gap-3 py-14 text-center">
            <FolderOpen size={36} className="text-cha-faint" aria-hidden />
            <Card.Title className="font-display text-lg font-extrabold">No programs yet</Card.Title>
            <Card.Description className="max-w-md">
              You don&apos;t have a role on any program. Ask a Program Owner or Director to add you in Settings
              &amp; Access.
            </Card.Description>
          </Card.Content>
        </Card>
      ) : (
        <Table variant="secondary" className="mt-4 overflow-hidden rounded-[18px] border border-cha-border bg-cha-surface">
          <Table.ScrollContainer>
            <Table.Content aria-label="Programs" className="min-w-[760px]">
              <Table.Header className="bg-cha-canvas">
                <Table.Column isRowHeader className="w-[40%] text-[13px] font-bold text-cha-ink">
                  Program Name
                </Table.Column>
                <Table.Column className="text-[13px] font-bold text-cha-ink">Status</Table.Column>
                <Table.Column className="text-[13px] font-bold text-cha-ink">Modules</Table.Column>
                <Table.Column className="text-[13px] font-bold text-cha-ink">Last Updated</Table.Column>
                <Table.Column className="text-[13px] font-bold text-cha-ink">Actions</Table.Column>
              </Table.Header>
              <Table.Body>
                {programs.map((p) => {
                  const can = capabilitiesFor({
                    // Only the edit capability matters here; any row shown is viewable.
                    isCreator: false,
                    isInstructor: false,
                    contributorRole: p.contributors[0]?.role ?? null,
                    isDirector: p.directors.length > 0,
                    isOwner: p.owners.length > 0,
                  });
                  const viewUrl = p.published ? learnerProgramUrl(p.id) : null;
                  const outline = `${buttonVariants({ size: "sm", variant: "outline" })} rounded-md`;
                  return (
                    <Table.Row key={p.id} id={p.id} className="border-t border-cha-border">
                      <Table.Cell className="py-4">
                        <p className="text-sm font-bold text-cha-ink">{p.title}</p>
                        <p className="mt-0.5 text-[11px] text-cha-muted">
                          Creator: {p.creatorAuthor ? displayName(p.creatorAuthor) : "Not set"}
                        </p>
                      </Table.Cell>
                      <Table.Cell>
                        <Chip size="sm" variant="soft" color={p.published ? "success" : "warning"}>
                          {p.published ? "Published" : "Draft"}
                        </Chip>
                      </Table.Cell>
                      <Table.Cell className="text-sm text-cha-ink">{p._count.modules}</Table.Cell>
                      <Table.Cell className="text-[13px] text-cha-muted">{formatUpdated(p.updatedAt)}</Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <Link href={`/programs/${p.id}/setup`} className={outline}>
                            {can.editSetup ? "Edit" : "Details"}
                          </Link>
                          {viewUrl && (
                            <a href={viewUrl} target="_blank" rel="noopener noreferrer" className={outline}>
                              View
                            </a>
                          )}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      )}
    </div>
  );
}
