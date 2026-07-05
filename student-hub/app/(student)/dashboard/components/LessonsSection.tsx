"use client";

import { useState } from "react";
import LessonRow from "./LessonRow";
import type { Lesson } from "../data/mock";

const TABS = [
  { id: "upcoming", label: "Upcoming Lessons" },
  { id: "assignments", label: "Assignments" },
  { id: "achievements", label: "Achievements" },
  { id: "live", label: "Live Sessions" },
];

export default function LessonsSection({ lessons }: { lessons: Lesson[] }) {
  const [tab, setTab] = useState("upcoming");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-7 border-b border-cha-separator">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-[15px] transition-colors ${
                active
                  ? "border-cha-orange font-bold text-cha-ink"
                  : "border-transparent font-medium text-cha-muted hover:text-cha-ink"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3.5">
        {lessons.map((lesson) => (
          <LessonRow key={lesson.id} lesson={lesson} />
        ))}
      </div>
    </div>
  );
}
