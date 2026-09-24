/* Pure progress rules for topic-split units (decision-log
 * 2026-09-24 "Per-topic progress formula", Sept 21 decision "Unit progress:
 * per-topic granularity"). Kept free of I/O so they're unit-tested directly.
 *
 * Formula (approved option A): the reading fills up to READING_SHARE of the
 * bar — one equal slice per topic completed — and passing the unit's
 * Knowledge Check(s) supplies the rest, so 100% is only ever reached by a
 * passed KC ("scrolling alone can't prove the content was actually read").
 * A unit with no KC has nothing to gate on, so its reading fills 0 → 100%. */

export const READING_SHARE = 0.9;

export function unitProgressPct({
  topicCount,
  completedTopicCount,
  contentDone,
  kcCount,
  passedKcCount,
}: {
  /** Navigable topics; 0 = a flat, topic-less reading. */
  topicCount: number;
  completedTopicCount: number;
  /** Unit status is completed / verified / retake. */
  contentDone: boolean;
  kcCount: number;
  passedKcCount: number;
}): number {
  const readingShare = kcCount > 0 ? READING_SHARE : 1;

  const readingFraction = contentDone
    ? 1
    : topicCount > 0
      ? Math.min(completedTopicCount, topicCount) / topicCount
      : 0;

  const kcFraction = kcCount > 0 ? Math.min(passedKcCount, kcCount) / kcCount : 0;

  return Math.round((readingShare * readingFraction + (1 - readingShare) * kcFraction) * 100);
}

/** A topic-split unit's reading is complete once every navigable topic has
 * been completed — completions for topics no longer in the unit are ignored. */
export function allTopicsComplete(topicIds: string[], completedTopicIds: string[]): boolean {
  if (topicIds.length === 0) return false;
  const done = new Set(completedTopicIds);
  return topicIds.every((id) => done.has(id));
}
