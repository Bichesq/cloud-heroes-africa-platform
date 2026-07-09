import { z } from "zod";

/* Shared validation for the To Do widget's create/update/toggle/dismiss
 * actions. Business rules (system tasks can't be deleted or retitled) are
 * enforced in app/api/todos/route.ts, not here. */

const dueDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
  .nullable();

export const createTodoSchema = z.strictObject({
  title: z.string().trim().min(1, "Required").max(200, "Too long"),
  dueDate: dueDate.optional(),
  link: z.url("Enter a valid URL").nullable().optional(),
});

export const todoActionSchema = z.discriminatedUnion("action", [
  z.strictObject({
    action: z.literal("toggle"),
    id: z.string().min(1),
    completed: z.boolean(),
  }),
  z.strictObject({
    action: z.literal("update"),
    id: z.string().min(1),
    title: z.string().trim().min(1, "Required").max(200, "Too long").optional(),
    dueDate: dueDate.optional(),
  }),
  z.strictObject({
    action: z.literal("dismiss"),
    id: z.string().min(1),
    reason: z.string().trim().min(1, "Required").max(200, "Too long"),
  }),
]);

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type TodoAction = z.infer<typeof todoActionSchema>;
