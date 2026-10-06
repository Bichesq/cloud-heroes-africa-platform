"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Alert, Button, buttonVariants, FieldError, Input, Label, Separator, TextArea, TextField } from "@heroui/react";
import { CloudUpload } from "lucide-react";
import PersonSelect from "@/components/people/PersonSelect";
import type { PersonOption } from "@/components/people/types";
import type { FormState } from "@/lib/actions/form-state";
import { saveProgramSetup } from "@/lib/actions/program-setup";

/* Program Setup (§6.1) — Figma "Program Setup" frame, Setup card:
 *   left 618px "Program details": Program Name, Description, Creator dropdown
 *     with "The creator owns and maintains this program's content."
 *   right 390px "Program thumbnail": dashed upload area, upload-cloud glyph,
 *     "Upload program thumbnail" / "PNG or JPG · recommended 16:9",
 *     "Choose file"
 *   divider, then Cancel / Save Program.
 *
 * Create mode has no Creator control (the creator is the signed-in Director,
 * plan §7). Read-only mode (Reviewer / Viewer / Instructor / Creator only)
 * shows the same card with nothing editable and no actions. Every rule is
 * enforced again in the server action; this only decides what's shown. */

const MAX_BYTES = 2 * 1024 * 1024;

export type ProgramSetupValues = {
  id: string | null; // null = create
  title: string;
  description: string;
  creatorAuthorId: string | null;
  thumbnailUrl: string | null;
};

export default function ProgramSetupForm({
  program,
  canEdit,
  canChangeCreator,
  people,
  justCreated = false,
}: {
  program: ProgramSetupValues;
  canEdit: boolean;
  canChangeCreator: boolean;
  people: PersonOption[];
  justCreated?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState<FormState, FormData>(async (prev, formData) => {
    const result = await saveProgramSetup(program.id ?? "new", prev, formData);
    // Saved: the page re-renders with the stored thumbnail, so drop the
    // local preview and clear the picker (no accidental re-upload).
    if (result?.ok) {
      setPreview(null);
      setFileName(null);
      if (fileRef.current) fileRef.current.value = "";
    }
    return result;
  }, null);

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  const fieldErrors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  const readOnly = !canEdit;
  const isCreate = program.id === null;
  const creatorName = people.find((p) => p.id === program.creatorAuthorId)?.label ?? "Not set";
  const shownThumb = preview ?? program.thumbnailUrl;

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileError(null);
    if (preview) URL.revokeObjectURL(preview);
    if (!file) {
      setPreview(null);
      setFileName(null);
      return;
    }
    // Convenience only; the server checks the content and size itself.
    if (file.size > MAX_BYTES || !["image/png", "image/jpeg"].includes(file.type)) {
      setFileError("Choose a PNG or JPG image of 2 MB or less.");
      e.target.value = "";
      setPreview(null);
      setFileName(null);
      return;
    }
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
  }

  return (
    <form action={formAction} className="cha-card-outline mt-8 rounded-[18px] p-7" noValidate>
      <div className="flex flex-col gap-7 lg:flex-row">
        {/* Program details */}
        <fieldset className="flex min-w-0 flex-1 flex-col gap-5 lg:max-w-[618px]">
          <legend className="mb-4 font-display text-lg font-extrabold">Program details</legend>

          <TextField
            name="title"
            defaultValue={program.title}
            isRequired
            isReadOnly={readOnly}
            isInvalid={Boolean(fieldErrors.title)}
          >
            <Label className="text-sm font-semibold">Program Name</Label>
            <Input className="rounded-md" maxLength={120} />
            <FieldError>{fieldErrors.title}</FieldError>
          </TextField>

          <TextField
            name="description"
            defaultValue={program.description}
            isReadOnly={readOnly}
            isInvalid={Boolean(fieldErrors.description)}
          >
            <Label className="text-sm font-semibold">Description</Label>
            <TextArea className="rounded-md" rows={4} maxLength={2000} style={{ resize: "vertical" }} />
            <FieldError>{fieldErrors.description}</FieldError>
          </TextField>

          {isCreate ? (
            <div>
              <p className="text-sm font-semibold">Creator</p>
              <p className="mt-1.5 text-sm text-cha-ink">You</p>
              <p className="mt-1 text-xs text-cha-muted">
                The creator owns and maintains this program&apos;s content. You&apos;ll also be its first Owner and
                Director.
              </p>
            </div>
          ) : canEdit && canChangeCreator ? (
            <PersonSelect
              label="Creator"
              name="creatorAuthorId"
              people={people}
              defaultValue={program.creatorAuthorId}
              description="The creator owns and maintains this program’s content."
              errorMessage={fieldErrors.creatorAuthorId}
            />
          ) : (
            <div>
              <p className="text-sm font-semibold">Creator</p>
              <p className="mt-1.5 text-sm text-cha-ink">{creatorName}</p>
              <p className="mt-1 text-xs text-cha-muted">The creator owns and maintains this program’s content.</p>
            </div>
          )}
        </fieldset>

        {/* Program thumbnail — custom composition: HeroUI v3 has no file
            upload component; a native file input behind a HeroUI Button. */}
        <div className="w-full lg:w-[390px]">
          <p className="text-sm font-semibold">Program thumbnail</p>
          <div
            className={`mt-3 flex aspect-video flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed text-center ${
              fieldErrors.thumbnail || fileError ? "border-cha-danger" : "border-cha-border"
            } bg-cha-canvas`}
          >
            {shownThumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shownThumb} alt="Program thumbnail preview" className="h-full w-full object-cover" />
            ) : (
              <>
                <CloudUpload size={28} className="text-cha-faint" aria-hidden />
                <p className="text-sm font-semibold">Upload program thumbnail</p>
                <p className="text-xs text-cha-muted">PNG or JPG · recommended 16:9</p>
              </>
            )}
          </div>
          {canEdit && (
            <div className="mt-3 flex items-center gap-3">
              <input
                ref={fileRef}
                id="thumbnail"
                type="file"
                name="thumbnail"
                accept="image/png,image/jpeg"
                className="sr-only"
                onChange={onFileChange}
                aria-describedby="thumbnail-help"
              />
              <Button size="sm" variant="outline" className="rounded-md" onPress={() => fileRef.current?.click()}>
                {shownThumb ? "Replace file" : "Choose file"}
              </Button>
              <p id="thumbnail-help" className="min-w-0 truncate text-xs text-cha-muted">
                {fileName ?? "PNG or JPG, up to 2 MB"}
              </p>
            </div>
          )}
          {(fileError || fieldErrors.thumbnail) && (
            <p role="alert" className="mt-2 text-xs text-cha-danger">
              {fileError ?? fieldErrors.thumbnail}
            </p>
          )}
        </div>
      </div>

      {(state || justCreated) && (
        <div className="mt-6" aria-live="polite">
          {state && !state.ok && (
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>{state.error}</Alert.Description>
              </Alert.Content>
            </Alert>
          )}
          {(state?.ok || (justCreated && !state)) && (
            <Alert status="success">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>
                  {state?.ok ? (state.message ?? "Saved.") : "Program created. Add Instructors below and people in Settings & Access."}
                </Alert.Description>
              </Alert.Content>
            </Alert>
          )}
        </div>
      )}

      {canEdit && (
        <>
          <Separator className="my-6" />
          <div className="flex justify-end gap-3">
            <Link href="/" className={`${buttonVariants({ size: "md", variant: "tertiary" })} rounded-md`}>
              Cancel
            </Link>
            <Button type="submit" className="rounded-md font-bold" isPending={pending}>
              {isCreate ? "Create Program" : "Save Program"}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
