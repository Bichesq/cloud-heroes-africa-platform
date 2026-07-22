"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  BookOpenText,
  Calendar,
  Home,
  ListFilter,
  Play,
  Search,
  User,
} from "lucide-react";

/* Program Catalogue (mockup "Catalog View"): heading + secondary pill nav,
 * filter/search row, and a responsive grid of program cards with
 * Enrolled/Locked chips and a persistent Start/Resume CTA overlay on the
 * enrolled card. Locked programs
 * (not enrolled) are not clickable — enrollment is admin/points-governed,
 * and surfacing un-startable content is exactly what the dashboard scope
 * decision (2026-07-02) avoids. */

const STUDENT_HUB_URL =
  process.env.NEXT_PUBLIC_STUDENT_HUB_URL ?? "http://localhost:3000";

export type CatalogProgram = {
  id: string;
  title: string;
  blurb: string;
  heroImage: string;
  language: string;
  delivery: string;
  enrolled: boolean;
  started: boolean;
};

const PILL_NAV = [
  { label: "My Dashboard", icon: Home, href: `${STUDENT_HUB_URL}/dashboard`, external: true },
  { label: "Catalogue", icon: BookOpen, href: "/catalog", active: true },
  { label: "My Program", icon: BookOpenText, href: "/courses" },
  { label: "My Profile", icon: User, href: `${STUDENT_HUB_URL}/profile`, external: true },
  { label: "Calendar", icon: Calendar, href: `${STUDENT_HUB_URL}/dashboard`, external: true },
];

export default function CatalogClient({ programs }: { programs: CatalogProgram[] }) {
  const [query, setQuery] = useState("");

  const visible = programs.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.blurb.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="mx-auto w-full max-w-[1400px] px-8 pb-16 pt-8">
      {/* Secondary pill nav (mockup: centered above the grid, right of title) */}
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl font-extrabold sm:text-5xl">
            Program Catalogue
          </h1>
          <p className="mt-2 text-lg text-cha-muted">
            Enroll or click into any available programs below to start learning
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-2 pt-2">
          {PILL_NAV.map(({ label, icon: Icon, href, active, external }) =>
            external ? (
              <a
                key={label}
                href={href}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-cha-ink transition-colors hover:bg-cha-surface-2"
              >
                <Icon size={16} />
                {label}
              </a>
            ) : (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-cha-orange text-white"
                    : "text-cha-ink hover:bg-cha-surface-2"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          )}
        </nav>
      </div>

      {/* Filters + search */}
      <div className="mt-8 flex items-center justify-end gap-4">
        <button className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-cha-muted hover:text-cha-ink">
          <ListFilter size={15} />
          Filters
        </button>
        <div className="flex w-[280px] items-center gap-2 rounded-full border border-cha-border bg-cha-surface px-3 py-2">
          <Search size={16} className="shrink-0 text-cha-faint" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            aria-label="Search programs"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-cha-faint"
          />
        </div>
      </div>

      {/* Program cards */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((p) => (
          <ProgramCard key={p.id} program={p} />
        ))}
        {visible.length === 0 && (
          <p className="col-span-full py-16 text-center text-cha-muted">
            No programs match “{query}”.
          </p>
        )}
      </div>
    </div>
  );
}

function ProgramCard({ program }: { program: CatalogProgram }) {
  const card = (
    <article className="flex h-full flex-col rounded-2xl bg-cha-surface shadow-[0_4px_18px_rgba(0,0,0,0.09)] dark:shadow-[0_4px_18px_rgba(0,0,0,0.5)]">
      {/* Image + hover overlay, inset from the card edges with its own rounding */}
      <div className="px-5 pt-5">
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-cha-surface-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={program.heroImage}
            alt=""
            className="h-full w-full object-cover"
          />
          {program.enrolled && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45">
              <span className="flex items-center gap-2 font-display text-lg font-bold text-white">
                <Play size={20} fill="currentColor" />
                {program.started ? "Resume Program" : "Start Program"}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-4 pt-4">
        <h2 className="font-display text-xl font-extrabold leading-tight">
          {program.title}
        </h2>
        <p className="mt-1.5 line-clamp-3 text-[13px] leading-snug text-cha-muted">
          {program.blurb}
        </p>

        <div className="mt-3">
          {program.enrolled ? (
            <span className="font-display text-lg font-bold text-cha-ink">
              Enrolled
            </span>
          ) : (
            <span className="inline-block rounded-full bg-cha-faint/80 px-4 py-1.5 text-sm font-semibold text-white">
              Locked
            </span>
          )}
        </div>

        <div className="mt-2 border-b border-cha-border pb-2 text-xs font-semibold uppercase text-cha-muted">
          {program.language}
        </div>
        <div className="flex items-center gap-1.5 pt-2 text-[11px] font-medium text-cha-muted">
          <BookOpenText size={13} />
          {program.delivery === "self-paced" ? "Self-Paced Learning" : program.delivery}
        </div>
      </div>
    </article>
  );

  return program.enrolled ? (
    <Link
      href={`/programs/${program.id}`}
      className="block h-full focus-visible:outline-2 focus-visible:outline-cha-orange"
    >
      {card}
    </Link>
  ) : (
    <div className="h-full opacity-90">{card}</div>
  );
}
