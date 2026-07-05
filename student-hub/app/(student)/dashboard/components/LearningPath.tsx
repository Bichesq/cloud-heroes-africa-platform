"use client";

import { useState } from "react";
import ResumeCard from "./ResumeCard";
import NewCourseCard from "./NewCourseCard";
import type { ResumeModule, NewCourse } from "../data/mock";

const TABS = [
  { id: "self", label: "Self Paced Learning" },
  { id: "courses", label: "Your Courses" },
];

export default function LearningPath({
  resume,
  course,
}: {
  resume: ResumeModule;
  course: NewCourse;
}) {
  const [tab, setTab] = useState("self");

  return (
    <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1.5fr)_minmax(240px,1fr)]">
      {/* Left — tabs + resume card */}
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex gap-6 border-b border-cha-separator">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`-mb-px border-b-2 pb-3 text-[15px] transition-colors ${
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
        <ResumeCard resume={resume} />
      </div>

      {/* Right — new course */}
      <div className="flex min-w-0 flex-col gap-3.5">
        <h2 className="font-display text-[22px] font-bold">New Course</h2>
        <NewCourseCard course={course} />
      </div>
    </div>
  );
}
