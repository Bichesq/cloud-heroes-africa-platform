import { Student } from "@/types";
import { promises as fs } from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "students.json");

async function readDB(): Promise<Student[]> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeDB(students: Student[]): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(students, null, 2));
}

export async function saveStudent(student: Student): Promise<void> {
  const students = await readDB();
  const index = students.findIndex((s) => s.email === student.email);

  if (index >= 0) {
    students[index] = student; // update existing
  } else {
    students.push(student);   // new entry
  }

  await writeDB(students);
}

export async function getStudent(email: string): Promise<Student | null> {
  const students = await readDB();
  return students.find((s) => s.email === email) ?? null;
}