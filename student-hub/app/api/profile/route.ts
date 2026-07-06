import { getSession } from "@/lib/auth";
import { getStudent, updateStudentProfile } from "@/lib/mock-api";
import { diffFields, logAudit } from "@/lib/audit";
import { fieldErrors, profileUpdateSchema } from "@/lib/profile-schema";
import { mdyToIso } from "@/lib/profile-utils";
import type { Student } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  const student = await getStudent(session.user.email);
  return NextResponse.json({ student });
}

/** Fields a student may change through this endpoint (audited below). */
const AUDITED_FIELDS: (keyof Student & string)[] = [
  "givenName",
  "familyName",
  "legalName",
  "timezone",
  "alternateEmail",
  "country",
  "phone",
  "birthDate",
  "photoPublic",
  "countryPublic",
];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: fieldErrors(parsed) },
      { status: 400 }
    );
  }

  const current = await getStudent(session.user.email);
  if (!current) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  // Map validated form fields onto the Student record. Only fields present
  // in the payload are touched; everything else on Student is untouchable
  // from this endpoint.
  const p = parsed.data;
  const update: Partial<Student> = {};
  if (p.firstName !== undefined) update.givenName = p.firstName;
  if (p.lastName !== undefined) update.familyName = p.lastName;
  if (p.firstName !== undefined || p.lastName !== undefined) {
    update.legalName = `${p.firstName ?? current.givenName} ${
      p.lastName ?? current.familyName
    }`.trim();
  }
  if (p.timezone !== undefined) update.timezone = p.timezone;
  if (p.secondaryEmail !== undefined) update.alternateEmail = p.secondaryEmail;
  if (p.country !== undefined) update.country = p.country;
  if (p.phone !== undefined) update.phone = p.phone;
  if (p.birthDate !== undefined) update.birthDate = mdyToIso(p.birthDate)!;
  if (p.photoPublic !== undefined) update.photoPublic = p.photoPublic;
  if (p.countryPublic !== undefined) update.countryPublic = p.countryPublic;

  const updated = await updateStudentProfile(session.user.email, update);
  if (!updated) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  await logAudit({
    studentId: updated.id,
    actor: session.user.email,
    actorRole: "student",
    action:
      p.photoPublic !== undefined || p.countryPublic !== undefined
        ? Object.keys(p).length <= 2
          ? "privacy.toggle"
          : "profile.update"
        : "profile.update",
    changes: diffFields(
      current as unknown as Record<string, unknown>,
      updated as unknown as Record<string, unknown>,
      AUDITED_FIELDS
    ),
  });

  return NextResponse.json({ ok: true, student: updated });
}
