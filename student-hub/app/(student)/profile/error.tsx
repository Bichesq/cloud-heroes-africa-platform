"use client";

import { RefreshCw, LifeBuoy } from "lucide-react";

/** Non-blocking error state for a failed profile load, with Retry + Support CTA. */
export default function ProfileError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-3xl bg-cha-surface p-7 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
      <h1 className="font-display text-[26px] font-extrabold">My Profile</h1>
      <p className="text-sm font-medium text-cha-muted">
        We couldn&apos;t load your profile right now. Your data is safe — please
        try again.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-1.5 rounded-full bg-cha-blue px-5 py-2 text-sm font-semibold text-white transition hover:bg-cha-blue/90"
        >
          <RefreshCw size={15} /> Retry
        </button>
        <a
          href="mailto:support@cloudheroesafrica.com"
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-cha-blue transition hover:bg-cha-blue/10"
        >
          <LifeBuoy size={15} /> Contact Support
        </a>
      </div>
    </div>
  );
}
