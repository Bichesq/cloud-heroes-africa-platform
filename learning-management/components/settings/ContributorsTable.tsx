"use client";

import { useState, useTransition, type Key } from "react";
import { Alert, Button, Label, ListBox, Modal, Select } from "@heroui/react";
import { UserPlus } from "lucide-react";
import ConfirmRemoveButton from "@/components/people/ConfirmRemoveButton";
import PersonSelect from "@/components/people/PersonSelect";
import type { PersonOption } from "@/components/people/types";
import { addContributor, changeContributorRole, removeContributor } from "@/lib/actions/program-people";

/* Settings & Access → Contributors (Figma TableCard): "Contributors" +
 * "Add Contributor", then Name / Email / Role (dropdown) / Date Added /
 * Actions (Remove). Owners and Directors manage it (plan §7); everyone else
 * sees roles as text. The server actions re-check the role on this program. */

type Role = "editor" | "reviewer" | "viewer";

export type ContributorRow = PersonOption & { role: Role; addedLabel: string };

const ROLES: { id: Role; label: string }[] = [
  { id: "editor", label: "Editor" },
  { id: "reviewer", label: "Reviewer" },
  { id: "viewer", label: "Viewer" },
];
const roleLabel = (r: Role) => ROLES.find((x) => x.id === r)?.label ?? r;
const isRole = (k: Key | Key[] | null): k is Role => typeof k === "string" && ROLES.some((r) => r.id === k);

function RoleSelect({
  label,
  value,
  onChange,
  isDisabled,
  hideLabel,
}: {
  label: string;
  value: Role | null;
  onChange: (r: Role) => void;
  isDisabled?: boolean;
  hideLabel?: boolean;
}) {
  return (
    <Select
      aria-label={hideLabel ? label : undefined}
      value={value}
      onChange={(k) => isRole(k) && onChange(k)}
      isDisabled={isDisabled}
      placeholder="Choose a role"
      className="w-[150px]"
    >
      {!hideLabel && <Label className="text-sm font-semibold">{label}</Label>}
      <Select.Trigger className="rounded-md">
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {ROLES.map((r) => (
            <ListBox.Item key={r.id} id={r.id} textValue={r.label}>
              {r.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

export default function ContributorsTable({
  programId,
  rows,
  candidates,
  canManage,
}: {
  programId: string;
  rows: ContributorRow[];
  candidates: PersonOption[];
  canManage: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [newPerson, setNewPerson] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<Role>("viewer");
  const [modalError, setModalError] = useState<string | null>(null);

  const listed = new Set(rows.map((r) => r.id));
  const addable = candidates.filter((c) => !listed.has(c.id));

  function run(action: () => Promise<{ ok: boolean; error?: string } | null>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result && !result.ok) setError(result.error ?? "Something went wrong.");
    });
  }

  function submitAdd() {
    if (!newPerson) return;
    setModalError(null);
    startTransition(async () => {
      const result = await addContributor({ programId, authorId: newPerson, role: newRole });
      if (result && !result.ok) {
        setModalError(result.error);
        return;
      }
      setOpen(false);
      setNewPerson(null);
      setNewRole("viewer");
    });
  }

  return (
    <section aria-labelledby="contributors-heading">
      <div className="flex items-center justify-between gap-4">
        <h2 id="contributors-heading" className="font-display text-lg font-extrabold">
          Contributors
        </h2>
        {canManage && (
          <Button size="sm" className="rounded-md font-bold" onPress={() => setOpen(true)} isDisabled={pending}>
            <UserPlus size={15} aria-hidden />
            Add Contributor
          </Button>
        )}
      </div>

      {/* Custom composition: a semantic <table>, not HeroUI Table. Inside
          HeroUI Table (React Aria grid) cells, pointer presses on overlay
          triggers (this row's role Select, Remove's AlertDialog) don't open
          them — only the keyboard does (verified 2026-09-28). Styled to match
          the Programs table. */}
      <div className="mt-4 overflow-x-auto rounded-md border border-cha-border">
        <table className="w-full min-w-[720px] text-left">
          <caption className="sr-only">Contributors</caption>
          <thead className="bg-cha-canvas">
            <tr>
              {["Name", "Email", "Role", "Date Added", canManage ? "Actions" : ""].map((h, i) => (
                <th key={i} scope="col" className="px-4 py-3 text-[13px] font-bold text-cha-ink">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-cha-muted">
                  No contributors yet.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-cha-border">
                <th scope="row" className="px-4 py-3 text-sm font-semibold text-cha-ink">
                  {r.label}
                </th>
                <td className="px-4 py-3 text-sm text-cha-muted">{r.email}</td>
                <td className="px-4 py-3">
                  {canManage ? (
                    <RoleSelect
                      label={`Role for ${r.label}`}
                      hideLabel
                      value={r.role}
                      isDisabled={pending}
                      onChange={(role) =>
                        role !== r.role && run(() => changeContributorRole({ programId, authorId: r.id, role }))
                      }
                    />
                  ) : (
                    <span className="text-sm">{roleLabel(r.role)}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-cha-muted">{r.addedLabel}</td>
                <td className="px-4 py-3">
                  {canManage && (
                    <ConfirmRemoveButton
                      heading={`Remove ${r.label}?`}
                      body="They'll lose their contributor access to this program. You can add them again later."
                      isDisabled={pending}
                      onConfirm={() => run(() => removeContributor({ programId, authorId: r.id }))}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <Alert status="danger" className="mt-3">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      {canManage && (
        <Modal.Backdrop isOpen={open} onOpenChange={setOpen}>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-[440px]">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Add Contributor</Modal.Heading>
              </Modal.Header>
              <Modal.Body className="flex flex-col gap-4">
                <PersonSelect
                  label="Person"
                  people={addable}
                  value={newPerson}
                  onChange={setNewPerson}
                  isDisabled={addable.length === 0}
                  placeholder={addable.length === 0 ? "Everyone is already a contributor" : "Choose a person"}
                  description="People appear here once they've signed in to Learning Management."
                />
                <RoleSelect label="Role" value={newRole} onChange={setNewRole} />
                {modalError && (
                  <Alert status="danger">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Description>{modalError}</Alert.Description>
                    </Alert.Content>
                  </Alert>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button slot="close" variant="tertiary">
                  Cancel
                </Button>
                <Button className="font-bold" isDisabled={!newPerson || pending} onPress={submitAdd}>
                  Add Contributor
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      )}
    </section>
  );
}
