"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import type { Faq } from "@/types";
import AppCard from "@/components/ui/AppCard";

/**
 * "Common Questions & Troubleshooting" panel. Filtered by the selected
 * category (gap-closure #4), click-to-expand answers so self-service is a
 * real resolution path rather than a static list, and a "View All" toggle
 * to fall back to the full catalog. Shows a no-results state when a
 * category has nothing to offer.
 */
export default function CommonQuestions({
  faqs,
  allFaqs,
  categoryLabel,
}: {
  faqs: Faq[];
  allFaqs: Faq[];
  categoryLabel?: string;
}) {
  const [showAll, setShowAll] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const visible = showAll ? allFaqs : faqs;

  return (
    <AppCard padding="lg" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-[19px] font-bold leading-tight">
          Common Questions
          <br />& Troubleshooting
        </h2>
        <button
          onClick={() => setShowAll((v) => !v)}
          className="shrink-0 text-[13px] font-semibold text-cha-ink underline underline-offset-2 hover:text-cha-orange"
        >
          {showAll ? "Show Fewer" : "View All"}
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-start gap-2 text-sm text-cha-muted">
          <p>
            No common questions for {categoryLabel ?? "this topic"} yet.
          </p>
          <button
            onClick={() => setShowAll(true)}
            className="font-semibold text-cha-blue underline underline-offset-2"
          >
            Browse all questions instead
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((faq) => {
            const expanded = expandedId === faq.id;
            return (
              <li key={faq.id}>
                <button
                  onClick={() => setExpandedId(expanded ? null : faq.id)}
                  aria-expanded={expanded}
                  className="flex w-full items-start gap-2.5 text-left text-[14px] font-semibold text-cha-ink hover:text-cha-orange"
                >
                  <HelpCircle size={17} className="mt-0.5 shrink-0 text-cha-ink" />
                  <span className={expanded ? "underline underline-offset-2" : ""}>
                    {faq.question}
                  </span>
                </button>
                {expanded && (
                  <p className="ml-[26px] mt-1.5 text-[13px] leading-relaxed text-cha-muted">
                    {faq.answer}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </AppCard>
  );
}
