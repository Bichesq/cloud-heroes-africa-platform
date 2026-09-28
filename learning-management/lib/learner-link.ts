/* "View" in the Programs table opens a published program in the learner
 * app. The base URL comes from LM_LEARNER_APP_URL and must be http(s),
 * otherwise View is hidden (SECURITY.md §11: explicit config, no silent
 * fallback). Pure — unit-tested. */

export function learnerProgramUrl(
  programId: string,
  base: string | undefined = process.env.LM_LEARNER_APP_URL,
): string | null {
  if (!base) return null;
  let url: URL;
  try {
    url = new URL(base);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  return new URL(`/programs/${encodeURIComponent(programId)}`, url).toString();
}
