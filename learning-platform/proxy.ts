/**
 * Proxy (formerly middleware) runs on the Edge Runtime — must NOT import Node.js modules.
 */
import NextAuth from "next-auth";
import { authConfigEdge } from "@/lib/auth.config.edge";

const { auth } = NextAuth(authConfigEdge);

export default auth;

export const config = {
  matcher: ["/courses/:path*", "/catalog/:path*", "/programs/:path*"],
};
