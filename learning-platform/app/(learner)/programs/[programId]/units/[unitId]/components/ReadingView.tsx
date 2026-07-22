"use client";

import { useMemo } from "react";
import { ArrowRight, Check } from "lucide-react";
import type { LpItem } from "@/types";
import { blocksToScript } from "@/lib/tts/serialize";
import { useSpeech } from "@/lib/tts/useSpeech";
import BlockRenderer from "./BlockRenderer";
import TtsControlBar from "./TtsControlBar";
import type { UnitMeta } from "./UnitShell";

/* Canonical reading-material lesson view (mockup View 1, adjusted by the
 * 2026-07-16 decisions: no "Learning Material" heading, no author info, no
 * prev/next arrows). Static hero visual + local TTS + content blocks +
 * "Go to Next Item". */

export default function ReadingView({
  unit,
  sectionTitle,
  sectionNumber,
  item,
  isCompleted,
  isLast,
  advancing,
  onAdvance,
}: {
  unit: UnitMeta;
  sectionTitle: string;
  sectionNumber: number;
  item: LpItem;
  isCompleted: boolean;
  isLast: boolean;
  advancing: boolean;
  onAdvance: () => void;
}) {
  const speech = useSpeech();
  const script = useMemo(
    () =>
      [item.title, ...(item.blocks ? [blocksToScript(item.blocks)] : [])].join(
        "\n\n"
      ),
    [item]
  );

  return (
    <div className="flex flex-col px-8 pb-6 pt-7 sm:px-10">
      <h1 className="font-display text-2xl font-extrabold">{item.title}</h1>

      {/* Static hero visual (data-light replacement for the video player) */}
      {item.heroImage && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={item.heroImage}
          alt=""
          className="mt-5 aspect-[16/9] w-full rounded-2xl object-cover"
        />
      )}

      {/* Local TTS controls */}
      <div className="mt-4">
        <TtsControlBar speech={speech} script={script} />
      </div>

      {/* Unit / section context line */}
      <div className="mt-6 border-b border-cha-border pb-3">
        <h2 className="font-display text-xl font-extrabold">
          <span className="text-cha-orange">Unit {unit.order}: </span>
          {unit.title}
        </h2>
        <p className="mt-1 text-sm">
          <span className="font-bold text-cha-orange">Section {sectionNumber}: </span>
          <span className="font-semibold">{sectionTitle}</span>
          <span className="text-cha-faint"> &gt; {item.title}</span>
        </p>
      </div>

      {/* Content blocks */}
      <div className="mt-6">
        {item.blocks && item.blocks.length > 0 ? (
          <BlockRenderer blocks={item.blocks} />
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
          {isLast ? "Finish unit" : "Go to Next Item"}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
