import type { ContentBlock } from "@/types";

/* Flattens a reading's content blocks into the plain-text "lesson script".
 * One string, two consumers: the local TTS engine reads it aloud, and the
 * right panel's Lesson Script tab shows it — the text IS the lesson (a
 * reading panel, not a video transcript). */

/** Strip the markdown syntax we allow in richtext blocks. */
function mdToPlain(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, "") // fenced code isn't read aloud
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .trim();
}

export function blocksToScript(blocks: ContentBlock[]): string {
  return [...blocks]
    .sort((a, b) => a.order - b.order)
    .map((block) => {
      switch (block.type) {
        case "heading":
          return block.payload.text;
        case "richtext":
          return mdToPlain(block.payload.md);
        case "callout":
          return mdToPlain(block.payload.md);
        case "image":
          return block.payload.caption ?? "";
        case "code":
          return ""; // code isn't useful read aloud
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("\n\n");
}

/** Sentence-level chunks for speechSynthesis — Chrome silently drops very
 * long utterances, so we queue many short ones instead. */
export function scriptToChunks(script: string): string[] {
  return script
    .split(/(?<=[.!?:])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
