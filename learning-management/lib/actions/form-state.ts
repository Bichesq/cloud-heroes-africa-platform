/* Shared result shape for Learning Management server actions. Errors shown
 * to the author are deliberately generic (SECURITY.md §10/§11): an action
 * refused for authorization looks the same as any other failure. */

export type FormState =
  | { ok: true; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }
  | null;

export const GENERIC_ERROR = "Something went wrong. Refresh the page and try again.";
