import NextAuth, { type DefaultSession } from "next-auth";
import { type JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      given_name?: string;
      family_name?: string;
    } & DefaultSession["user"];
  }

  interface User {
    given_name?: string;
    family_name?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    given_name?: string;
    family_name?: string;
  }
}
