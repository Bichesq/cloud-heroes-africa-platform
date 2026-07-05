"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { UserCog, ArrowRight, X } from "lucide-react";

/**
 * Soft profile-completion gate for the dashboard.
 *
 * When the student's profile is incomplete, the first dashboard visit of a
 * browser session shows a popup offering "Complete Profile" or "Continue to
 * Dashboard". Choosing to continue dismisses the popup for the rest of the
 * session (tracked in sessionStorage) — after that a persistent banner keeps
 * reminding them, but the popup never re-appears until a new session.
 *
 * Renders nothing once the profile is complete.
 */
const DISMISS_KEY = "chaDashboardProfileReminderDismissed";

export default function ProfileGate({ complete }: { complete: boolean }) {
  const [showModal, setShowModal] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Decide whether to open the popup after mount, so SSR and the first client
  // render agree (avoids a hydration mismatch / flash).
  useEffect(() => {
    if (complete) return;
    const dismissed = sessionStorage.getItem(DISMISS_KEY) === "1";
    if (!dismissed) setShowModal(true);
  }, [complete]);

  // Escape closes the popup (same as "Continue to Dashboard").
  useEffect(() => {
    if (!showModal) return;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showModal]);

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setShowModal(false);
  }

  if (complete) return null;

  return (
    <>
      {/* Persistent reminder — always visible while the profile is incomplete. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-cha-orange/30 bg-cha-orange/10 px-4 py-3">
        <UserCog size={18} className="shrink-0 text-cha-orange" />
        <span className="text-sm font-medium text-cha-ink">
          Your profile is incomplete. Complete it to get the most out of your
          dashboard.
        </span>
        <Link
          href="/profile"
          className="ml-auto flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-cha-orange hover:underline"
        >
          Complete profile <ArrowRight size={15} />
        </Link>
      </div>

      {/* One-time popup */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-gate-title"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={dismiss}
            aria-hidden="true"
          />
          <div
            ref={panelRef}
            tabIndex={-1}
            className="relative w-full max-w-md rounded-3xl bg-cha-surface p-7 shadow-[0_20px_50px_rgba(0,0,0,0.25)] outline-none"
          >
            <button
              onClick={dismiss}
              aria-label="Close"
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-cha-faint transition-colors hover:bg-cha-surface-2"
            >
              <X size={18} />
            </button>

            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cha-orange/10 text-cha-orange">
              <UserCog size={24} />
            </div>

            <h2
              id="profile-gate-title"
              className="mt-4 font-display text-[22px] font-bold text-cha-ink"
            >
              Complete your profile
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-cha-muted">
              A few details are still missing. Finish your profile to unlock the
              full experience — or continue to the dashboard and complete it
              later.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={dismiss}
                className="rounded-full bg-cha-surface-2 px-5 py-2.5 text-sm font-semibold text-cha-ink transition-colors hover:bg-cha-border"
              >
                Continue to Dashboard
              </button>
              <Link
                href="/profile"
                onClick={dismiss}
                className="flex items-center justify-center gap-1.5 rounded-full bg-cha-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cha-orange-strong"
              >
                Complete Profile <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
