"use client";

import { useState } from "react";
import { Input, Modal, TextArea, TextField } from "@heroui/react";
import { Loader2 } from "lucide-react";
import type { HelpCategory, SupportDesk, TicketContext } from "@/types";
import AppButton from "@/components/ui/AppButton";

export type TicketDraft = {
  categoryId: string;
  desk: SupportDesk;
  topic: string;
  description: string;
  preferredChannel: string | null;
};

type SubmitResult = { ok: boolean; message?: string };

/**
 * "Open a Support Ticket" dialog — HeroUI Modal (controlled), mirrors
 * CreateEventModal's structure. Intake only ever asks for a short + long
 * description (help2.md minimum), plus an optional preferred channel;
 * category/desk are prefilled from whatever the student already selected
 * but stay editable, and learning context is captured automatically and
 * shown read-only rather than asked of the student (gap-closure #9).
 *
 * The form body only mounts while open, so every open starts from fresh
 * field state without a reset-on-prop-change effect.
 */
export default function OpenTicketModal({
  isOpen,
  onOpenChange,
  categories,
  initialCategoryId,
  context,
  onSubmit,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categories: HelpCategory[];
  initialCategoryId: string | null;
  context: TicketContext;
  onSubmit: (draft: TicketDraft) => Promise<SubmitResult>;
}) {
  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="rounded-3xl sm:max-w-[480px]">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="font-display text-lg font-bold">
              Open a Support Request
            </Modal.Heading>
          </Modal.Header>

          {isOpen && (
            <TicketForm
              categories={categories}
              initialCategoryId={initialCategoryId}
              context={context}
              onSubmit={onSubmit}
              onClose={() => onOpenChange(false)}
            />
          )}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

function TicketForm({
  categories,
  initialCategoryId,
  context,
  onSubmit,
  onClose,
}: {
  categories: HelpCategory[];
  initialCategoryId: string | null;
  context: TicketContext;
  onSubmit: (draft: TicketDraft) => Promise<SubmitResult>;
  onClose: () => void;
}) {
  const [categoryId, setCategoryId] = useState(initialCategoryId ?? categories[0]?.id ?? "");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [preferredChannel, setPreferredChannel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const category = categories.find((c) => c.id === categoryId);
  const contextLine = [context.programTitle, context.moduleTitle, context.unitTitle]
    .filter(Boolean)
    .join(" → ");

  async function handleSubmit() {
    if (!category || !topic.trim() || !description.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    const result = await onSubmit({
      categoryId: category.id,
      desk: category.desk,
      topic: topic.trim(),
      description: description.trim(),
      preferredChannel: preferredChannel.trim() || null,
    });
    setSubmitting(false);
    if (result.ok) {
      onClose();
    } else {
      setError(result.message ?? "Couldn't submit your request. Please try again.");
    }
  }

  return (
    <>
      <Modal.Body className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-cha-ink">Topic</span>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(c.id)}
                aria-pressed={categoryId === c.id}
                className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
                  categoryId === c.id
                    ? "bg-cha-orange text-white"
                    : "bg-cha-surface-2 text-cha-muted hover:text-cha-ink"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <TextField name="ticket-topic" aria-label="Short description">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Short description — what's going on?"
            maxLength={140}
            className="w-full rounded-2xl"
          />
        </TextField>

        <TextArea
          aria-label="Detailed description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more detail — what have you tried, and what were you expecting?"
          className="h-28 w-full rounded-2xl"
        />

        <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-cha-ink">
          Preferred channel (optional)
          <select
            value={preferredChannel}
            onChange={(e) => setPreferredChannel(e.target.value)}
            className="h-10 rounded-xl border border-cha-border bg-cha-surface px-3 text-sm font-medium text-cha-ink outline-none focus:border-cha-blue"
          >
            <option value="">No preference</option>
            <option value="Email">Email</option>
            <option value="In-platform thread">In-platform thread</option>
          </select>
        </label>

        {contextLine && (
          <p className="rounded-xl bg-cha-surface-2 px-3.5 py-2.5 text-[12px] leading-relaxed text-cha-faint">
            We&apos;ll attach your current context automatically: {contextLine}
          </p>
        )}

        {error && (
          <p role="alert" className="text-[12.5px] font-medium text-red-500">
            {error}
          </p>
        )}
      </Modal.Body>

      <Modal.Footer className="justify-end gap-2">
        <AppButton
          onPress={handleSubmit}
          isDisabled={submitting || !topic.trim() || !description.trim()}
        >
          {submitting ? <Loader2 size={15} className="animate-spin" /> : "Submit Request"}
        </AppButton>
        <AppButton
          variant="ghost"
          className="bg-cha-surface-2 text-cha-muted"
          onPress={onClose}
          isDisabled={submitting}
        >
          Cancel
        </AppButton>
      </Modal.Footer>
    </>
  );
}
