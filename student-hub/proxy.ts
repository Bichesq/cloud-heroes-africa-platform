import { auth } from "@/lib/auth";
import { getStudent } from "@/lib/mock-api";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth(async (req: NextRequest & { auth: any }) => {
  const { nextUrl } = req;
  const session = req.auth;

  // Not logged in → landing page
  if (!session?.user) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Profile gate — /dashboard requires profileCompletedAt to be set
  if (nextUrl.pathname.startsWith("/dashboard")) {
    const student = await getStudent(session.user.email);
    if (!student?.profileCompletedAt) {
      return NextResponse.redirect(new URL("/profile", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};