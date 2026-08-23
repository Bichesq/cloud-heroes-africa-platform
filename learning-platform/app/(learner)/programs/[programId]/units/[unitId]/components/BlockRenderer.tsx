import { AlertTriangle, Info, Lightbulb } from "lucide-react";
import type { ContentBlock } from "@/types";

/* Renders a reading's ordered content blocks. Rich text supports the small
 * markdown subset the seeds use (paragraphs, **bold**, *italic*, `code`,
 * "- " bullets) — deliberately tiny instead of pulling in a full md parser
 * for V1's data-light content. */

export default function BlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="flex flex-col gap-5">
      {[...blocks]
        .sort((a, b) => a.order - b.order)
        .map((block) => (
          <Block key={block.id} block={block} />
        ))}
    </div>
  );
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "heading": {
      const Tag = block.payload.level === 3 ? "h3" : "h2";
      return (
        <Tag
          className={`font-display font-extrabold leading-tight ${
            block.payload.level === 3 ? "text-lg" : "text-2xl"
          }`}
        >
          {block.payload.text}
        </Tag>
      );
    }
    case "richtext":
      return <RichText md={block.payload.md} />;
    case "image":
      return (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.payload.src}
            alt={block.payload.alt}
            className="w-full rounded-2xl"
          />
          {block.payload.caption && (
            <figcaption className="mt-2 text-center text-xs text-cha-faint">
              {block.payload.caption}
            </figcaption>
          )}
        </figure>
      );
    case "code":
      return (
        <pre className="overflow-x-auto rounded-2xl bg-cha-eclipse p-4 text-[13px] leading-relaxed text-zinc-100">
          <code>{block.payload.code}</code>
        </pre>
      );
    case "video":
      return (
        <video
          src={block.payload.src}
          poster={block.payload.poster}
          controls
          className="w-full rounded-2xl"
        />
      );
    case "callout": {
      const tone = block.payload.tone;
      const styles =
        tone === "warning"
          ? "border-cha-warning/50 bg-cha-warning/10"
          : tone === "tip"
            ? "border-cha-success/50 bg-cha-success/10"
            : "border-cha-blue/40 bg-cha-blue/10";
      const Icon = tone === "warning" ? AlertTriangle : tone === "tip" ? Lightbulb : Info;
      return (
        <div className={`flex gap-3 rounded-2xl border px-4 py-3.5 ${styles}`}>
          <Icon size={18} className="mt-0.5 shrink-0 text-cha-ink/70" />
          <div className="min-w-0 text-sm leading-relaxed">
            <RichText md={block.payload.md} />
          </div>
        </div>
      );
    }
    default:
      return null;
  }
}

/* ---------------- tiny markdown subset ---------------- */

function inline(text: string, keyBase: string): React.ReactNode[] {
  // Split on **bold**, *italic*, `code` — order matters (bold before italic).
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2)
      return <em key={key}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code key={key} className="rounded bg-cha-surface-2 px-1.5 py-0.5 text-[0.9em]">
          {part.slice(1, -1)}
        </code>
      );
    return part;
  });
}

function RichText({ md }: { md: string }) {
  // Group consecutive "- " lines into lists; everything else is a paragraph.
  const lines = md.split("\n");
  const nodes: React.ReactNode[] = [];
  let bullets: string[] = [];
  let paragraph: string[] = [];

  const flushBullets = (key: string) => {
    if (bullets.length === 0) return;
    nodes.push(
      <ul key={key} className="ml-5 list-disc space-y-1.5">
        {bullets.map((b, i) => (
          <li key={i} className="leading-relaxed">
            {inline(b, `${key}-li${i}`)}
          </li>
        ))}
      </ul>
    );
    bullets = [];
  };

  const flushParagraph = (key: string) => {
    if (paragraph.length === 0) return;
    nodes.push(
      <p key={key} className="leading-relaxed">
        {inline(paragraph.join(" "), key)}
      </p>
    );
    paragraph = [];
  };

  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (line.startsWith("- ") || line.startsWith("* ")) {
      flushParagraph(`p${i}`);
      bullets.push(line.slice(2));
    } else if (line === "") {
      flushParagraph(`p${i}`);
      flushBullets(`ul${i}`);
    } else {
      flushBullets(`ul${i}`);
      paragraph.push(line);
    }
  });
  flushParagraph("p-end");
  flushBullets("ul-end");

  return <div className="flex flex-col gap-3 text-[15px] text-cha-ink/90">{nodes}</div>;
}
