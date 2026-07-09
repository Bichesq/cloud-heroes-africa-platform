import type { Module, Program, Unit, UnitCompletion } from "@/types";

/* Pure curriculum math — no I/O, unit-testable. Consumes a Program + the
 * student's UnitCompletion[] (from lib/curriculum.ts) and derives resume
 * logic, module/program progress, and the "Your Progress" widget window. */

export type ModuleStats = {
  moduleId: string;
  title: string;
  order: number;
  completedUnits: number;
  totalUnits: number;
  percent: number; // 0–100, rounded
  complete: boolean;
};

export type ProgramStats = {
  programId: string;
  title: string;
  completedModules: number;
  totalModules: number;
  completedUnits: number;
  totalUnits: number;
  percent: number; // 0–100, rounded, unit-weighted across the whole program
};

export type NextUnit = {
  moduleId: string;
  moduleTitle: string;
  moduleOrder: number;
  unit: Unit;
};

function sortedModules(program: Program): Module[] {
  return [...program.modules].sort((a, b) => a.order - b.order);
}

function sortedUnits(module: Module): Unit[] {
  return [...module.units].sort((a, b) => a.order - b.order);
}

function completedSet(completions: UnitCompletion[]): Set<string> {
  return new Set(completions.map((c) => c.unitId));
}

export function moduleStats(
  program: Program,
  completions: UnitCompletion[]
): ModuleStats[] {
  const done = completedSet(completions);
  return sortedModules(program).map((m) => {
    const totalUnits = m.units.length;
    const completedUnits = m.units.filter((u) => done.has(u.id)).length;
    const percent = totalUnits === 0 ? 0 : Math.round((completedUnits / totalUnits) * 100);
    return {
      moduleId: m.id,
      title: m.title,
      order: m.order,
      completedUnits,
      totalUnits,
      percent,
      complete: totalUnits > 0 && completedUnits === totalUnits,
    };
  });
}

export function programStats(
  program: Program,
  completions: UnitCompletion[]
): ProgramStats {
  const stats = moduleStats(program, completions);
  const completedModules = stats.filter((m) => m.complete).length;
  const totalUnits = stats.reduce((sum, m) => sum + m.totalUnits, 0);
  const completedUnits = stats.reduce((sum, m) => sum + m.completedUnits, 0);
  return {
    programId: program.id,
    title: program.title,
    completedModules,
    totalModules: stats.length,
    completedUnits,
    totalUnits,
    percent: totalUnits === 0 ? 0 : Math.round((completedUnits / totalUnits) * 100),
  };
}

/** First incomplete unit in curriculum order (module order, then unit order).
 * Rolls over to the next module automatically. `null` when every unit in
 * the program is complete. */
export function nextIncompleteUnit(
  program: Program,
  completions: UnitCompletion[]
): NextUnit | null {
  const done = completedSet(completions);
  for (const m of sortedModules(program)) {
    for (const u of sortedUnits(m)) {
      if (!done.has(u.id)) {
        return { moduleId: m.id, moduleTitle: m.title, moduleOrder: m.order, unit: u };
      }
    }
  }
  return null;
}

export type ResumeState =
  | { kind: "no-program" }
  | { kind: "complete"; programTitle: string }
  | {
      kind: "in-progress";
      programTitle: string;
      percent: number;
      moduleId: string;
      moduleOrder: number;
      moduleTitle: string;
      moduleDescription: string;
    };

/** Drives the dashboard's "Resume Where You Left Off" banner: real overall
 * progress + the canonical next unit's module, or the completion / no-track
 * empty states. */
export function resumeState(
  program: Program | null,
  completions: UnitCompletion[]
): ResumeState {
  if (!program) return { kind: "no-program" };

  const next = nextIncompleteUnit(program, completions);
  if (!next) return { kind: "complete", programTitle: program.title };

  const mod = program.modules.find((m) => m.id === next.moduleId);
  return {
    kind: "in-progress",
    programTitle: program.title,
    percent: programStats(program, completions).percent,
    moduleId: next.moduleId,
    moduleOrder: next.moduleOrder,
    moduleTitle: next.moduleTitle,
    moduleDescription: mod?.description ?? "",
  };
}

/** Window of modules to show in the "Your Progress" widget: starts at the
 * first incomplete module (so the list stays relevant), capped at `cap`.
 * Falls back to the start of the list once the whole program is complete. */
export function progressWidgetModules(
  stats: ModuleStats[],
  cap = 4
): { visible: ModuleStats[]; hasMore: boolean } {
  const startIndex = stats.findIndex((m) => !m.complete);
  const start = startIndex === -1 ? 0 : startIndex;
  const visible = stats.slice(start, start + cap);
  return { visible, hasMore: stats.length > visible.length };
}
