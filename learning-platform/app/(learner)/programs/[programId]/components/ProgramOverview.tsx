"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock,
  Lock,
  RotateCcw,
} from "lucide-react";
import type { StudentUnitStatus } from "@/types";
import GoalDateModal from "./GoalDateModal";

/* Course/program overview: module accordions of unit rows. Every row
 * surfaces the product mechanics the mockups lacked (design evaluation
 * "Cross-Cutting Gaps"): lock state with current/required points, the dual
 * Completed / Competent-Verified chips, and the unit's goal deadline. */

export type OverviewUnit = {
  id: string;
  title: string;
  description: string;
  order: number;
  durationMin: number;
  itemCount: number;
  pointsAward: number;
  pointsRequired: number;
  status: StudentUnitStatus | null;
  completedAt: string | null;
  verifiedAt: string | null;
  goalTargetDate: string | null;
};

export type OverviewModule = {
  id: string;
  title: string;
  description: string;
  units: OverviewUnit[];
};

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
  const [openModules, setOpenModules] = useState<Set<string>>(
    () => new Set(modules.slice(0, 1).map((m) => m.id))
  );
  const [goalUnit, setGoalUnit] = useState<OverviewUnit | null>(null);

  function toggleModule(id: string) {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="mt-8 flex flex-col gap-4">
      {modules.map((module, mi) => {
        const open = openModules.has(module.id);
        return (
          <section key={module.id} className="cha-card overflow-hidden">
            <button
              onClick={() => toggleModule(module.id)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-cha-surface-2"
            >
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wide text-cha-orange">
                  Module {mi + 1}
                </div>
                <h2 className="font-display text-xl font-extrabold">{module.title}</h2>
                <p className="mt-0.5 truncate text-sm text-cha-muted">
                  {module.description}
                </p>
              </div>
              <ChevronDown
                size={20}
                className={`shrink-0 text-cha-muted transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>

            {open && (
              <ul className="border-t border-cha-border">
                {module.units.map((unit) => (
                  <UnitRow
                    key={unit.id}
                    programId={programId}
                    unit={unit}
                    balance={balance}
                    onSetGoal={() => setGoalUnit(unit)}
                  />
                ))}
              </ul>
            )}
          </section>
        );
      })}

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

function UnitRow({
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
  const locked = unit.status === null && balance < unit.pointsRequired;
  const clickable = !locked;

  const inner = (
    <div
      className={`flex items-center gap-4 px-6 py-4 ${
        locked ? "opacity-60" : "transition-colors hover:bg-cha-surface-2"
      }`}
    >
      {/* Status icon */}
      <StatusIcon status={unit.status} locked={locked} />

      {/* Title + meta */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">
            Unit {unit.order}: {unit.title}
          </span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-cha-faint">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {unit.durationMin} mins · {unit.itemCount} items
          </span>
          {locked ? (
            <span className="flex items-center gap-1 font-semibold text-cha-warning">
              <Lock size={12} />
              Requires {unit.pointsRequired} points — you have {balance}
            </span>
          ) : (
            <span>Earns {unit.pointsAward} points</span>
          )}
          {unit.goalTargetDate && (
            <span className="flex items-center gap-1 font-semibold text-cha-blue">
              <CalendarClock size={12} />
              Goal: {unit.goalTargetDate}
            </span>
          )}
        </div>
      </div>

      {/* Goal deadline action */}
      {!locked && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSetGoal();
          }}
          className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-cha-blue transition-colors hover:bg-cha-blue/10"
        >
          {unit.goalTargetDate ? "Edit deadline" : "Set deadline"}
        </button>
      )}

      {/* Dual status chips */}
      <div className="flex shrink-0 items-center gap-1.5">
        <StatusChips status={unit.status} locked={locked} />
      </div>
    </div>
  );

  return (
    <li className="border-b border-cha-border last:border-b-0">
      {clickable ? (
        <Link href={`/programs/${programId}/units/${unit.id}`} className="block">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </li>
  );
}

function StatusIcon({
  status,
  locked,
}: {
  status: StudentUnitStatus | null;
  locked: boolean;
}) {
  if (locked)
    return (
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cha-surface-2 text-cha-faint">
        <Lock size={16} />
      </span>
    );
  switch (status) {
    case "verified":
      return (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cha-success/15 text-cha-success">
          <BadgeCheck size={18} />
        </span>
      );
    case "completed":
      return (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cha-ocean/15 text-cha-ocean">
          <CheckCircle2 size={18} />
        </span>
      );
    case "retake":
      return (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cha-warning/15 text-cha-warning">
          <RotateCcw size={18} />
        </span>
      );
    default:
      return (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-cha-border text-cha-faint" />
      );
  }
}

/** The dual-state model made visible: content completion and competence
 * verification are separate chips, so "Completed" + "Verification pending"
 * can coexist (requirements §6). */
function StatusChips({
  status,
  locked,
}: {
  status: StudentUnitStatus | null;
  locked: boolean;
}) {
  if (locked)
    return <Chip className="bg-cha-surface-2 text-cha-faint">Locked</Chip>;

  switch (status) {
    case "verified":
      return (
        <>
          <Chip className="bg-cha-ocean/15 text-cha-ocean">Completed</Chip>
          <Chip className="bg-cha-success/15 text-cha-success">
            Competent / Verified
          </Chip>
        </>
      );
    case "completed":
      return (
        <>
          <Chip className="bg-cha-ocean/15 text-cha-ocean">Completed</Chip>
          <Chip className="bg-cha-surface-2 text-cha-muted">
            Verification pending
          </Chip>
        </>
      );
    case "retake":
      return (
        <>
          <Chip className="bg-cha-ocean/15 text-cha-ocean">Completed</Chip>
          <Chip className="bg-cha-warning/15 text-cha-warning">Retake</Chip>
        </>
      );
    case "in_progress":
      return (
        <Chip className="bg-cha-orange-soft text-cha-orange dark:bg-cha-orange/15">
          In progress
        </Chip>
      );
    default:
      return <Chip className="bg-cha-surface-2 text-cha-muted">Not started</Chip>;
  }
}

function Chip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
