import { getSession } from "@/lib/auth";
import { getStudent } from "@/lib/mock-api";
import { redirect } from "next/navigation";
import {
  mockStudent,
  mockAssessments,
  mockAlerts,
  mockCalendarEvents,
  mockKBArticles
} from "./data/mock";
import ProgressWidget from "./components/ProgressWidget";
import AssessmentCard from "./components/AssessmentCard";
import AlertsList from "./components/AlertsList";
import CalendarWidget from "./components/CalendarWidget";
import HelpDeskEntry from "./components/HelpDeskEntry";
import KnowledgeBaseWidget from "./components/KnowledgeBaseWidget";


export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/invite");

  const student = await getStudent(session.user.email);

  // TODO: replace mockStudent with real data from LMS API
  const displayName = student?.displayName
    ?? session.user.given_name
    ?? mockStudent.name;

  return (
    <div className="flex flex-col gap-6">

      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome back, {displayName} 👋
        </h1>
        <p className="text-sm text-gray-400 mt-1">{mockStudent.cohort}</p>
      </div>

      {/* Top row — progress + assessments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProgressWidget
          cohort={mockStudent.cohort}
          progress={mockStudent.programProgress}
          modulesCompleted={mockStudent.modulesCompleted}
          totalModules={mockStudent.totalModules}
        />
        <AssessmentCard
          last={mockAssessments.last}
          next={mockAssessments.next}
        />
      </div>

      {/* Learning platform CTA */}
      
        href="#"
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700
                   text-white text-sm font-medium rounded-md py-3 transition-colors"
      <a>
        {/* TODO: replace # with real learning platform URL + SSO */}
        Go to Learning Platform →
      </a>

      {/* Alerts */}
      <AlertsList alerts={mockAlerts} />

      {/* Bottom row — calendar + help desk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CalendarWidget events={mockCalendarEvents} />
        <HelpDeskEntry />
      </div>

    </div>
  );
}