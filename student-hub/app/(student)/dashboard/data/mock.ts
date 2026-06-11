import type { Alert, CalendarEvent } from "@/types";

export const mockStudent = {
  name: "Amara Osei",
  cohort: "Cohort 3 — 2025",
  programProgress: 42,
  modulesCompleted: 5,
  totalModules: 12,
};

export const mockAssessments = {
  last: {
    title: "Cloud Fundamentals Quiz",
    score: 78,
    maxScore: 100,
    date: "2025-05-30",
    status: "passed" as const,
  },
  next: {
    title: "AWS S3 & IAM Lab",
    due: "2025-06-14",
    type: "Lab",
  },
};

export const mockAlerts: Alert[] = [
  { id: 1, type: "info",    message: "Week 6 materials are now available on the learning platform." },
  { id: 2, type: "warning", message: "Submit your Lab 3 reflection by Friday 13 June." },
  { id: 3, type: "success", message: "Your mentor session is confirmed for Saturday 10 am WAT." },
];

export const mockCalendarEvents: CalendarEvent[] = [
  { id: 1, title: "Live Q&A — Networking Basics", date: "2025-06-12", time: "7:00 PM WAT" },
  { id: 2, title: "Lab 3 Deadline",               date: "2025-06-14", time: "11:59 PM WAT" },
  { id: 3, title: "Mentor Check-in",              date: "2025-06-15", time: "10:00 AM WAT" },
  { id: 4, title: "Group Study Session",           date: "2025-06-18", time: "6:00 PM WAT" },
];

export const mockKBArticles = [
  {
    id: 1,
    title: "How to access the Learning Platform",
    category: "Getting Started",
    excerpt: "Step-by-step guide to logging into the learning platform for the first time.",
    url: "#",
  },
  {
    id: 2,
    title: "What to do if you miss a live session",
    category: "Programme",
    excerpt: "All live sessions are recorded. Here's how to find and watch recordings.",
    url: "#",
  },
  {
    id: 3,
    title: "How to reset your MFA",
    category: "Account",
    excerpt: "Lost access to your authenticator? Contact your programme coordinator.",
    url: "#",
  },
  {
    id: 4,
    title: "Submitting assignments and labs",
    category: "Assessments",
    excerpt: "A guide to uploading and submitting your work before deadlines.",
    url: "#",
  },
  {
    id: 5,
    title: "Getting help from your mentor",
    category: "Support",
    excerpt: "How to book mentor sessions and what to prepare beforehand.",
    url: "#",
  },
  {
    id: 6,
    title: "Programme schedule and cohort calendar",
    category: "Programme",
    excerpt: "Understanding the weekly schedule, live sessions, and key milestones.",
    url: "#",
  },
];

export type KBArticle = (typeof mockKBArticles)[number];

// TODO: replace all with real API calls
// Open questions:
// - programProgress source: LMS API or manual field?
// - Calendar events data model from Learning Management?
// - Next assessment: cohort schedule or individual path?
// - Knowledge base location: Notion, Confluence, custom?
// - Learning platform URL + does it SSO?