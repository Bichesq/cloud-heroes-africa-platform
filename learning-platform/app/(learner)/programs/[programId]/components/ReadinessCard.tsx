import Link from "next/link";
import { ArrowRight, Gauge } from "lucide-react";
import type { ReadinessSummary } from "@/lib/lp-utils";

/* Exam Readiness entry card (decision 2026-07-09: readiness is measured by
 * dedicated assessments, never inferred from content consumption). Shows the
 * latest level/score + history count, and the entry point to (re)take. */

export default function ReadinessCard({
  programId,
  assessmentId,
  title,
  description,
  summary,
}: {
  programId: string;
  assessmentId: string;
  title: string;
  description: string;
  summary: ReadinessSummary;
}) {
  const { latest, history } = summary;

  return (
    <section className="cha-card flex flex-wrap items-center gap-6 px-6 py-5">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cha-blue/10 text-cha-blue">
        <Gauge size={24} />
      </span>

      <div className="min-w-0 flex-1">
        <h2 className="font-display text-lg font-extrabold">{title}</h2>
        <p className="mt-0.5 text-sm text-cha-muted">{description}</p>
      </div>

      {latest ? (
        <div className="shrink-0 text-right">
          <div
            className={`font-display text-xl font-extrabold ${
              latest.score >= 0.8
                ? "text-cha-success"
                : latest.score >= 0.5
                  ? "text-cha-warning"
                  : "text-cha-danger"
            }`}
          >
            {latest.level ?? `${Math.round(latest.score * 100)}%`}
          </div>
          <div className="text-xs text-cha-faint">
            Latest score {Math.round(latest.score * 100)}% ·{" "}
            {history.length} attempt{history.length === 1 ? "" : "s"}
          </div>
        </div>
      ) : (
        <div className="shrink-0 text-sm font-semibold text-cha-faint">
          Not taken yet
        </div>
      )}

      <Link
        href={`/programs/${programId}/readiness/${assessmentId}`}
        className="flex shrink-0 items-center gap-2 rounded-full bg-cha-blue px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-cha-blue/90"
      >
        {latest ? "Retake assessment" : "Check my readiness"}
        <ArrowRight size={16} />
      </Link>
    </section>
  );
}
