"use client";

import { Button, Modal } from "@heroui/react";
import type { ReactNode } from "react";

/**
 * Confirmation dialog used by the privacy toggles and the MFA/passkey
 * actions. Controlled HeroUI Modal: nothing changes unless "Confirm" is
 * pressed; closing or cancelling leaves the previous state untouched.
 */
export default function ConfirmModal({
  open,
  onOpenChange,
  title,
  confirmLabel = "Confirm",
  tone = "primary",
  busy = false,
  onConfirm,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  confirmLabel?: string;
  tone?: "primary" | "danger";
  busy?: boolean;
  onConfirm: () => void;
  children: ReactNode;
}) {
  return (
    <Modal.Backdrop isOpen={open} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-[440px]">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="font-display text-[19px] font-bold">
              {title}
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <div className="text-sm leading-relaxed text-cha-muted">{children}</div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              isDisabled={busy}
              onPress={() => onOpenChange(false)}
              className="rounded-full px-5 font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              isDisabled={busy}
              onPress={onConfirm}
              className={`rounded-full px-5 font-semibold text-white ${
                tone === "danger"
                  ? "bg-red-600 hover:bg-red-600/90"
                  : "bg-cha-blue hover:bg-cha-blue/90"
              }`}
            >
              {busy ? "Working…" : confirmLabel}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
