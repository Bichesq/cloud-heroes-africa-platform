"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  AlertDialog,
  Button,
  FieldError,
  Input,
  Label,
  ListBox,
  Select,
  Separator,
  TextArea,
  TextField,
} from "@heroui/react";
import { CloudUpload } from "lucide-react";
import PersonSelect from "@/components/people/PersonSelect";
import type { PersonOption } from "@/components/people/types";
import ContentUpload from "@/components/unit-editor/ContentUpload";
import { deleteUnit } from "@/lib/actions/course-structure";
import type { FormState } from "@/lib/actions/form-state";
import { discardDraft, saveUnit } from "@/lib/actions/unit-editor";

/* Unit Editor — Figma "Unit Editor" frame, one 18px-radius Editor card:
 * Course Context (Program, Module) · Unit Details (Unit Name, Description,
 * and the frame's empty compact row, now Duration / Tokens awarded / Tokens
 * required, plan §9) · Creator & Media (Creator, orange-tint thumbnail
 * upload) · Content Upload · Delete Unit / Save Draft / Publish Unit.
 *
 * Save Draft and Publish Unit post the same form; the server keeps pending
 * changes in a draft copy until Publish (decision #8). Publishing asks for
 * confirmation because it changes what learners see. Everything here is
 * re-checked by the server actions; `canEdit` etc. only decide what's shown. */

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export type UnitEditorValues = {
  id: string;
  programId: string;
  programTitle: string;
  moduleId: string;
  modules: { id: string; label: string }[];
  title: string;
  description: string;
  durationMin: number;
  tokensAward: number;
  tokensRequired: number;
  creatorAuthorId: string | null;
  thumbnailUrl: string | null;
  published: boolean;
  hasDraft: boolean;
  draftNote: string | null;
  content: { live: { name: string | null; bytes: number | null; topics: number }; pending: { name: string; bytes: number } | null };
};

const fieldClass = "rounded-[10px]";

type EditorProps = {
  unit: UnitEditorValues;
  canEdit: boolean;
  canChangeCreator: boolean;
  people: PersonOption[];
  /** Changes whenever the saved version changes (draft saved, published,
   * discarded) so the form remounts with the server's values. */
  version: number;
};

/** Keeps the last result message across the remount that follows a save. */
export default function UnitEditor(props: EditorProps) {
  const [flash, setFlash] = useState<FormState>(null);
  return <UnitEditorForm key={props.version} {...props} flash={flash} setFlash={setFlash} />;
}

function UnitEditorForm({
  unit,
  canEdit,
  canChangeCreator,
  people,
  flash,
  setFlash,
}: EditorProps & { flash: FormState; setFlash: (s: FormState) => void }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const intentRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [thumbError, setThumbError] = useState<string | null>(null);
  const [duration, setDuration] = useState(String(unit.durationMin));
  const [sideError, setSideError] = useState<string | null>(null);
  const [sidePending, startSide] = useTransition();

  const [actionState, formAction, pending] = useActionState<FormState, FormData>(async (prev, formData) => {
    const result = await saveUnit(unit.programId, unit.id, prev, formData);
    // On success the page re-renders with a new version and this form
    // remounts from the server's values; the message survives in `flash`.
    setFlash(result);
    if (intentRef.current) intentRef.current.value = "draft";
    return result;
  }, null);
  const state = actionState ?? flash;

  const fieldErrors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  const readOnly = !canEdit;
  const creatorName = people.find((p) => p.id === unit.creatorAuthorId)?.label ?? "Not set";

  function submit(intent: "draft" | "publish") {
    if (intentRef.current) intentRef.current.value = intent;
    formRef.current?.requestSubmit();
  }

  function onThumb(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setThumbError(null);
    if (thumbPreview) URL.revokeObjectURL(thumbPreview);
    setThumbPreview(null);
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES || !["image/png", "image/jpeg"].includes(file.type)) {
      setThumbError("Choose a PNG or JPG image of 2 MB or less.");
      e.target.value = "";
      return;
    }
    setThumbPreview(URL.createObjectURL(file));
  }

  function onDelete() {
    setSideError(null);
    startSide(async () => {
      const result = await deleteUnit({ programId: unit.programId, unitId: unit.id });
      if (result && !result.ok) setSideError(result.error);
      else router.push(`/programs/${unit.programId}/structure`);
    });
  }

  function onDiscard() {
    setSideError(null);
    startSide(async () => {
      const result = await discardDraft({ programId: unit.programId, unitId: unit.id });
      if (result && !result.ok) setSideError(result.error);
      else {
        setFlash(result);
        router.refresh();
      }
    });
  }

  const shownThumb = thumbPreview ?? unit.thumbnailUrl;

  return (
    <form ref={formRef} action={formAction} noValidate className="cha-card-outline mt-8 flex flex-col gap-7 rounded-[18px] p-7">
      <input ref={intentRef} type="hidden" name="intent" defaultValue="draft" />

      <StatusBanner unit={unit} canEdit={canEdit} onDiscard={onDiscard} busy={sidePending} />

      {/* Course Context */}
      <section aria-labelledby="context-heading">
        <h2 id="context-heading" className="font-display text-lg font-extrabold">
          Course Context
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-[13px] font-bold">Program</p>
            <p className={`mt-1.5 flex h-[42px] items-center border border-cha-border bg-cha-canvas px-3 text-sm ${fieldClass}`}>
              {unit.programTitle}
            </p>
          </div>
          <Select name="moduleId" defaultValue={unit.moduleId} isDisabled={readOnly} isInvalid={Boolean(fieldErrors.moduleId)}>
            <Label className="text-[13px] font-bold">Module</Label>
            <Select.Trigger className={fieldClass}>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <FieldError>{fieldErrors.moduleId}</FieldError>
            <Select.Popover>
              <ListBox>
                {unit.modules.map((m) => (
                  <ListBox.Item key={m.id} id={m.id} textValue={m.label}>
                    {m.label}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
        {canEdit && <p className="mt-2 text-xs text-cha-muted">Changing the module moves the unit as soon as you save.</p>}
      </section>

      <Separator />

      {/* Unit Details */}
      <section aria-labelledby="details-heading" className="flex flex-col gap-5">
        <h2 id="details-heading" className="font-display text-lg font-extrabold">
          Unit Details
        </h2>
        <TextField name="title" defaultValue={unit.title} isRequired isReadOnly={readOnly} isInvalid={Boolean(fieldErrors.title)}>
          <Label className="text-[13px] font-bold">Unit Name</Label>
          <Input className={fieldClass} maxLength={160} />
          <FieldError>{fieldErrors.title}</FieldError>
        </TextField>
        <TextField name="description" defaultValue={unit.description} isReadOnly={readOnly} isInvalid={Boolean(fieldErrors.description)}>
          <Label className="text-[13px] font-bold">Description</Label>
          <TextArea className={fieldClass} rows={3} maxLength={1000} style={{ resize: "vertical" }} />
          <FieldError>{fieldErrors.description}</FieldError>
        </TextField>
        <div className="grid gap-4 md:grid-cols-3">
          <TextField name="durationMin" value={duration} onChange={setDuration} isReadOnly={readOnly} isInvalid={Boolean(fieldErrors.durationMin)}>
            <Label className="text-[13px] font-bold">Duration (minutes)</Label>
            <Input className={fieldClass} type="number" min={0} max={600} inputMode="numeric" />
            <FieldError>{fieldErrors.durationMin}</FieldError>
          </TextField>
          <TextField name="tokensAward" defaultValue={String(unit.tokensAward)} isReadOnly={readOnly} isInvalid={Boolean(fieldErrors.tokensAward)}>
            <Label className="text-[13px] font-bold">Tokens awarded</Label>
            <Input className={fieldClass} type="number" min={0} max={1000} inputMode="numeric" />
            <FieldError>{fieldErrors.tokensAward}</FieldError>
          </TextField>
          <TextField name="tokensRequired" defaultValue={String(unit.tokensRequired)} isReadOnly={readOnly} isInvalid={Boolean(fieldErrors.tokensRequired)}>
            <Label className="text-[13px] font-bold">Tokens required to unlock</Label>
            <Input className={fieldClass} type="number" min={0} max={100000} inputMode="numeric" />
            <FieldError>{fieldErrors.tokensRequired}</FieldError>
          </TextField>
        </div>
      </section>

      <Separator />

      {/* Creator & Media */}
      <section aria-labelledby="media-heading" className="max-w-[409px]">
        <h2 id="media-heading" className="font-display text-lg font-extrabold">
          Creator &amp; Media
        </h2>
        <div className="mt-4 flex flex-col gap-5">
          {canEdit && canChangeCreator ? (
            <PersonSelect
              label="Creator"
              name="creatorAuthorId"
              people={people}
              defaultValue={unit.creatorAuthorId}
              description="The creator owns and maintains this unit's content."
              errorMessage={fieldErrors.creatorAuthorId}
            />
          ) : (
            <div>
              <p className="text-[13px] font-bold">Creator</p>
              <p className="mt-1.5 text-sm">{creatorName}</p>
              <p className="mt-1 text-[11px] text-cha-muted">The creator owns and maintains this unit&apos;s content.</p>
            </div>
          )}

          {/* Custom composition: native file input behind a HeroUI Button. */}
          <div
            className={`flex aspect-video flex-col items-center justify-center gap-2 overflow-hidden rounded-[10px] border text-center ${
              thumbError || fieldErrors.thumbnail ? "border-cha-danger" : "border-transparent"
            } bg-cha-orange-soft/50`}
          >
            {shownThumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shownThumb} alt="Unit thumbnail preview" className="h-full w-full object-cover" />
            ) : (
              <>
                <CloudUpload size={24} className="text-cha-muted" aria-hidden />
                <p className="text-sm font-bold">Upload unit thumbnail</p>
                <p className="text-[13px] text-cha-muted">PNG or JPG · recommended 16:9</p>
              </>
            )}
          </div>
          {canEdit && (
            <div className="-mt-2 flex items-center gap-3">
              <input
                ref={thumbRef}
                type="file"
                name="thumbnail"
                accept="image/png,image/jpeg"
                className="sr-only"
                onChange={onThumb}
                aria-label="Unit thumbnail image"
              />
              <Button size="sm" variant="outline" className="rounded-md font-bold" onPress={() => thumbRef.current?.click()}>
                {shownThumb ? "Replace file" : "Choose file"}
              </Button>
              <span className="text-xs text-cha-muted">PNG or JPG, up to 2 MB</span>
            </div>
          )}
          {(thumbError || fieldErrors.thumbnail) && (
            <p role="alert" className="-mt-3 text-xs text-cha-danger">
              {thumbError ?? fieldErrors.thumbnail}
            </p>
          )}
        </div>
      </section>

      <Separator />

      <ContentUpload
        programId={unit.programId}
        unitId={unit.id}
        canEdit={canEdit}
        current={unit.content}
        onEstimate={(m) => setDuration(String(m))}
        error={fieldErrors.content}
      />

      {(state || sideError) && (
        <div aria-live="polite">
          {(sideError || (state && !state.ok)) && (
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>{sideError ?? (state && !state.ok ? state.error : "")}</Alert.Description>
              </Alert.Content>
            </Alert>
          )}
          {state?.ok && !sideError && (
            <Alert status="success">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>{state.message}</Alert.Description>
              </Alert.Content>
            </Alert>
          )}
        </div>
      )}

      {canEdit && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {!unit.published && (
              <AlertDialog>
                <Button size="sm" variant="outline" className="rounded-md font-bold text-cha-danger" isDisabled={pending || sidePending}>
                  Delete Unit
                </Button>
                <AlertDialog.Backdrop>
                  <AlertDialog.Container>
                    <AlertDialog.Dialog className="sm:max-w-[420px]">
                      <AlertDialog.Header>
                        <AlertDialog.Icon status="danger" />
                        <AlertDialog.Heading>Delete this unit?</AlertDialog.Heading>
                      </AlertDialog.Header>
                      <AlertDialog.Body>
                        <p className="text-sm text-cha-muted">
                          It has never been published, so no learner has seen it. This can&apos;t be undone.
                        </p>
                      </AlertDialog.Body>
                      <AlertDialog.Footer>
                        <Button slot="close" variant="tertiary">
                          Cancel
                        </Button>
                        <Button slot="close" variant="danger" onPress={onDelete}>
                          Delete Unit
                        </Button>
                      </AlertDialog.Footer>
                    </AlertDialog.Dialog>
                  </AlertDialog.Container>
                </AlertDialog.Backdrop>
              </AlertDialog>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-md font-bold" isDisabled={pending} onPress={() => submit("draft")}>
              Save Draft
            </Button>
            <AlertDialog>
              <Button className="rounded-md font-bold" isPending={pending}>
                Publish Unit
              </Button>
              <AlertDialog.Backdrop>
                <AlertDialog.Container>
                  <AlertDialog.Dialog className="sm:max-w-[440px]">
                    <AlertDialog.Header>
                      <AlertDialog.Icon status="accent" />
                      <AlertDialog.Heading>Publish to learners?</AlertDialog.Heading>
                    </AlertDialog.Header>
                    <AlertDialog.Body>
                      <p className="text-sm text-cha-muted">
                        {unit.published
                          ? "Learners will see this version straight away. If you've imported a new file, topics that are no longer in it are removed, along with learners' progress on them."
                          : "Learners will be able to open this unit straight away."}
                      </p>
                    </AlertDialog.Body>
                    <AlertDialog.Footer>
                      <Button slot="close" variant="tertiary">
                        Cancel
                      </Button>
                      <Button slot="close" onPress={() => submit("publish")}>
                        Publish Unit
                      </Button>
                    </AlertDialog.Footer>
                  </AlertDialog.Dialog>
                </AlertDialog.Container>
              </AlertDialog.Backdrop>
            </AlertDialog>
          </div>
        </div>
      )}
    </form>
  );
}

function StatusBanner({
  unit,
  canEdit,
  onDiscard,
  busy,
}: {
  unit: UnitEditorValues;
  canEdit: boolean;
  onDiscard: () => void;
  busy: boolean;
}) {
  const [text, tone] = !unit.published
    ? ["Draft: learners can't see this unit until it's published.", "warning" as const]
    : unit.hasDraft
      ? [`Unpublished changes${unit.draftNote ? ` (${unit.draftNote})` : ""}. Learners still see the published version.`, "accent" as const]
      : ["Published. Changes you save as a draft reach learners only when you publish.", "success" as const];
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-md border px-4 py-3 text-sm ${
        tone === "warning"
          ? "border-cha-warning/50 bg-cha-warning/10"
          : tone === "accent"
            ? "border-cha-orange/40 bg-cha-orange-soft/40"
            : "border-cha-success/40 bg-cha-success/10"
      }`}
      role="status"
    >
      <p>{text}</p>
      {canEdit && unit.published && unit.hasDraft && (
        <Button size="sm" variant="ghost" onPress={onDiscard} isDisabled={busy}>
          Discard changes
        </Button>
      )}
    </div>
  );
}
