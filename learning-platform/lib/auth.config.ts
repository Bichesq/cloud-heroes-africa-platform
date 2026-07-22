import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { findApprovedEmail } from "./approved-emails";
import { upsertStudent } from "./students";

/* Mirror of student-hub/lib/auth.config.ts. Same Google provider, same
 * AUTH_SECRET and JWT strategy, so a session established on Student Hub
 * (localhost:3000) is readable here (localhost:3001) — cookies are not
 * port-scoped. That IS the "handshake": LP never runs its own login logic
 * beyond this shared gate. */

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ profile }) {
      if (!profile?.email) return false;

      const email = profile.email.toLowerCase().trim();

      // Step 1 — check ApprovedEmail (shared admin-managed list)
      const approved = await findApprovedEmail(email);
      if (!approved) return "/not-approved";

      // Step 2 — upsert Student in the shared registry. Profile completion
      // (first-login /profile redirect) is Student Hub's concern, not LP's.
      await upsertStudent({
        email,
        givenName: profile.given_name ?? "",
        familyName: profile.family_name ?? "",
        approvedEmailId: approved.id,
      });

      return true;
    },

    async jwt({ token, profile }) {
      if (profile) {
        token.given_name  = profile.given_name ?? undefined;
        token.family_name = profile.family_name ?? undefined;
        token.email       = profile.email?.toLowerCase().trim();
        token.picture     = (profile as { picture?: string }).picture ?? token.picture;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.given_name  = token.given_name as string;
      session.user.family_name = token.family_name as string;
      session.user.email       = token.email       as string;
      session.user.image       = (token.picture as string) ?? session.user.image;
      return session;
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected =
        nextUrl.pathname.startsWith("/courses") ||
        nextUrl.pathname.startsWith("/catalog") ||
        nextUrl.pathname.startsWith("/programs");

      if (isProtected && !isLoggedIn) {
        return Response.redirect(new URL("/SignIn", nextUrl));
      }
      return true;
    },
  },
  pages: {
    signIn: "/SignIn",
    error:  "/",
  },
};
