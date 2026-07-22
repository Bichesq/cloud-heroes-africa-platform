"use client";

import { Info } from "lucide-react";
import type { SupportTicket } from "@/types";
import AppButton from "@/components/ui/AppButton";

/**
 * Always-visible escalation path (gap-closure #6). The CTA label reflects
 * the selected category's desk so the student understands where the
 * request is headed without needing to know the internal Help Desk /
 * Service Desk split. Shows a duplicate-discouraging notice when the
 * student already has an open request in the selected category (gap #7).
 */
export default function NeedMoreHelp({
  ctaLabel,
  onOpenTicket,
  existingTicket,
  onViewExisting,
}: {
  ctaLabel: string;
  onOpenTicket: () => void;
  existingTicket?: SupportTicket | null;
  onViewExisting?: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl bg-cha-surface-2 p-7 text-left sm:items-center sm:text-center">
      <h2 className="font-display text-xl font-extrabold">Need More Help?</h2>

      {existingTicket && (
        <button
          onClick={onViewExisting}
          className="flex items-start gap-2 rounded-xl bg-cha-warning/15 px-3.5 py-2.5 text-left text-[12.5px] font-medium text-amber-700 hover:bg-cha-warning/25 dark:text-cha-warning sm:text-center"
        >
          <Info size={15} className="mt-0.5 shrink-0" />
          You already have a request in progress for this topic ({existingTicket.status}). View it before opening another.
        </button>
      )}

      <AppButton onPress={onOpenTicket}>{ctaLabel}</AppButton>
    </div>
  );
}
