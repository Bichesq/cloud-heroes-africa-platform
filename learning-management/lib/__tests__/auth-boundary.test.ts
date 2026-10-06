import { describe, expect, it } from "vitest";
import { issuerForTenant, resolveAllowedIdentity } from "@/lib/tenant";
import { authCookies } from "@/lib/auth-cookies";
import { buildCsp } from "@/lib/csp";

const TENANT = "11111111-2222-3333-4444-555555555555";
const good = { tid: TENANT, oid: "abc-123", email: "Kris@CloudHeroes.Africa ", name: " Kris " };

describe("resolveAllowedIdentity (plan decision #4: CHA tenant only)", () => {
  it("accepts a CHA-tenant account and normalises email/name", () => {
    expect(resolveAllowedIdentity(good, TENANT)).toEqual({
      email: "kris@cloudheroes.africa",
      oid: "abc-123",
      name: "Kris",
    });
  });

  it("rejects other tenants, including a case-trick match", () => {
    expect(resolveAllowedIdentity({ ...good, tid: "99999999-2222-3333-4444-555555555555" }, TENANT)).toBeNull();
    expect(resolveAllowedIdentity({ ...good, tid: TENANT.toUpperCase() }, TENANT)).not.toBeNull();
  });

  it("fails closed when the tenant isn't configured or claims are missing", () => {
    expect(resolveAllowedIdentity(good, undefined)).toBeNull();
    expect(resolveAllowedIdentity(null, TENANT)).toBeNull();
    expect(resolveAllowedIdentity({ ...good, tid: undefined }, TENANT)).toBeNull();
    expect(resolveAllowedIdentity({ ...good, oid: undefined }, TENANT)).toBeNull();
    expect(resolveAllowedIdentity({ ...good, oid: 42 }, TENANT)).toBeNull();
  });

  it("falls back to preferred_username and rejects malformed emails", () => {
    expect(
      resolveAllowedIdentity({ ...good, email: undefined, preferred_username: "ama@cloudheroes.africa" }, TENANT)?.email
    ).toBe("ama@cloudheroes.africa");
    expect(resolveAllowedIdentity({ ...good, email: "not-an-email" }, TENANT)).toBeNull();
    expect(resolveAllowedIdentity({ ...good, email: `${"a".repeat(250)}@x.io` }, TENANT)).toBeNull();
  });

  it("builds a tenant-specific issuer, never /common/", () => {
    expect(issuerForTenant(TENANT)).toBe(`https://login.microsoftonline.com/${TENANT}/v2.0`);
    expect(issuerForTenant(undefined)).toBeUndefined();
  });
});

describe("authCookies (separate from the learner apps' authjs.* cookies)", () => {
  it("prefixes every cookie with lm. so it can't collide on localhost", () => {
    for (const secure of [false, true]) {
      const cookies = authCookies(secure)!;
      for (const c of Object.values(cookies)) {
        expect(c!.name).toMatch(/lm\./);
        expect(c!.name).not.toMatch(/^(__Secure-|__Host-)?authjs\./);
        expect(c!.options!.httpOnly).toBe(true);
      }
    }
  });

  it("uses __Secure-/__Host- names and Secure cookies in production", () => {
    const cookies = authCookies(true)!;
    expect(cookies.sessionToken!.name).toBe("__Secure-lm.session-token");
    expect(cookies.csrfToken!.name).toBe("__Host-lm.csrf-token");
    expect(cookies.sessionToken!.options!.secure).toBe(true);
  });
});

describe("buildCsp (SECURITY.md §2)", () => {
  it("allows scripts only via the per-request nonce and blocks framing", () => {
    const csp = buildCsp("n0nce", false);
    expect(csp).toContain("script-src 'self' 'nonce-n0nce' 'strict-dynamic'");
    expect(csp).not.toContain("'unsafe-inline' 'nonce");
    expect(csp).not.toMatch(/script-src[^;]*unsafe-eval/);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
  });

  it("adds unsafe-eval only in development", () => {
    expect(buildCsp("n", true)).toMatch(/script-src[^;]*'unsafe-eval'/);
  });
});
