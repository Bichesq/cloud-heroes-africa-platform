"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Tabs } from "@heroui/react";
import { ClipboardList, LifeBuoy, StickyNote } from "lucide-react";
import type { TicketContext } from "@/types";
import HelpModal from "@/components/help/HelpModal";

/* Right-side secondary panel — Notes and Assignments tabs plus the embedded
 * Help entry, keeping non-essential material out of the main area
 * (decision 2026-07-09).
 *
 * 2026-09-23 (plan step 3): the "Lesson Script" tab is removed — it
 * re-rendered the same reading already shown in the center panel, a leftover
 * of the video-based design (Sept 21 decision). */

export default function RightPanel({
  unitId,
  initialNote,
  assignments,
  helpContext,
}: {
  unitId: string;
  initialNote: string;
  assignments: { id: string; title: string; description: string }[];
  helpContext: TicketContext;
}) {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <aside className="cha-card hidden w-[320px] shrink-0 flex-col overflow-hidden rounded-2xl xl:flex">
      <Tabs variant="secondary" defaultSelectedKey="notes" className="flex min-h-0 flex-1 flex-col">
        <Tabs.ListContainer>
          <Tabs.List aria-label="Unit side panel">
            <Tabs.Tab id="notes">
              <StickyNote size={15} />
              Notes
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="assignments">
              <ClipboardList size={15} />
              Assignments
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel id="notes" className="min-h-0 flex-1 overflow-y-auto p-5">
          <NotesTab unitId={unitId} initialNote={initialNote} />
        </Tabs.Panel>
        <Tabs.Panel id="assignments" className="min-h-0 flex-1 overflow-y-auto p-5">
          <AssignmentsTab assignments={assignments} />
        </Tabs.Panel>
      </Tabs>

      <div className="border-t border-cha-border p-4">
        <Button fullWidth variant="outline" onPress={() => setHelpOpen(true)}>
          <LifeBuoy size={15} />
          Help
        </Button>
      </div>

      <HelpModal isOpen={helpOpen} onOpenChange={setHelpOpen} context={helpContext} />
    </aside>
  );
}

/* ------------------------------ Notes ------------------------------- */

function NotesTab({ unitId, initialNote }: { unitId: string; initialNote: string }) {
  const [body, setBody] = useState(initialNote);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced autosave — notes are per-unit and work for reading and
  // TTS-based lessons alike (no video-anchored notes UX).
  useEffect(() => {
    if (body === initialNote && state === "idle") return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setState("saving");
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitId, body }),
      });
      setState(res.ok ? "saved" : "error");
    }, 800);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body, unitId]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-bold">My notes for this unit</h3>
        <span className="text-[11px] text-cha-faint">
          {state === "saving" && "Saving…"}
          {state === "saved" && "Saved"}
          {state === "error" && (
            <span className="text-red-500">Couldn&apos;t save</span>
          )}
        </span>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Capture what you're learning — key terms, questions to revisit, ideas from the reading…"
        className="mt-3 min-h-[280px] flex-1 resize-none rounded-xl border border-cha-border bg-cha-surface p-3 text-[13px] leading-relaxed outline-none placeholder:text-cha-faint focus:border-cha-blue"
      />
    </div>
  );
}

/* --------------------------- Assignments ---------------------------- */

function AssignmentsTab({
  assignments,
}: {
  assignments: { id: string; title: string; description: string }[];
}) {
  if (assignments.length === 0) {
    return (
      <p className="text-sm text-cha-muted">
        No assignments are attached to this unit yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[13px] font-bold">Assignments</h3>
      {assignments.map((a) => (
        <div key={a.id} className="rounded-xl border border-cha-border p-3.5">
          <div className="text-[13px] font-semibold">{a.title}</div>
          <p className="mt-1 text-[12px] leading-relaxed text-cha-muted">
            {a.description}
          </p>
          <p className="mt-2 text-[11px] font-semibold text-cha-faint">
            Submissions open soon — your instructor will announce the workflow.
          </p>
        </div>
      ))}
    </div>
  );
}
