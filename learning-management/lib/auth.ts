import NextAuth from "next-auth";
import { authConfigEdge } from "@/lib/auth.config.edge";
import { findAuthorIdByEmail, upsertAuthorOnSignIn } from "@/lib/authors";
import { resolveAllowedIdentity, type EntraClaims } from "@/lib/tenant";

/* Full (Node runtime) Auth.js instance. Adds the DB-backed callbacks to the
 * edge-safe config:
 *  - signIn: explicit tenant check on the id_token claims, then LpAuthor
 *    upsert. Anything unexpected is denied (fail closed). Denials go to
 *    /signin?error=AccessDenied with a generic message — never the reason
 *    (SECURITY.md §4 generic login errors).
 *  - jwt: on first sign-in, stores only the author id/email/name in the
 *    token. The provider's profile photo (a base64 data URL) is dropped so
 *    the session cookie stays small. */

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfigEdge,
  callbacks: {
    ...authConfigEdge.callbacks,

    async signIn({ profile }) {
      const identity = resolveAllowedIdentity(
        profile as EntraClaims | undefined,
        process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID
      );
      if (!identity) return false;
      const author = await upsertAuthorOnSignIn(identity);
      return author !== null;
    },

    async jwt({ token, profile }) {
      if (profile) {
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
