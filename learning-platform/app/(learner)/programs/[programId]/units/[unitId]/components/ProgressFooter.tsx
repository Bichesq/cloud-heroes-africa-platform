import type { StudentUnitStatus } from "@/types";

/* Bottom progress strip (mockup: "Progress ... 2%") plus a compact unit
 * status word — visible even in focus mode, per the design evaluation's
 * minimized-sidebar recommendation. */

const STATUS_TEXT: Record<StudentUnitStatus, { label: string; className: string }> = {
  in_progress: { label: "In progress", className: "text-cha-orange" },
  completed: { label: "Completed — verification pending", className: "text-cha-ocean" },
  retake: { label: "Retake required", className: "text-cha-warning" },
  verified: { label: "Competent / Verified", className: "text-cha-success" },
};

export default function ProgressFooter({
  progressPct,
  unitStatus,
}: {
  progressPct: number;
  unitStatus: StudentUnitStatus | null;
}) {
  const status = unitStatus ? STATUS_TEXT[unitStatus] : null;

  return (
    <div className="mt-auto border-t border-cha-border px-8 py-4 sm:px-10">
      <div className="flex items-center justify-between text-sm">
        <span className={`font-semibold ${status?.className ?? "text-cha-faint"}`}>
          {status?.label ?? "Not started"}
        </span>
        <span className="font-bold">
          Progress <span className="ml-2">{progressPct}%</span>
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-cha-surface-2">
        <div
          className="h-full rounded-full bg-cha-orange transition-all"
          style={{ width: `${Math.max(progressPct, 2)}%` }}
        />
      </div>
    </div>
  );
}
