import { describe, expect, it } from "vitest";
import { withoutEmptyModules } from "@/lib/lp-utils";

/* Phase 4 sub-step 3: draft units are filtered out in the catalogue query,
 * and a module left with no published units is hidden from learners. */
describe("withoutEmptyModules", () => {
  it("drops modules with no units and keeps order", () => {
    const modules = [
      { id: "m1", units: [{ id: "u1" }] },
      { id: "m2", units: [] },
      { id: "m3", units: [{ id: "u2" }, { id: "u3" }] },
    ];
    expect(withoutEmptyModules(modules).map((m) => m.id)).toEqual(["m1", "m3"]);
  });

  it("returns an empty list when nothing is published", () => {
    expect(withoutEmptyModules([{ id: "m1", units: [] }])).toEqual([]);
  });
});
