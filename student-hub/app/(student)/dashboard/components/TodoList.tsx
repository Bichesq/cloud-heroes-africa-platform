"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Loader2, Plus, Trash2, X } from "lucide-react";
import type { Todo } from "@/types";
import { visibleTodos, sortTodos, formatDueDate } from "@/lib/todos-utils";

export default function TodoList({
  initialTodos,
  now,
}: {
  initialTodos: Todo[];
  now: string; // ISO, computed server-side so sort/overdue math is deterministic
}) {
  const [todos, setTodos] = useState(initialTodos);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  const [dismissingId, setDismissingId] = useState<string | null>(null);
  const [dismissReason, setDismissReason] = useState("");

  const visible = useMemo(
    () => sortTodos(visibleTodos(todos), new Date(now)),
    [todos, now]
  );

  async function toggle(id: string, completed: boolean) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", id, completed }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.todo) throw new Error();
      setTodos((prev) => prev.map((t) => (t.id === id ? json.todo : t)));
    } catch {
      setError("Couldn't update that task. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function addTask() {
    const title = newTitle.trim();
    if (!title) return;
    setBusyId("new");
    setError(null);
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, dueDate: newDueDate || null }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.todo) throw new Error();
      setTodos((prev) => [...prev, json.todo]);
      setNewTitle("");
      setNewDueDate("");
      setAdding(false);
    } catch {
      setError("Couldn't add that task. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/todos?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Couldn't delete that task. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDismiss(id: string) {
    const reason = dismissReason.trim();
    if (!reason) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dismiss", id, reason }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.todo) throw new Error();
      setTodos((prev) => prev.map((t) => (t.id === id ? json.todo : t)));
      setDismissingId(null);
      setDismissReason("");
    } catch {
      setError("Couldn't dismiss that task. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="cha-card flex flex-col gap-3.5 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">To Do List</h2>
        <button
          onClick={() => setAdding((v) => !v)}
          aria-label="Add task"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cha-orange/10 text-cha-orange transition-colors hover:bg-cha-orange/20"
        >
          <Plus size={15} />
        </button>
      </div>

      {error && (
        <p role="alert" className="text-[12.5px] font-medium text-red-500">
          {error}
        </p>
      )}

      {adding && (
        <div className="flex flex-col gap-2 rounded-2xl border border-cha-border bg-cha-surface-2 p-3">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Task title"
            className="h-9 w-full rounded-lg border border-cha-border bg-cha-surface px-3 text-sm outline-none focus:border-cha-blue"
          />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="h-9 flex-1 rounded-lg border border-cha-border bg-cha-surface px-3 text-sm outline-none focus:border-cha-blue"
            />
            <button
              onClick={addTask}
              disabled={busyId === "new" || !newTitle.trim()}
              className="flex h-9 items-center gap-1 rounded-lg bg-cha-orange px-3 text-sm font-semibold text-white transition disabled:opacity-60"
            >
              {busyId === "new" ? <Loader2 size={14} className="animate-spin" /> : "Add"}
            </button>
          </div>
        </div>
      )}

      {visible.length === 0 && !adding && (
        <p className="text-sm text-cha-muted">No tasks right now.</p>
      )}

      <div className="flex flex-col gap-2.5">
        {visible.map((t) => {
          const done = !!t.completedAt;
          const overdue = !done && !!t.dueDate && t.dueDate < now.slice(0, 10);
          const busy = busyId === t.id;
          const row = (
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => toggle(t.id, !done)}
                disabled={busy}
                aria-label={done ? "Mark incomplete" : "Mark complete"}
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-colors ${
                  done
                    ? "border-cha-orange bg-cha-orange text-white"
                    : overdue
                      ? "border-red-400"
                      : "border-cha-orange/50"
                }`}
              >
                {done && <Check size={13} strokeWidth={3} />}
              </button>
              <div className="min-w-0">
                <div
                  className={`truncate text-sm font-semibold ${
                    done ? "text-cha-faint line-through" : "text-cha-ink"
                  }`}
                >
                  {t.title}
                </div>
                {t.dueDate && (
                  <div className={`text-xs ${overdue ? "font-semibold text-red-500" : "text-cha-faint"}`}>
                    {formatDueDate(t.dueDate)}
                  </div>
                )}
              </div>
            </div>
          );

          return (
            <div key={t.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                {t.link ? (
                  <Link href={t.link} className="min-w-0 flex-1 hover:opacity-80">
                    {row}
                  </Link>
                ) : (
                  <div className="min-w-0 flex-1">{row}</div>
                )}

                {t.source === "student" ? (
                  <button
                    onClick={() => remove(t.id)}
                    disabled={busy}
                    aria-label="Delete task"
                    className="shrink-0 rounded-full p-1.5 text-cha-faint transition-colors hover:bg-cha-surface-2 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                ) : (
                  !done && (
                    <button
                      onClick={() => setDismissingId(dismissingId === t.id ? null : t.id)}
                      disabled={busy}
                      aria-label="Dismiss task"
                      className="shrink-0 rounded-full p-1.5 text-cha-faint transition-colors hover:bg-cha-surface-2 hover:text-cha-ink"
                    >
                      <X size={14} />
                    </button>
                  )
                )}
              </div>

              {dismissingId === t.id && (
                <div className="flex items-center gap-2 rounded-xl border border-cha-border bg-cha-surface-2 p-2">
                  <input
                    value={dismissReason}
                    onChange={(e) => setDismissReason(e.target.value)}
                    placeholder="Why dismiss this?"
                    className="h-8 flex-1 rounded-lg border border-cha-border bg-cha-surface px-2.5 text-xs outline-none focus:border-cha-blue"
                  />
                  <button
                    onClick={() => confirmDismiss(t.id)}
                    disabled={busy || !dismissReason.trim()}
                    className="h-8 shrink-0 rounded-lg bg-cha-ink px-2.5 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
