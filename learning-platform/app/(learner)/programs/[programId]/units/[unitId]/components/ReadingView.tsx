"use client";

import { useMemo } from "react";
import { ArrowRight, Check } from "lucide-react";
import { blocksToScript } from "@/lib/tts/serialize";
import { useSpeech } from "@/lib/tts/useSpeech";
import BlockRenderer from "./BlockRenderer";
import TtsControlBar from "./TtsControlBar";
import type { UnitMeta } from "./UnitShell";

/* Canonical reading-material lesson view (mockup View 1, adjusted by the
 * 2026-07-16 decisions: no "Learning Material" heading, no author info, no
 * prev/next arrows). Static hero visual + local TTS + content blocks +
 * "Go to Next".
 *
 * (2026-08-11: Section/Item are gone — a Unit's contentBlocks ARE the
 * reading, so there is no more per-item title/section breadcrumb below the
 * unit heading itself.) */

export default function ReadingView({
  unit,
  isCompleted,
  hasKc,
  advancing,
  onAdvance,
}: {
  unit: UnitMeta;
  isCompleted: boolean;
  hasKc: boolean;
  advancing: boolean;
  onAdvance: () => void;
}) {
  const speech = useSpeech();
  const script = useMemo(
    () => [unit.title, blocksToScript(unit.contentBlocks)].join("\n\n"),
    [unit]
  );

  return (
    <div className="flex flex-col px-8 pb-6 pt-7 sm:px-10">
      <h1 className="font-display text-2xl font-extrabold">
        <span className="text-cha-orange">Unit {unit.order}: </span>
        {unit.title}
      </h1>

      {/* Static hero visual (data-light replacement for the video player) */}
      {unit.heroImage && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={unit.heroImage}
          alt=""
          className="mt-5 aspect-[16/9] w-full rounded-2xl object-cover"
        />
      )}

      {/* Local TTS controls */}
      <div className="mt-4">
        <TtsControlBar speech={speech} script={script} />
      </div>

      {/* Content blocks */}
      <div className="mt-6 border-t border-cha-border pt-6">
        {unit.contentBlocks.length > 0 ? (
          <BlockRenderer blocks={unit.contentBlocks} />
        ) : (
          <p className="text-cha-muted">{unit.description}</p>
        )}
      </div>

      {/* Advance — the only navigation control (2026-07-16) */}
      <div className="mt-10 flex items-center justify-end gap-3">
        {isCompleted && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-cha-success">
            <Check size={16} />
            Completed
          </span>
        )}
        <button
          onClick={onAdvance}
          disabled={advancing}
          className="flex items-center gap-2 rounded-lg bg-cha-ocean px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-cha-ocean/90 disabled:opacity-60"
        >
          {hasKc ? "Continue to Knowledge Check" : "Finish unit"}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
