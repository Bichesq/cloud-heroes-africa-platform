"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Alert, Button, buttonVariants, Chip } from "@heroui/react";
import { ArrowDown, ArrowUp, ChevronDown, Pencil, Plus } from "lucide-react";
import StructureDialog, { type DialogConfig } from "@/components/structure/StructureDialog";
import { addModule, addUnit, deleteModule, moveModule, moveUnit, updateModule } from "@/lib/actions/course-structure";
import type { FormState } from "@/lib/actions/form-state";

/* Course Structure tree — Figma "Course Structure" frame, Course tree card:
 * 18px-radius white card; each module is a 10px-radius block whose header
 * (chevron, "Module N: title", "N units", "+ Add Unit") sits on a tinted band
 * — orange-soft for the module you last worked in, canvas otherwise. Unit
 * rows: 30px sequence badge (orange for the unit you last worked on), title,
 * subtitle, and ↑ / ↓ / Edit.
 *
 * Added beyond the frame (plan §8, labelled custom composition): module
 * ↑ / ↓ / Edit (same buttons as unit rows), a Draft chip, and the add/edit
 * dialogs. The unit subtitle is "N topics · M min" — units have no type field,
 * so the frame's "Reading" / "Hands-on lab" can't be shown. A unit's Edit
 * opens the Unit Editor (View for read-only roles); each module links to its
 * Module Assessment.
 *
 * `canEdit` only decides what's rendered; every action re-checks the role. */

export type TreeUnit = {
  id: string;
  title: string;
  description: string;
  topics: number;
  durationMin: number;
  draft: boolean;
  /** A published unit with a saved, unpublished Unit Editor draft. */
  pendingChanges: boolean;
};
export type TreeModule = { id: string; title: string; description: string; units: TreeUnit[] };

function unitSubtitle(u: TreeUnit): string {
  const topics = u.topics === 0 ? "No topics yet" : `${u.topics} topic${u.topics === 1 ? "" : "s"}`;
  return u.durationMin > 0 ? `${topics} · ${u.durationMin} min` : topics;
}

const iconBtn = "rounded-md";

export default function CourseTree({
  programId,
  programTitle,
  modules,
  canEdit,
}: {
  programId: string;
  programTitle: string;
  modules: TreeModule[];
  canEdit: boolean;
}) {
  const [dialog, setDialog] = useState<DialogConfig | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [focus, setFocus] = useState<{ moduleId?: string; unitId?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function act(action: () => Promise<FormState>, nextFocus: { moduleId?: string; unitId?: string }) {
    setError(null);
    setFocus(nextFocus);
    startTransition(async () => {
      const result = await action();
      if (result && !result.ok) setError(result.error);
    });
  }

  function toggle(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const openAddModule = () =>
    setDialog({
      heading: "Add Module",
      submitLabel: "Add Module",
      titleLabel: "Module title",
      onSubmit: (v) => addModule({ programId, ...v }),
    });

  const openEditModule = (m: TreeModule) =>
    setDialog({
      heading: "Edit Module",
      submitLabel: "Save",
      titleLabel: "Module title",
      initialTitle: m.title,
      initialDescription: m.description,
      onSubmit: (v) => {
        setFocus({ moduleId: m.id });
        return updateModule({ programId, moduleId: m.id, ...v });
      },
      onDelete: () => deleteModule({ programId, moduleId: m.id }),
      deleteLabel: "Delete module",
      deleteBlockedReason:
        m.units.length > 0 ? "Only an empty module can be deleted. Move or delete its units first." : null,
    });

  const openAddUnit = (m: TreeModule) =>
    setDialog({
      heading: `Add Unit to ${m.title}`,
      submitLabel: "Add Unit",
      titleLabel: "Unit title",
      note: "New units are drafts: learners won't see them until they're published in the Unit Editor.",
      onSubmit: (v) => {
        setFocus({ moduleId: m.id });
        return addUnit({ programId, moduleId: m.id, ...v });
      },
    });

  return (
    <>
      <div className="mt-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-wide text-cha-muted">PROGRAM</p>
          <p className="font-display text-xl font-extrabold text-cha-ink">{programTitle}</p>
        </div>
        {canEdit && (
          <Button size="sm" className="rounded-md font-bold" onPress={openAddModule}>
            <Plus size={15} aria-hidden />
            Add Module
          </Button>
        )}
      </div>

      {error && (
        <Alert status="danger" className="mt-4">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      <div className="cha-card-outline mt-4 flex flex-col gap-4 rounded-[18px] p-6" aria-busy={pending}>
        {modules.length === 0 && (
          <p className="py-10 text-center text-sm text-cha-muted">
            No modules yet.{canEdit ? " Add the first module to start building this program." : ""}
          </p>
        )}

        {modules.map((m, mi) => {
          const open = !collapsed.has(m.id);
          const focused = focus.moduleId === m.id;
          const bodyId = `module-${m.id}-units`;
          return (
            <section
              key={m.id}
              aria-labelledby={`module-${m.id}-title`}
              className="overflow-hidden rounded-[10px] border border-cha-border"
            >
              <div
                className={`flex items-center gap-3 px-4 py-3.5 ${focused ? "bg-cha-orange-soft/60" : "bg-cha-canvas"}`}
              >
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  aria-expanded={open}
                  aria-controls={bodyId}
                  aria-label={open ? `Collapse ${m.title}` : `Expand ${m.title}`}
                  onPress={() => toggle(m.id)}
                >
                  <ChevronDown size={14} aria-hidden className={`transition-transform ${open ? "" : "-rotate-90"}`} />
                </Button>
                <div className="min-w-0 flex-1">
                  <h2 id={`module-${m.id}-title`} className="truncate text-sm font-extrabold text-cha-ink">
                    Module {mi + 1}: {m.title}
                  </h2>
                  <p className="text-[11px] text-cha-muted">
                    {m.units.length} unit{m.units.length === 1 ? "" : "s"}
                  </p>
                </div>
                {!canEdit && (
                  <Link
                    href={`/programs/${programId}/assessments/${m.id}`}
                    className={`${buttonVariants({ size: "sm", variant: "outline" })} rounded-md bg-cha-surface font-bold`}
                  >
                    Assessment
                  </Link>
                )}
                {canEdit && (
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="outline"
                      className={iconBtn}
                      aria-label={`Move ${m.title} up`}
                      isDisabled={pending || mi === 0}
                      onPress={() => act(() => moveModule({ programId, moduleId: m.id, direction: "up" }), { moduleId: m.id })}
                    >
                      <ArrowUp size={14} aria-hidden />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="outline"
                      className={iconBtn}
                      aria-label={`Move ${m.title} down`}
                      isDisabled={pending || mi === modules.length - 1}
                      onPress={() => act(() => moveModule({ programId, moduleId: m.id, direction: "down" }), { moduleId: m.id })}
                    >
                      <ArrowDown size={14} aria-hidden />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="outline"
                      className={iconBtn}
                      aria-label={`Edit ${m.title}`}
                      onPress={() => openEditModule(m)}
                    >
                      <Pencil size={14} aria-hidden />
                    </Button>
                    <Link
                      href={`/programs/${programId}/assessments/${m.id}`}
                      className={`${buttonVariants({ size: "sm", variant: "outline" })} rounded-md bg-cha-surface font-bold`}
                    >
                      Assessment
                    </Link>
                    <Button size="sm" variant="outline" className="rounded-md bg-cha-surface font-bold" onPress={() => openAddUnit(m)}>
                      <Plus size={14} aria-hidden />
                      Add Unit
                    </Button>
                  </div>
                )}
              </div>

              {open && (
                <ol id={bodyId} className="divide-y divide-cha-border">
                  {m.units.length === 0 && <li className="px-4 py-4 text-sm text-cha-muted">No units yet.</li>}
                  {m.units.map((u, ui) => {
                    const current = focus.unitId === u.id;
                    return (
                      <li key={u.id} className="flex items-center gap-4 px-4 py-3">
                        <span
                          aria-hidden
                          className={`flex size-[30px] shrink-0 items-center justify-center rounded-md text-[13px] font-extrabold ${
                            current ? "bg-cha-orange text-white" : "bg-cha-canvas text-cha-ink"
                          }`}
                        >
                          {ui + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={`flex items-center gap-2 truncate text-sm text-cha-ink ${current ? "font-bold" : "font-medium"}`}>
                            <span className="sr-only">Unit {ui + 1}: </span>
                            {u.title}
                            {u.draft && (
                              <Chip size="sm" variant="soft" color="warning">
                                Draft
                              </Chip>
                            )}
                            {u.pendingChanges && (
                              <Chip size="sm" variant="soft" color="accent">
                                Unpublished changes
                              </Chip>
                            )}
                          </p>
                          <p className="text-[11px] text-cha-muted">{unitSubtitle(u)}</p>
                        </div>
                        {canEdit && (
                          <div className="flex shrink-0 items-center gap-2">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="outline"
                              className={iconBtn}
                              aria-label={`Move ${u.title} up`}
                              isDisabled={pending || ui === 0}
                              onPress={() => act(() => moveUnit({ programId, unitId: u.id, direction: "up" }), { moduleId: m.id, unitId: u.id })}
                            >
                              <ArrowUp size={14} aria-hidden />
                            </Button>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="outline"
                              className={iconBtn}
                              aria-label={`Move ${u.title} down`}
                              isDisabled={pending || ui === m.units.length - 1}
                              onPress={() => act(() => moveUnit({ programId, unitId: u.id, direction: "down" }), { moduleId: m.id, unitId: u.id })}
                            >
                              <ArrowDown size={14} aria-hidden />
                            </Button>
                            <Link href={`/programs/${programId}/units/${u.id}`} className={`${buttonVariants({ size: "sm", variant: "outline" })} rounded-md font-bold`}>
                              Edit
                            </Link>
                          </div>
                        )}
                        {!canEdit && (
                          <Link href={`/programs/${programId}/units/${u.id}`} className={`${buttonVariants({ size: "sm", variant: "outline" })} rounded-md font-bold`}>
                            View
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
          );
        })}
      </div>

      {canEdit && <StructureDialog config={dialog} onClose={() => setDialog(null)} />}
    </>
  );
}
