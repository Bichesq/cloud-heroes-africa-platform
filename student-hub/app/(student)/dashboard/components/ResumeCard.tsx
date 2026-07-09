import Link from "next/link";
import { ArrowRight, PartyPopper, Rocket } from "lucide-react";
import type { ResumeState } from "@/lib/curriculum-utils";

/**
 * Orange "Resume Where You Left Off" feature card. Real progress/next-unit
 * data drives the in-progress state; track-complete and no-active-program
 * are separate empty states per the requirements.
 */
export default function ResumeCard({ state }: { state: ResumeState }) {
  if (state.kind === "no-program") {
    return (
      <Link
        href="/explore"
        className="flex min-h-[196px] flex-col justify-center gap-3 rounded-3xl bg-cha-orange p-[26px] text-white shadow-[0_8px_24px_rgba(232,84,26,0.18)] transition-opacity hover:opacity-95"
      >
        <Rocket size={28} />
        <div className="flex items-center gap-2 font-display text-[28px] font-extrabold leading-[1.1]">
          Get Started <ArrowRight size={26} strokeWidth={2.5} />
        </div>
        <p className="max-w-md text-sm opacity-90">
          You&apos;re not enrolled in a program yet. Explore Programs to pick your track.
        </p>
      </Link>
    );
  }

  if (state.kind === "complete") {
    return (
      <Link
        href="/my-program"
        className="flex min-h-[196px] flex-col justify-center gap-3 rounded-3xl bg-cha-orange p-[26px] text-white shadow-[0_8px_24px_rgba(232,84,26,0.18)] transition-opacity hover:opacity-95"
      >
        <PartyPopper size={28} />
        <div className="flex items-center gap-2 font-display text-[28px] font-extrabold leading-[1.1]">
          Track Complete <ArrowRight size={26} strokeWidth={2.5} />
        </div>
        <p className="max-w-md text-sm opacity-90">
          You&apos;ve finished {state.programTitle}. Revisit any module or explore what&apos;s next.
        </p>
      </Link>
    );
  }

  return (
    <Link
      href={`/my-program#module-${state.moduleId}`}
      className="flex min-h-[196px] gap-5 rounded-3xl bg-cha-orange p-[26px] text-white shadow-[0_8px_24px_rgba(232,84,26,0.18)] transition-opacity hover:opacity-95"
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="text-[13px] font-semibold opacity-90">{state.programTitle}</div>
        <div className="mt-2 flex items-center gap-2 font-display text-[34px] font-extrabold leading-[1.06]">
          Resume Where You Left Off <ArrowRight size={30} strokeWidth={2.5} />
        </div>
      </div>

      {/* White progress panel */}
      <div className="flex w-[232px] shrink-0 flex-col gap-2.5 rounded-2xl bg-cha-surface p-4 text-cha-ink">
        <div className="text-xs font-semibold text-cha-muted">In Progress</div>
        <div className="flex items-start gap-3">
          <div className="font-display text-[44px] font-extrabold leading-[0.9]">
            {state.percent}%
          </div>
          <p className="m-0 text-[11.5px] leading-snug text-cha-muted">
            {state.moduleDescription}
          </p>
        </div>
        <div className="mt-auto">
          <div className="text-[11px] font-bold">Module {state.moduleOrder}:</div>
          <div className="text-[13px] text-cha-muted">{state.moduleTitle}</div>
        </div>
      </div>
    </Link>
  );
}
