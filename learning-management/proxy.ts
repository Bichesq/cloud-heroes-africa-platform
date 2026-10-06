/**
 * Proxy (formerly middleware) — Edge Runtime; must NOT import Node modules.
 *
 * Two jobs on every non-static request:
 *  1. Default-deny auth: everything except /signin and /api/auth/* requires a
 *     staff session; unauthenticated requests are redirected to /signin.
 *     (Pages and routes still re-check the session server-side, and every
 *     program action checks the author's role on THAT program — this is only
 *     the outer gate, SECURITY.md §3.)
 *  2. Nonce-based Content-Security-Policy (lib/csp.ts; SECURITY.md §2).
 */
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfigEdge } from "@/lib/auth.config.edge";
import { buildCsp } from "@/lib/csp";

const { auth } = NextAuth(authConfigEdge);

const PUBLIC_PATHS = ["/signin", "/api/auth"];

export default auth((req) => {
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce, process.env.NODE_ENV !== "production");
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!req.auth?.user && !isPublic) {
    const res = NextResponse.redirect(new URL("/signin", req.nextUrl));
    res.headers.set("Content-Security-Policy", csp);
    return res;
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("Content-Security-Policy", csp);
  return res;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp)$).*)"],
};
