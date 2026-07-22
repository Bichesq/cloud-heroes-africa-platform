import { z } from "zod";

/* LP-side validation for Help Desk ticket creation — mirrors student-hub/
 * lib/support-schema.ts's createTicketSchema, plus the explicit context
 * snapshot: unlike Student Hub (which derives context from progress), the
 * LP knows exactly which program/module/unit the student is viewing
 * (requirements §10) and sends it with the request. */

export const ticketContextSchema = z.strictObject({
  programId: z.string().optional(),
  programTitle: z.string().optional(),
  moduleId: z.string().optional(),
  moduleTitle: z.string().optional(),
  unitId: z.string().optional(),
  unitTitle: z.string().optional(),
});

export const createTicketSchema = z.strictObject({
  categoryId: z.string().trim().min(1, "Required"),
  topic: z.string().trim().min(1, "Required").max(140, "Keep this short"),
  description: z.string().trim().min(1, "Required").max(4000, "Too long"),
  preferredChannel: z.string().trim().max(120, "Too long").nullable().optional(),
  context: ticketContextSchema,
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
