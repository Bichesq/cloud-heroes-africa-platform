import { z } from "zod";

/* Shared validation for Support ticket creation and student-side actions.
 * Ownership/status transitions beyond these are staff-only and out of scope
 * for the student-facing route handler — enforced in app/api/support/route.ts. */

export const createTicketSchema = z.strictObject({
  desk: z.enum(["help", "service"]),
  categoryId: z.string().trim().min(1, "Required"),
  topic: z.string().trim().min(1, "Required").max(140, "Keep this short"),
  description: z.string().trim().min(1, "Required").max(4000, "Too long"),
  preferredChannel: z.string().trim().max(120, "Too long").nullable().optional(),
});

/** Service Desk requests filed before sign-in (e.g. a student locked out of
 * their account) have no session to derive identity from, so intake asks
 * for a name + email instead. Desk is always "service" — Help Desk requires
 * a session and is validated separately in the route handler. */
export const createAnonymousTicketSchema = z.strictObject({
  categoryId: z.string().trim().min(1, "Required"),
  topic: z.string().trim().min(1, "Required").max(140, "Keep this short"),
  description: z.string().trim().min(1, "Required").max(4000, "Too long"),
  preferredChannel: z.string().trim().max(120, "Too long").nullable().optional(),
  contactName: z.string().trim().min(1, "Required").max(120, "Too long"),
  contactEmail: z.email("Enter a valid email"),
});

/** Students may cancel their own request, or consent to close it once staff
 * have provided a resolution summary — per help2.md's closure requirement
 * that a ticket needs student consent (or second-review after ~2 days). */
export const ticketActionSchema = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("cancel"), id: z.string().min(1) }),
  z.strictObject({ action: z.literal("consent-close"), id: z.string().min(1) }),
]);

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type TicketAction = z.infer<typeof ticketActionSchema>;
