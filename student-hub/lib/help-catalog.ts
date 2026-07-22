import type { Faq, HelpCategory } from "@/types";

/**
 * Static Help/Support catalog — recommended topic groupings from
 * docs/student-hub/requirements/help2.md, split across Help Desk (learning,
 * content, community) and Service Desk (account, access, technical), matching
 * the "Help View" mockups. Categories are navigation aids only — students are
 * never forced into deeper taxonomy at intake (help2.md "derive, don't
 * classify").
 *
 * Mock data behind a stable shape (Faq/HelpCategory from @/types) so a real
 * knowledge-base/search API can replace this file's contents without
 * touching any consumer.
 */
export const HELP_CATEGORIES = [
  {
    id: "calendar-events",
    label: "Calendar & Events",
    desk: "help",
    icon: "CalendarDays",
    blurb: "Live sessions, deadlines, and community events on your calendar.",
  },
  {
    id: "community-inquiries",
    label: "Community Inquiries",
    desk: "help",
    icon: "Users",
    blurb: "Questions about cohorts, threads, and community conduct.",
  },
  {
    id: "programs-lessons",
    label: "Programs & Lessons",
    desk: "help",
    icon: "BookOpen",
    blurb: "Understanding lesson content, modules, and course progress.",
  },
  {
    id: "account-login",
    label: "Account & Login Issues",
    desk: "service",
    icon: "KeyRound",
    blurb: "Sign-in problems, MFA, and account access.",
  },
  {
    id: "technical-problems",
    label: "Technical Problems",
    desk: "service",
    icon: "Laptop",
    blurb: "Platform bugs, playback issues, and other technical faults.",
  },
  {
    id: "certificates-badges",
    label: "Certificates & Badges",
    desk: "help",
    icon: "Award",
    blurb: "Certificate delivery, badge progress, and completion records.",
  },
] satisfies HelpCategory[];

export const FAQS = [
  {
    id: "reset-password",
    categoryId: "account-login",
    question: "How do I reset my password?",
    answer:
      "Sign-in uses Google Auth, so there's no separate CHA password to reset. Use Google's own \"Forgot password\" flow, then sign back in with Continue with Google.",
  },
  {
    id: "course-access",
    categoryId: "programs-lessons",
    question: "Why can't I access my course?",
    answer:
      "New units unlock as you earn points from completed units. Check My Program to see how many points you need before the next unit opens.",
    href: "/my-program",
  },
  {
    id: "tts-speed",
    categoryId: "technical-problems",
    question: "Text to speech is too fast",
    answer:
      "Open the lesson's playback controls and lower the speed slider — your preference is remembered for future units.",
  },
  {
    id: "mfa-device-lost",
    categoryId: "account-login",
    question: "I lost the device I use for MFA",
    answer:
      "Go to My Profile → Multi-Factor Authentication and revoke the missing device, then add a new one. If you're locked out entirely, open a support ticket so staff can verify your identity.",
    href: "/profile",
  },
  {
    id: "certificate-missing",
    categoryId: "certificates-badges",
    question: "I completed a program but don't see my certificate",
    answer:
      "Certificates are issued after a short review of your final assessment. This usually takes a few days — check back on My Program, or open a request if it's been longer than a week.",
    href: "/my-program",
  },
  {
    id: "event-timezone",
    categoryId: "calendar-events",
    question: "An event time looks wrong",
    answer:
      "Event times are shown in the timezone on your profile. Double-check My Profile → Time Zone matches where you actually are.",
    href: "/profile",
  },
  {
    id: "community-conduct",
    categoryId: "community-inquiries",
    question: "How do I report an inappropriate message?",
    answer:
      "Support threads are moderated. Open a Help Desk request describing what happened and where — a team member will review it.",
  },
  {
    id: "page-slow",
    categoryId: "technical-problems",
    question: "The platform is slow or unresponsive",
    answer:
      "Try refreshing and clearing your browser cache first. If it keeps happening, open a Service Desk ticket with your device and browser so we can investigate.",
  },
] satisfies Faq[];
