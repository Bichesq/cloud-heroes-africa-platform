import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import type { ProgramStats } from "@/lib/curriculum-utils";

/**
 * Small utility card (per the approved design) showing the student's single
 * active program, its progress bar, and "X/Y Modules Completed". Clicking
 * navigates to My Program; the empty state encourages enrollment.
 */
export default function RecentProgramCard({ overall }: { overall: ProgramStats | null }) {
  return (
    <div className="cha-card flex flex-col gap-3.5 p-5">
      <h2 className="font-display text-lg font-bold">Recent Enrolled Program</h2>

      {overall ? (
        <Link
          href="/my-program"
          className="flex items-center gap-3 rounded-2xl border border-cha-border bg-cha-surface-2 p-3.5 transition-colors hover:bg-cha-border/60"
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cha-orange/10 text-cha-orange">
            <GraduationCap size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold">{overall.title}</div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-cha-surface">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FF8D28] to-cha-orange"
                style={{ width: `${overall.percent}%` }}
                role="progressbar"
                aria-valuenow={overall.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={overall.title}
              />
            </div>
          </div>
        </Link>
      ) : (
        <Link
          href="/explore"
          className="flex flex-col items-start gap-2 rounded-2xl border border-dashed border-cha-border p-4 transition-colors hover:bg-cha-surface-2"
        >
          <GraduationCap size={20} className="text-cha-faint" />
          <p className="text-sm text-cha-muted">You&apos;re not enrolled in a program yet.</p>
          <span className="flex items-center gap-1 text-sm font-semibold text-cha-orange">
            Explore Programs <ArrowRight size={14} />
          </span>
        </Link>
      )}

      {overall && (
        <div className="text-right text-xs font-semibold text-cha-muted">
          {overall.completedModules}/{overall.totalModules} Modules Completed
        </div>
      )}
    </div>
  );
}
