import { describe, expect, it } from "vitest";
import type { LpModule, LpUnit, StudentUnit } from "@/types";
import { moduleGates } from "@/lib/lp-utils";

/**
 * Phase 2 (docs/plan/2026-09-20-learning-platform-v1-build.md): module
 * unlock is read-computed from LpAssessmentAttempt.passed / LpStudentUnit
 * .status rather than a separately stored flag. These tests exercise
 * moduleGates in isolation — the pure function is the entire mechanism, so
 * there's no separate "atomic transition" to test the way there would be
 * for a write-based unlock (see lib/lp-utils.ts#moduleGates's own comment).
 */

function unit(id: string, order: number): LpUnit {
  return {
    id,
    title: `Unit ${order}`,
    order,
    description: "",
    durationMin: 10,
    tokensAward: 0,
    tokensRequired: 0,
    creators: [],
    contentBlocks: [],
    topics: [],
  };
}

function module(id: string, order: number, units: LpUnit[]): LpModule {
  return { id, title: `Module ${order}`, order, description: "", units };
}

function studentUnit(unitId: string, status: StudentUnit["status"]): StudentUnit {
  return {
    studentId: "s1",
    unitId,
    status,
    completedAt: "2026-09-01T00:00:00.000Z",
    verifiedAt: status === "verified" ? "2026-09-01T00:00:00.000Z" : null,
    updatedAt: "2026-09-01T00:00:00.000Z",
  };
}

describe("moduleGates", () => {
  it("the first module is always unlocked, regardless of progress", () => {
    const modules = [module("m1", 0, [unit("u1", 0)]), module("m2", 1, [unit("u2", 0)])];
    const gates = moduleGates(modules, new Map(), new Map());
    expect(gates.get("m1")).toEqual({ locked: false, reason: null });
  });

  it("a module with a Module Assessment unlocks the next once it's passed", () => {
    const modules = [module("m1", 0, [unit("u1", 0)]), module("m2", 1, [unit("u2", 0)])];

    const notPassed = moduleGates(modules, new Map(), new Map([["m1", false]]));
    expect(notPassed.get("m2")).toEqual({ locked: true, reason: "prerequisite_assessment" });

    const passed = moduleGates(modules, new Map(), new Map([["m1", true]]));
    expect(passed.get("m2")).toEqual({ locked: false, reason: null });
  });

  it("a module with no Module Assessment falls back to full unit completion", () => {
    const modules = [
      module("m1", 0, [unit("u1", 0), unit("u2", 1)]),
      module("m2", 1, [unit("u3", 0)]),
    ];

    const partial = moduleGates(
      modules,
      new Map([["u1", studentUnit("u1", "completed")]]),
      new Map()
    );
    expect(partial.get("m2")).toEqual({ locked: true, reason: "prerequisite_units" });

    const complete = moduleGates(
      modules,
      new Map([
        ["u1", studentUnit("u1", "completed")],
        ["u2", studentUnit("u2", "verified")],
      ]),
      new Map()
    );
    expect(complete.get("m2")).toEqual({ locked: false, reason: null });
  });

  it("an empty (zero-unit) module with no assessment never counts as cleared", () => {
    const modules = [module("m1", 0, []), module("m2", 1, [unit("u1", 0)])];
    const gates = moduleGates(modules, new Map(), new Map());
    expect(gates.get("m2")).toEqual({ locked: true, reason: "prerequisite_units" });
  });

  it("locking cascades — a locked module locks everything after it too", () => {
    const modules = [
      module("m1", 0, [unit("u1", 0)]),
      module("m2", 1, [unit("u2", 0)]),
      module("m3", 2, [unit("u3", 0)]),
    ];
    // m1's assessment not passed -> m2 locked -> m3 locked too, even though
    // m3's own prerequisite (m2) technically "has no assessment" fallback
    // never gets a chance to be evaluated as cleared.
    const gates = moduleGates(modules, new Map(), new Map([["m1", false]]));
    expect(gates.get("m2")?.locked).toBe(true);
    expect(gates.get("m3")?.locked).toBe(true);
  });

  it("module order in the input array doesn't matter — gates sort by .order", () => {
    const modules = [module("m2", 1, [unit("u2", 0)]), module("m1", 0, [unit("u1", 0)])];
    const gates = moduleGates(modules, new Map(), new Map([["m1", false]]));
    expect(gates.get("m1")).toEqual({ locked: false, reason: null });
    expect(gates.get("m2")).toEqual({ locked: true, reason: "prerequisite_assessment" });
  });
});
