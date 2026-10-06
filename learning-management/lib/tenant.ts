/* Who may sign in to Learning Management (plan decision #4, 2026-09-24): any
 * Microsoft account in the CHA organisation tenant — no extra allowlist; a
 * signed-in author with no program roles simply sees no programs.
 *
 * The provider is configured with a tenant-specific issuer, so Auth.js's
 * OIDC issuer validation already rejects other tenants. This check is the
 * explicit second layer on the id_token claims themselves (default deny:
 * anything missing or malformed is refused). Pure — unit-tested. */

export type EntraClaims = {
  tid?: unknown;
  oid?: unknown;
  email?: unknown;
  preferred_username?: unknown;
  name?: unknown;
};

export type AllowedIdentity = { email: string; oid: string; name: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function resolveAllowedIdentity(
  claims: EntraClaims | null | undefined,
  tenantId: string | undefined
): AllowedIdentity | null {
  if (!claims || !tenantId) return null;
  if (typeof claims.tid !== "string" || claims.tid.toLowerCase() !== tenantId.toLowerCase()) {
    return null;
  }
  if (typeof claims.oid !== "string" || claims.oid.length === 0 || claims.oid.length > 64) {
    return null;
  }

  // Work accounts may omit `email`; `preferred_username` is the UPN.
  const raw = typeof claims.email === "string" ? claims.email : claims.preferred_username;
  if (typeof raw !== "string") return null;
  const email = raw.toLowerCase().trim();
  if (email.length > 254 || !EMAIL_RE.test(email)) return null;

  const name = typeof claims.name === "string" ? claims.name.trim().slice(0, 200) : "";
  return { email, oid: claims.oid, name };
}

export function issuerForTenant(tenantId: string | undefined): string | undefined {
  return tenantId ? `https://login.microsoftonline.com/${tenantId}/v2.0` : undefined;
}
