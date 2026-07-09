import { getSession } from "@/lib/auth";
import { getStudent } from "@/lib/mock-api";
import { getTodo, getTodos, createTodo, patchTodo, deleteTodo } from "@/lib/todos";
import { createTodoSchema, todoActionSchema } from "@/lib/todo-schema";
import { diffFields, logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";

async function currentStudent() {
  const session = await getSession();
  if (!session?.user?.email) return null;
  const student = await getStudent(session.user.email);
  if (!student) return null;
  return { email: session.user.email, student };
}

export async function GET() {
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  const student = await getStudent(session.user.email);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }
  const todos = await getTodos(student.id);
  return NextResponse.json({ todos });
}

/** Students can only ever create their own tasks (source is always "student"). */
export async function POST(req: NextRequest) {
  const ctx = await currentStudent();
  if (!ctx) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createTodoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const todo = await createTodo(ctx.student.id, {
    title: parsed.data.title,
    dueDate: parsed.data.dueDate ?? null,
    link: parsed.data.link ?? null,
  });

  await logAudit({
    studentId: ctx.student.id,
    actor: ctx.email,
    actorRole: "student",
    action: "todo.create",
    changes: [{ field: "title", from: null, to: todo.title }],
  });

  return NextResponse.json({ ok: true, todo });
}

/** toggle (any task) | update (student tasks: title+dueDate; system tasks:
 * dueDate only) | dismiss (system tasks only, soft-hide with a reason). */
export async function PATCH(req: NextRequest) {
  const ctx = await currentStudent();
  if (!ctx) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = todoActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const existing = await getTodo(ctx.student.id, parsed.data.id);
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const action = parsed.data;

  if (action.action === "toggle") {
    const updated = await patchTodo(ctx.student.id, action.id, {
      completedAt: action.completed ? new Date().toISOString() : null,
    });
    await logAudit({
      studentId: ctx.student.id,
      actor: ctx.email,
      actorRole: "student",
      action: action.completed ? "todo.complete" : "todo.incomplete",
      changes: [{ field: "completedAt", from: existing.completedAt, to: updated?.completedAt ?? null }],
    });
    return NextResponse.json({ ok: true, todo: updated });
  }

  if (action.action === "update") {
    if (existing.source === "system" && action.title !== undefined) {
      return NextResponse.json(
        { error: "System task titles can't be edited" },
        { status: 403 }
      );
    }
    const patch: { title?: string; dueDate?: string | null } = {};
    if (action.title !== undefined) patch.title = action.title;
    if (action.dueDate !== undefined) patch.dueDate = action.dueDate;

    const updated = await patchTodo(ctx.student.id, action.id, patch);
    await logAudit({
      studentId: ctx.student.id,
      actor: ctx.email,
      actorRole: "student",
      action: "todo.update",
      changes: diffFields(
        existing as unknown as Record<string, unknown>,
        (updated ?? existing) as unknown as Record<string, unknown>,
        ["title", "dueDate"]
      ),
    });
    return NextResponse.json({ ok: true, todo: updated });
  }

  // dismiss
  if (existing.source !== "system") {
    return NextResponse.json({ error: "Only system tasks can be dismissed" }, { status: 400 });
  }
  const updated = await patchTodo(ctx.student.id, action.id, {
    dismissed: { at: new Date().toISOString(), reason: action.reason },
  });
  await logAudit({
    studentId: ctx.student.id,
    actor: ctx.email,
    actorRole: "student",
    action: "todo.dismiss",
    changes: [{ field: "dismissed", from: null, to: action.reason }],
  });
  return NextResponse.json({ ok: true, todo: updated });
}

/** Student-created tasks only — system tasks cannot be deleted (dismiss instead). */
export async function DELETE(req: NextRequest) {
  const ctx = await currentStudent();
  if (!ctx) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const existing = await getTodo(ctx.student.id, id);
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  if (existing.source === "system") {
    return NextResponse.json({ error: "System tasks can't be deleted" }, { status: 403 });
  }

  await deleteTodo(ctx.student.id, id);
  await logAudit({
    studentId: ctx.student.id,
    actor: ctx.email,
    actorRole: "student",
    action: "todo.delete",
    changes: [{ field: "title", from: existing.title, to: null }],
  });

  return NextResponse.json({ ok: true });
}
