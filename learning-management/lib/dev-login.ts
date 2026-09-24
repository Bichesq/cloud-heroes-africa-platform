/* Development-only sign-in (decided 2026-09-24: Microsoft Entra credentials
 * exist only in production; dev uses an email login for listed addresses).
 *
 * Three independent guards, all fail-closed:
 *  1. Enabled only when NODE_ENV !== "production" AND LM_DEV_LOGIN === "1".
 *     When disabled, the provider is not registered at all, so its callback
 *     route doesn't exist.
 *  2. Only emails listed in LM_DEV_EMAILS (comma-separated) are accepted —
 *     re-checked in both authorize() and the signIn callback.
 *  3. assertDevLoginNotInProduction() throws at startup if LM_DEV_LOGIN is
 *     set in a production run, so a leaked flag stops the app instead of
 *     silently opening a password-less login.
 * Edge-safe and pure (env passed in) — unit-tested. */

type Env = Record<string, string | undefined>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const DEV_LOGIN_PROVIDER_ID = "dev-login";

export function isDevLoginEnabled(env: Env): boolean {
  return env.NODE_ENV !== "production" && env.LM_DEV_LOGIN === "1";
}

export function devAllowedEmails(env: Env): Set<string> {
  return new Set(
    (env.LM_DEV_EMAILS ?? "")
      .split(",")
      .map((e) => e.toLowerCase().trim())
      .filter((e) => EMAIL_RE.test(e))
  );
}

/** Normalised email if dev login is enabled and this address is listed. */
export function resolveDevLoginEmail(input: unknown, env: Env): string | null {
  if (!isDevLoginEnabled(env) || typeof input !== "string") return null;
  const email = input.toLowerCase().trim();
  if (email.length > 254 || !EMAIL_RE.test(email)) return null;
  return devAllowedEmails(env).has(email) ? email : null;
}

export function assertDevLoginNotInProduction(env: Env): void {
  if (env.NODE_ENV === "production" && env.LM_DEV_LOGIN !== undefined && env.LM_DEV_LOGIN !== "") {
    throw new Error(
      "LM_DEV_LOGIN is set in a production environment. Dev login must never run in production — remove it."
    );
  }
}
