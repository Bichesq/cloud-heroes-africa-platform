import type { Todo } from "@/types";

/* Pure To Do list logic — no I/O, unit-testable. */

/** Dismissed (soft-hidden) system tasks are excluded from the visible list
 * but kept in storage. */
export function visibleTodos(todos: Todo[]): Todo[] {
  return todos.filter((t) => !t.dismissed);
}

function isOverdue(t: Todo, todayIso: string): boolean {
  return !t.completedAt && !!t.dueDate && t.dueDate < todayIso;
}

function rank(t: Todo, todayIso: string): 0 | 1 | 2 {
  if (t.completedAt) return 2;
  if (isOverdue(t, todayIso)) return 0;
  return 1;
}

/** Overdue-incomplete first (earliest due date first), then other
 * incomplete (earliest due date first, no-due-date last), then completed
 * last (most recently completed first). */
export function sortTodos(todos: Todo[], now: Date): Todo[] {
  const todayIso = now.toISOString().slice(0, 10);

  return [...todos].sort((a, b) => {
    const rankDiff = rank(a, todayIso) - rank(b, todayIso);
    if (rankDiff !== 0) return rankDiff;

    if (rank(a, todayIso) === 2) {
      return (b.completedAt ?? "").localeCompare(a.completedAt ?? "");
    }
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

/** "Tuesday, 30 June" — display format for a "YYYY-MM-DD" due date. */
export function formatDueDate(dueDate: string): string {
  const d = new Date(`${dueDate}T00:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });
}
