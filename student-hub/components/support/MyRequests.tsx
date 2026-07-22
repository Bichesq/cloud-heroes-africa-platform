"use client";

import { Loader2, UserRound } from "lucide-react";
import type { HelpCategory, SupportTicket } from "@/types";
import AppButton from "@/components/ui/AppButton";
import StatusChip from "./StatusChip";

/** ISO 8601 UTC timestamp → "7/17/2026, 2:42 PM". Parses the string
 * directly rather than using Date#toLocaleString, whose output depends on
 * the runtime's default locale/timezone — that differs between the Node
 * SSR process and the browser and causes a hydration mismatch (matches
 * formatJoinedDate's approach in lib/profile-utils.ts for the same reason). */
function formatUpdated(iso: string): string {
  const [datePart, timePart] = iso.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hourStr, minuteStr] = timePart.split(":");
  const hour24 = Number(hourStr);
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${month}/${day}/${year}, ${hour12}:${minuteStr} ${period}`;
}

function categoryLabel(categories: HelpCategory[], categoryId: string): string {
  return categories.find((c) => c.id === categoryId)?.label ?? "General";
}

export const OPEN_STATUSES = new Set<SupportTicket["status"]>(["open", "pending", "responded"]);

/**
 * Student-visible support history (gap-closure #2). `variant="compact"`
 * gives the Helpdesk landing a lightweight "help already in progress"
 * glance; `variant="full"` (Support Tickets tab) renders the complete
 * lifecycle — status, last updated, assigned owner, chronological status
 * history, and resolution summary (gap-closure #3), with student-side
 * cancel / consent-to-close actions.
 */
export default function MyRequests({
  tickets,
  categories,
  variant,
  onViewAll,
  onCancel,
  onConsentClose,
  busyId,
}: {
  tickets: SupportTicket[];
  categories: HelpCategory[];
  variant: "compact" | "full";
  onViewAll?: () => void;
  onCancel?: (id: string) => void;
  onConsentClose?: (id: string) => void;
  busyId?: string | null;
}) {
  if (tickets.length === 0) {
    return variant === "compact" ? null : (
      <p className="text-sm text-cha-muted">
        You don&apos;t have any support requests yet. Search above or open a
        new request if you need help.
      </p>
    );
  }

  if (variant === "compact") {
    const preview = tickets.slice(0, 3);
    return (
      <div className="flex flex-col gap-3.5 rounded-2xl bg-cha-surface-2 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-[15px] font-bold">My Requests</h3>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-[12.5px] font-semibold text-cha-ink underline underline-offset-2 hover:text-cha-orange"
            >
              View All
            </button>
          )}
        </div>
        <ul className="flex flex-col gap-2.5">
          {preview.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-cha-surface px-3.5 py-2.5"
            >
              <div className="min-w-0">
                <div className="truncate text-[13.5px] font-semibold text-cha-ink">
                  {t.topic}
                </div>
                <div className="truncate text-[11.5px] text-cha-faint">
                  {categoryLabel(categories, t.categoryId)} · Updated{" "}
                  {formatUpdated(t.updatedAt)}
                </div>
              </div>
              <StatusChip status={t.status} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {tickets.map((t) => {
        const busy = busyId === t.id;
        const canCancel = OPEN_STATUSES.has(t.status) && t.status !== "responded";
        const canConsentClose = t.status === "responded" && !!t.resolutionSummary;
        return (
          <li key={t.id} className="rounded-2xl border border-cha-border p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-cha-ink">{t.topic}</p>
                <p className="mt-0.5 text-[12.5px] text-cha-faint">
                  {categoryLabel(categories, t.categoryId)} ·{" "}
                  {t.desk === "service" ? "Service Desk" : "Help Desk"} · Updated{" "}
                  {formatUpdated(t.updatedAt)}
                </p>
              </div>
              <StatusChip status={t.status} />
            </div>

            <p className="mt-3 text-[13.5px] leading-relaxed text-cha-muted">
              {t.description}
            </p>

            {t.assignedTo && (
              <p className="mt-3 flex items-center gap-1.5 text-[12.5px] text-cha-muted">
                <UserRound size={14} className="shrink-0" />
                Assigned to {t.assignedTo}
              </p>
            )}

            <ol className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-cha-faint">
              {t.statusLog.map((entry, i) => (
                <li key={i} className="capitalize">
                  {entry.status} — {formatUpdated(entry.at)}
                </li>
              ))}
            </ol>

            {t.resolutionSummary && (
              <div className="mt-3 rounded-xl bg-cha-success/10 p-3.5 text-[13px] leading-relaxed text-emerald-700 dark:text-cha-success">
                <p className="font-semibold">Resolution summary</p>
                <p className="mt-1">{t.resolutionSummary}</p>
              </div>
            )}

            {(canCancel || canConsentClose) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {canConsentClose && onConsentClose && (
                  <AppButton
                    size="sm"
                    isDisabled={busy}
                    onPress={() => onConsentClose(t.id)}
                  >
                    {busy ? <Loader2 size={14} className="animate-spin" /> : "Confirm resolved"}
                  </AppButton>
                )}
                {canCancel && onCancel && (
                  <AppButton
                    size="sm"
                    variant="ghost"
                    className="bg-cha-surface-2 text-cha-muted"
                    isDisabled={busy}
                    onPress={() => onCancel(t.id)}
                  >
                    Cancel request
                  </AppButton>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
