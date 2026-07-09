import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { Todo } from "@/types";

/* JSON-file store for the To Do widget. Business rules (system tasks can't
 * be deleted or have their title edited, only dismissed) are enforced in
 * app/api/todos/route.ts — this module is a plain CRUD store. */

const FILE = path.join(process.cwd(), "data", "todos.json");

async function readAll(): Promise<Todo[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf-8")) as Todo[];
  } catch {
    return [];
  }
}

async function writeAll(todos: Todo[]): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(todos, null, 2));
}

export async function getTodos(studentId: string): Promise<Todo[]> {
  const all = await readAll();
  return all.filter((t) => t.studentId === studentId);
}

export async function getTodo(studentId: string, id: string): Promise<Todo | null> {
  const all = await readAll();
  return all.find((t) => t.studentId === studentId && t.id === id) ?? null;
}

export async function createTodo(
  studentId: string,
  input: { title: string; dueDate: string | null; link: string | null }
): Promise<Todo> {
  const all = await readAll();
  const now = new Date().toISOString();
  const todo: Todo = {
    id: randomUUID(),
    studentId,
    title: input.title,
    dueDate: input.dueDate,
    link: input.link,
    source: "student",
    completedAt: null,
    dismissed: null,
    createdAt: now,
    updatedAt: now,
  };
  all.push(todo);
  await writeAll(all);
  return todo;
}

export async function patchTodo(
  studentId: string,
  id: string,
  patch: Partial<Pick<Todo, "title" | "dueDate" | "link" | "completedAt" | "dismissed">>
): Promise<Todo | null> {
  const all = await readAll();
  const idx = all.findIndex((t) => t.studentId === studentId && t.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  await writeAll(all);
  return all[idx];
}

export async function deleteTodo(studentId: string, id: string): Promise<boolean> {
  const all = await readAll();
  const idx = all.findIndex((t) => t.studentId === studentId && t.id === id);
  if (idx === -1) return false;
  all.splice(idx, 1);
  await writeAll(all);
  return true;
}
