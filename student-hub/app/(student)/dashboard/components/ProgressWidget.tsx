import Link from "next/link";
import type { ModuleStats } from "@/lib/curriculum-utils";

/**
 * "Your Progress" bars for the active program's modules. Plain Tailwind
 * track + gradient fill so the brand orange (400→600) renders exactly;
 * completed modules switch to solid blue, matching the approved design's
 * distinct "done" color.
 */
export default function ProgressWidget({
  modules,
  hasMore,
}: {
  modules: ModuleStats[];
  hasMore: boolean;
}) {
  if (modules.length === 0) {
    return <p className="text-sm text-cha-muted">No modules yet — enroll in a program to get started.</p>;
  }

  return (
    <div className="flex flex-col gap-[18px]">
      {modules.map((m) => (
        <Link
          key={m.moduleId}
          href={`/my-program#module-${m.moduleId}`}
          className="block rounded-lg transition-opacity hover:opacity-80"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-bold">{m.title}</span>
            <span className="text-[13px] font-bold text-cha-muted">{m.percent}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-cha-surface-2">
            <div
              className={`h-full rounded-full transition-all ${
                m.complete ? "bg-cha-blue" : "bg-gradient-to-r from-[#FF8D28] to-cha-orange"
              }`}
              style={{ width: `${m.percent}%` }}
              role="progressbar"
              aria-valuenow={m.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={m.title}
            />
          </div>
        </Link>
      ))}
      {hasMore && (
        <Link
          href="/my-program"
          className="self-start text-[13px] font-semibold text-cha-blue hover:underline"
        >
          View all modules →
        </Link>
      )}
    </div>
  );
}
