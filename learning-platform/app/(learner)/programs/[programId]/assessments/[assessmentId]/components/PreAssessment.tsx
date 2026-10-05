"use client";

import { Alert, Button, Card } from "@heroui/react";
import { ArrowRight, LifeBuoy } from "lucide-react";
import type { LastAttempt } from "./types";

/* Figma "Assessment View (Start Assessment)": "Assessment:" eyebrow, the
 * module heading, description, Start / Report an Issue, and an Instructions
 * card (question count, attempts so far, last attempt grade). Time limit and
 * the post-fail cooldown aren't drawn in the frame but are real V1 rules, so
 * they're kept in the same card rather than dropped. */

export default function PreAssessment({
  heading,
  description,
  questionsPerAttempt,
  timeLimitSeconds,
  maxAttempts,
  attemptCount,
  lastAttempt,
  hasInProgressAttempt,
  cooldownUntil,
  busy,
  error,
  onStart,
  onReportIssue,
}: {
  heading: string;
  description: string;
  questionsPerAttempt: number;
  timeLimitSeconds: number | null;
  maxAttempts: number | null;
  attemptCount: number;
  lastAttempt: LastAttempt;
  hasInProgressAttempt: boolean;
  cooldownUntil: string | null;
  busy: boolean;
  error: string | null;
  onStart: () => void;
  onReportIssue: () => void;
}) {
  const onCooldown = cooldownUntil !== null && new Date(cooldownUntil) > new Date();
  // Decision 7b: at the cap a new attempt is refused (a started one resumes).
  const atLimit = maxAttempts !== null && attemptCount >= maxAttempts && !hasInProgressAttempt;

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 px-6 py-10 lg:grid-cols-[1fr_340px]">
      <section>
        <p className="font-display text-lg font-bold text-cha-orange">Assessment:</p>
        <h2 className="mt-1 font-display text-3xl font-extrabold leading-tight">{heading}</h2>
        {description && <p className="mt-3 max-w-xl text-cha-muted">{description}</p>}

        {onCooldown && (
          <Alert status="warning" className="mt-6">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Retake not available yet</Alert.Title>
              <Alert.Description>
                You can retake this assessment after {new Date(cooldownUntil!).toLocaleString()}.
              </Alert.Description>
            </Alert.Content>
          </Alert>
        )}

        {atLimit && (
          <Alert status="warning" className="mt-6">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>No attempts left</Alert.Title>
              <Alert.Description>
                You&apos;ve used all {maxAttempts} attempts. Use Report an Issue to ask support for another one.
              </Alert.Description>
            </Alert.Content>
          </Alert>
        )}

        {error && (
          <Alert status="danger" className="mt-6">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button size="lg" isPending={busy} isDisabled={onCooldown || atLimit} onPress={onStart}>
            {hasInProgressAttempt ? "Resume Assessment" : "Start Assessment"}
            <ArrowRight size={16} />
          </Button>
          <Button size="lg" variant="outline" onPress={onReportIssue}>
            <LifeBuoy size={16} />
            Report an Issue
          </Button>
        </div>
      </section>

      <Card>
        <Card.Header>
          <Card.Title className="font-display text-lg font-extrabold">Instructions:</Card.Title>
          <Card.Description>
            Attempt all Questions. Earning Points will allow you to unlock the next module.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <dl className="flex flex-col gap-2.5 text-sm">
            <InfoRow label="Number of Questions" value={String(questionsPerAttempt)} />
            <InfoRow
              label="Time Limit"
              value={timeLimitSeconds === null ? "No time limit" : `${Math.round(timeLimitSeconds / 60)} minutes`}
            />
            <InfoRow label="Attempts Allowed" value={maxAttempts === null ? "Unlimited" : String(maxAttempts)} />
            <InfoRow label="Number of Assessment Attempts" value={String(attemptCount)} />
            <InfoRow
              label="Last Attempt Grade"
              value={
                lastAttempt?.score != null ? `${Math.round(lastAttempt.score * 100)}%` : "—"
              }
              valueClassName={
                lastAttempt?.passed === true
                  ? "text-cha-success"
                  : lastAttempt?.passed === false
                    ? "text-cha-danger"
                    : undefined
              }
            />
          </dl>
        </Card.Content>
      </Card>
    </div>
  );
}

function InfoRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-cha-muted">{label}:</dt>
      <dd className={`font-bold ${valueClassName ?? "text-cha-ink"}`}>{value}</dd>
    </div>
  );
}
