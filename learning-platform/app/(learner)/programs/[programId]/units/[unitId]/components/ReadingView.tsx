"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, Separator } from "@heroui/react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { ContentBlock, UnitTopic } from "@/types";
import { blocksToScript } from "@/lib/tts/serialize";
import { useSpeech } from "@/lib/tts/useSpeech";
import BlockRenderer from "./BlockRenderer";
import TtsControlBar from "./TtsControlBar";
import type { UnitMeta } from "./UnitShell";

/* Reading lesson view — Figma "Unit View (Reading - Learning Material)":
 * topic title · static illustration (data-light stand-in for the video
 * player; no video chrome in V1) · controls row (Previous/Next + local TTS)
 * · "Topic i of n › topic" trail · reading. (The Figma's per-topic
 * "Unit N: title" heading was dropped 2026-09-24 — the rail carries it.)
 *
 * The Figma frame puts the reading text in a narrow right-hand column; that
 * column was the duplicate "Lesson Script" panel removed on Sept 21, so the
 * reading renders here in the main column instead. Previous/Next come back
 * (they were dropped 2026-07-16 when a unit was one page) because they now
 * move between Topics. */

export default function ReadingView({
  unit,
  topic,
  topicNumber,
  topicCount,
  blocks,
  isCompleted,
  advancing,
  prevHref,
  nextLabel,
  onNext,
}: {
  unit: UnitMeta;
  topic: UnitTopic | null;
  topicNumber: number;
  topicCount: number;
  blocks: ContentBlock[];
  isCompleted: boolean;
  advancing: boolean;
  prevHref: string | null;
  nextLabel: string;
  onNext: () => void;
}) {
  const speech = useSpeech();
  const title = topic?.name ?? unit.title;
  const description = topic?.description || unit.description;
  const script = useMemo(
    () => [title, blocksToScript(blocks)].join("\n\n"),
    [title, blocks]
  );

  const nav = (
    <TopicNav
      prevHref={prevHref}
      nextLabel={nextLabel}
      advancing={advancing}
      onNext={() => {
        speech.stop();
        onNext();
      }}
    />
  );

  return (
    <div className="flex flex-col px-8 pb-6 pt-7 sm:px-10">
      <h1 className="font-display text-[28px] font-extrabold leading-tight">{title}</h1>

      {/* Static hero visual (data-light replacement for the video player) */}
      {unit.heroImage && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={unit.heroImage}
          alt=""
          className="mt-5 aspect-[16/9] w-full rounded-2xl object-cover"
        />
      )}

      {/* Controls row: topic navigation + local TTS. Sticky (Sept 21, Kris):
          in the drawn order it sits under the illustration, so without this
          it scrolled away and pausing/adjusting speed mid-read meant
          scrolling back up. It pins to the top of the reading card instead. */}
      <div className="sticky top-0 z-10 -mx-8 mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-cha-border bg-cha-surface px-8 py-3 sm:-mx-10 sm:px-10">
        {nav}
        <TtsControlBar speech={speech} script={script} />
      </div>

      {/* 2026-09-24 (Bichesq): no "Unit N: title" heading per topic — the
          rail's unit title (with its orange "Unit N:") already says which
          unit this is. */}
      <div className="mt-7">
        {topic && (
          <p className="text-[15px] font-semibold text-cha-muted">
            Topic {topicNumber} of {topicCount}
            <span className="mx-1.5 text-cha-faint">›</span>
            {topic.name}
          </p>
        )}
      </div>

      <Separator className="my-5" />

      {description && <p className="text-cha-muted">{description}</p>}

      {/* Content blocks */}
      {blocks.length > 0 && (
        <div className="mt-6">
          <BlockRenderer blocks={blocks} />
        </div>
      )}

      {/* Repeated at the end so a long topic doesn't force a scroll back up */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        {isCompleted ? (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-cha-success">
            <Check size={16} />
            Unit reading completed
          </span>
        ) : (
          <span />
        )}
        {nav}
      </div>
    </div>
  );
}

function TopicNav({
  prevHref,
  nextLabel,
  advancing,
  onNext,
}: {
  prevHref: string | null;
  nextLabel: string;
  advancing: boolean;
  onNext: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        isDisabled={!prevHref}
        onPress={() => prevHref && router.push(prevHref)}
      >
        <ArrowLeft size={15} />
        Previous
      </Button>
      <Button size="sm" isPending={advancing} onPress={onNext}>
        {nextLabel}
        <ArrowRight size={15} />
      </Button>
    </div>
  );
}
