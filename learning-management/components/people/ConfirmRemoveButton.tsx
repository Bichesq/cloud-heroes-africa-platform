"use client";

import { AlertDialog, Button } from "@heroui/react";

/* "Remove" with a confirmation step (HeroUI v3 AlertDialog: not dismissable
 * by backdrop or ESC by default, so a stray click can't confirm). */

export default function ConfirmRemoveButton({
  heading,
  body,
  confirmLabel = "Remove",
  isDisabled,
  onConfirm,
}: {
  heading: string;
  body: string;
  confirmLabel?: string;
  isDisabled?: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <Button size="sm" variant="outline" className="rounded-md" isDisabled={isDisabled}>
        Remove
      </Button>
      <AlertDialog.Backdrop>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-[420px]">
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>{heading}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p className="text-sm text-cha-muted">{body}</p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                Cancel
              </Button>
              <Button slot="close" variant="danger" onPress={onConfirm}>
                {confirmLabel}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}
