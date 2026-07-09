"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import type { Program, UnitCompletion } from "@/types";
import { moduleStats, programStats, nextIncompleteUnit } from "@/lib/curriculum-utils";

const TYPE_LABEL: Record<string, string> = {
  lesson: "Lesson",
  lab: "Lab",
  assessment: "Assessment",
};

export default function MyProgramClient({
  program,
  completedUnitIds,
}: {
  program: Program;
  completedUnitIds: string[];
}) {
  const [completed, setCompleted] = useState<Set<string>>(new Set(completedUnitIds));
  const [busyUnitId, setBusyUnitId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const completions: UnitCompletion[] = useMemo(
    () =>
      Array.from(completed).map((unitId) => ({
        studentId: "",
        unitId,
        completedAt: "",
      })),
    [completed]
  );

  const modules = useMemo(() => moduleStats(program, completions), [program, completions]);
  const overall = useMemo(() => programStats(program, completions), [program, completions]);
  const next = useMemo(() => nextIncompleteUnit(program, completions), [program, completions]);

  async function markComplete(unitId: string) {
    setBusyUnitId(unitId);
    setError(null);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitId }),
      });
      if (!res.ok) throw new Error("failed");
      setCompleted((prev) => new Set(prev).add(unitId));
    } catch {
      setError("Couldn't mark that unit complete. Please try again.");
    } finally {
      setBusyUnitId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[32px] font-extrabold leading-[1.1]">
          My Program
        </h1>
        <div className="mt-2 text-[17px] font-semibold text-cha-muted">
          {program.title}
        </div>
      </div>

      {error && (
        <div
          role="status"
          className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <div className="cha-card flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <div className="text-sm font-semibold text-cha-muted">Overall Progress</div>
          <div className="mt-1 font-display text-[30px] font-extrabold">{overall.percent}%</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-cha-muted">Modules Completed</div>
          <div className="mt-1 font-display text-[22px] font-bold">
            {overall.completedModules}/{overall.totalModules}
          </div>
        </div>
        {next && (
          <div className="text-right">
            <div className="text-sm font-semibold text-cha-muted">Up Next</div>
            <div className="mt-1 text-sm font-bold">{next.unit.title}</div>
            <div className="text-xs text-cha-faint">Module {next.moduleOrder}: {next.moduleTitle}</div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {modules.map((mStat) => {
          const mod = program.modules.find((m) => m.id === mStat.moduleId)!;
          const units = [...mod.units].sort((a, b) => a.order - b.order);
          return (
            <div
              key={mod.id}
              id={`module-${mod.id}`}
              className="cha-card flex flex-col gap-4 p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-cha-faint">
                    Module {mStat.order}
                  </div>
                  <div className="font-display text-lg font-bold">{mStat.title}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{mStat.percent}%</div>
                  <div className="text-xs text-cha-muted">
                    {mStat.completedUnits}/{mStat.totalUnits} units
                  </div>
                </div>
              </div>

              <div className="h-2.5 w-full overflow-hidden rounded-full bg-cha-surface-2">
                <div
                  className={`h-full rounded-full transition-all ${
                    mStat.complete
                      ? "bg-cha-blue"
                      : "bg-gradient-to-r from-[#FF8D28] to-cha-orange"
                  }`}
                  style={{ width: `${mStat.percent}%` }}
                  role="progressbar"
                  aria-valuenow={mStat.percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={mStat.title}
                />
              </div>

              <div className="flex flex-col gap-2">
                {units.map((u) => {
                  const done = completed.has(u.id);
                  const busy = busyUnitId === u.id;
                  return (
                    <div
                      key={u.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-cha-border bg-cha-surface-2 px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {done ? (
                          <CheckCircle2 size={18} className="shrink-0 text-cha-blue" />
                        ) : (
                          <Circle size={18} className="shrink-0 text-cha-faint" />
                        )}
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{u.title}</div>
                          <div className="text-xs text-cha-faint">
                            {TYPE_LABEL[u.type] ?? u.type} · {u.durationMin} min
                          </div>
                        </div>
                      </div>
                      {done ? (
                        <span className="shrink-0 text-xs font-bold text-cha-blue">Completed</span>
                      ) : (
                        <button
                          onClick={() => markComplete(u.id)}
                          disabled={busy}
                          className="flex shrink-0 items-center gap-1.5 rounded-full bg-cha-orange px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-cha-orange-strong disabled:opacity-60"
                        >
                          {busy && <Loader2 size={13} className="animate-spin" />}
                          {busy ? "Saving…" : "Mark complete"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
