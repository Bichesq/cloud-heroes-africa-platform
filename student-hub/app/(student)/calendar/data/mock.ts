/**
 * Mock data for the full calendar page.
 * Design reference: docs/Calendar View Light 2 with Popup.png
 */

export type EventTone = "amber" | "amber-soft" | "ocean";

export type ScheduleEvent = {
  id: string;
  title: string;
  time: string;
  participants: string;
  /** 24h start slot the block renders in (13 = 1 PM row). */
  hour: number;
  tone: EventTone;
  video?: boolean;
  /** Fraction of the row width to indent the block by (0–1). */
  offset?: number;
  /** Block width in px. */
  width?: number;
};

export type EventCategory = {
  id: string;
  label: string;
  /** Token-backed utility class for the category color dot. */
  dotClass: string;
};

export const mockCalendarPage = {
  timezone: "WAT",
  /** "Today" in the mocked world — 24 June 2026, matching the design. */
  initial: { year: 2026, month: 6, day: 24 },
  /** Days of the visible month that carry the small event dot. */
  eventDays: [2, 6, 9, 14, 20, 23, 27, 28],
  categories: [
    { id: "live", label: "Live Sessions", dotClass: "bg-cha-orange" },
    { id: "events", label: "Events", dotClass: "bg-cha-blue" },
    { id: "tasks", label: "Tasks", dotClass: "bg-cha-danger" },
    { id: "assignments", label: "Assignments", dotClass: "bg-cha-success" },
  ] satisfies EventCategory[],
  todayEvent: {
    title: "DevOps Class",
    time: "3:00 - 4:00 PM",
    link: "https://zoom.us/j/71670423115",
  },
  /** Visible scheduler window: 1 PM – 8 PM. */
  hours: { start: 13, end: 20 },
  events: [
    {
      id: "devops-2pm",
      title: "DevOps Class",
      time: "2:00 - 3:30 PM",
      participants: "25+ Participants",
      hour: 14,
      tone: "amber",
      video: true,
      offset: 0.3,
      width: 104,
    },
    {
      id: "intermediate-3pm",
      title: "Intermediate..",
      time: "3:00 - 4:30 PM",
      participants: "25+ Participants",
      hour: 15,
      tone: "amber",
      offset: 0.45,
      width: 100,
    },
    {
      id: "kubernetes-4pm",
      title: "Kubernetes Class",
      time: "4:00 - 5:30 PM",
      participants: "25+ Participants",
      hour: 16,
      tone: "ocean",
      offset: 0,
      width: 118,
    },
    {
      id: "devops-6pm",
      title: "DevOps Class",
      time: "6:00 - 7:00 PM",
      participants: "25+ Participants",
      hour: 18,
      tone: "amber",
      video: true,
      offset: 0.16,
      width: 104,
    },
    {
      id: "devops-7pm",
      title: "DevOps Class",
      time: "7:00 - 8:00 PM",
      participants: "25+ Participants",
      hour: 19,
      tone: "amber-soft",
      offset: 0.16,
      width: 168,
    },
  ] satisfies ScheduleEvent[],
};

export type CalendarPageData = typeof mockCalendarPage;
