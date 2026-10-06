"use client";

import { Alert, Button, Modal } from "@heroui/react";

/* Figma "assessment-end-confirmation-2" / "…-complete_review": a "Review
 * Before Submitting" dialog over the last question — Answered / Flagged /
 * Unanswered counts, the can't-change-answers warning, and Review / Submit /
 * Cancel. When nothing is flagged or unanswered the review action becomes
 * "Review Your Answers" (the complete_review frame). */

export default function SubmitReviewModal({
  isOpen,
  onOpenChange,
  answered,
  flagged,
  unanswered,
  submitting,
  error,
  onReview,
  onSubmit,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  answered: number;
  flagged: number;
  unanswered: number;
  submitting: boolean;
  error: string | null;
  onReview: () => void;
  onSubmit: () => void;
}) {
  const needsAttention = flagged > 0 || unanswered > 0;

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={!submitting}>
      <Modal.Container>
        <Modal.Dialog className="rounded-3xl sm:max-w-[520px]">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="font-display text-xl font-extrabold">
              Review Before Submitting
            </Modal.Heading>
            <p className="text-sm text-cha-muted">
              Review your progress summary before submitting your assessment.
            </p>
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat value={answered} label="Answered" className="text-cha-success" />
              <Stat value={flagged} label="Flagged" className="text-cha-warning" />
              <Stat value={unanswered} label="Unanswered" className="text-cha-faint" />
            </div>

            <Alert status={needsAttention ? "warning" : "default"}>
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>
                  {needsAttention
                    ? `You have ${unanswered} unanswered question${unanswered === 1 ? "" : "s"} and ${flagged} flagged for review. `
                    : ""}
                  Once submitted, you cannot change your answers.
                </Alert.Description>
              </Alert.Content>
            </Alert>

            {error && (
              <p role="alert" className="text-sm font-medium text-cha-danger">
                {error}
              </p>
            )}
          </Modal.Body>

          <Modal.Footer className="flex-wrap justify-end gap-2">
            <Button variant="ghost" isDisabled={submitting} onPress={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="outline" isDisabled={submitting} onPress={onReview}>
              {needsAttention ? "Review Flagged or Unanswered Questions" : "Review Your Answers"}
            </Button>
            <Button isPending={submitting} onPress={onSubmit}>
              Submit Assessment
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

function Stat({ value, label, className }: { value: number; label: string; className: string }) {
  return (
    <div className="rounded-2xl bg-cha-surface-2/70 px-3 py-3 text-xs font-semibold text-cha-muted">
      <div className={`font-display text-2xl font-extrabold ${className}`}>{value}</div>
      {label}
    </div>
  );
}
