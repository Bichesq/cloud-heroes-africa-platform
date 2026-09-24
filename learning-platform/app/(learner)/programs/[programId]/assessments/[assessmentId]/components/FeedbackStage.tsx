"use client";

import { useMemo, useState } from "react";
import { Alert, Button, Card, Chip, Pagination, Tabs } from "@heroui/react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import type { ReviewItem, TopicBreakdown } from "./types";

/* Figma "assessment-performance-review-questions": "Assessment Feedback"
 * with a "Performance Summary & Insights" callout, All / Incorrect Only /
 * Flagged filter tabs, paginated question cards (Correct/Incorrect chip, your
 * answer, the correct answer when wrong, explanation), then View Assessment
 * Results / Retake Assessment. */

const PAGE_SIZE = 5;
type Filter = "all" | "incorrect" | "flagged";

export default function FeedbackStage({
  review,
  flaggedIds,
  topics,
  passed,
  canRetake,
  onBack,
  onRetake,
}: {
  review: ReviewItem[];
  flaggedIds: Set<string>;
  topics: TopicBreakdown[];
  passed: boolean;
  canRetake: boolean;
  onBack: () => void;
  onRetake: () => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(0);

  const isCorrect = (r: ReviewItem) => r.pointsEarned >= r.pointsPossible;
  const incorrectCount = review.filter((r) => !isCorrect(r)).length;
  const flaggedCount = review.filter((r) => flaggedIds.has(r.attemptQuestionId)).length;

  const items = useMemo(() => {
    if (filter === "incorrect") return review.filter((r) => !isCorrect(r));
    if (filter === "flagged") return review.filter((r) => flaggedIds.has(r.attemptQuestionId));
    return review;
  }, [review, filter, flaggedIds]);

  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const start = page * PAGE_SIZE;
  const pageItems = items.slice(start, start + PAGE_SIZE);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <h2 className="font-display text-3xl font-extrabold">Assessment Feedback</h2>

      <Alert status="accent" className="mt-5">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Performance Summary &amp; Insights</Alert.Title>
          <Alert.Description>{insight(topics, passed)}</Alert.Description>
        </Alert.Content>
      </Alert>

      <Tabs
        variant="secondary"
        selectedKey={filter}
        onSelectionChange={(key) => {
          setFilter(key as Filter);
          setPage(0);
        }}
        className="mt-6"
      >
        <Tabs.ListContainer>
          <Tabs.List aria-label="Filter questions">
            <Tabs.Tab id="all">
              All Questions
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="incorrect">
              Incorrect Only ({incorrectCount})
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="flagged">
              Flagged ({flaggedCount})
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-cha-muted">No questions match this filter.</p>
      ) : (
        <ul className="mt-5 flex flex-col gap-4">
          {pageItems.map((r) => {
            const correct = isCorrect(r);
            const label = (ids: string[]) =>
              r.options.filter((o) => ids.includes(o.id)).map((o) => o.label).join(", ") || "Not answered";
            return (
              <li key={r.attemptQuestionId}>
                <Card>
                  <Card.Header className="flex-row items-center justify-between gap-3">
                    <Card.Title className="font-display text-base font-extrabold">
                      Question {r.orderIndex + 1}
                    </Card.Title>
                    <Chip color={correct ? "success" : "danger"} variant="soft" size="sm">
                      <Chip.Label>{correct ? "Correct" : "Incorrect"}</Chip.Label>
                    </Chip>
                  </Card.Header>
                  <Card.Content className="flex flex-col gap-2 text-sm">
                    <p className="font-semibold text-cha-ink">{r.prompt}</p>
                    <p>
                      <span className="font-semibold">Your Answer: </span>
                      <span className={correct ? "text-cha-success" : "text-cha-danger"}>
                        {label(r.selectedOptionIds)}
                      </span>
                    </p>
                    {!correct && (
                      <p>
                        <span className="font-semibold">Correct Answer: </span>
                        <span className="text-cha-success">{label(r.correctOptionIds)}</span>
                      </p>
                    )}
                    {r.explanation && (
                      <p className="text-cha-muted">
                        <span className="font-semibold text-cha-ink">Explanation: </span>
                        {r.explanation}
                      </p>
                    )}
                  </Card.Content>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {items.length > 0 && (
        <Pagination size="sm" className="mt-6">
          <Pagination.Summary>
            Showing {start + 1}-{Math.min(start + PAGE_SIZE, items.length)} of {items.length}
          </Pagination.Summary>
          {pageCount > 1 && (
            <Pagination.Content>
              <Pagination.Item>
                <Pagination.Previous isDisabled={page === 0} onPress={() => setPage((p) => p - 1)}>
                  <Pagination.PreviousIcon />
                  <span>Previous</span>
                </Pagination.Previous>
              </Pagination.Item>
              {Array.from({ length: pageCount }).map((_, i) => (
                <Pagination.Item key={i}>
                  <Pagination.Link isActive={i === page} onPress={() => setPage(i)}>
                    {i + 1}
                  </Pagination.Link>
                </Pagination.Item>
              ))}
              <Pagination.Item>
                <Pagination.Next
                  isDisabled={page === pageCount - 1}
                  onPress={() => setPage((p) => p + 1)}
                >
                  <span>Next</span>
                  <Pagination.NextIcon />
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          )}
        </Pagination>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button variant="outline" onPress={onBack}>
          <ArrowLeft size={15} />
          View Assessment Results
        </Button>
        {!passed && (
          <Button isDisabled={!canRetake} onPress={onRetake}>
            <RotateCcw size={15} />
            Retake Assessment
          </Button>
        )}
      </div>
    </div>
  );
}

/** One-line insight in the Figma copy's voice, from the topic breakdown. */
function insight(topics: TopicBreakdown[], passed: boolean): string {
  if (topics.length === 0) {
    return passed ? "Awesome work overall!" : "Review the questions below before your next attempt.";
  }
  const sorted = [...topics].sort((a, b) => b.pct - a.pct);
  const best = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const opener = passed ? "Awesome work overall!" : "Good effort — you're building the foundations.";
  if (sorted.length === 1 || best.pct === weakest.pct) {
    return `${opener} You scored ${best.pct}% in ${best.name}.`;
  }
  return `${opener} You performed best in ${best.name} but may want to spend extra time reviewing ${weakest.name}.`;
}
