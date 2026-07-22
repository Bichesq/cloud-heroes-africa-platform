import type {
  AssessmentResult,
  LpItem,
  LpModule,
  LpProgram,
  LpSection,
  LpUnit,
  PointsEntry,
  ReadinessLevel,
  StudentUnit,
  StudentUnitStatus,
  UnitGoal,
} from "@/types";

/* Pure, I/O-free learning-state math (mirrors student-hub/lib/curriculum-utils.ts).
 * Everything takes plain records and returns plain values so it is unit-testable
 * and survives the JSON-store → Postgres swap unchanged. */

/* --------------------------- item ordering --------------------------- */

/** All items of a unit in learning order (section order, then item order). */
export function flattenItems(unit: LpUnit): LpItem[] {
  return [...unit.sections]
    .sort((a, b) => a.order - b.order)
    .flatMap((s) => [...s.items].sort((a, b) => a.order - b.order));
}

/** Percentage (0–100) of the unit's items the student has completed. */
export function unitProgress(unit: LpUnit, completedItemIds: Set<string>): number {
  const items = flattenItems(unit);
  if (items.length === 0) return 0;
  const done = items.filter((i) => completedItemIds.has(i.id)).length;
  return Math.round((done / items.length) * 100);
}

/** First incomplete item in learning order — powers "Go to Next Item" and
 * resume. Null when every item is done. */
export function nextItem(
  unit: LpUnit,
  completedItemIds: Set<string>
): LpItem | null {
  return flattenItems(unit).find((i) => !completedItemIds.has(i.id)) ?? null;
}

/** The item after `itemId` in learning order (null at the end). */
export function itemAfter(unit: LpUnit, itemId: string): LpItem | null {
  const items = flattenItems(unit);
  const idx = items.findIndex((i) => i.id === itemId);
  if (idx === -1) return null;
  return items[idx + 1] ?? null;
}

export type ItemLocation = {
  program: LpProgram;
  module: LpModule;
  unit: LpUnit;
  section: LpSection;
  item: LpItem;
};

/** Finds where an item lives across all programs (item ids are globally
 * unique). Null if unknown. */
export function locateItem(
  programs: LpProgram[],
  itemId: string
): ItemLocation | null {
  for (const program of programs) {
    for (const module of program.modules) {
      for (const unit of module.units) {
        for (const section of unit.sections) {
          const item = section.items.find((i) => i.id === itemId);
          if (item) return { program, module, unit, section, item };
        }
      }
    }
  }
  return null;
}

/** Reading items only — unit "Completed" means the content is finished;
 * knowledge checks affect verification, not completion (requirements §4/§6). */
export function readingItems(unit: LpUnit): LpItem[] {
  return flattenItems(unit).filter((i) => i.type === "reading");
}

/* ------------------------- points & locking -------------------------- */

export function pointsBalance(entries: PointsEntry[]): number {
  return entries.reduce((sum, e) => sum + e.points, 0);
}

export type UnitAccess = {
  locked: boolean;
  currentPoints: number;
  requiredPoints: number;
};

/** Points-based unlocking (decision 2026-07-09): a unit opens once the
 * student's balance reaches its threshold. Verified/completed units never
 * re-lock. */
export function unitAccess(
  unit: LpUnit,
  balance: number,
  studentUnit?: StudentUnit
): UnitAccess {
  const started = !!studentUnit;
  return {
    locked: !started && balance < unit.pointsRequired,
    currentPoints: balance,
    requiredPoints: unit.pointsRequired,
  };
}

/* --------------------------- unit status ----------------------------- */

export type UnitDisplayStatus = "locked" | "available" | StudentUnitStatus;

/** Single display status combining the lock state with the dual
 * Completed / Competent-Verified progression model. */
export function unitDisplayStatus(
  unit: LpUnit,
  balance: number,
  studentUnit?: StudentUnit
): UnitDisplayStatus {
  if (studentUnit) return studentUnit.status;
  return balance < unit.pointsRequired ? "locked" : "available";
}

export const UNIT_STATUS_LABEL: Record<UnitDisplayStatus, string> = {
  locked: "Locked",
  available: "Not started",
  in_progress: "In progress",
  completed: "Completed",
  retake: "Retake",
  verified: "Competent / Verified",
};

/* ------------------------ module / program --------------------------- */

export type ModuleStats = {
  moduleId: string;
  totalUnits: number;
  completedUnits: number;
  verifiedUnits: number;
  progressPct: number;
};

export function moduleStats(
  module: LpModule,
  studentUnits: Map<string, StudentUnit>
): ModuleStats {
  const total = module.units.length;
  const completed = module.units.filter((u) => {
    const su = studentUnits.get(u.id);
    return su?.status === "completed" || su?.status === "verified";
  }).length;
  const verified = module.units.filter(
    (u) => studentUnits.get(u.id)?.status === "verified"
  ).length;
  return {
    moduleId: module.id,
    totalUnits: total,
    completedUnits: completed,
    verifiedUnits: verified,
    progressPct: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export type ProgramStats = {
  totalUnits: number;
  completedUnits: number;
  verifiedUnits: number;
  progressPct: number;
};

export function programStats(
  program: LpProgram,
  studentUnits: Map<string, StudentUnit>
): ProgramStats {
  const perModule = program.modules.map((m) => moduleStats(m, studentUnits));
  const totals = perModule.reduce(
    (acc, m) => ({
      totalUnits: acc.totalUnits + m.totalUnits,
      completedUnits: acc.completedUnits + m.completedUnits,
      verifiedUnits: acc.verifiedUnits + m.verifiedUnits,
    }),
    { totalUnits: 0, completedUnits: 0, verifiedUnits: 0 }
  );
  return {
    ...totals,
    progressPct:
      totals.totalUnits === 0
        ? 0
        : Math.round((totals.completedUnits / totals.totalUnits) * 100),
  };
}

/** First unit (curriculum order) that isn't completed/verified and isn't
 * locked — the resume target for "Start learning" handshakes. */
export function resumeUnit(
  program: LpProgram,
  studentUnits: Map<string, StudentUnit>,
  balance: number
): { module: LpModule; unit: LpUnit } | null {
  const modules = [...program.modules].sort((a, b) => a.order - b.order);
  for (const module of modules) {
    const units = [...module.units].sort((a, b) => a.order - b.order);
    for (const unit of units) {
      const status = unitDisplayStatus(unit, balance, studentUnits.get(unit.id));
      if (status === "completed" || status === "verified" || status === "locked")
        continue;
      return { module, unit };
    }
  }
  return null;
}

/* ------------------------- goals & streak ---------------------------- */

export type GoalOutcome = {
  unitId: string;
  targetDate: string; // "YYYY-MM-DD"
  completedAt: string | null;
  /** met = completed on/before the target date; null = still pending. */
  met: boolean | null;
};

export type GoalsStreak = {
  current: number;
  longest: number;
  history: GoalOutcome[];
};

/** Goals Meeting Streak (decision 2026-07-09): counts consecutive deadlines
 * met, ordered by target date — not logins. A goal still in the future with
 * no completion is pending and doesn't affect the streak. `today` is passed
 * in (YYYY-MM-DD) to keep the function pure. */
export function goalsStreak(
  goals: UnitGoal[],
  studentUnits: Map<string, StudentUnit>,
  today: string
): GoalsStreak {
  const history: GoalOutcome[] = [...goals]
    .sort((a, b) => a.targetDate.localeCompare(b.targetDate))
    .map((g) => {
      const completedAt = studentUnits.get(g.unitId)?.completedAt ?? null;
      let met: boolean | null;
      if (completedAt) {
        met = completedAt.slice(0, 10) <= g.targetDate;
      } else {
        met = g.targetDate < today ? false : null; // missed vs pending
      }
      return { unitId: g.unitId, targetDate: g.targetDate, completedAt, met };
    });

  const resolved = history.filter((h) => h.met !== null);
  let current = 0;
  for (let i = resolved.length - 1; i >= 0 && resolved[i].met; i--) current++;

  let longest = 0;
  let run = 0;
  for (const h of resolved) {
    run = h.met ? run + 1 : 0;
    longest = Math.max(longest, run);
  }

  return { current, longest, history };
}

/* -------------------------- exam readiness --------------------------- */

export type ReadinessSummary = {
  latest: { score: number; level: string | null; submittedAt: string } | null;
  history: { score: number; level: string | null; submittedAt: string }[];
};

export function latestReadiness(results: AssessmentResult[]): ReadinessSummary {
  const history = [...results]
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))
    .map((r) => ({ score: r.score, level: r.level, submittedAt: r.submittedAt }));
  return { latest: history[history.length - 1] ?? null, history };
}

/** Categorical level for a score given ordered-or-not level bands. */
export function levelForScore(
  levels: ReadinessLevel[] | undefined,
  score: number
): string | null {
  if (!levels?.length) return null;
  const sorted = [...levels].sort((a, b) => b.min - a.min);
  return sorted.find((l) => score >= l.min)?.label ?? sorted[sorted.length - 1].label;
}
