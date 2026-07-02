import { ArrowRight } from "lucide-react";
import type { ResumeModule } from "../data/mock";

/**
 * Orange "Resume Where You Left Off" feature card with a nested white
 * progress panel. Built with Tailwind (not HeroUI Card) because HeroUI
 * v3 Card exposes only semantic — not colored — variants.
 */
export default function ResumeCard({ resume }: { resume: ResumeModule }) {
  return (
    <div className="flex min-h-[196px] gap-5 rounded-3xl bg-cha-orange p-[26px] text-white shadow-[0_8px_24px_rgba(232,84,26,0.18)]">
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="text-[13px] font-semibold opacity-90">
          {resume.track}
        </div>
        <div className="mt-2 flex items-center gap-2 font-display text-[34px] font-extrabold leading-[1.06]">
          Resume Where You Left Off <ArrowRight size={30} strokeWidth={2.5} />
        </div>
      </div>

      {/* White progress panel */}
      <div className="flex w-[232px] shrink-0 flex-col gap-2.5 rounded-2xl bg-white p-4 text-cha-ink">
        <div className="text-xs font-semibold text-zinc-500">
          {resume.progressLabel}
        </div>
        <div className="flex items-start gap-3">
          <div className="font-display text-[44px] font-extrabold leading-[0.9]">
            {resume.progress}%
          </div>
          <p className="m-0 text-[11.5px] leading-snug text-zinc-500">
            {resume.moduleDescription}
          </p>
        </div>
        <div className="mt-auto">
          <div className="text-[11px] font-bold">
            Module {resume.moduleNumber}:
          </div>
          <div className="text-[13px] text-zinc-700">{resume.moduleTitle}</div>
        </div>
      </div>
    </div>
  );
}
