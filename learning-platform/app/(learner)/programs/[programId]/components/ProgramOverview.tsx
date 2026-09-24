"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Card,
  Chip,
  Dropdown,
  ProgressBar,
} from "@heroui/react";
import { CalendarClock, Clock, Lock, MoreVertical } from "lucide-react";
import type { CreatorRef, StudentUnitStatus } from "@/types";
import GoalDateModal from "./GoalDateModal";

/* Course/Module view, rebuilt against the "Learning Platform (Program+Module
 * View)" Figma canvas (docs/CHA Platform_4.fig, decoded via decode_fig.py —
 * "Course View (Active State)"/"Course View (Rest State)" frames, same
 * layout, two progress-data states). The decoded frame shows two things the
 * old accordion build didn't have: (1) each module's units as rich cards
 * (thumbnail, instructor, progress bar, Start/Completed button) rather than
 * a plain row list, and (2) a compact per-module status strip ("0/8
 * Completed" / "Locked") for quick scanning across all modules. Both are
 * rebuilt here. The Figma also shows a horizontal per-module unit carousel
 * with prev/next arrows — not wired here (no reason to build unwired
 * interactive chrome); units render in a responsive card grid instead,
 * matching the grid pattern already established in the Catalogue rebuild.
 *
 * Every row still carries the real product mechanics the raw mocks don't
 * show at all (design evaluation "Cross-Cutting Gaps"): lock state with
 * current/required points, the dual Completed / Competent-Verified chips,
 * and the unit's goal deadline — preserved from the prior build, re-skinned
 * with HeroUI v3 instead of removed. */

export type OverviewUnit = {
  id: string;
  title: string;
  description: string;
  order: number;
  durationMin: number;
  tokensAward: number;
  tokensRequired: number;
  status: StudentUnitStatus | null;
  completedAt: string | null;
  verifiedAt: string | null;
  goalTargetDate: string | null;
  heroImage?: string;
  creators: CreatorRef[];
};

export type OverviewModule = {
  id: string;
  title: string;
  description: string;
  /** Prerequisite module/assessment not yet cleared (Phase 2 gating) — the
   * whole module is unenterable, not just individually locked units. */
  locked: boolean;
  units: OverviewUnit[];
};

const FALLBACK_THUMB = "/figma-assets/module-thumb-cloud-basics.jpg";

/** Discrete status → a progress-bar value. There's no continuous per-unit
 * progress tracked in the data model (only the four-state
 * in_progress/completed/retake/verified enum) — this is a deliberate
 * approximation to fill the Figma card's progress bar, not a hidden new
 * metric. */
function progressValueFor(status: StudentUnitStatus | null): number {
  switch (status) {
    case "verified":
    case "completed":
    case "retake":
      return 100;
    case "in_progress":
      return 50;
    default:
      return 0;
  }
}

export default function ProgramOverview({
  programId,
  modules,
  balance,
}: {
  programId: string;
  modules: OverviewModule[];
  balance: number;
}) {
  const router = useRouter();
  const [goalUnit, setGoalUnit] = useState<OverviewUnit | null>(null);

  return (
    <div className="mt-8 flex flex-col gap-10">
      {/* Compact per-module status strip — matches the Figma's small
       * "X/N Completed" / "Locked" cards, giving a quick-scan overview and a
       * jump link into that module's full Module Content View. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {modules.map((module) => {
          const completedUnits = module.units.filter(
            (u) => u.status === "completed" || u.status === "verified"
          ).length;
          return (
            <Card key={module.id} className="gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Chip
                    color={module.locked ? "default" : "accent"}
                    size="sm"
                    variant="soft"
                  >
                    <Chip.Label>
                      {module.locked
                        ? "Locked"
                        : `${completedUnits}/${module.units.length} Completed`}
                    </Chip.Label>
                  </Chip>
                  <Card.Title className="mt-2 truncate text-sm">
                    {module.title}
                  </Card.Title>
                </div>
                <Dropdown>
                  <Dropdown.Trigger
                    className="shrink-0 rounded-full p-1.5 text-cha-faint outline-none hover:bg-cha-surface-2"
                    aria-label={`More actions for ${module.title}`}
                  >
                    <MoreVertical size={16} />
                  </Dropdown.Trigger>
                  <Dropdown.Popover className="min-w-[180px]">
                    <Dropdown.Menu
                      onAction={(key) => {
                        if (key === "details") {
                          router.push(`/programs/${programId}/modules/${module.id}`);
                        }
                      }}
                    >
                      <Dropdown.Item id="details" textValue="View Module Details">
                        View Module Details
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Per-module unit card grids */}
      {modules.map((module, mi) => (
        <section key={module.id}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wide text-cha-orange">
                Module {mi + 1}
              </div>
              <h2 className="font-display text-xl font-extrabold">{module.title}</h2>
            </div>
            <Link
              href={`/programs/${programId}/modules/${module.id}`}
              className="shrink-0 rounded-full border border-cha-border px-4 py-1.5 text-xs font-bold text-cha-ink transition-colors hover:bg-cha-surface-2"
            >
              View Module Details
            </Link>
          </div>

          {module.locked ? (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-dashed border-cha-border px-5 py-6 text-sm font-semibold text-cha-warning">
              <Lock size={16} />
              Locked — pass the previous module&apos;s assessment to unlock.
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {module.units.map((unit) => (
                <UnitCard
                  key={unit.id}
                  programId={programId}
                  unit={unit}
                  balance={balance}
                  onSetGoal={() => setGoalUnit(unit)}
                />
              ))}
            </div>
          )}
        </section>
      ))}

      <GoalDateModal
        unit={goalUnit}
        onClose={() => setGoalUnit(null)}
        onSaved={() => {
          setGoalUnit(null);
          router.refresh();
        }}
      />
    </div>
  );
}

function UnitCard({
  programId,
  unit,
  balance,
  onSetGoal,
}: {
  programId: string;
  unit: OverviewUnit;
  balance: number;
  onSetGoal: () => void;
}) {
  const locked = unit.status === null && balance < unit.tokensRequired;
  const clickable = !locked;
  const instructor = unit.creators[0];

  const card = (
    <Card className="h-full gap-0 p-4">
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-cha-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={unit.heroImage || FALLBACK_THUMB}
          alt=""
          className={`h-full w-full object-cover ${locked ? "opacity-50 grayscale" : ""}`}
        />
        {locked && (
          <span className="absolute inset-0 grid place-items-center bg-black/30">
            <Lock size={22} className="text-white" />
          </span>
        )}
      </div>

      <Card.Content className="flex flex-1 flex-col gap-3 px-0 pb-0 pt-3">
        <div>
          <Card.Title className="text-base leading-tight">
            Unit {unit.order}: {unit.title}
          </Card.Title>
          <Card.Description className="mt-1 line-clamp-2 text-[13px] leading-snug">
            {unit.description}
          </Card.Description>
        </div>

        {instructor && (
          <div className="flex items-center gap-2">
            <Avatar.Root className="h-6 w-6">
              {instructor.avatarUrl && <Avatar.Image src={instructor.avatarUrl} />}
              <Avatar.Fallback className="text-[10px]">
                {instructor.name.slice(0, 1)}
              </Avatar.Fallback>
            </Avatar.Root>
            <div className="min-w-0 text-[11px] leading-tight">
              <div className="truncate font-semibold text-cha-ink">{instructor.name}</div>
              <div className="text-cha-faint">{instructor.role || "Course Instructor"}</div>
            </div>
          </div>
        )}

        <ProgressBar
          aria-label={`${unit.title} progress`}
          size="sm"
          color={locked ? "default" : "accent"}
          value={progressValueFor(unit.status)}
        >
          <ProgressBar.Track>
            <ProgressBar.Fill />
          </ProgressBar.Track>
        </ProgressBar>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-cha-faint">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {unit.durationMin} mins
          </span>
          {locked ? (
            <span className="flex items-center gap-1 font-semibold text-cha-warning">
              <Lock size={12} />
              Requires {unit.tokensRequired} tokens — you have {balance}
            </span>
          ) : (
            <span>Earns {unit.tokensAward} tokens</span>
          )}
        </div>

        {unit.goalTargetDate && (
          <span className="flex items-center gap-1 text-xs font-semibold text-cha-blue">
            <CalendarClock size={12} />
            Goal: {unit.goalTargetDate}
          </span>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <StatusChips status={unit.status} locked={locked} />
          {!locked && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSetGoal();
              }}
              className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold text-cha-blue transition-colors hover:bg-cha-blue/10"
            >
              {unit.goalTargetDate ? "Edit deadline" : "Set deadline"}
            </button>
          )}
        </div>

        <div className="mt-1">
          <StartButton status={unit.status} locked={locked} />
        </div>
      </Card.Content>
    </Card>
  );

  return clickable ? (
    <Link
      href={`/programs/${programId}/units/${unit.id}`}
      className="block h-full focus-visible:outline-2 focus-visible:outline-cha-orange"
    >
      {card}
    </Link>
  ) : (
    <div className="h-full opacity-90">{card}</div>
  );
}

function StartButton({
  status,
  locked,
}: {
  status: StudentUnitStatus | null;
  locked: boolean;
}) {
  if (locked) return null;
  const label =
    status === "verified" || status === "completed"
      ? "Review"
      : status === "retake"
        ? "Retake"
        : status === "in_progress"
          ? "Resume"
          : "Start";
  return (
    <span className="inline-flex w-full items-center justify-center rounded-full bg-cha-orange px-4 py-2 text-xs font-bold text-white">
      {label}
    </span>
  );
}

function StatusChips({
  status,
  locked,
}: {
  status: StudentUnitStatus | null;
  locked: boolean;
}) {
  if (locked)
    return (
      <Chip color="default" size="sm" variant="soft">
        <Chip.Label>Locked</Chip.Label>
      </Chip>
    );

  switch (status) {
    case "verified":
      return (
        <div className="flex flex-wrap gap-1.5">
          <Chip color="accent" size="sm" variant="soft">
            <Chip.Label>Completed</Chip.Label>
          </Chip>
          <Chip color="success" size="sm" variant="soft">
            <Chip.Label>Competent / Verified</Chip.Label>
          </Chip>
        </div>
      );
    case "completed":
      return (
        <div className="flex flex-wrap gap-1.5">
          <Chip color="accent" size="sm" variant="soft">
            <Chip.Label>Completed</Chip.Label>
          </Chip>
          <Chip color="default" size="sm" variant="soft">
            <Chip.Label>Verification pending</Chip.Label>
          </Chip>
        </div>
      );
    case "retake":
      return (
        <div className="flex flex-wrap gap-1.5">
          <Chip color="accent" size="sm" variant="soft">
            <Chip.Label>Completed</Chip.Label>
          </Chip>
          <Chip color="warning" size="sm" variant="soft">
            <Chip.Label>Retake</Chip.Label>
          </Chip>
        </div>
      );
    case "in_progress":
      return (
        <Chip color="warning" size="sm" variant="soft">
          <Chip.Label>In progress</Chip.Label>
        </Chip>
      );
    default:
      return (
        <Chip color="default" size="sm" variant="soft">
          <Chip.Label>Not started</Chip.Label>
        </Chip>
      );
  }
}
