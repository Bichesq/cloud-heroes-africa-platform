"use client";

import { Card, Label, ProgressBar, Separator } from "@heroui/react";
import { Flag } from "lucide-react";

/* Question-navigation sidebar (Figma "Question Palette Sidebar", brief §5.2):
 * "Assessment Progress" bar, a "Status Summary" legend with live
 * Answered/Flagged/Remaining counts, and the numbered 4-column "Questions
 * Palette" jump grid. Deliberately generic (no assessment-specific typing)
 * so the Readiness runner can reuse it. */

export type PaletteQuestionState = {
  answered: boolean;
  flagged: boolean;
};

export default function QuestionPalette({
  states,
  currentIndex,
  onJump,
}: {
  states: PaletteQuestionState[];
  currentIndex: number;
  onJump: (index: number) => void;
}) {
  const answeredCount = states.filter((s) => s.answered).length;
  const flaggedCount = states.filter((s) => s.flagged).length;
  const remainingCount = states.length - answeredCount;
  const progressPct = Math.round((answeredCount / Math.max(states.length, 1)) * 100);

  return (
    <Card className="w-full shrink-0 lg:w-[340px]">
      <Card.Content className="flex flex-col gap-5">
        <ProgressBar value={progressPct} size="sm" className="w-full">
          <Label className="font-semibold">Assessment Progress</Label>
          <ProgressBar.Output className="font-semibold" />
          <ProgressBar.Track>
            <ProgressBar.Fill />
          </ProgressBar.Track>
        </ProgressBar>

        <Separator />

        <div>
          <p className="text-[13px] font-bold">Status Summary</p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] font-medium text-cha-muted">
            <LegendItem swatch="bg-cha-success" label={`Answered (${answeredCount})`} />
            <LegendItem swatch="bg-cha-warning" label={`Flagged (${flaggedCount})`} />
            <LegendItem
              swatch="border border-cha-border bg-cha-surface"
              label={`Remaining (${remainingCount})`}
            />
          </ul>
        </div>

        <Separator />

        <div>
          <p className="text-[13px] font-bold">Questions Palette</p>
          {/* Custom composition: a numbered jump grid — each cell is a plain
              button (navigation, not a selection control). */}
          <div className="mt-3 grid grid-cols-4 gap-2" role="group" aria-label="Jump to question">
            {states.map((s, i) => {
              const isCurrent = i === currentIndex;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onJump(i)}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`Question ${i + 1}${s.answered ? ", answered" : ", unanswered"}${s.flagged ? ", flagged for review" : ""}`}
                  className={`relative h-8 rounded-full text-xs font-bold outline-none transition-colors focus-visible:ring-4 focus-visible:ring-cha-blue/15 ${
                    isCurrent
                      ? "bg-cha-orange text-white"
                      : s.flagged
                        ? "bg-cha-warning/20 text-cha-warning hover:bg-cha-warning/30"
                        : s.answered
                          ? "bg-cha-success/15 text-cha-success hover:bg-cha-success/25"
                          : "border border-cha-border bg-cha-surface text-cha-faint hover:bg-cha-surface-2"
                  }`}
                >
                  {i + 1}
                  {s.flagged && (
                    <Flag
                      size={10}
                      aria-hidden
                      className={`absolute right-1.5 top-1 ${isCurrent ? "fill-white text-white" : "fill-cha-warning text-cha-warning"}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}

function LegendItem({ swatch, label }: { swatch: string; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span aria-hidden className={`h-3 w-3 rounded-[3px] ${swatch}`} />
      {label}
    </li>
  );
}
