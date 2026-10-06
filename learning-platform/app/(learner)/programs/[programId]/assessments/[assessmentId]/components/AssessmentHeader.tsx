"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import { ArrowLeft, Home } from "lucide-react";

/* Assessment View header (Figma, all 12 frames): orange home chip, back
 * arrow + "Exit", then the assessment title with a "Module Assessment •
 * Ongoing/Ended" status line. Replaces the breadcrumb row on this screen —
 * the frames draw "Exit" where the breadcrumb trail normally sits. */

export default function AssessmentHeader({
  title,
  kind = "Module Assessment",
  status,
  exitLabel = "Exit",
  onExit,
  aside,
}: {
  title: string;
  /** Status-line label; Exam Readiness reuses this header (plan step 5). */
  kind?: string;
  status: "Ongoing" | "Ended" | null;
  exitLabel?: string;
  onExit: () => void;
  aside?: React.ReactNode;
}) {
  return (
    <header className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3 border-b border-cha-border bg-cha-surface px-5 py-4">
      <div className="flex items-center gap-2">
        <Link
          href="/courses"
          aria-label="Home"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cha-orange text-white outline-none transition-colors hover:bg-cha-orange-strong focus-visible:ring-4 focus-visible:ring-cha-blue/15"
        >
          <Home size={16} />
        </Link>
        <Button size="sm" variant="ghost" onPress={onExit}>
          <ArrowLeft size={16} />
          {exitLabel}
        </Button>
      </div>

      <div className="min-w-0">
        <h1 className="truncate font-display text-2xl font-extrabold leading-tight">{title}</h1>
        {status && (
          <p className="text-[15px] font-semibold text-cha-muted">
            {kind} <span className="text-cha-faint">•</span>{" "}
            <span className={status === "Ongoing" ? "text-cha-orange" : "text-cha-ink"}>
              {status}
            </span>
          </p>
        )}
      </div>

      {aside && <div className="ml-auto">{aside}</div>}
    </header>
  );
}
