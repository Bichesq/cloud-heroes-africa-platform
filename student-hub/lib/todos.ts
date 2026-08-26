import type { Todo as PrismaTodo } from "@prisma/client";
import type { Todo } from "@/types";
import { prisma } from "./prisma";

/* To Do widget store. Prisma-backed (model in
 * prisma-shared/student-hub-local-models.prisma) — replaces
 * student-hub/data/todos.json per
 * docs/plan/2026-08-23-centralize-shared-data.md. Business rules (system
 * tasks can't be deleted or have their title edited, only dismissed) are
 * enforced in app/api/todos/route.ts — this module is a plain CRUD store. */

function toTodo(row: PrismaTodo): Todo {
  return {
    id: row.id,
    studentId: row.studentId,
    title: row.title,
    dueDate: row.dueDate,
    link: row.link,
    source: row.source,
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    dismissed: row.dismissedAt
      ? { at: row.dismissedAt.toISOString(), reason: row.dismissedReason ?? "" }
      : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getTodos(studentId: string): Promise<Todo[]> {
  const rows = await prisma.todo.findMany({ where: { studentId } });
  return rows.map(toTodo);
}

export async function getTodo(studentId: string, id: string): Promise<Todo | null> {
  const row = await prisma.todo.findFirst({ where: { studentId, id } });
  return row ? toTodo(row) : null;
}

export async function createTodo(
  studentId: string,
  input: { title: string; dueDate: string | null; link: string | null }
): Promise<Todo> {
  const row = await prisma.todo.create({
    data: {
      studentId,
      title: input.title,
      dueDate: input.dueDate,
      link: input.link,
      source: "student",
      completedAt: null,
    },
  });
  return toTodo(row);
}

export async function patchTodo(
  studentId: string,
  id: string,
  patch: Partial<Pick<Todo, "title" | "dueDate" | "link" | "completedAt" | "dismissed">>
): Promise<Todo | null> {
  const existing = await prisma.todo.findFirst({ where: { studentId, id } });
  if (!existing) return null;

  const row = await prisma.todo.update({
    where: { id: existing.id },
    data: {
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.dueDate !== undefined ? { dueDate: patch.dueDate } : {}),
      ...(patch.link !== undefined ? { link: patch.link } : {}),
      ...(patch.completedAt !== undefined
        ? { completedAt: patch.completedAt ? new Date(patch.completedAt) : null }
        : {}),
      ...(patch.dismissed !== undefined
        ? {
            dismissedAt: patch.dismissed ? new Date(patch.dismissed.at) : null,
            dismissedReason: patch.dismissed ? patch.dismissed.reason : null,
          }
        : {}),
    },
  });
  return toTodo(row);
}

export async function deleteTodo(studentId: string, id: string): Promise<boolean> {
  const existing = await prisma.todo.findFirst({ where: { studentId, id } });
  if (!existing) return false;
  await prisma.todo.delete({ where: { id: existing.id } });
  return true;
}
