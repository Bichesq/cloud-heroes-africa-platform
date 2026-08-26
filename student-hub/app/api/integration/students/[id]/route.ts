import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyIntegrationRequest } from "@/lib/integration-auth";
import { updateStudentProfile } from "@/lib/mock-api";
import { prisma } from "@/lib/prisma";

/* Admin-forward-compatible half of the Student-write API — see
 * app/api/integration/students/route.ts for the upsert-on-login half. No
 * caller uses this yet; it exists so "Administration" (per
 * docs/decision-log.md), once built, can update admin-status fields like
 * `status: "banned"` through this same endpoint instead of a direct write. */

const patchStudentSchema = z
  .strictObject({
    status: z.enum(["active", "banned"]).optional(),
    legalName: z.string().optional(),
    displayName: z.string().optional(),
    phone: z.string().optional(),
    alternateEmail: z.string().optional(),
    birthDate: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    timezone: z.string().optional(),
    track: z.string().optional(),
    activeProgramId: z.string().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, { message: "No fields to update" });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = verifyIntegrationRequest(req);
  if (denied) return denied;

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchStudentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const existing = await prisma.student.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const updated = await updateStudentProfile(existing.email, parsed.data);
  return NextResponse.json({ student: updated });
}
