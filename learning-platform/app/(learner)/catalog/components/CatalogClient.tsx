"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpenText, ListFilter } from "lucide-react";
import { Card, Chip, SearchField } from "@heroui/react";

/* Program Catalogue, rebuilt against the "Learning Platform (Program
 * Catalogue View)" Figma frame (docs/CHA Platform_4.fig, decoded via
 * decode_fig.py — 4 state variants: Enroll, Enrolled, Enrolled/Resume,
 * Completed). The global nav row and the Explore Programs/My Program
 * switcher live in the shared TopBar now (present on every learner screen
 * per requirements §1), not duplicated here. Card layout matches the
 * decoded frame: image, title, 2-line description, then an always-visible
 * status row (chip + optional CTA text) rather than a hover-only overlay —
 * the Figma card shows that row inline in every state variant. */

export type CatalogProgram = {
  id: string;
  title: string;
  blurb: string;
  heroImage: string;
  language: string;
  delivery: string;
  enrolled: boolean;
  started: boolean;
  completed: boolean;
};

export default function CatalogClient({ programs }: { programs: CatalogProgram[] }) {
  const [query, setQuery] = useState("");

  const visible = programs.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.blurb.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="mx-auto w-full max-w-[1400px] px-8 pb-16 pt-8">
      <div>
        <h1 className="font-display text-4xl font-extrabold sm:text-5xl">
          Program Catalogue
        </h1>
        <p className="mt-2 text-lg text-cha-muted">
          Enroll or Click into any available programs below to start learning
        </p>
      </div>

      {/* Filters + search — matches the Figma row's ordering (search field,
       * prev/next paging arrows, FILTERS dropdown label) right-aligned under
       * the title. Paging arrows and Filters aren't wired to anything yet:
       * the catalogue has no filter taxonomy in the data model today, so
       * this stays a visual placeholder rather than a fabricated filter. */}
      <div className="mt-8 flex items-center justify-end gap-4">
        <SearchField aria-label="Search programs" className="w-[280px]" variant="secondary">
          <SearchField.Group className="rounded-full bg-cha-surface">
            <SearchField.SearchIcon className="text-cha-faint" />
            <SearchField.Input
              className="text-sm"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <button className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-cha-muted hover:text-cha-ink">
          <ListFilter size={15} />
          Filters
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((p) => (
          <ProgramCard key={p.id} program={p} />
        ))}
        {visible.length === 0 && (
          <p className="col-span-full py-16 text-center text-cha-muted">
            No programs match &ldquo;{query}&rdquo;.
          </p>
        )}
      </div>
    </div>
  );
}

function StatusRow({ program }: { program: CatalogProgram }) {
  if (!program.enrolled) {
    return (
      <Chip color="default" size="lg" variant="soft">
        <Chip.Label>Locked</Chip.Label>
      </Chip>
    );
  }

  if (program.completed) {
    return (
      <div className="flex items-center gap-2">
        <Chip color="success" size="lg" variant="soft">
          <Chip.Label>Completed 100%</Chip.Label>
        </Chip>
        <span className="font-display text-sm font-bold text-cha-orange">Resume Program</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Chip color="accent" size="lg" variant="soft">
        <Chip.Label>Enrolled</Chip.Label>
      </Chip>
      <span className="font-display text-sm font-bold text-cha-orange">
        {program.started ? "Resume Program" : "Start Program"}
      </span>
    </div>
  );
}

function ProgramCard({ program }: { program: CatalogProgram }) {
  const card = (
    <Card className="h-full gap-0 p-5">
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-cha-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={program.heroImage} alt="" className="h-full w-full object-cover" />
      </div>

      <Card.Content className="flex flex-1 flex-col px-0 pb-0 pt-4">
        <Card.Title className="font-display text-xl font-extrabold leading-tight">
          {program.title}
        </Card.Title>
        <Card.Description className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-cha-muted">
          {program.blurb}
        </Card.Description>

        <div className="mt-3">
          <StatusRow program={program} />
        </div>

        <div className="mt-3 border-b border-cha-border pb-2 text-xs font-semibold uppercase text-cha-muted">
          {program.language}
        </div>
        <div className="flex items-center gap-1.5 pt-2 text-[11px] font-medium text-cha-muted">
          <BookOpenText size={13} />
          {program.delivery === "self-paced" ? "Self-Paced Learning" : program.delivery}
        </div>
      </Card.Content>
    </Card>
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
