"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppWindow, CheckCircle, ChartGantt, PencilLine, Settings, type LucideIcon } from "lucide-react";

/* Figma "Create Course View (For Admins)" → Programs frame, Sidebar node:
 * 284px canvas-coloured column, "AUTHORING" section label, 244×43 nav items
 * (6px radius, 16px icon, 14px label); the active item is filled orange with
 * a white bold label. Icons follow the frame's glyph names (app-window,
 * chart-gantt, edit-3, check-circle, settings) via their lucide equivalents.
 *
 * Custom composition: this is route navigation, not a selection control, so
 * plain links (same choice as the learner app's unit rail).
 *
 * The program-scoped screens link to the program in the URL
 * (/programs/[programId]/…); with no program selected they render disabled.
 * Unit Editor is live while a unit is open (/programs/[id]/units/[unitId]);
 * units are opened from Course Structure. Knowledge Check opens the current
 * unit's KC, or the program's first unit's.
 * Links are navigation only — each page checks the author's role itself. */

type NavItem = { label: string; icon: LucideIcon; segment?: string };

const NAV: NavItem[] = [
  { label: "Programs", icon: AppWindow },
  { label: "Program Setup", icon: AppWindow, segment: "setup" },
  { label: "Course Structure", icon: ChartGantt, segment: "structure" },
  { label: "Unit Editor", icon: PencilLine, segment: "units" },
  { label: "Knowledge Check", icon: CheckCircle, segment: "knowledge-check" },
  { label: "Settings & Access", icon: Settings, segment: "settings" },
];

/** "/programs/cloud-practitioner/setup" → "cloud-practitioner". */
function programIdFrom(pathname: string): string | null {
  const m = /^\/programs\/([^/]+)\//.exec(pathname);
  return m && m[1] !== "new" ? m[1] : null;
}

/** "/programs/p/units/u-1" or "/programs/p/knowledge-check/u-1" → "u-1". */
function unitIdFrom(pathname: string): string | null {
  return /^\/programs\/[^/]+\/(?:units|knowledge-check)\/([^/]+)/.exec(pathname)?.[1] ?? null;
}

export default function AuthoringSidebar() {
  const pathname = usePathname();
  const programId = programIdFrom(pathname);
  const unitId = unitIdFrom(pathname);

  return (
    <nav aria-label="Authoring" className="w-[284px] shrink-0 bg-cha-canvas px-5 pt-7">
      <p className="text-[11px] font-bold tracking-wide text-cha-faint">AUTHORING</p>
      <ul className="mt-2 flex flex-col gap-2">
        {NAV.map(({ label, icon: Icon, segment }) => {
          const href =
            label === "Programs"
              ? "/"
              : segment === "units"
                ? programId && unitId
                  ? `/programs/${programId}/units/${unitId}`
                  : undefined
                : segment === "knowledge-check" && programId
                  ? `/programs/${programId}/knowledge-check${unitId ? `/${unitId}` : ""}`
                  : segment && programId
                    ? `/programs/${programId}/${segment}`
                    : undefined;
          const active =
            label === "Programs"
              ? pathname === "/" || pathname === "/programs/new"
              : segment === "knowledge-check"
                ? pathname.startsWith(`/programs/${programId}/knowledge-check`)
                : href !== undefined && pathname === href;
          const base =
            "flex h-[43px] items-center gap-3 rounded-md px-3.5 text-sm outline-none transition-colors focus-visible:ring-4 focus-visible:ring-cha-blue/15";
          return (
            <li key={label}>
              {href ? (
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`${base} ${
                    active
                      ? "bg-cha-orange font-bold text-white"
                      : "font-medium text-cha-ink hover:bg-cha-surface"
                  }`}
                >
                  <Icon size={16} aria-hidden />
                  {label}
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  title={
                    segment === "units" && programId
                      ? "Open a unit from Course Structure"
                      : programId || !segment
                        ? "Coming in a later step"
                        : "Choose a program first"
                  }
                  className={`${base} cursor-not-allowed font-medium text-cha-ink opacity-55`}
                >
                  <Icon size={16} aria-hidden />
                  {label}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
