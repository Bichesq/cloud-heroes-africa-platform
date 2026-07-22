"use client";

import Link from "next/link";
import { SearchX } from "lucide-react";
import type { Faq } from "@/types";
import AppCard from "@/components/ui/AppCard";
import AppButton from "@/components/ui/AppButton";

/**
 * Search-first self-service surface (gap-closure #1): matching FAQs/articles
 * render before any request-creation CTA. Escalation always stays visible
 * (gap #6), and a no-results state offers clear next actions (gap #7)
 * instead of a dead end.
 */
export default function SearchResults({
  query,
  results,
  onClearSearch,
  onOpenTicket,
}: {
  query: string;
  results: Faq[];
  onClearSearch: () => void;
  onOpenTicket: () => void;
}) {
  return (
    <AppCard padding="lg" className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">
          {results.length > 0
            ? `${results.length} result${results.length === 1 ? "" : "s"} for "${query}"`
            : `No results for "${query}"`}
        </h2>
        <button
          onClick={onClearSearch}
          className="shrink-0 text-[13px] font-semibold text-cha-muted underline underline-offset-2 hover:text-cha-ink"
        >
          Clear search
        </button>
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-start gap-4">
          <div className="flex items-start gap-3 text-cha-muted">
            <SearchX size={20} className="mt-0.5 shrink-0" />
            <p className="text-sm leading-relaxed">
              We couldn&apos;t find an existing answer for that. Try a
              different search term, browse topics below, or open a request
              so a real person can help.
            </p>
          </div>
          <AppButton onPress={onOpenTicket}>Open a Support Ticket</AppButton>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-4">
            {results.map((faq) => (
              <li key={faq.id} className="rounded-2xl border border-cha-border p-4">
                <p className="text-[14.5px] font-bold text-cha-ink">{faq.question}</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-cha-muted">
                  {faq.answer}
                </p>
                {faq.href && (
                  <Link
                    href={faq.href}
                    className="mt-2 inline-block text-[13px] font-semibold text-cha-blue underline underline-offset-2"
                  >
                    Open related page
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="flex flex-col items-start gap-2 border-t border-cha-border pt-4">
            <p className="text-sm text-cha-muted">Didn&apos;t solve it?</p>
            <AppButton variant="outline" onPress={onOpenTicket}>
              Still need help? Open a request
            </AppButton>
          </div>
        </>
      )}
    </AppCard>
  );
}
