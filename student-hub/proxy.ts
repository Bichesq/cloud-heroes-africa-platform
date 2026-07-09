/**
 * Proxy (formerly middleware) runs on the Edge Runtime — must NOT import Node.js modules.
 * Profile-completion gate (/dashboard redirect) is handled inside the
 * /dashboard layout (Node.js runtime) instead of here.
 */
import NextAuth from "next-auth";
import { authConfigEdge } from "@/lib/auth.config.edge";

const { auth } = NextAuth(authConfigEdge);

export default auth;

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/my-program/:path*"],
};
