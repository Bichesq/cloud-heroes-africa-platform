import { describe, expect, it } from "vitest";
import { allTopicsComplete, unitProgressPct } from "@/lib/topic-progress";

const base = { topicCount: 10, completedTopicCount: 0, contentDone: false, kcCount: 1, passedKcCount: 0 };

describe("unitProgressPct (decision-log 2026-09-24 'Per-topic progress formula')", () => {
  it("starts at 0%", () => {
    expect(unitProgressPct(base)).toBe(0);
  });

  it("gives each of 10 topics an equal slice of the 90% reading share", () => {
    expect(unitProgressPct({ ...base, completedTopicCount: 1 })).toBe(9);
    expect(unitProgressPct({ ...base, completedTopicCount: 2 })).toBe(18);
  });

  it("never reaches 100% on reading alone when the unit has a KC", () => {
    expect(unitProgressPct({ ...base, completedTopicCount: 10 })).toBe(90);
    expect(unitProgressPct({ ...base, contentDone: true })).toBe(90);
  });

  it("reaches 100% only once the KC is passed", () => {
    expect(unitProgressPct({ ...base, contentDone: true, passedKcCount: 1 })).toBe(100);
  });

  it("lets reading fill 0→100% when the unit has no KC", () => {
    expect(unitProgressPct({ ...base, kcCount: 0, completedTopicCount: 5 })).toBe(50);
    expect(unitProgressPct({ ...base, kcCount: 0, contentDone: true })).toBe(100);
  });

  it("treats a topic-less unit's reading as all-or-nothing", () => {
    const flat = { ...base, topicCount: 0 };
    expect(unitProgressPct(flat)).toBe(0);
    expect(unitProgressPct({ ...flat, contentDone: true })).toBe(90);
  });

  it("caps over-counted completions (e.g. a topic removed after completion)", () => {
    expect(unitProgressPct({ ...base, topicCount: 4, completedTopicCount: 6 })).toBe(90);
  });

  it("keeps full reading credit on a Retake (contentDone) even with no topic rows", () => {
    expect(unitProgressPct({ ...base, completedTopicCount: 0, contentDone: true })).toBe(90);
  });
});

describe("allTopicsComplete", () => {
  it("requires every navigable topic", () => {
    expect(allTopicsComplete(["a", "b", "c"], ["a", "c"])).toBe(false);
    expect(allTopicsComplete(["a", "b", "c"], ["c", "b", "a"])).toBe(true);
  });

  it("can't be satisfied by skipping straight to the last topic", () => {
    expect(allTopicsComplete(["a", "b", "c"], ["c"])).toBe(false);
  });

  it("ignores completions for topics no longer in the unit", () => {
    expect(allTopicsComplete(["a", "b"], ["a", "b", "old"])).toBe(true);
    expect(allTopicsComplete(["a", "b"], ["a", "old"])).toBe(false);
  });

  it("is never true for a unit without topics", () => {
    expect(allTopicsComplete([], [])).toBe(false);
  });
});
