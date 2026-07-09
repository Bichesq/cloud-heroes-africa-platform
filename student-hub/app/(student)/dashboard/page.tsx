import { Suspense } from "react";
import { Skeleton } from "@heroui/react";
import { getSession } from "@/lib/auth";
import { getStudent } from "@/lib/mock-api";
import { DEFAULT_PROGRAM_ID } from "@/lib/curriculum";
import { timezoneOffsetHours, DEFAULT_TIMEZONE } from "@/lib/profile-options";
import { redirect } from "next/navigation";
import ResumeCardData from "./components/ResumeCardData";
import RecentProgramCardData from "./components/RecentProgramCardData";
import ProgressCardData from "./components/ProgressCardData";
import TodoListData from "./components/TodoListData";
import StreakCardData from "./components/StreakCardData";
import CalendarCardData from "./components/CalendarCardData";
import WidgetBoundary from "./components/WidgetBoundary";
import ProfileGate from "./components/ProfileGate";

/**
 * Student dashboard — matches the approved design (Dashboard View Primary
 * 2.png): resume banner, then a left 2-column grid (Recent Enrolled
 * Program + To Do List | Your Progress + Activity Streak), with the
 * Calendar alone in the right rail.
 *
 * Each widget is its own async Server Component, wrapped in Suspense +
 * WidgetBoundary, so a failed/slow data fetch for one widget shows its own
 * skeleton/retry state without blocking the rest of the page.
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

  const displayName = student?.displayName || session.user.given_name || "Student";
  const trackName = student?.track || "CHA Student";

  const studentId = student?.id;
  const activeProgramId = student?.activeProgramId ?? DEFAULT_PROGRAM_ID;
  const offsetHours = timezoneOffsetHours(student?.timezone || DEFAULT_TIMEZONE);
  const now = new Date().toISOString();

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

          <WidgetBoundary>
            <Suspense fallback={<Skeleton className="h-[196px] w-full rounded-3xl" />}>
              <ResumeCardData studentId={studentId} activeProgramId={activeProgramId} />
            </Suspense>
          </WidgetBoundary>

          {/* Left 2-column grid: Recent Enrolled Program + To Do List | Your Progress + Activity Streak */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-6">
              <WidgetBoundary>
                <Suspense fallback={<Skeleton className="h-[104px] w-full rounded-3xl" />}>
                  <RecentProgramCardData studentId={studentId} activeProgramId={activeProgramId} />
                </Suspense>
              </WidgetBoundary>
              <WidgetBoundary>
                <Suspense fallback={<Skeleton className="h-[220px] w-full rounded-3xl" />}>
                  <TodoListData studentId={studentId} now={now} />
                </Suspense>
              </WidgetBoundary>
            </div>
            <div className="flex flex-col gap-6">
              <WidgetBoundary>
                <Suspense fallback={<Skeleton className="h-[180px] w-full rounded-3xl" />}>
                  <ProgressCardData studentId={studentId} activeProgramId={activeProgramId} />
                </Suspense>
              </WidgetBoundary>
              <WidgetBoundary>
                <Suspense fallback={<Skeleton className="h-[140px] w-full rounded-3xl" />}>
                  <StreakCardData studentId={studentId} offsetHours={offsetHours} now={now} />
                </Suspense>
              </WidgetBoundary>
            </div>
          </div>
        </div>

        {/* Right Rail */}
        <div className="flex flex-col gap-8">
          <WidgetBoundary>
            <Suspense fallback={<Skeleton className="h-[520px] w-full rounded-3xl" />}>
              <CalendarCardData offsetHours={offsetHours} now={now} />
            </Suspense>
          </WidgetBoundary>
        </div>
      </div>
    </div>
  );
}
