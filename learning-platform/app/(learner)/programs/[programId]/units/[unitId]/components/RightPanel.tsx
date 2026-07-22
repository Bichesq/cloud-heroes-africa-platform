"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ClipboardList,
  FileText,
  LifeBuoy,
  StickyNote,
} from "lucide-react";
import type { LpItem, TicketContext } from "@/types";
import { blocksToScript } from "@/lib/tts/serialize";
import HelpModal from "@/components/help/HelpModal";

/* Right-side secondary panel — the tabs/panels model the design evaluation
 * asked for in place of the mockup's persistent "Learning Material" sidebar:
 * Lesson Script (the reading text — this is a reading panel, NOT a video
 * transcript), Notes, Assignments, and the embedded Help entry. */

type Tab = "script" | "notes" | "assignments" | "help";

const TABS: { id: Tab; label: string; icon: typeof FileText }[] = [
  { id: "script", label: "Lesson Script", icon: FileText },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "assignments", label: "Assignments", icon: ClipboardList },
  { id: "help", label: "Help", icon: LifeBuoy },
];

export default function RightPanel({
  currentItem,
  unitId,
  initialNote,
  assignments,
  helpContext,
}: {
  currentItem: LpItem;
  unitId: string;
  initialNote: string;
  assignments: { id: string; title: string; description: string }[];
  helpContext: TicketContext;
}) {
  const [tab, setTab] = useState<Tab>("script");
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <aside className="cha-card hidden w-[320px] shrink-0 flex-col overflow-hidden rounded-2xl xl:flex">
      {/* Tab strip */}
      <div className="flex border-b border-cha-border">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              if (id === "help") setHelpOpen(true);
              else setTab(id);
            }}
            aria-pressed={tab === id && id !== "help"}
            title={label}
            className={`flex flex-1 flex-col items-center gap-1 px-2 py-3 text-[11px] font-semibold transition-colors ${
              tab === id && id !== "help"
                ? "border-b-2 border-cha-orange text-cha-ink"
                : "text-cha-muted hover:text-cha-ink"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {tab === "script" && <ScriptTab item={currentItem} />}
        {tab === "notes" && <NotesTab unitId={unitId} initialNote={initialNote} />}
        {tab === "assignments" && <AssignmentsTab assignments={assignments} />}
      </div>

      <HelpModal isOpen={helpOpen} onOpenChange={setHelpOpen} context={helpContext} />
    </aside>
  );
}

/* ------------------------------ Script ------------------------------ */

function ScriptTab({ item }: { item: LpItem }) {
  const script = useMemo(
    () => (item.blocks ? blocksToScript(item.blocks) : ""),
    [item]
  );

  if (item.type !== "reading") {
    return (
      <p className="text-sm text-cha-muted">
        The lesson script belongs to reading items — open a reading to see its
        full text here.
      </p>
    );
  }

  return (
    <div>
      <h3 className="text-[13px] font-bold">{item.title}</h3>
      <div className="mt-3 flex flex-col gap-3 text-[13px] leading-relaxed text-cha-muted">
        {script.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
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
