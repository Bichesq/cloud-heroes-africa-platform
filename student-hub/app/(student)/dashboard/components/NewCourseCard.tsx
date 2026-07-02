import { LifeBuoy } from "lucide-react";
import type { NewCourse } from "../data/mock";

/**
 * Ocean "New Course" feature card. The LifeBuoy glyph is a placeholder
 * for the Kubernetes helm logo (swap in the official SVG when available).
 */
export default function NewCourseCard({ course }: { course: NewCourse }) {
  return (
    <div className="relative flex min-h-[196px] flex-col overflow-hidden rounded-[22px] bg-cha-ocean p-[22px] text-white shadow-[0_8px_24px_rgba(50,167,212,0.2)]">
      {/* Watermark */}
      <LifeBuoy
        size={168}
        strokeWidth={1.2}
        className="pointer-events-none absolute -right-8 top-3.5 opacity-[0.16]"
      />

      {/* Mark */}
      <div className="grid h-[62px] w-[62px] place-items-center rounded-2xl bg-white/15">
        <LifeBuoy size={38} strokeWidth={1.8} />
      </div>

      <div className="relative mt-auto">
        <div className="font-display text-[22px] font-bold leading-tight">
          {course.title}
        </div>
        <div className="mt-3 text-sm opacity-90">{course.members} members</div>
        <div className="mt-1.5 text-sm">
          Instructor - <span className="font-bold">{course.instructor}</span>
        </div>
      </div>
    </div>
  );
}
