import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { findApprovedEmail } from "./approved-emails";
import { upsertStudent } from "./mock-api";

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

      // Step 1 — check ApprovedEmail
      const approved = await findApprovedEmail(email);
      if (!approved) return "/not-approved";

      // Step 2 — upsert Student (auto-create on first login,
      //           update lastLogin on subsequent logins)
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
      }
      return token;
    },

    async session({ session, token }) {
      session.user.given_name  = token.given_name as string;
      session.user.family_name = token.family_name as string;
      session.user.email       = token.email       as string;
      return session;
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/profile");

      if (isProtected && !isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl));
      }
      return true;
    },
  },
  pages: {
    signIn: "/",
    error:  "/",
  },
};