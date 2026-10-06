import type { LpContributorRole } from "@prisma/client";

/* Pure authoring permission rules (unit-tested). Visibility is per program
 * (plan decision #2): any role on a program lets an author see it, and
 * nothing is platform-wide. The per-action rules are plan §7 (Bichesq,
 * 2026-09-28). lib/program-access.ts loads the roles and enforces these. */

/** Program ids are seeded/generated slugs. Anything else is refused before it
 * reaches a query (SECURITY.md §10). */
export const PROGRAM_ID_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

export type ProgramRoles = {
  isCreator: boolean;
  isInstructor: boolean;
  contributorRole: LpContributorRole | null;
  isDirector: boolean;
  isOwner: boolean;
};

export type ProgramCapabilities = {
  view: boolean;
  editSetup: boolean;
  /** Course Structure: add / edit / reorder / delete modules and units. */
  editStructure: boolean;
  /** Approve / reject Module Assessments submitted for review (plan §11). The
   * server also refuses a reviewer's own submission. */
  reviewAssessments: boolean;
  changeCreator: boolean;
  manageContributors: boolean;
  manageDirectorsOwners: boolean;
};

export type Capability = keyof ProgramCapabilities;

/** Pure: roles → what they allow (unit-tested). */
export function capabilitiesFor(r: ProgramRoles): ProgramCapabilities {
  const ownerOrDirector = r.isOwner || r.isDirector;
  return {
    view: r.isCreator || r.isInstructor || r.contributorRole !== null || ownerOrDirector,
    editSetup: ownerOrDirector || r.contributorRole === "editor",
    // Same roles as Program Setup (plan §8).
    editStructure: ownerOrDirector || r.contributorRole === "editor",
    reviewAssessments: ownerOrDirector || r.contributorRole === "reviewer",
    changeCreator: ownerOrDirector,
    manageContributors: ownerOrDirector,
    manageDirectorsOwners: r.isDirector,
  };
}
