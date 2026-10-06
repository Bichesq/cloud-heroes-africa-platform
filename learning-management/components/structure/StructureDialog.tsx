"use client";

import { useState, useTransition } from "react";
import { Alert, Button, FieldError, Input, Label, Modal, TextArea, TextField } from "@heroui/react";
import type { FormState } from "@/lib/actions/form-state";

/* Add / edit dialog for a module or unit (Course Structure, plan §8). Not
 * drawn in the Figma — the frame shows only the "+ Add Module", "+ Add Unit"
 * and Edit triggers — so this is a plain HeroUI v3 Modal with the two fields
 * both models have (title, description).
 *
 * Delete lives here, behind a second confirming click, and only when the
 * server would allow it (empty module / draft unit); `deleteBlockedReason`
 * explains otherwise. The server action enforces the same rule. */

export type DialogConfig = {
  heading: string;
  submitLabel: string;
  initialTitle?: string;
  initialDescription?: string;
  titleLabel: string;
  note?: string;
  onSubmit: (values: { title: string; description: string }) => Promise<FormState>;
  onDelete?: () => Promise<FormState>;
  deleteLabel?: string;
  deleteBlockedReason?: string | null;
};

export default function StructureDialog({
  config,
  onClose,
}: {
  config: DialogConfig | null;
  onClose: () => void;
}) {
  return (
    <Modal.Backdrop isOpen={config !== null} onOpenChange={(open) => !open && onClose()}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-[480px]">
          {/* Keyed so each opening starts from its own initial values. */}
          {config && <DialogBody key={`${config.heading}:${config.initialTitle ?? ""}`} config={config} onClose={onClose} />}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

function DialogBody({ config, onClose }: { config: DialogConfig; onClose: () => void }) {
  const [title, setTitle] = useState(config.initialTitle ?? "");
  const [description, setDescription] = useState(config.initialDescription ?? "");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  function handle(action: () => Promise<FormState>) {
    setError(null);
    setFieldErrors({});
    startTransition(async () => {
      const result = await action();
      if (result && !result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      onClose();
    });
  }

  return (
    <>
      <Modal.CloseTrigger />
      <Modal.Header>
        <Modal.Heading>{config.heading}</Modal.Heading>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4">
        <form
          id="structure-dialog-form"
          className="flex flex-col gap-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            handle(() => config.onSubmit({ title, description }));
          }}
        >
          <TextField value={title} onChange={setTitle} isRequired isInvalid={Boolean(fieldErrors.title)} autoFocus>
            <Label className="text-sm font-semibold">{config.titleLabel}</Label>
            <Input className="rounded-md" maxLength={160} />
            <FieldError>{fieldErrors.title}</FieldError>
          </TextField>
          <TextField value={description} onChange={setDescription} isInvalid={Boolean(fieldErrors.description)}>
            <Label className="text-sm font-semibold">Description</Label>
            <TextArea className="rounded-md" rows={3} maxLength={1000} style={{ resize: "vertical" }} />
            <FieldError>{fieldErrors.description}</FieldError>
          </TextField>
        </form>
        {config.note && <p className="text-xs text-cha-muted">{config.note}</p>}

        {config.onDelete && (
          <div className="rounded-md border border-cha-border p-3">
            {config.deleteBlockedReason ? (
              <p className="text-xs text-cha-muted">{config.deleteBlockedReason}</p>
            ) : confirmingDelete ? (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-cha-ink">Delete permanently? This can&apos;t be undone.</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="tertiary" onPress={() => setConfirmingDelete(false)} isDisabled={pending}>
                    Keep it
                  </Button>
                  <Button size="sm" variant="danger" onPress={() => handle(config.onDelete!)} isDisabled={pending}>
                    Yes, delete
                  </Button>
                </div>
              </div>
            ) : (
              <Button size="sm" variant="outline" className="rounded-md" onPress={() => setConfirmingDelete(true)}>
                {config.deleteLabel ?? "Delete"}
              </Button>
            )}
          </div>
        )}

        {error && (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button slot="close" variant="tertiary">
          Cancel
        </Button>
        <Button type="submit" form="structure-dialog-form" className="font-bold" isPending={pending}>
          {config.submitLabel}
        </Button>
      </Modal.Footer>
    </>
  );
}
