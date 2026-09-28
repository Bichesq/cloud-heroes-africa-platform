import { describe, expect, it } from "vitest";
import { moveOneStep, nextOrder, sortSiblings } from "@/lib/ordering";
import { addUnitSchema, moveUnitSchema, updateModuleSchema } from "@/lib/validation";

describe("sibling ordering (plan §8)", () => {
  const items = [
    { id: "c", order: 3 },
    { id: "a", order: 1 },
    { id: "b", order: 2 },
  ];

  it("moves one step and returns the full new sequence", () => {
    expect(moveOneStep(items, "b", "up")).toEqual(["b", "a", "c"]);
    expect(moveOneStep(items, "b", "down")).toEqual(["a", "c", "b"]);
  });

  it("refuses moves past either end, and unknown ids", () => {
    expect(moveOneStep(items, "a", "up")).toBeNull();
    expect(moveOneStep(items, "c", "down")).toBeNull();
    expect(moveOneStep(items, "zzz", "up")).toBeNull();
  });

  it("handles duplicate and gapped orders deterministically (ties by id)", () => {
    const messy = [
      { id: "y", order: 5 },
      { id: "x", order: 5 },
      { id: "w", order: 1 },
    ];
    expect(sortSiblings(messy).map((i) => i.id)).toEqual(["w", "x", "y"]);
    expect(moveOneStep(messy, "y", "up")).toEqual(["w", "y", "x"]);
  });

  it("appends after the highest order", () => {
    expect(nextOrder([])).toBe(1);
    expect(nextOrder(items)).toBe(4);
    expect(nextOrder([{ id: "a", order: 9 }, { id: "b", order: 2 }])).toBe(10);
  });
});

describe("structure inputs", () => {
  it("accepts seeded and generated ids", () => {
    expect(moveUnitSchema.safeParse({ programId: "cloud-practitioner", unitId: "lp-m1-u1", direction: "up" }).success).toBe(true);
    expect(moveUnitSchema.safeParse({ programId: "cloud-practitioner", unitId: "u-0a1b2c3d4e", direction: "down" }).success).toBe(true);
  });

  it("rejects bad ids, directions, titles and extra keys", () => {
    expect(moveUnitSchema.safeParse({ programId: "cloud-practitioner", unitId: "../x", direction: "up" }).success).toBe(false);
    expect(moveUnitSchema.safeParse({ programId: "cloud-practitioner", unitId: "u-1", direction: "left" }).success).toBe(false);
    expect(addUnitSchema.safeParse({ programId: "p", moduleId: "m-1", title: " x ", description: "" }).success).toBe(false);
    expect(addUnitSchema.safeParse({ programId: "p", moduleId: "m-1", title: "Fine", description: "", publishedAt: "now" }).success).toBe(false);
    expect(updateModuleSchema.safeParse({ programId: "p", moduleId: "m-1", title: "a".repeat(161), description: "" }).success).toBe(false);
  });
});
