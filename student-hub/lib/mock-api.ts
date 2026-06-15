import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { Student } from "@/types";

const FILE = path.join(process.cwd(), "data", "students.json");

async function read(): Promise<Student[]> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function write(students: Student[]): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(students, null, 2));
}

// Called on every login — creates Student on first login,
// updates lastLogin on subsequent logins (Option C core logic)
export async function upsertStudent(params: {
  email: string;
  givenName: string;
  familyName: string;
  approvedEmailId: string;
}): Promise<Student> {
  const students = await read();
  const now = new Date().toISOString();
  const existing = students.find(
    (s) => s.email.toLowerCase() === params.email.toLowerCase()
  );

  if (existing) {
    // Returning student — update lastLogin only
    existing.lastLogin = now;
    existing.updatedAt = now;
    await write(students);
    return existing;
  }

  // First login — auto-create Student record
  const newStudent: Student = {
    id: randomUUID(),
    approvedEmailId: params.approvedEmailId,
    email: params.email.toLowerCase(),
    givenName: params.givenName,
    familyName: params.familyName,
    status: "active",
    lastLogin: now,
    profileCompletedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  students.push(newStudent);
  await write(students);
  return newStudent;
}

export async function getStudent(email: string): Promise<Student | null> {
  const students = await read();
  return (
    students.find((s) => s.email.toLowerCase() === email.toLowerCase()) ?? null
  );
}

export async function updateStudentProfile(
  email: string,
  profile: Partial<Student>
): Promise<Student | null> {
  const students = await read();
  const index = students.findIndex(
    (s) => s.email.toLowerCase() === email.toLowerCase()
  );
  if (index === -1) return null;

  const now = new Date().toISOString();

  students[index] = {
    ...students[index],
    ...profile,
    email: students[index].email,         // never overwrite email
    id: students[index].id,               // never overwrite id
    approvedEmailId: students[index].approvedEmailId, // never overwrite FK
    profileCompletedAt:
      profile.legalName &&
      profile.city &&
      profile.country &&
      profile.birthDate &&
      profile.phone
        ? students[index].profileCompletedAt ?? now  // set once, never reset
        : students[index].profileCompletedAt,
    updatedAt: now,
  };

  await write(students);
  return students[index];
}

export async function banStudent(
  email: string,
  updatedBy: string
): Promise<void> {
  const students = await read();
  const index = students.findIndex(
    (s) => s.email.toLowerCase() === email.toLowerCase()
  );
  if (index === -1) return;

  students[index] = {
    ...students[index],
    status: "banned",
    updatedAt: new Date().toISOString(),
  };

  await write(students);
}