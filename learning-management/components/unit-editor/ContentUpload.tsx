"use client";

import { useRef, useState, useTransition } from "react";
import { Alert, Button, Chip, Spinner } from "@heroui/react";
import { FileText } from "lucide-react";
import { previewImport, type ImportPreview } from "@/lib/actions/unit-editor";

/* Unit Editor → Content Upload (Figma "Markdown Upload": file-text glyph,
 * file name, "Markdown file · 24.5 KB", "Replace file"). Choosing a file runs
 * a server-side dry run (decision #6) and shows what the import will do —
 * topics kept / new / removed, and anything flagged — before anything is
 * written. The file stays in the form's `content` input and is parsed again
 * on Save Draft / Publish.
 *
 * Copy deviates from the Figma note ("auto-generate the course structure,
 * knowledge checks, and module assessments"): V1 imports content and Topics
 * only (decision #6). */

export function formatBytes(n: number): string {
  return n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`;
}

export default function ContentUpload({
  programId,
  unitId,
  canEdit,
  current,
  onEstimate,
  error,
}: {
  programId: string;
  unitId: string;
  canEdit: boolean;
  /** What learners see now / what's waiting in the draft. */
  current: { live: { name: string | null; bytes: number | null; topics: number }; pending: { name: string; bytes: number } | null };
  onEstimate: (minutes: number) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(null);
    setPreviewError(null);
    if (!file) return;
    const fd = new FormData();
    fd.set("content", file);
    startTransition(async () => {
      const result = await previewImport(programId, unitId, fd);
      if (result.ok) {
        setPreview(result.preview);
        onEstimate(result.preview.estimatedMinutes);
      } else {
        setPreviewError(result.error);
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  const shown = preview
    ? { name: preview.fileName, bytes: preview.bytes, note: "Not saved yet" }
    : current.pending
      ? { name: current.pending.name, bytes: current.pending.bytes, note: "In the draft, not published yet" }
      : current.live.name
        ? { name: current.live.name, bytes: current.live.bytes, note: "Published" }
        : null;

  return (
    <section aria-labelledby="content-heading">
      <h2 id="content-heading" className="font-display text-lg font-extrabold">
        Content Upload
      </h2>
      <div className={`mt-4 rounded-[10px] border p-6 ${error ? "border-cha-danger" : "border-cha-border"} bg-cha-surface`}>
        <div className="flex flex-wrap items-center gap-4">
          <FileText size={24} className="shrink-0 text-cha-muted" aria-hidden />
          <div className="min-w-0 flex-1">
            {shown ? (
              <>
                <p className="truncate text-sm font-bold text-cha-ink">{shown.name}</p>
                <p className="text-[13px] text-cha-muted">
                  Markdown file{shown.bytes !== null ? ` · ${formatBytes(shown.bytes)}` : ""} · {shown.note}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-cha-ink">
                  {current.live.topics > 0 ? `${current.live.topics} topics published` : "No content yet"}
                </p>
                <p className="text-[13px] text-cha-muted">
                  {current.live.topics > 0 ? "Imported before uploads were tracked" : "Upload a Markdown (.md) file"}
                </p>
              </>
            )}
          </div>
          {canEdit && (
            <>
              <input
                ref={inputRef}
                type="file"
                name="content"
                accept=".md,.markdown,text/markdown"
                className="sr-only"
                onChange={onChange}
                aria-label="Markdown content file"
              />
              <Button size="sm" variant="outline" className="rounded-md font-bold" onPress={() => inputRef.current?.click()} isDisabled={pending}>
                {shown || current.live.topics > 0 ? "Replace file" : "Choose file"}
              </Button>
            </>
          )}
        </div>
        <p className="mt-4 text-[11px] text-cha-muted">
          Uploading an .md file replaces this unit&apos;s content and topics. Each &ldquo;## &rdquo; heading starts a
          topic. Knowledge checks and assessments are authored in their own editors.
        </p>

        {pending && (
          <p className="mt-4 flex items-center gap-2 text-sm text-cha-muted" role="status">
            <Spinner size="sm" /> Checking the file…
          </p>
        )}
        {(previewError || error) && (
          <Alert status="danger" className="mt-4">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>{previewError ?? error}</Alert.Description>
            </Alert.Content>
          </Alert>
        )}
        {preview && <PreviewPanel preview={preview} />}
      </div>
    </section>
  );
}

function PreviewPanel({ preview }: { preview: ImportPreview }) {
  const kept = preview.topics.filter((t) => t.status === "kept").length;
  return (
    <div className="mt-5 rounded-md border border-cha-border bg-cha-canvas p-4" aria-live="polite">
      <p className="text-sm font-bold text-cha-ink">
        Preview: {preview.topics.length} topic{preview.topics.length === 1 ? "" : "s"}, about {preview.estimatedMinutes} min
      </p>
      <p className="mt-0.5 text-xs text-cha-muted">
        Nothing is saved until you choose Save Draft or Publish Unit.
        {kept > 0 && " Topics with the same heading keep learners' progress."}
      </p>
      <ol className="mt-3 flex flex-col gap-1.5">
        {preview.topics.map((t, i) => (
          <li key={t.name} className="flex items-center gap-2 text-sm">
            <span className="w-5 shrink-0 text-right text-xs font-bold text-cha-muted">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate">{t.name}</span>
            <span className="text-xs text-cha-muted">{t.blocks} sections</span>
            <Chip size="sm" variant="soft" color={t.status === "kept" ? "success" : "accent"}>
              {t.status === "kept" ? "Kept" : "New"}
            </Chip>
          </li>
        ))}
      </ol>
      {preview.removed.length > 0 && (
        <div className="mt-3 text-sm">
          <p className="font-semibold text-cha-ink">Removed on publish ({preview.removed.length})</p>
          <p className="text-xs text-cha-muted">Learners&apos; progress on these topics is dropped.</p>
          <ul className="mt-1 list-disc pl-5 text-cha-muted">
            {preview.removed.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      )}
      {preview.warnings.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-cha-ink">Check before publishing ({preview.warnings.length})</p>
          <ul className="mt-1 flex flex-col gap-1 text-xs text-cha-muted">
            {preview.warnings.map((w, i) => (
              <li key={i}>
                {w.line > 0 && <span className="font-bold">Line {w.line}: </span>}
                {w.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
