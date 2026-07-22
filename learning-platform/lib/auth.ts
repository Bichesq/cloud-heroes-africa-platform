import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Helper alias used in server components and layouts
export { auth as getSession };
