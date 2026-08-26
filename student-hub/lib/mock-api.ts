import type { Prisma, Student as PrismaStudent } from "@prisma/client";
import type { MfaMethod, Passkey, Student } from "@/types";
import { prisma } from "./prisma";
import { DEFAULT_PROGRAM_ID } from "./curriculum";

/* Student registry. Prisma-backed (model in
 * prisma-shared/platform-core-models.prisma) — replaces the repo-root
 * data/students.json JSON store per
 * docs/plan/2026-08-23-centralize-shared-data.md. student-hub is the SOLE
 * authoritative writer for Student rows (2026-08-24 decision in that plan);
 * learning-platform's own writes go through
 * app/api/integration/students/route.ts instead of a direct Prisma write. */

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

// Called on every login — creates Student on first login,
// updates lastLogin on subsequent logins (Option C core logic)
export async function upsertStudent(params: {
  email: string;
  givenName: string;
  familyName: string;
  approvedEmailId: string;
}): Promise<{ student: Student; isNew: boolean }> {
  const email = params.email.toLowerCase();
  const existing = await prisma.student.findUnique({ where: { email } });

  if (existing) {
    const updated = await prisma.student.update({
      where: { email },
      data: { lastLogin: new Date() },
    });
    return { student: toStudent(updated), isNew: false };
  }

  const created = await prisma.student.create({
    data: {
      approvedEmailId: params.approvedEmailId,
      email,
      givenName: params.givenName,
      familyName: params.familyName,
      photoPublic: true,
      countryPublic: true,
      mfaMethods: [],
      passkeys: [],
      activeProgramId: DEFAULT_PROGRAM_ID,
      status: "active",
      lastLogin: new Date(),
      profileCompletedAt: null,
    },
  });
  return { student: toStudent(created), isNew: true };
}

export async function getStudent(email: string): Promise<Student | null> {
  const row = await prisma.student.findUnique({ where: { email: email.toLowerCase() } });
  return row ? toStudent(row) : null;
}

export async function updateStudentProfile(
  email: string,
  profile: Partial<Student>
): Promise<Student | null> {
  const existing = await prisma.student.findUnique({ where: { email: email.toLowerCase() } });
  if (!existing) return null;

  // Completion is judged on the merged record (partial updates — e.g. a
  // single privacy toggle — must not prevent completion). Set once, never reset.
  const merged = { ...toStudent(existing), ...profile };
  const profileCompletedAt =
    existing.profileCompletedAt ??
    (merged.legalName && merged.city && merged.country && merged.birthDate && merged.phone
      ? new Date()
      : null);

  const data: Prisma.StudentUpdateInput = {
    ...(profile.givenName !== undefined ? { givenName: profile.givenName } : {}),
    ...(profile.familyName !== undefined ? { familyName: profile.familyName } : {}),
    ...(profile.legalName !== undefined ? { legalName: profile.legalName } : {}),
    ...(profile.displayName !== undefined ? { displayName: profile.displayName } : {}),
    ...(profile.timezone !== undefined ? { timezone: profile.timezone } : {}),
    ...(profile.alternateEmail !== undefined ? { alternateEmail: profile.alternateEmail } : {}),
    ...(profile.country !== undefined ? { country: profile.country } : {}),
    ...(profile.city !== undefined ? { city: profile.city } : {}),
    ...(profile.phone !== undefined ? { phone: profile.phone } : {}),
    ...(profile.birthDate !== undefined ? { birthDate: profile.birthDate } : {}),
    ...(profile.track !== undefined ? { track: profile.track } : {}),
    ...(profile.avatarUrl !== undefined ? { avatarUrl: profile.avatarUrl } : {}),
    ...(profile.photoPublic !== undefined ? { photoPublic: profile.photoPublic } : {}),
    ...(profile.countryPublic !== undefined ? { countryPublic: profile.countryPublic } : {}),
    ...(profile.mfaMethods !== undefined ? { mfaMethods: profile.mfaMethods as object } : {}),
    ...(profile.passkeys !== undefined ? { passkeys: profile.passkeys as object } : {}),
    ...(profile.activeProgramId !== undefined ? { activeProgramId: profile.activeProgramId } : {}),
    ...(profile.status !== undefined ? { status: profile.status } : {}),
    profileCompletedAt,
  };

  const updated = await prisma.student.update({ where: { email: email.toLowerCase() }, data });
  return toStudent(updated);
}

export async function banStudent(
  email: string,
  updatedBy: string
): Promise<void> {
  await prisma.student.updateMany({
    where: { email: email.toLowerCase() },
    data: { status: "banned" },
  });
}
