/* Help Desk categories offered from inside the LP — the "help" desk subset
 * of student-hub/lib/help-catalog.ts (ids must match: both apps write the
 * same shared ticket store and Help Desk routes by category). */

export type LpHelpCategory = { id: string; label: string };

export const LP_HELP_CATEGORIES: LpHelpCategory[] = [
  { id: "programs-lessons", label: "Programs & Lessons" },
  { id: "calendar-events", label: "Calendar & Events" },
  { id: "community-inquiries", label: "Community Inquiries" },
  { id: "certificates-badges", label: "Certificates & Badges" },
];

export const DEFAULT_HELP_CATEGORY_ID = "programs-lessons";
