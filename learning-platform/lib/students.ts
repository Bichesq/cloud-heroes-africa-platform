import type { Student as PrismaStudent } from "@prisma/client";
import type { MfaMethod, Passkey, Student } from "@/types";
import { prisma } from "./prisma";

/* Shared student registry. Prisma-backed (model in
 * prisma-shared/platform-core-models.prisma) — replaces the repo-root
 * data/students.json JSON store per
 * docs/plan/2026-08-23-centralize-shared-data.md. student-hub is the SOLE
 * authoritative writer for Student rows (2026-08-24 decision in that plan)
 * — upsertStudent below calls student-hub's
 * /api/integration/students API instead of writing to Postgres directly,
 * fixing the pre-existing split-brain-writer problem where both apps
 * independently upserted the same row. getStudent stays a direct Prisma
 * read — LP's own relational access to Student is unaffected. */

/** Matches student-hub's DEFAULT_PROGRAM_ID so the two surfaces agree on the
 * default enrollment. */
export const DEFAULT_PROGRAM_ID = "cloud-practitioner";

function toStudent(row: PrismaStudent): Student {
  return {
    id: row.id,
    approvedEmailId: row.approvedEmailId,
    email: row.email,
    givenName: row.givenName,
    familyName: row.familyName,
    legalName: row.legalName ?? undefined,
    displayName: row.displayName ?? undefined,
    phone: row.phone ?? undefined,
    alternateEmail: row.alternateEmail ?? undefined,
    birthDate: row.birthDate ?? undefined,
    city: row.city ?? undefined,
    country: row.country ?? undefined,
    timezone: row.timezone ?? undefined,
    track: row.track ?? undefined,
    avatarUrl: row.avatarUrl ?? undefined,
    photoPublic: row.photoPublic,
    countryPublic: row.countryPublic,
    mfaMethods: (row.mfaMethods as MfaMethod[]) ?? [],
    passkeys: (row.passkeys as Passkey[]) ?? [],
    activeProgramId: row.activeProgramId ?? undefined,
    status: row.status,
    lastLogin: row.lastLogin.toISOString(),
    profileCompletedAt: row.profileCompletedAt ? row.profileCompletedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// Called on every login — creates Student on first login (via student-hub's
// API), updates lastLogin on subsequent logins (same contract as before).
export async function upsertStudent(params: {
  email: string;
  givenName: string;
  familyName: string;
  approvedEmailId: string;
}): Promise<{ student: Student; isNew: boolean }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STUDENT_HUB_URL}/api/integration/students`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-integration-token": process.env.INTEGRATION_TOKEN ?? "",
      },
      body: JSON.stringify(params),
    }
  );

  if (!res.ok) {
    throw new Error(`student-hub upsertStudent failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

export async function getStudent(email: string): Promise<Student | null> {
  const row = await prisma.student.findUnique({ where: { email: email.toLowerCase() } });
  return row ? toStudent(row) : null;
}
