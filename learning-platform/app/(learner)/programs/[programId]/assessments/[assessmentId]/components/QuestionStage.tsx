"use client";

import {
  Alert,
  Button,
  Checkbox,
  CheckboxGroup,
  Chip,
  Radio,
  RadioGroup,
  ToggleButton,
} from "@heroui/react";
import { ArrowLeft, ArrowRight, Flag, MessageSquareWarning } from "lucide-react";
import { optionLetter, type AttemptQuestion } from "./types";

/* Figma "assessment-active-question" / "assessment-flagged-question": a
 * "Question N of M" badge, the prompt, lettered option cards, "Report
 * Question", then Previous · Flag for Review · Next Question. On the last
 * question Next becomes "Review Questions", which opens the submit modal
 * ("assessment-end-confirmation-2"). */

export default function QuestionStage({
  question,
  index,
  total,
  markedForReport,
  onSelect,
  onToggleFlag,
  onToggleReport,
  onPrevious,
  onNext,
}: {
  question: AttemptQuestion;
  index: number;
  total: number;
  markedForReport?: boolean;
  onSelect: (selectedOptionIds: string[]) => void;
  /** Omit to hide Flag for Review / Report Question — Exam Readiness has no
   * report API, so it passes only onToggleFlag (plan step 5). */
  onToggleFlag?: () => void;
  onToggleReport?: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const isLast = index === total - 1;
  const multi = question.type === "multi_select";

  const options = question.options.map((option, oi) => {
    const chosen = question.selectedOptionIds.includes(option.id);
    const cardClass = `rounded-2xl border-2 bg-cha-surface px-4 py-3.5 text-[15px] font-medium transition-colors ${
      chosen ? "border-cha-orange bg-cha-orange-soft dark:bg-cha-orange/10" : "border-cha-border hover:border-cha-faint"
    }`;
    const content = (
      <>
        <LetterTile letter={optionLetter(oi)} active={chosen} />
        <span>{option.label}</span>
      </>
    );
    return multi ? (
      <Checkbox key={option.id} value={option.id} className={cardClass}>
        <Checkbox.Content className="flex w-full items-center gap-4">{content}</Checkbox.Content>
      </Checkbox>
    ) : (
      <Radio key={option.id} value={option.id} className={cardClass}>
        <Radio.Content className="flex w-full items-center gap-4">{content}</Radio.Content>
      </Radio>
    );
  });

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <Chip color="accent" variant="soft" className="self-start">
        <Chip.Label>
          Question {index + 1} of {total}
        </Chip.Label>
      </Chip>

      <p className="mt-5 font-display text-xl font-bold leading-snug">{question.prompt}</p>
      {multi && (
        <p className="mt-1 text-xs font-semibold text-cha-faint">Select all that apply.</p>
      )}

      {multi ? (
        <CheckboxGroup
          aria-label="Answer options"
          value={question.selectedOptionIds}
          onChange={onSelect}
          className="mt-6 flex flex-col gap-3"
        >
          {options}
        </CheckboxGroup>
      ) : (
        <RadioGroup
          aria-label="Answer options"
          value={question.selectedOptionIds[0] ?? null}
          onChange={(id) => onSelect([id])}
          className="mt-6 flex flex-col gap-3"
        >
          {options}
        </RadioGroup>
      )}

      {onToggleReport && (
      <div className="mt-4">
        <ToggleButton
          size="sm"
          variant="ghost"
          isSelected={markedForReport}
          onChange={onToggleReport}
          className={markedForReport ? "text-cha-danger" : "text-cha-muted"}
        >
          <MessageSquareWarning size={15} />
          {markedForReport ? "Marked for reporting" : "Report Question"}
        </ToggleButton>
      </div>
      )}

      {question.flagged && (
        <Alert status="warning" className="mt-4">
          <Alert.Indicator>
            <Flag size={16} />
          </Alert.Indicator>
          <Alert.Content>
            <Alert.Description>
              Question {index + 1} flagged for review. You can quickly jump back to it later from
              the palette.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-8">
        <Button variant="outline" isDisabled={index === 0} onPress={onPrevious}>
          <ArrowLeft size={15} />
          Previous
        </Button>
        <div className="flex items-center gap-3">
          {onToggleFlag && (
            <ToggleButton isSelected={question.flagged} onChange={onToggleFlag}>
              <Flag size={15} className={question.flagged ? "fill-current" : ""} />
              {question.flagged ? "Flagged for Review" : "Flag for Review"}
            </ToggleButton>
          )}
          <Button onPress={onNext}>
            {isLast ? "Review Questions" : "Next Question"}
            <ArrowRight size={15} />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* Custom composition: Figma draws a lettered tile where HeroUI's
 * Radio/Checkbox control would sit; the underlying input stays HeroUI's
 * (keyboard + screen-reader semantics unchanged). */
export function LetterTile({ letter, active, tone }: {
  letter: string;
  active: boolean;
  tone?: "success" | "danger";
}) {
  const color =
    tone === "success"
      ? "bg-cha-success text-white"
      : tone === "danger"
        ? "bg-cha-danger text-white"
        : active
          ? "bg-cha-orange text-white"
          : "bg-cha-surface-2 text-cha-muted";
  return (
    <span
      aria-hidden
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-extrabold ${color}`}
    >
      {letter}
    </span>
  );
}
