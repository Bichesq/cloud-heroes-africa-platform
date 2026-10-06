import { NextResponse } from "next/server";

/* Auth guard for /api/admin/* (Phase 2 step 3 — Help Desk / admin
 * diagnostic + resync actions). Mirrors the shared-secret header pattern
 * lib/integration-auth.ts already uses for student-hub's server-to-server
 * calls, but with its OWN token (ADMIN_OPS_TOKEN, not INTEGRATION_TOKEN):
 * that token is scoped to read-only student lookups from student-hub, and
 * reusing it here would let that credential also perform admin mutations
 * (resync a stuck attempt) — a distinct, higher-privilege capability that
 * deserves its own credential (least-privilege, SECURITY.md §11).
 *
 * There is no in-app admin role/session in this codebase yet — an
 * "Administration" app is planned but not built (see
 * docs/shared-schema-audit.md) — so a shared-secret header is the same
 * stopgap already established for the equivalent problem, not a new
 * pattern invented for this endpoint. */
export function requireAdminAuth(request: Request): NextResponse | null {
  const token = request.headers.get("x-admin-token");
  if (!process.env.ADMIN_OPS_TOKEN || token !== process.env.ADMIN_OPS_TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
