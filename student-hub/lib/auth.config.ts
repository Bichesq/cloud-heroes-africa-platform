import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, profile }) {
      // On first sign-in, profile is populated from Google
      if (profile) {
        token.given_name = profile.given_name ?? undefined;
        token.family_name = profile.family_name ?? undefined;
        token.email = profile.email;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose only what the app needs
      session.user.given_name = token.given_name as string;
      session.user.family_name = token.family_name as string;
      session.user.email = token.email as string;
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/profile");

      if (isProtected && !isLoggedIn) {
        return Response.redirect(new URL("/invite", nextUrl));
      }
      return true;
    },
  },
  pages: {
    signIn: "/invite",
    error: "/invite",
  },
};