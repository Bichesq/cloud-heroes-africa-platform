/**
 * Edge-safe auth configuration (used by proxy.ts on the Edge Runtime) — must
 * NOT import Node.js-only modules or Prisma. DB-backed callbacks live in
 * lib/auth.ts.
 *
 * Learning Management is a separate trust boundary from the learner apps
 * (plan docs/plan/2026-09-21-learning-management-authoring-app.md §3):
 *  - Microsoft Entra ID only, restricted to the CHA tenant via a
 *    tenant-specific issuer (plus the explicit `tid` check in lib/auth.ts);
 *  - its OWN AUTH_SECRET (never the value learning-platform/student-hub
 *    share) and its own `lm.*` cookie names (lib/auth-cookies.ts);
 *  - short-lived staff sessions (8h).
 */
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { authCookies, sessionMaxAge } from "@/lib/auth-cookies";
import {
  assertDevLoginNotInProduction,
  DEV_LOGIN_PROVIDER_ID,
  isDevLoginEnabled,
  resolveDevLoginEmail,
} from "@/lib/dev-login";
import { issuerForTenant } from "@/lib/tenant";

// Stops the app if the dev-login flag leaks into production (lib/dev-login.ts).
assertDevLoginNotInProduction(process.env);

const secure = process.env.NODE_ENV === "production";

/* Development-only email login for listed addresses (lib/dev-login.ts).
 * Not registered at all unless dev login is enabled. authorize() does no DB
 * work (edge-safe); the signIn callback in lib/auth.ts re-checks the
 * allowlist and upserts the LpAuthor. */
const devLoginProviders = isDevLoginEnabled(process.env)
  ? [
      Credentials({
        id: DEV_LOGIN_PROVIDER_ID,
        name: "Development login",
        credentials: { email: { label: "Email", type: "email" } },
        authorize(credentials) {
          const email = resolveDevLoginEmail(credentials?.email, process.env);
          return email ? { id: email, email, name: "" } : null;
        },
      }),
    ]
  : [];

export const authConfigEdge: NextAuthConfig = {
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      // No fallback to the multi-tenant /common/ issuer: without a tenant id
      // the provider is misconfigured and sign-in must fail closed.
      issuer: issuerForTenant(process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID) ?? "https://login.microsoftonline.com/invalid-tenant/v2.0",
    }),
    ...devLoginProviders,
  ],
  session: { strategy: "jwt", maxAge: sessionMaxAge },
  jwt: { maxAge: sessionMaxAge },
  useSecureCookies: secure,
  cookies: authCookies(secure),
  callbacks: {
    async session({ session, token }) {
      session.user.authorId = (token.authorId as string | undefined) ?? "";
      session.user.email = (token.email as string | undefined) ?? "";
      session.user.name = (token.name as string | undefined) ?? "";
      return session;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
};
