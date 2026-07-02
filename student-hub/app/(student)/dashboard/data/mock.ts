/* ------------------------------------------------------------------ *
 * Mock data for the redesigned dashboard.
 * TODO: replace every export with real LMS / API calls.
 * ------------------------------------------------------------------ */

export type LessonStatus = "not-started" | "in-progress" | "locked";

export type Lesson = {
  id: number;
  brand: string; // short monogram placeholder for a tool logo (Jenkins, Docker…)
  title: string;
  description: string;
  lessonLabel: string; // e.g. "Lesson 2"
  status: LessonStatus;
  statusLabel: string; // e.g. "Not Started"
  instructor: string;
  instructorRole: string;
  active?: boolean; // highlighted (blue) row
};

export type ResumeModule = {
  track: string; // "DevOps Track Lv1"
  progress: number; // 60
  progressLabel: string; // "In Progress"
  moduleNumber: number; // 1
  moduleTitle: string; // "DevOps Foundations"
  moduleDescription: string;
};

export type NewCourse = {
  title: string;
  members: number;
  instructor: string;
  tag: string; // "Beginner"
};

export type CalendarDayCell = {
  day: number;
  muted?: boolean; // out-of-month
  event?: boolean; // has a dot
  selected?: boolean; // orange fill (today/selected)
};

export type CalendarEvent = {
  title: string;
  time: string;
  live?: boolean;
};

export type ProgressItem = {
  label: string;
  value: number; // 0–100
};

/* -------------------------- Student -------------------------------- */

export const mockStudent = {
  name: "Chem Patrick",
  firstName: "Chem",
  level: "Student | Intermediate",
  track: "DevOps Engineer Track",
};

/* --------------------- Resume / New course ------------------------- */

export const mockResume: ResumeModule = {
  track: "DevOps Track Lv1",
  progress: 60,
  progressLabel: "In Progress",
  moduleNumber: 1,
  moduleTitle: "DevOps Foundations",
  moduleDescription:
    "Understand identity, access, and security fundamentals in the cloud.",
};

export const mockNewCourse: NewCourse = {
  title: "Kubernetes Foundations",
  members: 148,
  instructor: "Ndzenyuy Jones",
  tag: "Beginner",
};

/* ----------------------------- Lessons ----------------------------- */

const LESSON_DESC =
  "Master CI/CD pipelines and learn how to automate your deployment workflows.";

export const mockLessons: Lesson[] = [
  {
    id: 1,
    brand: "Jk",
    title: "Setting up Jenkins",
    description: LESSON_DESC,
    lessonLabel: "Lesson 2",
    status: "not-started",
    statusLabel: "Not Started",
    instructor: "Ndzenyuy Jones",
    instructorRole: "Course Instructor",
    active: true,
  },
  {
    id: 2,
    brand: "Dk",
    title: "Docker Fundamentals",
    description: LESSON_DESC,
    lessonLabel: "Lesson 3",
    status: "not-started",
    statusLabel: "Not Started",
    instructor: "Ndzenyuy Jones",
    instructorRole: "Course Instructor",
  },
  {
    id: 3,
    brand: "Dk",
    title: "Docker Fundamentals",
    description: LESSON_DESC,
    lessonLabel: "Lesson 4",
    status: "not-started",
    statusLabel: "Not Started",
    instructor: "Ndzenyuy Jones",
    instructorRole: "Course Instructor",
  },
];

/* --------------------------- Calendar ------------------------------ */

export const mockCalendar = {
  monthLabel: "June",
  year: 2026,
  time: "10 : 30 AM WAT",
  // Replicated exactly from the approved design (June 2026 grid).
  // [day, muted, event, selected]
  days: [
    { day: 29, muted: true }, { day: 30, muted: true }, { day: 31, muted: true },
    { day: 1 }, { day: 2 }, { day: 3 }, { day: 4 },
    { day: 5 }, { day: 6 }, { day: 7 }, { day: 8 }, { day: 9 }, { day: 10, event: true }, { day: 11 },
    { day: 12 }, { day: 13 }, { day: 14 }, { day: 15 }, { day: 16 }, { day: 17, event: true }, { day: 18 },
    { day: 19 }, { day: 20 }, { day: 21 }, { day: 22 }, { day: 23 }, { day: 24, selected: true }, { day: 25 },
    { day: 26 }, { day: 27 }, { day: 28 }, { day: 29 }, { day: 30 }, { day: 31, muted: true }, { day: 1, muted: true },
  ] as CalendarDayCell[],
  event: {
    title: "DevOps Class",
    time: "2:00 - 3:30 PM WAT",
    live: true,
  } as CalendarEvent,
};

/* -------------------------- Your progress -------------------------- */

export const mockProgress: ProgressItem[] = [
  { label: "Basics of Linux", value: 55 },
  { label: "Cloud Security", value: 30 },
  { label: "Terraform", value: 75 },
];
