import NextAuth from "next-auth";
import { authConfigEdge } from "@/lib/auth.config.edge";
import { findAuthorIdByEmail, upsertAuthorOnSignIn, upsertDevAuthor } from "@/lib/authors";
import { DEV_LOGIN_PROVIDER_ID, resolveDevLoginEmail } from "@/lib/dev-login";
import { resolveAllowedIdentity, type EntraClaims } from "@/lib/tenant";

/* Full (Node runtime) Auth.js instance. Adds the DB-backed callbacks to the
 * edge-safe config:
 *  - signIn: explicit tenant check on the id_token claims, then LpAuthor
 *    upsert. Anything unexpected is denied (fail closed). Denials go to
 *    /signin?error=AccessDenied with a generic message — never the reason
 *    (SECURITY.md §4 generic login errors).
 *  - jwt: on first sign-in, stores only the author id/email/name in the
 *    token. The provider's profile photo (a base64 data URL) is dropped so
 *    the session cookie stays small.
 *  - dev-login (development only, lib/dev-login.ts): the allowlist is
 *    re-checked here and the author is upserted by email with no Entra oid;
 *    a later real Microsoft sign-in with the same email binds the oid. */

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfigEdge,
  callbacks: {
    ...authConfigEdge.callbacks,

    async signIn({ account, profile, user }) {
      if (account?.provider === DEV_LOGIN_PROVIDER_ID) {
        const email = resolveDevLoginEmail(user?.email, process.env);
        if (!email) return false;
        return (await upsertDevAuthor(email)) !== null;
      }

      const identity = resolveAllowedIdentity(
        profile as EntraClaims | undefined,
        process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID
      );
      if (!identity) return false;
      const author = await upsertAuthorOnSignIn(identity);
      return author !== null;
    },

    async jwt({ token, profile, account, user }) {
      if (account?.provider === DEV_LOGIN_PROVIDER_ID) {
        const email = resolveDevLoginEmail(user?.email, process.env);
        token.email = email ?? undefined;
        token.name = "";
        token.authorId = email ? await findAuthorIdByEmail(email) : undefined;
      } else if (profile) {
        const identity = resolveAllowedIdentity(
          profile as EntraClaims,
          process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID
        );
        token.email = identity?.email;
        token.name = identity?.name;
        token.authorId = identity ? await findAuthorIdByEmail(identity.email) : undefined;
      }
      delete token.picture;
      return token;
    },
  },
});

export { auth as getSession };
