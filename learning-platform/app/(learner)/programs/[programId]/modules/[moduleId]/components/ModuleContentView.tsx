import Link from "next/link";
import {
  Accordion,
  Avatar,
  Card,
  Chip,
  ProgressCircle,
} from "@heroui/react";
import {
  BookOpenCheck,
  ChevronDown,
  ClipboardList,
  Clock,
  Globe,
  Infinity as InfinityIcon,
  Lock,
} from "lucide-react";
import type { CreatorRef, StudentUnitStatus } from "@/types";
import type { ModuleStats } from "@/lib/lp-utils";

/* Module Content View — new screen, rebuilt against the standalone
 * "Learning Platform (Module Content View)" Figma canvas (decoded via
 * decode_fig.py), which turned out to be a *separate* frame from the
 * Program+Module View, not a section of it (confirmed by walking the
 * decoded canvas tree, resolving the parent plan doc's Open Question #2).
 * Reached via "View Module Details" from ProgramOverview.
 *
 * Two stats in the Figma frame ("Course Enrollments: 40", "Reviews: 15")
 * are platform-wide aggregates this app has no query for, and Reviews has
 * no backend/schema support at all (course ratings/reviews are explicitly
 * out of V1 per the 2026-09-07 decision) — both are intentionally omitted
 * rather than faked. "Quiz Taken" and "Completion Rate" are interpreted as
 * this learner's own numbers (verified-unit count / module completion %),
 * since the Figma mock shows them identical to "Your Course Status" and
 * this app has no cross-student analytics query — flagged as an
 * interpretation, not a confirmed spec. The Figma's play-button hero video
 * banner is replaced with a "Continue"/"Review" CTA into the next unit —
 * video is V2 (2026-07-06/07-16 decisions). Section grouping in the unit
 * list is Figma-drawn chrome only: there's no Section data in the schema
 * (2026-08-11 "final, no Section" decision), so units render as one
 * expandable group rather than fabricated section titles. */

type ModuleUnit = {
  id: string;
  title: string;
  description: string;
  order: number;
  durationMin: number;
  tokensRequired: number;
  status: StudentUnitStatus | null;
  locked: boolean;
};

export default function ModuleContentView({
  programId,
  moduleTitle,
  moduleDescription,
  moduleIndex,
  language,
  instructor,
  heroImage,
  stats,
  totalDurationMin,
  knowledgeCheckCount,
  assessment,
  units,
  nextUnitId,
}: {
  programId: string;
  moduleTitle: string;
  moduleDescription: string;
  moduleIndex: number;
  language: string;
  instructor: CreatorRef | null;
  heroImage: string;
  stats: ModuleStats;
  totalDurationMin: number;
  knowledgeCheckCount: number;
  assessment: { id: string; title: string } | null;
  units: ModuleUnit[];
  nextUnitId: string | null;
}) {
  const hours = Math.floor(totalDurationMin / 60);
  const mins = totalDurationMin % 60;
  const durationLabel = hours > 0 ? `${hours}h ${mins}mins` : `${mins}mins`;
  const isFullyComplete = stats.totalUnits > 0 && stats.completedUnits === stats.totalUnits;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-8 pb-16 pt-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Hero */}
        <Card className="relative col-span-full overflow-hidden rounded-3xl p-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          <div className="relative flex flex-col gap-4 p-8 text-white">
            <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide backdrop-blur">
              Module {moduleIndex + 1}: {moduleTitle}
            </span>
            <p className="max-w-xl text-lg font-medium text-white/90">{moduleDescription}</p>
            {nextUnitId && (
              <Link
                href={`/programs/${programId}/units/${nextUnitId}`}
                className="w-fit rounded-full bg-cha-orange px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-cha-orange-strong"
              >
                {isFullyComplete ? "Review Module" : "Continue Learning"}
              </Link>
            )}
          </div>
        </Card>

        {/* Main column */}
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Card className="items-center gap-2 p-5 text-center">
              <ProgressCircle aria-label="Your Course Status" value={stats.progressPct} size="lg">
                <ProgressCircle.Track>
                  <ProgressCircle.TrackCircle />
                  <ProgressCircle.FillCircle />
                </ProgressCircle.Track>
              </ProgressCircle>
              <div className="font-display text-xl font-extrabold">{stats.progressPct}%</div>
              <div className="text-xs text-cha-muted">Your Course Status</div>
            </Card>
            <Card className="items-center justify-center gap-1 p-5 text-center">
              <div className="font-display text-2xl font-extrabold">{stats.verifiedUnits}</div>
              <div className="text-xs text-cha-muted">Quiz Taken</div>
            </Card>
            <Card className="items-center justify-center gap-1 p-5 text-center">
              <div className="font-display text-2xl font-extrabold">{stats.progressPct}%</div>
              <div className="text-xs text-cha-muted">Completion Rate</div>
            </Card>
          </div>

          <Card className="flex-row flex-wrap items-center gap-6 p-5">
            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} className="text-cha-faint" />
              <span className="font-semibold">Self-Paced Course</span>
              <span className="text-cha-faint">· {durationLabel}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-cha-faint">
              <InfinityIcon size={16} />
              Lifetime access
            </div>
          </Card>

          {/* Unit list — display-only grouping, no fabricated Section
           * titles (see file header comment). */}
          <Card className="gap-3 p-5">
            <div className="flex items-center justify-between">
              <Card.Title className="text-base">
                {units.length} Units · {durationLabel} total length
              </Card.Title>
            </div>
            <Accordion defaultExpandedKeys={["units"]}>
              <Accordion.Item id="units">
                <Accordion.Heading>
                  <Accordion.Trigger>
                    Unit Content
                    <Accordion.Indicator>
                      <ChevronDown />
                    </Accordion.Indicator>
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                  <Accordion.Body>
                    <ul className="flex flex-col gap-1">
                      {units.map((unit) => (
                        <li key={unit.id}>
                          {unit.locked ? (
                            <div className="flex items-center gap-3 rounded-xl px-2 py-2.5 opacity-60">
                              <Lock size={15} className="shrink-0 text-cha-faint" />
                              <span className="flex-1 text-sm">
                                Unit {unit.order}: {unit.title}
                              </span>
                              <span className="text-xs text-cha-faint">{unit.durationMin}min</span>
                            </div>
                          ) : (
                            <Link
                              href={`/programs/${programId}/units/${unit.id}`}
                              className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-cha-surface-2"
                            >
                              <BookOpenCheck
                                size={15}
                                className={`shrink-0 ${
                                  unit.status === "completed" || unit.status === "verified"
                                    ? "text-cha-success"
                                    : "text-cha-faint"
                                }`}
                              />
                              <span className="flex-1 text-sm">
                                Unit {unit.order}: {unit.title}
                              </span>
                              <span className="text-xs text-cha-faint">{unit.durationMin}min</span>
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </Accordion.Body>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <Card className="gap-3 p-5">
            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} className="text-cha-faint" />
              Self-Paced
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ClipboardList size={16} className="text-cha-faint" />
              {knowledgeCheckCount} Knowledge Check{knowledgeCheckCount === 1 ? "" : "s"}
            </div>
            {instructor && (
              <div className="flex items-center gap-2">
                <Avatar.Root className="h-8 w-8">
                  {instructor.avatarUrl && <Avatar.Image src={instructor.avatarUrl} />}
                  <Avatar.Fallback className="text-xs">
                    {instructor.name.slice(0, 1)}
                  </Avatar.Fallback>
                </Avatar.Root>
                <span className="text-sm font-semibold">{instructor.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Globe size={16} className="text-cha-faint" />
              {language}
            </div>
            {assessment && (
              <Link
                href={`/programs/${programId}/assessments/${assessment.id}`}
                className="mt-2 flex items-center gap-2 rounded-xl bg-cha-surface-2 px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-cha-orange/10"
              >
                <ClipboardList size={16} className="text-cha-orange" />
                1 Module Assessment
              </Link>
            )}
          </Card>

          <Card className="gap-2 p-5">
            <Chip color={isFullyComplete ? "success" : "accent"} size="sm" variant="soft">
              <Chip.Label>
                {stats.completedUnits}/{stats.totalUnits} Units Completed
              </Chip.Label>
            </Chip>
          </Card>
        </div>
      </div>
    </div>
  );
}
