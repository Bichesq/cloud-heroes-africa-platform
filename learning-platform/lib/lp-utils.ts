import type {
  LpModule,
  LpProgram,
  LpUnit,
  ReadinessLevel,
  ReadinessResult,
  StudentUnit,
  StudentUnitStatus,
  TokenEntry,
  UnitGoal,
} from "@/types";

/* Pure, I/O-free learning-state math (mirrors student-hub/lib/curriculum-utils.ts).
 * Everything takes plain records and returns plain values so it is unit-testable
 * and survives the JSON-store → Postgres swap unchanged.
 *
 * (2026-08-11: Section/Item are gone — Unit is the leaf content container,
 * so the item-ordering helpers that used to live here (flattenItems,
 * nextItem, itemAfter, locateItem, readingItems) have no equivalent and
 * were removed. See plan Ambiguity #2: there is currently no replacement
 * signal for "is this unit's content read" below the Unit level — the
 * progress module (lib/store/progress.ts, app/api/progress/route.ts) now
 * treats a single client action as marking a whole unit's content done.) */

/* ---------------------------- tokens & locking ------------------------- */

export function tokensBalance(entries: TokenEntry[]): number {
  return entries.reduce((sum, e) => sum + e.tokens, 0);
}

export type UnitAccess = {
  locked: boolean;
  currentTokens: number;
  requiredTokens: number;
};

/** Token-based unlocking (decision 2026-07-09, renamed §1): a unit opens
 * once the student's balance reaches its threshold. Verified/completed
 * units never re-lock. */
export function unitAccess(
  unit: LpUnit,
  balance: number,
  studentUnit?: StudentUnit
): UnitAccess {
  const started = !!studentUnit;
  return {
    locked: !started && balance < unit.tokensRequired,
    currentTokens: balance,
    requiredTokens: unit.tokensRequired,
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
  return balance < unit.tokensRequired ? "locked" : "available";
}

export const UNIT_STATUS_LABEL: Record<UnitDisplayStatus, string> = {
  locked: "Locked",
  available: "Not started",
  in_progress: "In progress",
  completed: "Completed",
  retake: "Retake",
  verified: "Competent / Verified",
};

/* ------------------------------ lookup -------------------------------- */

export type UnitLocation = { program: LpProgram; module: LpModule; unit: LpUnit };

/** Finds where a unit lives across all programs (unit ids are globally
 * unique). Null if unknown. */
export function locateUnit(programs: LpProgram[], unitId: string): UnitLocation | null {
  for (const program of programs) {
    for (const module of program.modules) {
      const unit = module.units.find((u) => u.id === unitId);
      if (unit) return { program, module, unit };
    }
  }
  return null;
}

/* ------------------------ module / program --------------------------- */

/** Modules with no (published) units are hidden from learners — Phase 4
 * sub-step 3: a new module shows once its first unit is published. */
export function withoutEmptyModules<M extends { units: unknown[] }>(modules: M[]): M[] {
  return modules.filter((m) => m.units.length > 0);
}

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

export type ModuleGate = {
  locked: boolean;
  /** What the previous module still owes, when locked; null when unlocked. */
  reason: "prerequisite_assessment" | "prerequisite_units" | null;
};

/**
 * Sequential module gating (requirements §2: "module unlocks only once its
 * prerequisite module (or its assessment) is passed"). The first module is
 * always unlocked. Module N unlocks once module N-1 is "cleared": if N-1 has
 * a Module Assessment, cleared means the student has a passed attempt for
 * it; otherwise, cleared means every unit in N-1 is completed/verified.
 *
 * Deliberately read-computed from the same sources their own writes already
 * commit atomically elsewhere (`LpAssessmentAttempt.passed` via
 * `gradeAndSubmitAttempt`'s transaction, `LpStudentUnit.status` via
 * `setUnitStatus`) rather than a separately stored "module unlocked" flag —
 * so there is no second write that can fall out of sync with the pass/fail
 * result. This is the actual fix for the "automatic unlock trigger didn't
 * fire" scenario (requirements §8, plan doc Phase 2): there's no trigger to
 * fail, because there's nothing to write — the lock state is always exactly
 * as fresh as the attempt/unit records it's derived from.
 *
 * `moduleAssessmentPassed` maps moduleId → whether the student has passed
 * that module's assessment, for every module that HAS one; a module with no
 * entry is treated as having no Module Assessment (falls back to the
 * unit-completion rule).
 */
export function moduleGates(
  modules: LpModule[],
  studentUnits: Map<string, StudentUnit>,
  moduleAssessmentPassed: Map<string, boolean>
): Map<string, ModuleGate> {
  const ordered = [...modules].sort((a, b) => a.order - b.order);
  const gates = new Map<string, ModuleGate>();
  let previousCleared = true;
  let previousHadAssessment = false;

  for (const mod of ordered) {
    gates.set(mod.id, {
      locked: !previousCleared,
      reason: previousCleared
        ? null
        : previousHadAssessment
          ? "prerequisite_assessment"
          : "prerequisite_units",
    });

    const hasAssessment = moduleAssessmentPassed.has(mod.id);
    const cleared = hasAssessment
      ? (moduleAssessmentPassed.get(mod.id) ?? false)
      : (() => {
          const stats = moduleStats(mod, studentUnits);
          return stats.totalUnits > 0 && stats.completedUnits === stats.totalUnits;
        })();

    previousCleared = cleared;
    previousHadAssessment = hasAssessment;
  }

  return gates;
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

export function latestReadiness(results: ReadinessResult[]): ReadinessSummary {
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
