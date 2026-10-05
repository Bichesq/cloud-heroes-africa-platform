"use client";

import { Fragment, useState, useTransition, type Key } from "react";
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
  Modal,
  Select,
  TextArea,
  TextField,
} from "@heroui/react";
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2, X } from "lucide-react";
import type { FormState } from "@/lib/actions/form-state";
import { createModuleArea, discardAssessmentDraft, reviewAssessment, saveAssessment } from "@/lib/actions/assessment-editor";
import { fromKcQuestion, type AssessmentDraftQuestion, type Difficulty } from "@/lib/assessment-editor";

/* Module Assessment Configuration — Figma frame (plan §11): status tag;
 * General Metadata (Select Scope Module, Assessment Name, Description);
 * Execution Parameters (Passing Threshold, Attempts Allowed, Time Limitation
 * enable + minutes); Assessment Question Matrix (ID & Type, scenario, Module
 * Area, Default Weight) with "+ Import from Bank"; Cancel / Save Draft /
 * Submit for Review.
 *
 * Custom composition beyond the frame: per-difficulty draw counts, an
 * expandable editor under each matrix row, "Add question", Module Area
 * creation, and the review panel (approve / reject with comment). The matrix
 * is a semantic <table> — HeroUI Table swallows pointer presses on controls
 * inside its cells (found in sub-step 2). Correct-answer markers and the time
 * toggle are native inputs beside editable fields.
 *
 * Every rule is enforced again on the server. */

const LETTERS = "ABCDEF";
const DIFFS: Difficulty[] = ["easy", "medium", "difficult"];

export type Area = { id: string; name: string; unitId: string };
export type ImportableKc = {
  unitId: string;
  unitLabel: string;
  areaId: string | null;
  questions: { id: string; prompt: string; options: { id: string; label: string }[]; correctOptionId: string; explanation: string | null; points: number }[];
};

export type AssessmentEditorProps = {
  programId: string;
  moduleId: string;
  modules: { id: string; label: string; hasAssessment: boolean }[];
  units: { id: string; label: string }[];
  areas: Area[];
  importable: ImportableKc[];
  canEdit: boolean;
  canReview: boolean;
  currentAuthorId: string;
  published: { version: number } | null;
  draft: {
    status: "draft" | "in_review";
    submittedById: string | null;
    submittedNote: string | null;
    reviewComment: string | null;
    reviewedNote: string | null;
    savedNote: string;
  } | null;
  initial: {
    title: string;
    description: string;
    passPercent: number;
    maxAttempts: number | null;
    timeLimitMinutes: number | null;
    mix: Record<Difficulty, number>;
    questions: AssessmentDraftQuestion[];
  };
};

const blank = (): AssessmentDraftQuestion => ({
  type: "single_choice",
  difficulty: "medium",
  prompt: "",
  options: ["", "", "", ""],
  correctIndexes: [0],
  explanation: "",
  points: 1,
  topicId: null,
});

/** Keeps the last result message across the remount that follows a save. */
export default function AssessmentEditorShell(props: AssessmentEditorProps & { version: string }) {
  const [flash, setFlash] = useState<FormState>(null);
  return <AssessmentEditor key={props.version} {...props} flash={flash} setFlash={setFlash} />;
}

function AssessmentEditor(props: AssessmentEditorProps & { flash: FormState; setFlash: (s: FormState) => void }) {
  const { programId, moduleId, modules, units, importable, canEdit, canReview, currentAuthorId, published, draft, initial, flash, setFlash } = props;
  const router = useRouter();
  const [areas, setAreas] = useState<Area[]>(props.areas);
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [passPercent, setPassPercent] = useState(String(initial.passPercent));
  const [attempts, setAttempts] = useState(initial.maxAttempts === null ? "" : String(initial.maxAttempts));
  const [timed, setTimed] = useState(initial.timeLimitMinutes !== null);
  const [minutes, setMinutes] = useState(String(initial.timeLimitMinutes ?? 45));
  const [mix, setMix] = useState<Record<Difficulty, string>>({
    easy: String(initial.mix.easy),
    medium: String(initial.mix.medium),
    difficult: String(initial.mix.difficult),
  });
  const [questions, setQuestions] = useState<AssessmentDraftQuestion[]>(initial.questions);
  const [open, setOpen] = useState<number | null>(initial.questions.length ? null : -1);
  const [dirty, setDirty] = useState(false);
  const [result, setResult] = useState<FormState>(null);
  const [comment, setComment] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const state = result ?? flash;
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  const err = (k: string) => errors[k];
  const inReview = draft?.status === "in_review";
  const ownSubmission = inReview && draft?.submittedById === currentAuthorId;
  const readOnly = !canEdit;
  const areaName = (id: string | null) => areas.find((a) => a.id === id)?.name ?? "—";
  const available = (d: Difficulty) => questions.filter((q) => q.difficulty === d).length;

  const touch = () => (setDirty(true), setResult(null));
  const update = (i: number, patch: Partial<AssessmentDraftQuestion>) => {
    touch();
    setQuestions((qs) => qs.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  };

  function payload() {
    return {
      title,
      description,
      passPercent: Number(passPercent),
      maxAttempts: attempts.trim() === "" ? null : Number(attempts),
      timeLimitMinutes: timed ? Number(minutes) : null,
      mix: { easy: Number(mix.easy), medium: Number(mix.medium), difficult: Number(mix.difficult) },
      questions,
    };
  }
  function after(r: FormState) {
    setResult(r);
    if (r?.ok) {
      setFlash(r);
      setDirty(false);
      router.refresh();
    }
  }
  const save = (intent: "draft" | "submit") => startTransition(async () => after(await saveAssessment({ programId, moduleId, intent, draft: payload() })));
  const review = (decision: "approve" | "reject") => startTransition(async () => after(await reviewAssessment({ programId, moduleId, decision, comment })));
  const discard = () => startTransition(async () => after(await discardAssessmentDraft({ programId, moduleId })));

  function switchModule(key: Key | Key[] | null) {
    if (typeof key !== "string" || key === moduleId) return;
    if (dirty && !window.confirm("You have unsaved changes. Leave without saving?")) return;
    router.push(`/programs/${programId}/assessments/${key}`);
  }

  function importPicked() {
    const add: AssessmentDraftQuestion[] = [];
    for (const group of importable) for (const q of group.questions) if (picked.has(q.id)) add.push(fromKcQuestion(q, group.areaId));
    if (add.length) {
      touch();
      setQuestions((qs) => [...qs, ...add]);
    }
    setPicked(new Set());
    setImportOpen(false);
  }

  const tag = inReview
    ? { text: "In review", color: "accent" as const }
    : draft?.reviewComment
      ? { text: "Returned with comments", color: "danger" as const }
      : draft || !published
        ? { text: `v${(published?.version ?? 0) + 1} · Draft`, color: "warning" as const }
        : { text: `v${published.version} · Published`, color: "success" as const };

  return (
    <div className="mt-6 flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Chip size="sm" variant="soft" color={tag.color}>
          {tag.text}
        </Chip>
        {draft && <span className="text-xs text-cha-muted">{draft.savedNote}</span>}
        {!published && <span className="text-xs text-cha-muted">Not published yet: learners don&apos;t see this assessment.</span>}
        {published && draft && <span className="text-xs text-cha-muted">Learners still get v{published.version}.</span>}
        {canEdit && draft && (
          <Button size="sm" variant="ghost" onPress={discard} isDisabled={pending}>
            Discard draft
          </Button>
        )}
      </div>

      {draft?.reviewComment && !inReview && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Returned for changes{draft.reviewedNote ? ` (${draft.reviewedNote})` : ""}</Alert.Title>
            <Alert.Description className="whitespace-pre-wrap">{draft.reviewComment}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      {inReview && (
        <section aria-labelledby="review-heading" className="rounded-xl border border-cha-orange/40 bg-cha-orange-soft/30 p-5">
          <h2 id="review-heading" className="font-display text-base font-extrabold">
            Waiting for review
          </h2>
          <p className="mt-1 text-sm text-cha-muted">{draft?.submittedNote}</p>
          {canReview && !ownSubmission && (
            <div className="mt-4 flex flex-col gap-3">
              <TextField value={comment} onChange={setComment} isInvalid={Boolean(err("comment"))}>
                <Label className="text-[13px] font-semibold">Review comment</Label>
                <TextArea className="rounded-md bg-cha-surface" rows={3} maxLength={2000} />
                <Description className="text-xs text-cha-muted">Required to return it; optional when approving.</Description>
                <FieldError>{err("comment")}</FieldError>
              </TextField>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="rounded-md font-bold" isDisabled={pending} onPress={() => review("reject")}>
                  Return for changes
                </Button>
                <AlertDialog>
                  <Button className="rounded-md font-bold" isPending={pending}>
                    Approve &amp; publish
                  </Button>
                  <AlertDialog.Backdrop>
                    <AlertDialog.Container>
                      <AlertDialog.Dialog className="sm:max-w-[440px]">
                        <AlertDialog.Header>
                          <AlertDialog.Icon status="accent" />
                          <AlertDialog.Heading>Approve and publish?</AlertDialog.Heading>
                        </AlertDialog.Header>
                        <AlertDialog.Body>
                          <p className="text-sm text-cha-muted">
                            New attempts use this version straight away. {published ? "" : "Passing it will be required to unlock the next module, except for learners who had already completed this module."}
                          </p>
                        </AlertDialog.Body>
                        <AlertDialog.Footer>
                          <Button slot="close" variant="tertiary">
                            Cancel
                          </Button>
                          <Button slot="close" onPress={() => review("approve")}>
                            Approve &amp; publish
                          </Button>
                        </AlertDialog.Footer>
                      </AlertDialog.Dialog>
                    </AlertDialog.Container>
                  </AlertDialog.Backdrop>
                </AlertDialog>
              </div>
            </div>
          )}
          {ownSubmission && <p className="mt-3 text-sm">You submitted this, so another Reviewer, Owner or Director has to review it.</p>}
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,622fr)_minmax(0,450fr)]">
        {/* General Metadata */}
        <section aria-labelledby="meta-heading" className="cha-card-outline flex flex-col gap-4 rounded-xl p-7">
          <h2 id="meta-heading" className="font-display text-base font-extrabold">
            General Metadata
          </h2>
          <Select value={moduleId} onChange={switchModule}>
            <Label className="text-[13px] font-semibold">Select Scope Module</Label>
            <Select.Trigger className="rounded-md">
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {modules.map((m) => (
                  <ListBox.Item key={m.id} id={m.id} textValue={m.label}>
                    <span className="min-w-0 flex-1 truncate">{m.label}</span>
                    {!m.hasAssessment && <span className="text-xs text-cha-muted">None yet</span>}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
          <TextField value={title} onChange={(v) => (touch(), setTitle(v))} isReadOnly={readOnly} isRequired isInvalid={Boolean(err("title"))}>
            <Label className="text-[13px] font-semibold">Assessment Name</Label>
            <Input className="rounded-md" maxLength={160} />
            <FieldError>{err("title")}</FieldError>
          </TextField>
          <TextField value={description} onChange={(v) => (touch(), setDescription(v))} isReadOnly={readOnly} isInvalid={Boolean(err("description"))}>
            <Label className="text-[13px] font-semibold">Description</Label>
            <TextArea className="rounded-md" rows={3} maxLength={2000} style={{ resize: "vertical" }} />
            <FieldError>{err("description")}</FieldError>
          </TextField>
        </section>

        {/* Execution Parameters */}
        <section aria-labelledby="exec-heading" className="cha-card-outline flex flex-col gap-4 rounded-xl p-7">
          <h2 id="exec-heading" className="font-display text-base font-extrabold">
            Execution Parameters
          </h2>
          <ParamRow label="Passing Threshold" hint="Minimum grade required to unlock subsequent content." error={err("passPercent")}>
            <NumberBox value={passPercent} onChange={(v) => (touch(), setPassPercent(v))} readOnly={readOnly} suffix="%" label="Passing threshold percent" max={100} />
          </ParamRow>
          <ParamRow label="Attempts Allowed" hint="Maximum number of times a learner can test. Leave empty for unlimited." error={err("maxAttempts")}>
            <NumberBox value={attempts} onChange={(v) => (touch(), setAttempts(v))} readOnly={readOnly} suffix="times" label="Attempts allowed" max={50} placeholder="∞" />
          </ParamRow>
          <ParamRow label="Time Limitation" hint="Restrict duration of the exam once started." error={err("timeLimitMinutes")}>
            <label className="flex items-center gap-1.5 text-xs font-bold text-cha-orange">
              <input type="checkbox" checked={timed} disabled={readOnly} onChange={(e) => (touch(), setTimed(e.target.checked))} className="accent-cha-orange" />
              {timed ? "Enabled" : "Off"}
            </label>
            {timed && <NumberBox value={minutes} onChange={(v) => (touch(), setMinutes(v))} readOnly={readOnly} suffix="min" label="Time limit in minutes" max={600} />}
          </ParamRow>
          <div>
            <p className="text-sm font-bold">Questions per attempt</p>
            <p className="text-xs text-cha-muted">Drawn at random by difficulty.</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {DIFFS.map((d) => (
                <label key={d} className="text-xs text-cha-muted">
                  <span className="capitalize">{d}</span> ({available(d)} written)
                  <input
                    type="number"
                    min={0}
                    max={200}
                    value={mix[d]}
                    readOnly={readOnly}
                    onChange={(e) => (touch(), setMix((m) => ({ ...m, [d]: e.target.value })))}
                    aria-invalid={Boolean(err(`mix.${d}`))}
                    className={`mt-1 block h-8 w-full rounded-md border bg-cha-canvas px-2 text-sm font-bold text-cha-ink outline-none focus-visible:ring-4 focus-visible:ring-cha-blue/15 ${err(`mix.${d}`) ? "border-cha-danger" : "border-transparent"}`}
                  />
                </label>
              ))}
            </div>
            {(err("mix") || DIFFS.map((d) => err(`mix.${d}`)).find(Boolean)) && (
              <p className="mt-1 text-xs text-cha-danger">{err("mix") ?? DIFFS.map((d) => err(`mix.${d}`)).find(Boolean)}</p>
            )}
          </div>
        </section>
      </div>

      {/* Assessment Question Matrix */}
      <section aria-labelledby="matrix-heading" className="cha-card-outline rounded-xl p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="matrix-heading" className="font-display text-base font-extrabold">
              Assessment Question Matrix
            </h2>
            <p className="text-xs text-cha-muted">Compile and weigh the key evaluative questions below.</p>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="rounded-md font-bold" onPress={() => (touch(), setQuestions((qs) => [...qs, blank()]), setOpen(questions.length))}>
                <Plus size={14} aria-hidden /> Add question
              </Button>
              <Button size="sm" className="rounded-md font-bold" onPress={() => setImportOpen(true)}>
                <Plus size={14} aria-hidden /> Import from Bank
              </Button>
            </div>
          )}
        </div>
        {err("questions") && <p className="mt-2 text-xs text-cha-danger">{err("questions")}</p>}

        <div className="mt-4 overflow-x-auto rounded-md border border-cha-border">
          <table className="w-full min-w-[760px] text-left">
            <caption className="sr-only">Assessment questions</caption>
            <thead className="bg-cha-canvas text-xs font-bold">
              <tr>
                <th scope="col" className="w-36 px-4 py-3">ID &amp; Type</th>
                <th scope="col" className="px-4 py-3">Question Scenario &amp; Answers Structure</th>
                <th scope="col" className="w-44 px-4 py-3">Module Area</th>
                <th scope="col" className="w-28 px-4 py-3">Default Weight</th>
                <th scope="col" className="w-10 px-2 py-3">
                  <span className="sr-only">Expand</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {questions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-cha-muted">
                    No questions yet.{canEdit ? " Add one, or import from this module's Knowledge Checks." : ""}
                  </td>
                </tr>
              )}
              {questions.map((q, i) => {
                const rowErr = Object.keys(errors).some((k) => k.startsWith(`questions.${i}.`) || k === `questions.${i}`);
                const expanded = open === i;
                return (
                  <Fragment key={i}>
                    <tr className={`border-t border-cha-border text-[13px] ${rowErr ? "bg-cha-danger/5" : ""}`}>
                      <th scope="row" className="px-4 py-3 font-bold">
                        Q-{i + 1} · {q.type === "multi_select" ? "Multi" : "MC"}
                        <span className="block text-[11px] font-normal capitalize text-cha-muted">{q.difficulty}</span>
                      </th>
                      <td className="px-4 py-3">{q.prompt || <span className="text-cha-muted">Untitled question</span>}</td>
                      <td className="px-4 py-3 text-cha-muted">{areaName(q.topicId)}</td>
                      <td className="px-4 py-3 font-bold text-cha-orange">{q.points} pts</td>
                      <td className="px-2 py-3">
                        <Button isIconOnly size="sm" variant="ghost" aria-expanded={expanded} aria-label={`${expanded ? "Collapse" : "Edit"} question ${i + 1}`} onPress={() => setOpen(expanded ? null : i)}>
                          <ChevronDown size={14} aria-hidden className={expanded ? "rotate-180" : ""} />
                        </Button>
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="bg-cha-canvas/50">
                        <td colSpan={5} className="px-4 py-4">
                          <QuestionEditor
                            index={i}
                            question={q}
                            count={questions.length}
                            areas={areas}
                            units={units}
                            readOnly={readOnly}
                            errors={errors}
                            onChange={(patch) => update(i, patch)}
                            onMove={(d) => {
                              touch();
                              setQuestions((qs) => {
                                const next = [...qs];
                                [next[i], next[i + d]] = [next[i + d], next[i]];
                                return next;
                              });
                              setOpen(i + d);
                            }}
                            onRemove={() => (touch(), setQuestions((qs) => qs.filter((_, j) => j !== i)), setOpen(null))}
                            onCreateArea={async (name, unitId) => {
                              const r = await createModuleArea({ programId, moduleId, unitId, name });
                              if (!r.ok) return r.error;
                              setAreas((as) => (as.some((a) => a.id === r.area.id) ? as : [...as, r.area]));
                              update(i, { topicId: r.area.id });
                              return null;
                            }}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

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
        <Link href={`/programs/${programId}/structure`} className={`${buttonVariants({ variant: "outline" })} rounded-md font-bold`}>
          {canEdit ? "Cancel" : "Back to Course Structure"}
        </Link>
        {canEdit && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="rounded-md font-bold"
              isDisabled={pending}
              onPress={() => {
                if (inReview && !window.confirm("This is waiting for review. Saving withdraws it back to a draft. Continue?")) return;
                save("draft");
              }}
            >
              Save Draft
            </Button>
            <AlertDialog>
              <Button className="rounded-md font-bold" isPending={pending}>
                Submit for Review
              </Button>
              <AlertDialog.Backdrop>
                <AlertDialog.Container>
                  <AlertDialog.Dialog className="sm:max-w-[440px]">
                    <AlertDialog.Header>
                      <AlertDialog.Icon status="accent" />
                      <AlertDialog.Heading>Submit for review?</AlertDialog.Heading>
                    </AlertDialog.Header>
                    <AlertDialog.Body>
                      <p className="text-sm text-cha-muted">
                        A Reviewer, Owner or Director other than you approves it before learners see it. Learners keep the current version until then.
                      </p>
                    </AlertDialog.Body>
                    <AlertDialog.Footer>
                      <Button slot="close" variant="tertiary">
                        Cancel
                      </Button>
                      <Button slot="close" onPress={() => save("submit")}>
                        Submit for Review
                      </Button>
                    </AlertDialog.Footer>
                  </AlertDialog.Dialog>
                </AlertDialog.Container>
              </AlertDialog.Backdrop>
            </AlertDialog>
          </div>
        )}
      </div>

      {canEdit && (
        <Modal.Backdrop isOpen={importOpen} onOpenChange={setImportOpen}>
          <Modal.Container scroll="inside">
            <Modal.Dialog className="sm:max-w-[640px]">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Import from Bank</Modal.Heading>
              </Modal.Header>
              <Modal.Body className="flex flex-col gap-4">
                <p className="text-sm text-cha-muted">
                  Copies questions from this module&apos;s unit Knowledge Checks. Copies are independent: editing one never changes the other.
                </p>
                {importable.every((g) => g.questions.length === 0) && <p className="text-sm">No Knowledge Check questions in this module yet.</p>}
                {importable
                  .filter((g) => g.questions.length > 0)
                  .map((g) => (
                    <fieldset key={g.unitId}>
                      <legend className="text-sm font-bold">{g.unitLabel}</legend>
                      <div className="mt-2 flex flex-col gap-1.5">
                        {g.questions.map((kq) => (
                          <label key={kq.id} className="flex items-start gap-2 text-sm">
                            <input
                              type="checkbox"
                              className="mt-1 accent-cha-orange"
                              checked={picked.has(kq.id)}
                              onChange={(e) =>
                                setPicked((p) => {
                                  const n = new Set(p);
                                  if (e.target.checked) n.add(kq.id);
                                  else n.delete(kq.id);
                                  return n;
                                })
                              }
                            />
                            <span>
                              {kq.prompt} <span className="text-xs text-cha-muted">· {kq.points} pts</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  ))}
              </Modal.Body>
              <Modal.Footer>
                <Button slot="close" variant="tertiary">
                  Cancel
                </Button>
                <Button className="font-bold" isDisabled={picked.size === 0} onPress={importPicked}>
                  Import {picked.size || ""} question{picked.size === 1 ? "" : "s"}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      )}
    </div>
  );
}

function ParamRow({ label, hint, error, children }: { label: string; hint: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold">{label}</p>
          <p className="text-xs text-cha-muted">{hint}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">{children}</div>
      </div>
      {error && <p className="mt-1 text-xs text-cha-danger">{error}</p>}
    </div>
  );
}

function NumberBox({
  value,
  onChange,
  readOnly,
  suffix,
  label,
  max,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  readOnly: boolean;
  suffix: string;
  label: string;
  max: number;
  placeholder?: string;
}) {
  return (
    <span className="flex items-center gap-1 rounded-md bg-cha-canvas px-2 py-1 text-sm font-bold">
      <input
        type="number"
        min={1}
        max={max}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 bg-transparent text-right outline-none focus-visible:ring-2 focus-visible:ring-cha-blue/30"
      />
      {suffix}
    </span>
  );
}

function QuestionEditor({
  index,
  question: q,
  count,
  areas,
  units,
  readOnly,
  errors,
  onChange,
  onMove,
  onRemove,
  onCreateArea,
}: {
  index: number;
  question: AssessmentDraftQuestion;
  count: number;
  areas: Area[];
  units: { id: string; label: string }[];
  readOnly: boolean;
  errors: Record<string, string>;
  onChange: (patch: Partial<AssessmentDraftQuestion>) => void;
  onMove: (d: -1 | 1) => void;
  onRemove: () => void;
  onCreateArea: (name: string, unitId: string) => Promise<string | null>;
}) {
  const [newArea, setNewArea] = useState<{ name: string; unitId: string } | null>(null);
  const [areaError, setAreaError] = useState<string | null>(null);
  const [busy, startBusy] = useTransition();
  const e = (k: string) => errors[`questions.${index}.${k}`];
  const multi = q.type === "multi_select";
  const selectClass = "h-8 rounded-md border border-cha-border bg-cha-surface px-2 text-[13px] outline-none focus-visible:ring-4 focus-visible:ring-cha-blue/15";

  function toggleCorrect(oi: number) {
    if (multi) {
      const has = q.correctIndexes.includes(oi);
      onChange({ correctIndexes: has ? q.correctIndexes.filter((x) => x !== oi) : [...q.correctIndexes, oi] });
    } else onChange({ correctIndexes: [oi] });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <label className="text-[13px] font-semibold">
          Type
          <select value={q.type} disabled={readOnly} onChange={(ev) => onChange({ type: ev.target.value as AssessmentDraftQuestion["type"], correctIndexes: [q.correctIndexes[0] ?? 0] })} className={`mt-1 block ${selectClass}`}>
            <option value="single_choice">Single choice (MC)</option>
            <option value="multi_select">Multi-select</option>
          </select>
        </label>
        <label className="text-[13px] font-semibold">
          Difficulty
          <select value={q.difficulty} disabled={readOnly} onChange={(ev) => onChange({ difficulty: ev.target.value as Difficulty })} className={`mt-1 block capitalize ${selectClass}`}>
            {DIFFS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[13px] font-semibold">
          Default Weight (pts)
          <input type="number" min={1} max={100} value={q.points} readOnly={readOnly} onChange={(ev) => onChange({ points: Number(ev.target.value) })} className={`mt-1 block w-20 ${selectClass}`} />
        </label>
        <label className="text-[13px] font-semibold">
          Module Area
          <select
            value={q.topicId ?? ""}
            disabled={readOnly}
            onChange={(ev) => {
              if (ev.target.value === "__new") setNewArea({ name: "", unitId: units[0]?.id ?? "" });
              else onChange({ topicId: ev.target.value || null });
            }}
            className={`mt-1 block min-w-44 ${selectClass}`}
          >
            <option value="">None</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
            {!readOnly && <option value="__new">+ New area…</option>}
          </select>
        </label>
        {!readOnly && (
          <div className="ml-auto flex gap-1">
            <Button isIconOnly size="sm" variant="ghost" aria-label={`Move question ${index + 1} up`} isDisabled={index === 0} onPress={() => onMove(-1)}>
              <ArrowUp size={14} aria-hidden />
            </Button>
            <Button isIconOnly size="sm" variant="ghost" aria-label={`Move question ${index + 1} down`} isDisabled={index === count - 1} onPress={() => onMove(1)}>
              <ArrowDown size={14} aria-hidden />
            </Button>
            <Button isIconOnly size="sm" variant="ghost" aria-label={`Remove question ${index + 1}`} onPress={onRemove}>
              <Trash2 size={14} aria-hidden />
            </Button>
          </div>
        )}
      </div>
      {(e("points") || e("topicId")) && <p className="-mt-2 text-xs text-cha-danger">{e("points") ?? e("topicId")}</p>}

      {newArea && (
        <div className="flex flex-wrap items-end gap-2 rounded-md border border-cha-border bg-cha-surface p-3">
          <label className="text-[13px] font-semibold">
            New area name
            <input value={newArea.name} maxLength={120} onChange={(ev) => setNewArea({ ...newArea, name: ev.target.value })} className={`mt-1 block w-56 ${selectClass}`} />
          </label>
          <label className="text-[13px] font-semibold">
            Review unit
            <select value={newArea.unitId} onChange={(ev) => setNewArea({ ...newArea, unitId: ev.target.value })} className={`mt-1 block ${selectClass}`}>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </label>
          <Button
            size="sm"
            className="font-bold"
            isPending={busy}
            onPress={() =>
              startBusy(async () => {
                const problem = await onCreateArea(newArea.name, newArea.unitId);
                setAreaError(problem);
                if (!problem) setNewArea(null);
              })
            }
          >
            Add area
          </Button>
          <Button size="sm" variant="ghost" onPress={() => (setNewArea(null), setAreaError(null))}>
            Cancel
          </Button>
          <p className="w-full text-xs text-cha-muted">Learners who miss questions in this area are pointed back to the review unit.</p>
          {areaError && <p className="w-full text-xs text-cha-danger">{areaError}</p>}
        </div>
      )}

      <TextField value={q.prompt} onChange={(v) => onChange({ prompt: v })} isReadOnly={readOnly} isInvalid={Boolean(e("prompt"))}>
        <Label className="text-[13px] font-semibold">Question Scenario</Label>
        <TextArea className="rounded-md bg-cha-surface" rows={2} maxLength={1000} />
        <FieldError>{e("prompt")}</FieldError>
      </TextField>

      <fieldset>
        <legend className="text-[13px] font-semibold">Answers {multi ? "(mark every correct answer)" : "(mark the correct answer)"}</legend>
        <div className="mt-2 flex flex-col gap-2">
          {q.options.map((opt, oi) => (
            <div key={oi} className="flex items-center gap-3">
              <input
                type={multi ? "checkbox" : "radio"}
                name={`aq${index}-correct`}
                checked={q.correctIndexes.includes(oi)}
                disabled={readOnly}
                onChange={() => toggleCorrect(oi)}
                aria-label={`Mark option ${LETTERS[oi]} correct`}
                className="size-[18px] shrink-0 accent-cha-orange"
              />
              <span className="w-5 text-[13px] font-bold text-cha-muted">{LETTERS[oi]}:</span>
              <input
                value={opt}
                readOnly={readOnly}
                maxLength={300}
                aria-label={`Question ${index + 1}, option ${LETTERS[oi]}`}
                onChange={(ev) => onChange({ options: q.options.map((o, k) => (k === oi ? ev.target.value : o)) })}
                className="h-8 min-w-0 flex-1 rounded-md bg-cha-surface px-3 text-[13px] outline-none focus-visible:ring-4 focus-visible:ring-cha-blue/15"
              />
              {!readOnly && q.options.length > 2 && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  aria-label={`Remove option ${LETTERS[oi]}`}
                  onPress={() =>
                    onChange({
                      options: q.options.filter((_, k) => k !== oi),
                      correctIndexes: q.correctIndexes.filter((x) => x !== oi).map((x) => (x > oi ? x - 1 : x)),
                    })
                  }
                >
                  <X size={14} aria-hidden />
                </Button>
              )}
            </div>
          ))}
        </div>
        {(e("options") || e("correctIndexes") || Object.keys(errors).find((k) => k.startsWith(`questions.${index}.options.`))) && (
          <p className="mt-1 text-xs text-cha-danger">{e("options") ?? e("correctIndexes") ?? errors[Object.keys(errors).find((k) => k.startsWith(`questions.${index}.options.`))!]}</p>
        )}
        {!readOnly && q.options.length < 6 && (
          <Button size="sm" variant="ghost" className="mt-2" onPress={() => onChange({ options: [...q.options, ""] })}>
            <Plus size={14} aria-hidden /> Add option
          </Button>
        )}
      </fieldset>

      <TextField value={q.explanation} onChange={(v) => onChange({ explanation: v })} isReadOnly={readOnly} isInvalid={Boolean(e("explanation"))}>
        <Label className="text-[13px] font-semibold">Explanation (shown in the results review)</Label>
        <TextArea className="rounded-md bg-cha-surface" rows={2} maxLength={2000} />
        <FieldError>{e("explanation")}</FieldError>
      </TextField>
    </div>
  );
}
