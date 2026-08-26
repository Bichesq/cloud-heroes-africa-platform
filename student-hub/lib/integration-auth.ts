import { NextResponse } from "next/server";

/* Server-to-server guard for /api/integration/* — mirrors
 * learning-platform/lib/integration-auth.ts, but for the reverse direction:
 * learning-platform calling student-hub's Student-write API (first use of
 * this direction, per docs/plan/2026-08-23-centralize-shared-data.md step 4
 * — previously only student-hub called learning-platform this way). */

export function verifyIntegrationRequest(request: Request): NextResponse | null {
  const token = request.headers.get("x-integration-token");
  if (!process.env.INTEGRATION_TOKEN || token !== process.env.INTEGRATION_TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
