import { Label, ProgressBar } from "@heroui/react";
import type { StudentUnitStatus } from "@/types";

/* Unit progress, pinned to the bottom-right corner of the content card
 * (Figma "Unit View (Reading - Learning Material)" ProgressBar node, 241×43:
 * "Progress" extra-bold / "n%" medium above a 22px orange-on-zinc track) —
 * outside the card's scroll area, so it's visible at all times (2026-09-24).
 * The compact unit status word on the left isn't in the frame; it's kept
 * from the design evaluation's minimized-sidebar recommendation. */

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
    <div className="flex shrink-0 items-end justify-between gap-4 border-t border-cha-border px-8 py-3 sm:px-10">
      <p className={`pb-0.5 text-[13px] font-semibold ${status?.className ?? "text-cha-faint"}`}>
        {status?.label ?? "Not started"}
      </p>
      <ProgressBar value={progressPct} size="lg" className="w-[240px] shrink-0">
        <Label className="text-xs font-extrabold text-cha-ink">Progress</Label>
        <ProgressBar.Output className="text-xs font-medium text-cha-ink" />
        <ProgressBar.Track className="h-5.5">
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>
    </div>
  );
}
