import { Card, Chip } from "@heroui/react";
import { FolderOpen } from "lucide-react";
import { getAuthorPrograms } from "@/lib/program-access";
import { requireAuthor } from "@/lib/session";

/* Programs landing — Figma Programs frame page header ("Programs" /
 * "Create and manage the learning programs owned by your team.").
 *
 * Sub-step 1 placeholder: lists only the programs this author holds a role
 * on (decision #2), read-only. The full Programs table (status, modules,
 * last updated, Edit/View, Create Program) is sub-step 2. An author with no
 * roles sees the empty state (decision #4: no allowlist — access comes from
 * per-program rows). */

export default async function ProgramsPage() {
  const author = await requireAuthor();
  const programs = await getAuthorPrograms(author.id);
  const published = programs.filter((p) => p.published).length;

  return (
    <div className="max-w-[1092px]">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Programs</h1>
        <p className="mt-1.5 text-sm text-cha-muted">
          Create and manage the learning programs owned by your team.
        </p>
      </header>

      {programs.length === 0 ? (
        <Card className="mt-8">
          <Card.Content className="flex flex-col items-center gap-3 py-14 text-center">
            <FolderOpen size={36} className="text-cha-faint" aria-hidden />
            <Card.Title className="font-display text-lg font-extrabold">No programs yet</Card.Title>
            <Card.Description className="max-w-md">
              You don&apos;t have a role on any program. Ask a Program Owner or Director to add
              you in Settings &amp; Access.
            </Card.Description>
          </Card.Content>
        </Card>
      ) : (
        <>
          <p className="mt-8 text-sm">
            <span className="font-bold">
              {programs.length} program{programs.length === 1 ? "" : "s"}
            </span>
            <span className="ml-3 text-cha-muted">
              {published} published · {programs.length - published} drafts
            </span>
          </p>
          <Card className="mt-4">
            <Card.Content className="p-0">
              <ul>
                {programs.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between border-b border-cha-border px-5 py-4 last:border-b-0"
                  >
                    <span className="text-sm font-bold">{p.title}</span>
                    <Chip size="sm" variant="soft" color={p.published ? "success" : "warning"}>
                      <Chip.Label>{p.published ? "Published" : "Draft"}</Chip.Label>
                    </Chip>
                  </li>
                ))}
              </ul>
            </Card.Content>
          </Card>
        </>
      )}
    </div>
  );
}
