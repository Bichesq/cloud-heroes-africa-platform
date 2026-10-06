/* Unit Editor .md import (plan §9; decision #6). Pure — heavily unit-tested.
 *
 * Maps a Markdown file onto the content blocks the learner app's renderer
 * actually supports (learning-platform BlockRenderer: headings, rich text with
 * **bold** / *italic* / `code` / "- " bullets, code, callouts). Each "## "
 * heading starts a Topic; text before the first one is topic 1,
 * "Introduction".
 *
 * Nothing here is ever rendered as HTML — the learner renderer escapes
 * everything — so unsupported syntax (links, numbered lists, tables, raw
 * HTML) is kept as plain text and flagged. Images are skipped and flagged
 * (decision 2026-09-28: learners must never load external URLs). */

export const MAX_MD_BYTES = 1024 * 1024;
export const MAX_TOPICS = 50;
export const MAX_BLOCKS = 500;
const MAX_TOPIC_NAME = 200;
const MAX_BLOCK_CHARS = 20_000;
const MAX_WARNINGS = 100;
const WORDS_PER_MINUTE = 200;
export const INTRO_TOPIC_NAME = "Introduction";

export type CalloutTone = "info" | "tip" | "warning";

export type ImportBlock =
  | { type: "heading"; payload: { text: string; level: 2 | 3 } }
  | { type: "richtext"; payload: { md: string } }
  | { type: "code"; payload: { lang: string; code: string } }
  | { type: "callout"; payload: { tone: CalloutTone; md: string } };

export type ImportTopic = { name: string; blocks: ImportBlock[] };
export type ImportWarning = { line: number; message: string };
export type ParsedImport = {
  topics: ImportTopic[];
  warnings: ImportWarning[];
  words: number;
  estimatedMinutes: number;
};
export type ImportResult = { ok: true; value: ParsedImport } | { ok: false; error: string };

/* ------------------------------ decoding ------------------------------ */

/** The content check for a text upload (SECURITY.md §10): it must be valid
 * UTF-8 with no control characters other than tab / newline / CR. */
export function decodeMarkdown(bytes: Uint8Array): { ok: true; text: string } | { ok: false; error: string } {
  if (bytes.length === 0) return { ok: false, error: "The file is empty." };
  if (bytes.length > MAX_MD_BYTES) return { ok: false, error: "Markdown files must be 1 MB or smaller." };
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return { ok: false, error: "The file isn't a UTF-8 text file." };
  }
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text)) {
    return { ok: false, error: "The file contains characters that aren't allowed in a text file." };
  }
  return { ok: true, text };
}

/* ------------------------------ parsing ------------------------------- */

const CALLOUT_MARKER = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$/i;
const CALLOUT_TONES: Record<string, CalloutTone> = {
  NOTE: "info",
  IMPORTANT: "info",
  TIP: "tip",
  WARNING: "warning",
  CAUTION: "warning",
};
const IMAGE = /!\[[^\]]*\]\([^)]*\)/;
const IMAGES = /!\[[^\]]*\]\([^)]*\)/g;
const STANDALONE_IMAGE = /^\s*!\[[^\]]*\]\([^)]*\)\s*$/;
const FENCE = /^(```|~~~)(.*)$/;
const CODE_LANG = /^[A-Za-z0-9+#.-]{0,20}$/;

const PLAIN_TEXT_CHECKS: { test: RegExp; message: string }[] = [
  { test: /\[[^\]]+\]\([^)]+\)/, message: "Links aren't supported yet and show as plain text." },
  { test: /^\s*\d+[.)]\s/m, message: 'Numbered lists show as plain text. Use "- " bullets instead.' },
  { test: /^\s*\|.*\|\s*$/m, message: "Tables aren't supported and show as plain text." },
  { test: /<\/?[A-Za-z][^>]*>/, message: "HTML isn't rendered. It shows as plain text." },
];

/** Case/space-insensitive topic identity used to match a re-import's
 * headings to existing topics (decision 2026-09-28). */
export function normalizeTopicName(name: string): string {
  return name
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[\s.:!?]+$/, "");
}

const countWords = (s: string) => (s.match(/\S+/g) ?? []).length;

export function parseMarkdown(input: string): ImportResult {
  const lines = input.replace(/\r\n?/g, "\n").split("\n");
  const topics: ImportTopic[] = [];
  const warnings: ImportWarning[] = [];
  let current: ImportTopic | null = null;

  let paragraph: string[] = [];
  let paragraphLine = 0;
  let quote: string[] = [];
  let quoteLine = 0;
  let fence: { marker: string; lang: string; line: number; body: string[] } | null = null;
  let fatal: string | null = null;

  const warn = (line: number, message: string) => {
    if (warnings.length < MAX_WARNINGS && !warnings.some((w) => w.line === line && w.message === message)) {
      warnings.push({ line, message });
    }
  };
  const topic = () => {
    if (!current) {
      current = { name: INTRO_TOPIC_NAME, blocks: [] };
      topics.push(current);
    }
    return current;
  };
  const push = (block: ImportBlock, line: number) => {
    const text = block.type === "code" ? block.payload.code : block.type === "heading" ? block.payload.text : block.payload.md;
    if (text.length > MAX_BLOCK_CHARS) fatal ??= `The section starting at line ${line} is too long. Split it up.`;
    topic().blocks.push(block);
  };

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    let md = paragraph.join("\n");
    if (IMAGE.test(md)) {
      warn(paragraphLine, "Images aren't imported yet, so this one was left out.");
      md = md.replace(IMAGES, "");
    }
    for (const check of PLAIN_TEXT_CHECKS) if (check.test.test(md)) warn(paragraphLine, check.message);
    md = md.trim();
    if (md) push({ type: "richtext", payload: { md } }, paragraphLine);
    paragraph = [];
  };

  const flushQuote = () => {
    if (quote.length === 0) return;
    let tone: CalloutTone = "info";
    const marker = CALLOUT_MARKER.exec(quote[0].trim());
    if (marker) {
      tone = CALLOUT_TONES[marker[1].toUpperCase()];
      quote = quote.slice(1);
    }
    const md = quote.join("\n").trim();
    for (const check of PLAIN_TEXT_CHECKS) if (check.test.test(md)) warn(quoteLine, check.message);
    if (md) push({ type: "callout", payload: { tone, md } }, quoteLine);
    quote = [];
  };

  const flush = () => {
    flushParagraph();
    flushQuote();
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const n = i + 1;

    if (fence) {
      if (line.trim() === fence.marker) {
        push({ type: "code", payload: { lang: fence.lang, code: fence.body.join("\n") } }, fence.line);
        fence = null;
      } else {
        fence.body.push(line);
      }
      continue;
    }

    const fenceOpen = FENCE.exec(line.trimEnd());
    if (fenceOpen) {
      flush();
      const info = fenceOpen[2].trim();
      const lang = CODE_LANG.test(info) ? info : "";
      if (!CODE_LANG.test(info)) warn(n, "The code block's language label was ignored.");
      fence = { marker: fenceOpen[1], lang, line: n, body: [] };
      continue;
    }

    if (line.trim() === "") {
      flush();
      continue;
    }

    // Optional closing hashes need a space before them ("## Topic ##"), so
    // "## C#" keeps its "#".
    const h = /^(#{1,6})\s+(.*?)(?:\s+#+)?\s*$/.exec(line);
    if (h) {
      flush();
      const level = h[1].length;
      const text = h[2].trim();
      if (!text) {
        warn(n, "An empty heading was left out.");
      } else if (level === 1) {
        warn(n, 'Top-level "# " headings are left out. The unit\'s name comes from Unit Name.');
      } else if (level === 2) {
        if (text.length > MAX_TOPIC_NAME) {
          fatal ??= `The topic heading at line ${n} is longer than ${MAX_TOPIC_NAME} characters.`;
        }
        current = { name: text, blocks: [] };
        topics.push(current);
        current.blocks.push({ type: "heading", payload: { text, level: 2 } });
      } else {
        if (level > 3) warn(n, `"${h[1]} " headings are shown as "### " headings.`);
        push({ type: "heading", payload: { text, level: 3 } }, n);
      }
      continue;
    }

    if (STANDALONE_IMAGE.test(line)) {
      flush();
      warn(n, "Images aren't imported yet, so this one was left out.");
      continue;
    }

    const q = /^\s{0,3}>\s?(.*)$/.exec(line);
    if (q) {
      flushParagraph();
      if (quote.length === 0) quoteLine = n;
      quote.push(q[1]);
      continue;
    }

    flushQuote();
    if (paragraph.length === 0) paragraphLine = n;
    paragraph.push(line);
  }

  if (fence) {
    warn(fence.line, "This code block was never closed, so it runs to the end of the file.");
    push({ type: "code", payload: { lang: fence.lang, code: fence.body.join("\n") } }, fence.line);
  }
  flush();

  if (fatal) return { ok: false, error: fatal };
  if (topics.length === 0) return { ok: false, error: "The file has no content to import." };
  if (topics.length > MAX_TOPICS) return { ok: false, error: `A unit can have at most ${MAX_TOPICS} topics. This file has ${topics.length}.` };
  const blockCount = topics.reduce((sum, t) => sum + t.blocks.length, 0);
  if (blockCount > MAX_BLOCKS) return { ok: false, error: `The file is too long (${blockCount} sections, at most ${MAX_BLOCKS}).` };

  // Topic headings must be unique: a re-import matches topics by heading.
  const seen = new Map<string, string>();
  for (const t of topics) {
    const key = normalizeTopicName(t.name);
    const prior = seen.get(key);
    if (prior !== undefined) return { ok: false, error: `Two topics are both called "${t.name}". Topic headings must be unique.` };
    seen.set(key, t.name);
  }

  for (const t of topics) {
    if (t.blocks.every((b) => b.type === "heading" && b.payload.level === 2)) {
      warn(0, `Topic "${t.name}" has no content under its heading.`);
    }
  }
  if (topics.length < 6 || topics.length > 12) {
    warn(0, `${topics.length} topic${topics.length === 1 ? "" : "s"}: the guidance is 6–12 topics per unit (about 10).`);
  }

  const words = topics
    .flatMap((t) => t.blocks)
    .reduce((sum, b) => sum + (b.type === "code" ? 0 : countWords(b.type === "heading" ? b.payload.text : b.payload.md)), 0);

  return {
    ok: true,
    value: { topics, warnings, words, estimatedMinutes: Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)) },
  };
}

/* --------------------------- topic matching ---------------------------- */

export type TopicPlan = {
  kept: { id: string; name: string; previousName: string }[];
  added: string[];
  removed: { id: string; name: string }[];
};

/** Which existing topics a re-import keeps (same heading → same id, so
 * learners keep their progress), adds, and removes. Pure. */
export function planTopicMatch(existing: { id: string; name: string }[], incoming: string[]): TopicPlan {
  const pool = new Map<string, { id: string; name: string }>();
  for (const t of existing) {
    const key = normalizeTopicName(t.name);
    if (!pool.has(key)) pool.set(key, t);
  }
  const kept: TopicPlan["kept"] = [];
  const added: string[] = [];
  for (const name of incoming) {
    const key = normalizeTopicName(name);
    const match = pool.get(key);
    if (match) {
      kept.push({ id: match.id, name, previousName: match.name });
      pool.delete(key);
    } else {
      added.push(name);
    }
  }
  const keptIds = new Set(kept.map((k) => k.id));
  return { kept, added, removed: existing.filter((t) => !keptIds.has(t.id)) };
}
