import { getSession } from "@/lib/auth";
import { getStudent } from "@/lib/mock-api";
import { redirect } from "next/navigation";
import {
  mockStudent,
  mockResume,
  mockNewCourse,
  mockLessons,
  mockCalendar,
  mockProgress,
} from "./data/mock";
import LearningPath from "./components/LearningPath";
import LessonsSection from "./components/LessonsSection";
import ProgressWidget from "./components/ProgressWidget";
import CalendarWidget from "./components/CalendarWidget";
import ProfileGate from "./components/ProfileGate";

/**
 * Redesigned student dashboard page.
 * Displays greeting, learning path, progress track, lessons section, and calendar.
 */
export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const student = await getStudent(session.user.email);

  // Soft profile gate — the dashboard is reachable even with an incomplete
  // profile, but ProfileGate nudges the user to finish it (one-time popup +
  // a persistent banner). Enforcement lives client-side so "Continue to
  // dashboard" can dismiss the popup for the rest of the session.
  const profileComplete = !!student?.profileCompletedAt;

  const displayName = student?.displayName
    ?? session.user.given_name
    ?? mockStudent.name;

  const trackName = student?.track ?? mockStudent.track;

  return (
    <div className="flex flex-col gap-8">
      <ProfileGate complete={profileComplete} />

      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
      {/* Main Content Column */}
      <div className="flex min-w-0 flex-col gap-8">
        {/* Welcome Header */}
        <div>
          <h1 className="whitespace-nowrap font-display text-[40px] font-extrabold leading-[1.1]">
            Welcome back, {displayName} 👋
          </h1>
          <div className="mt-2 text-[19px] font-semibold text-cha-muted">
            {trackName}
          </div>
        </div>

        {/* Self Paced / Courses & New Course */}
        <LearningPath resume={mockResume} course={mockNewCourse} />

        {/* Lessons Section */}
        <LessonsSection lessons={mockLessons} />
      </div>

      {/* Right Column / Rail */}
      <div className="flex flex-col gap-8">
        {/* Progress Widget */}
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-[22px] font-bold">Your Progress</h2>
          <div className="cha-card p-6">
            <ProgressWidget items={mockProgress} />
          </div>
        </div>

        {/* Calendar Widget */}
        <CalendarWidget calendar={mockCalendar} />
      </div>
      </div>
    </div>
  );
}