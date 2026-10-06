"use client";

import { useState, useTransition } from "react";
import { Alert, Button } from "@heroui/react";
import { UserPlus } from "lucide-react";
import ConfirmRemoveButton from "@/components/people/ConfirmRemoveButton";
import PersonSelect from "@/components/people/PersonSelect";
import type { PersonOption } from "@/components/people/types";
import { addPerson, removePerson } from "@/lib/actions/program-people";

/* One add/remove list of people on a program: Instructors (Program Setup),
 * Directors and Owners (Settings & Access — lists, not the Figma's single
 * dropdowns, per the 2026-09-17 decision).
 *
 * `canManage` only decides what's rendered; the server action checks the
 * author's role on this program again (SECURITY.md §3). */

type List = "director" | "owner" | "instructor";

export default function PersonListCard({
  programId,
  list,
  title,
  noun,
  emptyText,
  people,
  candidates,
  canManage,
  protectLast = false,
}: {
  programId: string;
  list: List;
  title: string;
  noun: string;
  emptyText: string;
  people: PersonOption[];
  candidates: PersonOption[];
  canManage: boolean;
  /** Disable Remove on the only remaining person (Directors). */
  protectLast?: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onList = new Set(people.map((p) => p.id));
  const addable = candidates.filter((c) => !onList.has(c.id));

  function run(action: () => Promise<{ ok: boolean; error?: string } | null>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result && !result.ok) setError(result.error ?? "Something went wrong.");
      else setSelected(null);
    });
  }

  return (
    <section aria-labelledby={`${list}-heading`}>
      <h3 id={`${list}-heading`} className="text-sm font-bold text-cha-ink">
        {title}
      </h3>

      <ul className="mt-2 divide-y divide-cha-border rounded-md border border-cha-border">
        {people.length === 0 && <li className="px-3.5 py-3 text-sm text-cha-muted">{emptyText}</li>}
        {people.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-cha-ink">{p.label}</p>
              {p.label !== p.email && <p className="truncate text-xs text-cha-muted">{p.email}</p>}
            </div>
            {canManage && (
              <ConfirmRemoveButton
                heading={`Remove ${p.label}?`}
                body={`They'll no longer be a ${noun} on this program. You can add them again later.`}
                isDisabled={pending || (protectLast && people.length === 1)}
                onConfirm={() => run(() => removePerson({ programId, authorId: p.id, list }))}
              />
            )}
          </li>
        ))}
      </ul>
      {canManage && protectLast && people.length === 1 && (
        <p className="mt-1.5 text-xs text-cha-muted">A program needs at least one {noun}.</p>
      )}

      {canManage && (
        <div className="mt-3 flex items-end gap-2">
          <PersonSelect
            label={`Add ${noun}`}
            people={addable}
            value={selected}
            onChange={setSelected}
            isDisabled={pending || addable.length === 0}
            placeholder={addable.length === 0 ? "Everyone is already listed" : "Choose a person"}
            className="min-w-0 flex-1"
          />
          <Button
            size="md"
            variant="secondary"
            className="rounded-md"
            isDisabled={!selected || pending}
            onPress={() => selected && run(() => addPerson({ programId, authorId: selected, list }))}
          >
            <UserPlus size={15} aria-hidden />
            Add
          </Button>
        </div>
      )}

      {error && (
        <Alert status="danger" className="mt-3">
          <Alert.Content>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}
    </section>
  );
}
