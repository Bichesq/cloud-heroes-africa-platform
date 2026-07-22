"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";

/* Mockup breadcrumb row: orange home chip, back arrow, "Back to Programs" /
 * "Module: X" (orange) / "Unit N" (faint). Rendered under the top bar on
 * program and unit screens. */

type Props = {
  moduleTitle?: string;
  unitLabel?: string; // e.g. "Unit 1"
};

export default function Breadcrumbs({ moduleTitle, unitLabel }: Props) {
  const router = useRouter();

  return (
    <div className="flex h-[52px] shrink-0 items-center gap-3 border-b border-cha-border bg-cha-surface px-5">
      <Link
        href="/courses"
        aria-label="Home"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cha-orange text-white transition-colors hover:bg-cha-orange-strong"
      >
        <Home size={16} />
      </Link>
      <button
        onClick={() => router.back()}
        aria-label="Go back"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-cha-muted transition-colors hover:bg-cha-surface-2 hover:text-cha-ink"
      >
        <ArrowLeft size={18} />
      </button>
      <nav className="flex min-w-0 items-center gap-2 font-display text-[17px] font-bold">
        <Link href="/courses" className="shrink-0 text-cha-ink hover:underline">
          Back to Programs
        </Link>
        {moduleTitle && (
          <>
            <span className="text-cha-faint">/</span>
            <span className="truncate">
              <span className="text-cha-ink">Module: </span>
              <span className="text-cha-orange">{moduleTitle}</span>
            </span>
          </>
        )}
        {unitLabel && (
          <>
            <span className="text-cha-faint">/</span>
            <span className="shrink-0 font-medium text-cha-faint">{unitLabel}</span>
          </>
        )}
      </nav>
    </div>
  );
}
