/**
 * Edge-safe auth configuration.
 * This file must NOT import any Node.js-only modules (fs, path, crypto, etc.)
 * because it is used in middleware which runs on the Edge Runtime.
 *
 * Node.js-dependent callbacks (signIn) live in auth.config.ts and are only
 * consumed by the full NextAuth instance in auth.ts (Node.js runtime).
 */
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfigEdge: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
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
