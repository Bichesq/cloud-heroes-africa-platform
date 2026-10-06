import type { NextAuthConfig } from "next-auth";

/* Distinct cookie names for staff sessions. Cookies are not port-scoped on
 * localhost, and learning-platform (:3001) + student-hub (:3000) already use
 * Auth.js's default `authjs.*` names for the learner session — with the
 * defaults, signing in here would overwrite/collide with a learner session
 * in the same browser. Prefixing every cookie keeps the two trust
 * boundaries separate (plan 2026-09-21 Risks; SECURITY.md §4). In
 * production the `__Secure-`/`__Host-` prefixes also bind them to HTTPS. */

const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60; // staff sessions: one working day

export function authCookies(secure: boolean): NextAuthConfig["cookies"] {
  const secureName = (name: string) => (secure ? `__Secure-${name}` : name);
  const base = { httpOnly: true, sameSite: "lax" as const, path: "/", secure };
  return {
    sessionToken: { name: secureName("lm.session-token"), options: base },
    callbackUrl: { name: secureName("lm.callback-url"), options: base },
    // __Host- requires Secure + Path=/ and no Domain — only in production.
    csrfToken: { name: secure ? "__Host-lm.csrf-token" : "lm.csrf-token", options: base },
    pkceCodeVerifier: { name: secureName("lm.pkce.code_verifier"), options: { ...base, maxAge: 900 } },
    state: { name: secureName("lm.state"), options: { ...base, maxAge: 900 } },
    nonce: { name: secureName("lm.nonce"), options: base },
  };
}

export const sessionMaxAge = SESSION_MAX_AGE_SECONDS;
