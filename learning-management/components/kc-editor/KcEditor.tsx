"use client";

import { useState, useTransition, type Key } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  AlertDialog,
  Button,
  buttonVariants,
  Chip,
  Description,
  FieldError,
  Input,
  Label,
  ListBox,
  Select,
  TextArea,
  TextField,
} from "@heroui/react";
import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import type { FormState } from "@/lib/actions/form-state";
import { discardKnowledgeCheckDraft, saveKnowledgeCheck } from "@/lib/actions/kc-editor";
import type { KcDraftQuestion } from "@/lib/kc-editor";

/* Knowledge Check Editor — Figma "Knowledge Check Editor" frame (plan §10):
 * version tag; Context & Association card (Knowledge Check Name, Associated
 * Unit); one 12px-radius card per question (Weight (pts), Question Text,
 * Answer Options & Correct Indicator, Explanation & Diagnostic Feedback);
 * "+ Add Question Card"; Cancel / Save as Draft / Save & Publish.
 *
 * Custom composition beyond the frame: Pass threshold and Questions per
 * attempt (both drive learner attempts), per-option add/remove, question
 * ↑ / ↓ / remove, and the correct-answer radios (native radio inputs: each
 * sits beside an editable text field, which a HeroUI Radio can't contain).
 *
 * Associated Unit switches to that unit's Knowledge Check (one per unit).
 * Everything is validated again on the server. */

const LETTERS = "ABCDEF";

export type KcEditorProps = {
  programId: string;
  unitId: string;
  units: { id: string; label: string; hasKc: boolean }[];
  canEdit: boolean;
  published: { version: number } | null;
  hasDraft: boolean;
  draftNote: string | null;
  initial: { title: string; passPercent: number; questionsPerAttempt: number; questions: KcDraftQuestion[] };
};

const blankQuestion = (): KcDraftQuestion => ({ prompt: "", options: ["", "", "", ""], correctIndex: 0, explanation: "", points: 1 });

/** Keeps the result message across the remount that follows a save. */
export default function KcEditorShell(props: KcEditorProps & { version: string }) {
  const [flash, setFlash] = useState<FormState>(null);
  return <KcEditor key={props.version} {...props} flash={flash} setFlash={setFlash} />;
}

function KcEditor({
  programId,
  unitId,
  units,
  canEdit,
  published,
  hasDraft,
  draftNote,
  initial,
  flash,
  setFlash,
}: KcEditorProps & { flash: FormState; setFlash: (s: FormState) => void }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [passPercent, setPassPercent] = useState(String(initial.passPercent));
  const [perAttempt, setPerAttempt] = useState(String(initial.questionsPerAttempt));
  const [questions, setQuestions] = useState<KcDraftQuestion[]>(initial.questions.length ? initial.questions : [blankQuestion()]);
  const [dirty, setDirty] = useState(false);
  const [result, setResult] = useState<FormState>(null);
  const [pending, startTransition] = useTransition();
  const state = result ?? flash;
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  const readOnly = !canEdit;

  const touch = () => {
    setDirty(true);
    setResult(null);
  };
  const update = (i: number, patch: Partial<KcDraftQuestion>) => {
    touch();
    setQuestions((qs) => qs.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  };
  const move = (i: number, d: -1 | 1) => {
    touch();
    setQuestions((qs) => {
      const next = [...qs];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    });
  };

  function save(intent: "draft" | "publish") {
    const draft = {
      title,
      passPercent: Number(passPercent),
      questionsPerAttempt: Number(perAttempt),
      questions: questions.map((q) => ({ ...q, points: Number(q.points) })),
    };
    startTransition(async () => {
      const r = await saveKnowledgeCheck({ programId, unitId, intent, draft });
      setResult(r);
      if (r?.ok) {
        setFlash(r);
        setDirty(false);
        router.refresh();
      }
    });
  }

  function discard() {
    startTransition(async () => {
      const r = await discardKnowledgeCheckDraft({ programId, unitId });
      setResult(r);
      if (r?.ok) {
        setFlash(r);
        setDirty(false);
        router.refresh();
      }
    });
  }

  function switchUnit(key: Key | Key[] | null) {
    if (typeof key !== "string" || key === unitId) return;
    if (dirty && !window.confirm("You have unsaved changes. Leave without saving?")) return;
    router.push(`/programs/${programId}/knowledge-check/${key}`);
  }

  const err = (path: string) => errors[path];
  const versionTag = hasDraft || !published ? `v${(published?.version ?? 0) + 1} · Draft` : `v${published.version} · Published`;

  return (
    <div className="mt-6 flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Chip size="sm" variant="soft" color={hasDraft || !published ? "warning" : "success"}>
          {versionTag}
        </Chip>
        {hasDraft && published && (
          <span className="text-xs text-cha-muted">
            Unpublished changes{draftNote ? ` (${draftNote})` : ""}. Learners still get v{published.version}.
          </span>
        )}
        {!published && <span className="text-xs text-cha-muted">Not published yet: learners don&apos;t see this Knowledge Check.</span>}
        {canEdit && hasDraft && published && (
          <Button size="sm" variant="ghost" onPress={discard} isDisabled={pending}>
            Discard changes
          </Button>
        )}
      </div>

      {/* Context & Association */}
      <section aria-labelledby="kc-context" className="cha-card-outline rounded-xl p-7">
        <h2 id="kc-context" className="font-display text-base font-extrabold">
          Context &amp; Association
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextField value={title} onChange={(v) => (touch(), setTitle(v))} isReadOnly={readOnly} isRequired isInvalid={Boolean(err("title"))}>
            <Label className="text-[13px] font-semibold">Knowledge Check Name</Label>
            <Input className="rounded-md" maxLength={160} />
            <FieldError>{err("title")}</FieldError>
          </TextField>
          <Select value={unitId} onChange={switchUnit} aria-describedby="kc-unit-help">
            <Label className="text-[13px] font-semibold">Associated Unit</Label>
            <Select.Trigger className="rounded-md">
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {units.map((u) => (
                  <ListBox.Item key={u.id} id={u.id} textValue={u.label}>
                    <span className="min-w-0 flex-1 truncate">{u.label}</span>
                    {!u.hasKc && <span className="text-xs text-cha-muted">No KC yet</span>}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
          <TextField value={passPercent} onChange={(v) => (touch(), setPassPercent(v))} isReadOnly={readOnly} isInvalid={Boolean(err("passPercent"))}>
            <Label className="text-[13px] font-semibold">Pass threshold (%)</Label>
            <Input className="rounded-md" type="number" min={1} max={100} inputMode="numeric" />
            <Description className="text-xs text-cha-muted">Share of points needed to pass.</Description>
            <FieldError>{err("passPercent")}</FieldError>
          </TextField>
          <TextField value={perAttempt} onChange={(v) => (touch(), setPerAttempt(v))} isReadOnly={readOnly} isInvalid={Boolean(err("questionsPerAttempt"))}>
            <Label className="text-[13px] font-semibold">Questions per attempt</Label>
            <Input className="rounded-md" type="number" min={1} max={questions.length} inputMode="numeric" />
            <Description className="text-xs text-cha-muted">
              Drawn at random from the {questions.length} question{questions.length === 1 ? "" : "s"} below.
            </Description>
            <FieldError>{err("questionsPerAttempt")}</FieldError>
          </TextField>
        </div>
        <p id="kc-unit-help" className="mt-3 text-xs text-cha-muted">
          Each unit has one Knowledge Check. Choosing another unit opens its Knowledge Check.
        </p>
      </section>

      {/* Question cards */}
      {questions.map((q, i) => (
        <section key={i} aria-labelledby={`q${i}-heading`} className="cha-card-outline rounded-xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id={`q${i}-heading`} className="font-display text-[15px] font-extrabold">
              Question {i + 1}
            </h2>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-[13px] font-semibold text-cha-muted">
                Weight (pts):
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={q.points}
                  readOnly={readOnly}
                  onChange={(e) => update(i, { points: Number(e.target.value) })}
                  className="w-14 rounded border border-cha-border bg-cha-canvas px-1.5 py-0.5 text-[13px] font-bold text-cha-ink outline-none focus-visible:ring-4 focus-visible:ring-cha-blue/15"
                />
              </label>
              {canEdit && (
                <>
                  <Button isIconOnly size="sm" variant="ghost" aria-label={`Move question ${i + 1} up`} isDisabled={i === 0} onPress={() => move(i, -1)}>
                    <ArrowUp size={14} aria-hidden />
                  </Button>
                  <Button isIconOnly size="sm" variant="ghost" aria-label={`Move question ${i + 1} down`} isDisabled={i === questions.length - 1} onPress={() => move(i, 1)}>
                    <ArrowDown size={14} aria-hidden />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    aria-label={`Remove question ${i + 1}`}
                    isDisabled={questions.length === 1}
                    onPress={() => (touch(), setQuestions((qs) => qs.filter((_, j) => j !== i)))}
                  >
                    <Trash2 size={14} aria-hidden />
                  </Button>
                </>
              )}
            </div>
          </div>
          {err(`questions.${i}.points`) && <p className="mt-1 text-xs text-cha-danger">{err(`questions.${i}.points`)}</p>}

          <TextField className="mt-4" value={q.prompt} onChange={(v) => update(i, { prompt: v })} isReadOnly={readOnly} isInvalid={Boolean(err(`questions.${i}.prompt`))}>
            <Label className="text-[13px] font-semibold">Question Text</Label>
            <Input className="rounded-md" maxLength={1000} />
            <FieldError>{err(`questions.${i}.prompt`)}</FieldError>
          </TextField>

          <fieldset className="mt-4">
            <legend className="text-[13px] font-semibold">Answer Options &amp; Correct Indicator</legend>
            <div className="mt-2 flex flex-col gap-2">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name={`q${i}-correct`}
                    checked={q.correctIndex === oi}
                    disabled={readOnly}
                    onChange={() => update(i, { correctIndex: oi })}
                    aria-label={`Mark option ${LETTERS[oi]} correct`}
                    className="size-[18px] shrink-0 accent-cha-orange"
                  />
                  <span className="w-5 text-[13px] font-bold text-cha-muted">{LETTERS[oi]}:</span>
                  <input
                    value={opt}
                    readOnly={readOnly}
                    maxLength={300}
                    aria-label={`Question ${i + 1}, option ${LETTERS[oi]}`}
                    onChange={(e) => update(i, { options: q.options.map((o, k) => (k === oi ? e.target.value : o)) })}
                    className="h-8 min-w-0 flex-1 rounded-md bg-cha-canvas px-3 text-[13px] text-cha-ink outline-none focus-visible:ring-4 focus-visible:ring-cha-blue/15"
                  />
                  {canEdit && q.options.length > 2 && (
                    <Button
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      aria-label={`Remove option ${LETTERS[oi]}`}
                      onPress={() =>
                        update(i, {
                          options: q.options.filter((_, k) => k !== oi),
                          correctIndex: q.correctIndex === oi ? 0 : q.correctIndex > oi ? q.correctIndex - 1 : q.correctIndex,
                        })
                      }
                    >
                      <X size={14} aria-hidden />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {(err(`questions.${i}.options`) || err(`questions.${i}`) || Object.keys(errors).find((k) => k.startsWith(`questions.${i}.options.`))) && (
              <p className="mt-1 text-xs text-cha-danger">
                {err(`questions.${i}.options`) ?? err(`questions.${i}`) ?? errors[Object.keys(errors).find((k) => k.startsWith(`questions.${i}.options.`))!]}
              </p>
            )}
            {canEdit && q.options.length < 6 && (
              <Button size="sm" variant="ghost" className="mt-2" onPress={() => update(i, { options: [...q.options, ""] })}>
                <Plus size={14} aria-hidden /> Add option
              </Button>
            )}
          </fieldset>

          <TextField className="mt-4" value={q.explanation} onChange={(v) => update(i, { explanation: v })} isReadOnly={readOnly} isInvalid={Boolean(err(`questions.${i}.explanation`))}>
            <Label className="text-[13px] font-semibold">Explanation &amp; Diagnostic Feedback</Label>
            <TextArea className="rounded-md" rows={2} maxLength={2000} style={{ resize: "vertical" }} />
            <FieldError>{err(`questions.${i}.explanation`)}</FieldError>
          </TextField>
        </section>
      ))}

      {canEdit && (
        <button
          type="button"
          onClick={() => (touch(), setQuestions((qs) => [...qs, blankQuestion()]))}
          className="flex h-[49px] items-center justify-center gap-2 rounded-lg border border-dashed border-cha-orange/40 bg-cha-orange-soft/20 text-sm font-bold text-cha-orange outline-none hover:bg-cha-orange-soft/40 focus-visible:ring-4 focus-visible:ring-cha-blue/15"
        >
          <Plus size={16} aria-hidden /> Add Question Card
        </button>
      )}

      {state && (
        <div aria-live="polite">
          <Alert status={state.ok ? "success" : "danger"}>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>{state.ok ? state.message : state.error}</Alert.Description>
            </Alert.Content>
          </Alert>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/programs/${programId}/units/${unitId}`} className={`${buttonVariants({ variant: "outline" })} rounded-md font-bold`}>
          {canEdit ? "Cancel" : "Back to unit"}
        </Link>
        {canEdit && (
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-md font-bold" isDisabled={pending} onPress={() => save("draft")}>
              Save as Draft
            </Button>
            <AlertDialog>
              <Button className="rounded-md font-bold" isPending={pending}>
                Save &amp; Publish
              </Button>
              <AlertDialog.Backdrop>
                <AlertDialog.Container>
                  <AlertDialog.Dialog className="sm:max-w-[440px]">
                    <AlertDialog.Header>
                      <AlertDialog.Icon status="accent" />
                      <AlertDialog.Heading>Publish this Knowledge Check?</AlertDialog.Heading>
                    </AlertDialog.Header>
                    <AlertDialog.Body>
                      <p className="text-sm text-cha-muted">
                        New attempts use it straight away. Attempts already started keep their questions, and questions learners have already
                        answered are replaced rather than changed, so past results stay as they were.
                      </p>
                    </AlertDialog.Body>
                    <AlertDialog.Footer>
                      <Button slot="close" variant="tertiary">
                        Cancel
                      </Button>
                      <Button slot="close" onPress={() => save("publish")}>
                        Save &amp; Publish
                      </Button>
                    </AlertDialog.Footer>
                  </AlertDialog.Dialog>
                </AlertDialog.Container>
              </AlertDialog.Backdrop>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  );
}
