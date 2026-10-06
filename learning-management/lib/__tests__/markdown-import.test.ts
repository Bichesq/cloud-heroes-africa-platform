import { describe, expect, it } from "vitest";
import {
  decodeMarkdown,
  INTRO_TOPIC_NAME,
  MAX_MD_BYTES,
  normalizeTopicName,
  parseMarkdown,
  planTopicMatch,
  type ParsedImport,
} from "@/lib/markdown-import";

const enc = (s: string) => new TextEncoder().encode(s);
function parsed(md: string): ParsedImport {
  const r = parseMarkdown(md);
  if (!r.ok) throw new Error(r.error);
  return r.value;
}
const messages = (p: ParsedImport) => p.warnings.map((w) => w.message);

describe("decodeMarkdown (content check)", () => {
  it("accepts UTF-8 text and strips a BOM", () => {
    expect(decodeMarkdown(enc("﻿## Hi\n\nÉté à Lagos"))).toEqual({ ok: true, text: "## Hi\n\nÉté à Lagos" });
  });

  it("rejects empty, oversized, non-UTF-8 and binary files", () => {
    expect(decodeMarkdown(new Uint8Array()).ok).toBe(false);
    expect(decodeMarkdown(new Uint8Array(MAX_MD_BYTES + 1)).ok).toBe(false);
    expect(decodeMarkdown(new Uint8Array([0xc3, 0x28])).ok).toBe(false); // invalid UTF-8
    expect(decodeMarkdown(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])).ok).toBe(false); // PNG
    expect(decodeMarkdown(enc("text\u0000more")).ok).toBe(false);
  });
});

describe("parseMarkdown: topics", () => {
  it("starts a topic at each ## heading, with a level-2 heading block", () => {
    const p = parsed("## One\n\nFirst.\n\n## Two\n\nSecond.");
    expect(p.topics.map((t) => t.name)).toEqual(["One", "Two"]);
    expect(p.topics[0].blocks).toEqual([
      { type: "heading", payload: { text: "One", level: 2 } },
      { type: "richtext", payload: { md: "First." } },
    ]);
  });

  it("puts text before the first ## into an Introduction topic", () => {
    const p = parsed("Welcome.\n\n## Next\n\nMore.");
    expect(p.topics.map((t) => t.name)).toEqual([INTRO_TOPIC_NAME, "Next"]);
    expect(p.topics[0].blocks).toEqual([{ type: "richtext", payload: { md: "Welcome." } }]);
  });

  it("keeps a # inside a heading and strips closing hashes", () => {
    expect(parsed("## C#\n\nx").topics[0].name).toBe("C#");
    expect(parsed("## Topic ##\n\nx").topics[0].name).toBe("Topic");
  });

  it("drops # headings with a warning and maps ###+ to level 3", () => {
    const p = parsed("# Unit title\n\n## A\n\n### Sub\n\n#### Deeper\n\ntext");
    expect(p.topics[0].blocks.filter((b) => b.type === "heading").map((b) => b.payload)).toEqual([
      { text: "A", level: 2 },
      { text: "Sub", level: 3 },
      { text: "Deeper", level: 3 },
    ]);
    expect(messages(p).some((m) => m.startsWith('Top-level "# "'))).toBe(true);
    expect(messages(p).some((m) => m.includes('"#### "'))).toBe(true);
  });

  it("rejects duplicate topic headings (re-import matching needs them unique)", () => {
    const r = parseMarkdown("## Same\n\na\n\n## same.\n\nb");
    expect(r).toMatchObject({ ok: false });
  });

  it("rejects empty files and too many topics", () => {
    expect(parseMarkdown("   \n\n").ok).toBe(false);
    const many = Array.from({ length: 51 }, (_, i) => `## T${i}\n\nx`).join("\n\n");
    expect(parseMarkdown(many)).toMatchObject({ ok: false });
  });

  it("notes topic counts outside the 6–12 guidance, and empty topics", () => {
    const p = parsed("## Only\n");
    expect(messages(p)).toContain("1 topic: the guidance is 6–12 topics per unit (about 10).");
    expect(messages(p)).toContain('Topic "Only" has no content under its heading.');
    const ten = parsed(Array.from({ length: 10 }, (_, i) => `## T${i}\n\nx`).join("\n\n"));
    expect(messages(ten).some((m) => m.includes("guidance"))).toBe(false);
  });
});

describe("parseMarkdown: blocks", () => {
  it("one rich-text block per blank-line-separated chunk, bullets included", () => {
    const p = parsed("## A\n\nIntro line\nsecond line\n\n- one\n- **two**\n");
    expect(p.topics[0].blocks.slice(1)).toEqual([
      { type: "richtext", payload: { md: "Intro line\nsecond line" } },
      { type: "richtext", payload: { md: "- one\n- **two**" } },
    ]);
  });

  it("fenced code keeps its content verbatim, including # lines and blank lines", () => {
    const p = parsed("## A\n\n```bash\n# not a heading\n\naws s3 ls\n```\n");
    expect(p.topics[0].blocks[1]).toEqual({ type: "code", payload: { lang: "bash", code: "# not a heading\n\naws s3 ls" } });
  });

  it("ignores an unsafe code language label, and closes an unterminated fence", () => {
    const p = parsed('## A\n\n```js onload="x"\nconst a = 1;');
    expect(p.topics[0].blocks[1]).toEqual({ type: "code", payload: { lang: "", code: "const a = 1;" } });
    expect(messages(p)).toContain("The code block's language label was ignored.");
    expect(messages(p)).toContain("This code block was never closed, so it runs to the end of the file.");
  });

  it("blockquotes become callouts; [!TIP] / [!WARNING] set the tone", () => {
    const p = parsed("## A\n\n> Plain note\n> continues\n\n> [!TIP]\n> Try this\n\n> [!warning]\n> Careful");
    expect(p.topics[0].blocks.slice(1)).toEqual([
      { type: "callout", payload: { tone: "info", md: "Plain note\ncontinues" } },
      { type: "callout", payload: { tone: "tip", md: "Try this" } },
      { type: "callout", payload: { tone: "warning", md: "Careful" } },
    ]);
  });

  it("skips images (standalone and inline) with a warning — nothing external is kept", () => {
    const p = parsed("## A\n\n![diagram](https://evil.example/track.png)\n\nSee ![x](http://x/y.png) here.");
    const md = JSON.stringify(p.topics);
    expect(md).not.toContain("evil.example");
    expect(md).not.toContain("http://x/y.png");
    expect(p.topics[0].blocks[1]).toEqual({ type: "richtext", payload: { md: "See  here." } });
    expect(messages(p).filter((m) => m.startsWith("Images aren't imported"))).toHaveLength(2);
  });

  it("flags links, numbered lists, tables and HTML, keeping them as plain text", () => {
    const p = parsed("## A\n\n[site](https://x.test)\n\n1. first\n\n| a | b |\n\n<script>alert(1)</script>");
    const m = messages(p);
    expect(m).toContain("Links aren't supported yet and show as plain text.");
    expect(m).toContain('Numbered lists show as plain text. Use "- " bullets instead.');
    expect(m).toContain("Tables aren't supported and show as plain text.");
    expect(m).toContain("HTML isn't rendered. It shows as plain text.");
    // Stored as text only; the learner renderer escapes it.
    expect(p.topics[0].blocks.at(-1)).toEqual({ type: "richtext", payload: { md: "<script>alert(1)</script>" } });
  });

  it("warnings carry line numbers", () => {
    const p = parsed("## A\n\ntext\n\n![i](x)");
    expect(p.warnings.find((w) => w.message.startsWith("Images"))?.line).toBe(5);
  });

  it("normalises CRLF line endings", () => {
    expect(parsed("## A\r\n\r\nline one\r\nline two").topics[0].blocks[1]).toEqual({
      type: "richtext",
      payload: { md: "line one\nline two" },
    });
  });

  it("estimates duration at ~200 words a minute, ignoring code", () => {
    const words = Array.from({ length: 450 }, () => "word").join(" ");
    const p = parsed(`## A\n\n${words}\n\n\`\`\`\n${words}\n\`\`\``);
    expect(p.words).toBe(451); // + the heading
    expect(p.estimatedMinutes).toBe(3);
    expect(parsed("## A\n\nshort").estimatedMinutes).toBe(1);
  });
});

describe("topic matching on re-import", () => {
  const existing = [
    { id: "t1", name: "What is the Cloud?" },
    { id: "t2", name: "Regions" },
    { id: "t3", name: "Old topic" },
  ];

  it("keeps same-heading topics (case/space/trailing punctuation insensitive)", () => {
    const plan = planTopicMatch(existing, ["what is the   cloud", "Regions", "Brand new"]);
    expect(plan.kept).toEqual([
      { id: "t1", name: "what is the   cloud", previousName: "What is the Cloud?" },
      { id: "t2", name: "Regions", previousName: "Regions" },
    ]);
    expect(plan.added).toEqual(["Brand new"]);
    expect(plan.removed).toEqual([{ id: "t3", name: "Old topic" }]);
  });

  it("first import: everything is new", () => {
    expect(planTopicMatch([], ["A", "B"])).toEqual({ kept: [], added: ["A", "B"], removed: [] });
  });

  it("normalizeTopicName", () => {
    expect(normalizeTopicName("  Hello   World!  ")).toBe("hello world");
    expect(normalizeTopicName("Ｆｕｌｌwidth")).toBe("fullwidth");
  });
});
