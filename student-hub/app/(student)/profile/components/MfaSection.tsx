"use client";

import { useState } from "react";
import { Button, Table, Tabs } from "@heroui/react";
import { KeyRound, Plus, ShieldAlert, ShieldCheck } from "lucide-react";
import type { MfaMethod, MfaMethodKind, Passkey } from "@/types";
import { formatJoinedDate, isMfaEnabled } from "@/lib/profile-utils";
import { cardClass } from "./fields";
import ConfirmModal from "./ConfirmModal";

const METHOD_LABELS: Record<MfaMethodKind, string> = {
  email: "Email",
  authenticator: "Authenticator App",
  sms: "SMS",
};

type PendingAction =
  | { kind: "disable-method"; id: string; label: string }
  | { kind: "remove-passkey"; id: string; label: string };

/**
 * Multi-Factor Authentication section: "Multi-Factor" tab (methods table)
 * and "Passkeys" tab. MFA is optional but recommended — a banner nudges
 * when no method is active. Destructive actions confirm via modal.
 *
 * NOTE (POC): method/passkey records persist on the student record, but no
 * real OTP emails are sent and no WebAuthn ceremony runs yet.
 */
export default function MfaSection({
  methods,
  passkeys,
  busy,
  onAddEmailMethod,
  onDisableMethod,
  onAddPasskey,
  onRemovePasskey,
}: {
  methods: MfaMethod[];
  passkeys: Passkey[];
  busy: boolean;
  onAddEmailMethod: () => Promise<boolean>;
  onDisableMethod: (id: string) => Promise<boolean>;
  onAddPasskey: (label: string) => Promise<boolean>;
  onRemovePasskey: (id: string) => Promise<boolean>;
}) {
  const [pending, setPending] = useState<PendingAction | null>(null);
  const enabled = isMfaEnabled(methods);

  async function confirmPending() {
    if (!pending) return;
    const ok =
      pending.kind === "disable-method"
        ? await onDisableMethod(pending.id)
        : await onRemovePasskey(pending.id);
    if (ok) setPending(null);
  }

  function addPasskey() {
    const ua = navigator.userAgent;
    const browser = ua.includes("Edg")
      ? "Edge"
      : ua.includes("Chrome")
        ? "Chrome"
        : ua.includes("Firefox")
          ? "Firefox"
          : ua.includes("Safari")
            ? "Safari"
            : "Browser";
    const os = ua.includes("Windows")
      ? "Windows"
      : ua.includes("Mac")
        ? "macOS"
        : ua.includes("Android")
          ? "Android"
          : ua.includes("Linux")
            ? "Linux"
            : "device";
    void onAddPasskey(`${browser} on ${os}`);
  }

  return (
    <div className={`flex flex-col gap-5 p-7 ${cardClass}`}>
      <h2 className="whitespace-nowrap font-display text-[22px] font-bold text-cha-orange">
        Multi-Factor Authentication (MFA)
      </h2>

      {enabled ? (
        <p className="flex items-center gap-2 text-[13px] font-medium text-emerald-600 dark:text-emerald-400">
          <ShieldCheck size={16} className="shrink-0" />
          MFA is enabled on your account.
        </p>
      ) : (
        <p
          role="status"
          className="flex items-center gap-2 rounded-2xl bg-amber-500/10 px-4 py-3 text-[13px] font-medium text-amber-600 dark:text-amber-400"
        >
          <ShieldAlert size={16} className="shrink-0" />
          For better security, enable Multi-Factor Authentication.
        </p>
      )}

      <Tabs defaultSelectedKey="mfa">
        <Tabs.ListContainer>
          <Tabs.List aria-label="MFA settings">
            <Tabs.Tab id="mfa">
              Multi-Factor
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="passkeys">
              Passkeys
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel id="mfa" className="pt-4">
          {methods.length === 0 ? (
            <div className="flex flex-col items-start gap-3">
              <p className="text-[13.5px] leading-relaxed text-cha-muted">
                No MFA methods configured. Enable email protection to receive a
                security code on each login.
              </p>
              <Button
                variant="primary"
                isDisabled={busy}
                onPress={() => void onAddEmailMethod()}
                className="rounded-full bg-cha-blue px-6 font-semibold text-white hover:bg-cha-blue/90"
              >
                Enable Email MFA
              </Button>
            </div>
          ) : (
            <Table>
              <Table.ScrollContainer>
                <Table.Content aria-label="MFA methods" className="min-w-[520px]">
                  <Table.Header>
                    <Table.Column isRowHeader>Method</Table.Column>
                    <Table.Column>Transport</Table.Column>
                    <Table.Column>Identifier</Table.Column>
                    <Table.Column>Last Used</Table.Column>
                    <Table.Column>Action</Table.Column>
                  </Table.Header>
                  <Table.Body>
                    {methods.map((m) => (
                      <Table.Row key={m.id}>
                        <Table.Cell>{METHOD_LABELS[m.method]}</Table.Cell>
                        <Table.Cell>{m.transport}</Table.Cell>
                        <Table.Cell>{m.identifier}</Table.Cell>
                        <Table.Cell>
                          {m.lastUsed ? formatJoinedDate(m.lastUsed) : "—"}
                        </Table.Cell>
                        <Table.Cell>
                          <button
                            disabled={busy}
                            onClick={() =>
                              setPending({
                                kind: "disable-method",
                                id: m.id,
                                label: METHOD_LABELS[m.method],
                              })
                            }
                            className="rounded-full px-3 py-1 text-[12.5px] font-semibold text-red-600 transition hover:bg-red-500/10 disabled:opacity-50"
                          >
                            Disable
                          </button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          )}
        </Tabs.Panel>

        <Tabs.Panel id="passkeys" className="pt-4">
          <div className="flex flex-col gap-4">
            {passkeys.length === 0 ? (
              <p className="text-[13.5px] leading-relaxed text-cha-muted">
                No passkeys registered. Passkeys let you sign in with your
                device&apos;s screen lock instead of a password.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {passkeys.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-cha-border px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <KeyRound size={18} className="shrink-0 text-cha-muted" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-cha-ink">
                          {p.label}
                        </div>
                        <div className="text-[12px] text-cha-faint">
                          Registered {formatJoinedDate(p.registeredAt)} · Last used{" "}
                          {p.lastUsed ? formatJoinedDate(p.lastUsed) : "never"}
                        </div>
                      </div>
                    </div>
                    <button
                      disabled={busy}
                      onClick={() =>
                        setPending({ kind: "remove-passkey", id: p.id, label: p.label })
                      }
                      className="shrink-0 rounded-full px-3 py-1 text-[12.5px] font-semibold text-red-600 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <Button
              variant="primary"
              isDisabled={busy}
              onPress={addPasskey}
              className="self-start rounded-full bg-cha-blue px-5 font-semibold text-white hover:bg-cha-blue/90"
            >
              <Plus size={15} /> Add Passkey
            </Button>
          </div>
        </Tabs.Panel>
      </Tabs>

      <ConfirmModal
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title={
          pending?.kind === "remove-passkey" ? "Remove this passkey?" : "Disable this MFA method?"
        }
        confirmLabel={pending?.kind === "remove-passkey" ? "Remove" : "Disable"}
        tone="danger"
        busy={busy}
        onConfirm={() => void confirmPending()}
      >
        {pending?.kind === "disable-method" ? (
          <>
            <strong>{pending.label}</strong> will no longer be available for
            multi-factor authentication. Without an active MFA method, your
            account is protected by your Google sign-in only — security may be
            reduced.
          </>
        ) : (
          <>
            <strong>{pending?.label}</strong> will be removed and can no longer
            be used to sign in from that device.
          </>
        )}
      </ConfirmModal>
    </div>
  );
}
