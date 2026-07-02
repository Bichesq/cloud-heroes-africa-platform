import { Circle, Settings } from "lucide-react";
import type { Lesson } from "../data/mock";

/**
 * A single lesson row. The active lesson is a filled blue card with
 * white text; the rest are light "sunken" grey cards.
 */
export default function LessonRow({ lesson }: { lesson: Lesson }) {
  const active = !!lesson.active;

  const shell = active
    ? "bg-cha-blue text-white"
    : "border border-zinc-200 bg-zinc-50 text-cha-ink";
  const sub = active ? "text-white/80" : "text-zinc-500";
  const tile = active ? "bg-white/20 text-white" : "bg-white text-zinc-700";
  const circle = active ? "border-white/70" : "border-zinc-300";
  const gear = active ? "text-white/85" : "text-zinc-400";

  return (
    <div
      className={`grid items-center gap-4 rounded-[20px] p-4 ${shell}`}
      style={{ gridTemplateColumns: "2.3fr 1fr 0.8fr 1.7fr" }}
    >
      {/* Course */}
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl font-display text-[15px] font-bold ${tile}`}
        >
          {lesson.brand}
        </div>
        <div className="min-w-0">
          <div className="text-[15px] font-bold">{lesson.title}</div>
          <p className={`mt-0.5 text-xs leading-snug ${sub}`}>
            {lesson.description}
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2.5">
        <Circle size={18} className={`shrink-0 ${circle}`} strokeWidth={2} />
        <span className="text-[13px] font-bold">{lesson.statusLabel}</span>
      </div>

      {/* Lesson label */}
      <div className={`text-[13px] ${sub}`}>{lesson.lessonLabel}</div>

      {/* Instructor */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
              active ? "bg-white/20 text-white" : "bg-zinc-200 text-zinc-600"
            }`}
          >
            {lesson.instructor
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div className="min-w-0">
            <div className="whitespace-nowrap text-[13px] font-bold">
              {lesson.instructor}
            </div>
            <div className={`text-[11px] ${sub}`}>{lesson.instructorRole}</div>
          </div>
        </div>
        <Settings size={16} className={`shrink-0 ${gear}`} />
      </div>
    </div>
  );
}
