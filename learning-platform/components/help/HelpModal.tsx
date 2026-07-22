"use client";

import { useState } from "react";
import { Input, Modal, TextArea, TextField } from "@heroui/react";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { TicketContext } from "@/types";
import {
  DEFAULT_HELP_CATEGORY_ID,
  LP_HELP_CATEGORIES,
} from "@/lib/help-categories";
import AppButton from "@/components/ui/AppButton";

/* Embedded Help (requirements §10) — adapted from student-hub's
 * OpenTicketModal. Present on every unit and assessment screen; submits to
 * LP's /api/support with the EXPLICIT current program/module/unit context
 * (shown read-only — the student never classifies their own request).
 * The form body only mounts while open, so each open starts fresh. */

export default function HelpModal({
  isOpen,
  onOpenChange,
  context,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  context: TicketContext;
}) {
  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="rounded-3xl sm:max-w-[480px]">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="font-display text-lg font-bold">
              Get help with this unit
            </Modal.Heading>
          </Modal.Header>

          {isOpen && (
            <HelpForm context={context} onClose={() => onOpenChange(false)} />
          )}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

function HelpForm({
  context,
  onClose,
}: {
  context: TicketContext;
  onClose: () => void;
}) {
  const [categoryId, setCategoryId] = useState(DEFAULT_HELP_CATEGORY_ID);
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contextLine = [context.programTitle, context.moduleTitle, context.unitTitle]
    .filter(Boolean)
    .join(" → ");

  async function handleSubmit() {
    if (!topic.trim() || !description.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId,
        topic: topic.trim(),
        description: description.trim(),
        preferredChannel: null,
        context,
      }),
    });
    setSubmitting(false);
    if (res.ok) setSubmitted(true);
    else setError("Couldn't submit your request. Please try again.");
  }

  if (submitted) {
    return (
      <>
        <Modal.Body className="flex flex-col items-center gap-3 py-8 text-center">
          <CheckCircle2 size={40} className="text-cha-success" />
          <p className="font-display text-lg font-bold">Request sent</p>
          <p className="max-w-[320px] text-sm text-cha-muted">
            The Help Desk has your request with your learning context attached.
            You can track it from the Student Hub Helpdesk page.
          </p>
        </Modal.Body>
        <Modal.Footer className="justify-end">
          <AppButton onPress={onClose}>Back to learning</AppButton>
        </Modal.Footer>
      </>
    );
  }

  return (
    <>
      <Modal.Body className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-cha-ink">Topic</span>
          <div className="flex flex-wrap gap-2">
            {LP_HELP_CATEGORIES.map((c) => (
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

        <TextField name="help-topic" aria-label="Short description">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Short description — what are you stuck on?"
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
