"use client";

import { Search } from "lucide-react";

/**
 * Hero banner + primary search entry point (Help View mockups: "How Can We
 * Help You Today?"). The search bar is intentionally the most prominent
 * control on the page — help.md calls it "the most obvious starting point".
 */
export default function HelpBanner({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
}) {
  return (
    <div className="rounded-[32px] bg-cha-ocean/20 p-10 text-center dark:bg-cha-ocean/10 sm:p-12">
      <h1 className="font-display text-[28px] font-extrabold leading-tight text-cha-ink sm:text-[34px]">
        How Can We Help You Today?
      </h1>

      <div className="mx-auto mt-6 max-w-xl">
        <div className="flex items-center gap-2.5 rounded-full bg-cha-surface px-5 py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
          <Search size={20} className="shrink-0 text-cha-faint" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search..."
            aria-label="Search for help articles, FAQs, or common questions"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-cha-ink outline-none placeholder:text-cha-faint"
          />
        </div>
      </div>
    </div>
  );
}
