import { z } from "zod";
import { PROGRAM_ID_PATTERN } from "@/lib/permissions";

/* zod schemas for every Learning Management write (SECURITY.md §10:
 * allowlist, strict objects, explicit lengths; malformed input is rejected,
 * never sanitised-and-continued). */

// Control characters are rejected outright (tab and newline are allowed).
const noControlChars = (s: string) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(s);

export const programId = z.string().regex(PROGRAM_ID_PATTERN);
export const authorId = z.uuid();
export const contributorRole = z.enum(["editor", "reviewer", "viewer"]);

export const programSetupSchema = z.strictObject({
  title: z
    .string()
    .trim()
    .min(3, "Enter a program name of at least 3 characters.")
    .max(120, "Keep the program name under 120 characters.")
    .refine(noControlChars, "Remove unsupported characters."),
  description: z
    .string()
    .trim()
    .max(2000, "Keep the description under 2,000 characters.")
    .refine(noControlChars, "Remove unsupported characters."),
  // Absent when the form has no Creator control (create mode, or the author
  // can't change it). "" means "no Creator".
  creatorAuthorId: z.union([authorId, z.literal("")]).optional(),
});

export type ProgramSetupInput = z.infer<typeof programSetupSchema>;

export const personSchema = z.strictObject({ programId, authorId });

export const addContributorSchema = z.strictObject({ programId, authorId, role: contributorRole });
export const changeRoleSchema = addContributorSchema;

export const personListSchema = z.enum(["director", "owner", "instructor"]);
export const personListChangeSchema = z.strictObject({ programId, authorId, list: personListSchema });

/** URL slug from a program name: lowercase ASCII, hyphen-separated, ≤ 60. */
export function slugify(title: string): string {
  const slug = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return slug || "program";
}
