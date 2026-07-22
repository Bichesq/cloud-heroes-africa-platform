import { DefaultSession } from "next-auth";
export type ApprovedEmailStatus = "approved" | "revoked" | "pending";
export type ApprovedEmailSource = "form" | "manual" | "import";

export type ApprovedEmail = {
  id: string;
  email: string;
  status: ApprovedEmailStatus;
  source: ApprovedEmailSource;
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
};

export type StudentStatus = "active" | "banned";

export type MfaMethodKind = "email" | "authenticator" | "sms";

export type MfaMethod = {
  id: string;
  method: MfaMethodKind;
  transport: string;                // where codes go, e.g. "bic***@gmail.com"
  identifier: string;               // short device label/code, e.g. "MFA-4F2A"
  lastUsed: string | null;          // ISO 8601
  active: boolean;
  createdAt: string;                // ISO 8601
};

export type Passkey = {
  id: string;
  label: string;                    // device/label, e.g. "Chrome on Windows"
  registeredAt: string;             // ISO 8601
  lastUsed: string | null;          // ISO 8601
};

export type Student = {
  id: string;
  approvedEmailId: string;          // FK → ApprovedEmail.id
  email: string;
  givenName: string;
  familyName: string;
  legalName?: string;
  displayName?: string;             // preferred name shown in the dashboard greeting
  phone?: string;
  alternateEmail?: string;
  birthDate?: string;               // ISO 8601
  city?: string;
  country?: string;
  timezone?: string;                // canonical entry from TIMEZONES
  track?: string;
  avatarUrl?: string;
  photoPublic: boolean;             // "Display Profile Photo to Public"
  countryPublic: boolean;           // "Display Country of Origin"
  mfaMethods: MfaMethod[];          // mfaEnabled derives from any active method
  passkeys: Passkey[];
  activeProgramId?: string;         // FK → Program.id; the student's single active enrollment
  status: StudentStatus;
  lastLogin: string;                // ISO 8601
  profileCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/* --------------------------- Curriculum ----------------------------- */
/* Simulated learning content for the dashboard/My Program POC. Isolated
 * behind lib/curriculum.ts so a future real-LMS integration only needs to
 * replace that module's I/O, not the types or the dashboard consumers. */

export type UnitType = "lesson" | "lab" | "assessment";

export type Unit = {
  id: string;
  title: string;
  type: UnitType;
  order: number;
  durationMin: number;
};

export type Module = {
  id: string;
  title: string;
  order: number;
  description: string; // short focus blurb, e.g. for the resume banner
  units: Unit[];
};

export type Program = {
  id: string;
  title: string;
  modules: Module[];
};

export type UnitCompletion = {
  studentId: string;
  unitId: string;
  completedAt: string; // ISO 8601
};

/* --------------------------- Calendar events -------------------------- */
/* Shared learning + beyond-learning events store for the dashboard widget
 * (and, eventually, the full /calendar page). Times are stored in UTC;
 * widgets convert to the student's profile timezone for display. */

export type LearningEventType = "learning" | "community" | "other";

export type LearningEvent = {
  id: string;
  type: LearningEventType;
  title: string;
  description: string;
  start: string; // ISO 8601, UTC
  end: string; // ISO 8601, UTC
  link: string | null;
};

/* ----------------------------- To Do -------------------------------- */

export type TodoSource = "student" | "system";

export type Todo = {
  id: string;
  studentId: string;
  title: string;
  dueDate: string | null; // "YYYY-MM-DD"
  link: string | null;
  source: TodoSource;
  completedAt: string | null; // ISO 8601
  dismissed: { at: string; reason: string } | null; // system tasks only
  createdAt: string;
  updatedAt: string;
};

declare module "next-auth" {
  interface Session {
    user: {
      given_name: string;
      family_name: string;
      email: string;
      image?: string | null;
    } & DefaultSession["user"];
  }

  interface JWT {
    given_name?: string;
    family_name?: string;
    email?: string;
    picture?: string;
  }
}

export type AlertType = "info" | "warning" | "success" | "danger";

export type Alert = {
  id: number;
  type: AlertType;
  message: string;
};

export type CalendarEvent = {
  id: number;
  title: string;
  date: string;
  time: string;
};

export type KBArticle = {
  id: number;
  title: string;
  category: string;
  excerpt: string;
  url: string;
};

/* ------------------------------ Help / Support ------------------------------ */
/* Help Desk (learning/content/community) and Service Desk (account/access/
 * technical) are distinct modules per docs/student-hub/requirements/help2.md,
 * even though both are surfaced together on the /support page. Students never
 * choose this desk explicitly — it is derived from the category they pick. */

export type SupportDesk = "help" | "service";

export type TicketStatus =
  | "open"
  | "pending"
  | "responded"
  | "resolved"
  | "cancelled";

/** Chronological status-date log — every status change is stored with its date. */
export type TicketStatusEvent = {
  status: TicketStatus;
  at: string; // ISO 8601
};

/** Snapshot of the student's learning context at submission time, captured
 * automatically rather than asked of the student (help2.md "derive, don't
 * classify"). */
export type TicketContext = {
  programId?: string;
  programTitle?: string;
  moduleId?: string;
  moduleTitle?: string;
  unitId?: string;
  unitTitle?: string;
};

export type SupportTicket = {
  id: string;
  /** null for a Service Desk request filed before sign-in — identified by
   * contactName/contactEmail instead. Help Desk tickets always require a
   * session, so studentId is only ever null on desk === "service". */
  studentId: string | null;
  desk: SupportDesk;
  categoryId: string;
  topic: string; // short description
  description: string; // long description
  preferredChannel: string | null;
  status: TicketStatus;
  statusLog: TicketStatusEvent[];
  assignedTo: string | null;
  resolvedBy: string | null;
  resolutionSummary: string | null;
  context: TicketContext;
  closedAt: string | null;
  contactName: string | null;
  contactEmail: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HelpCategory = {
  id: string;
  label: string;
  desk: SupportDesk;
  /** lucide-react icon component name, resolved by the UI layer. */
  icon: string;
  blurb: string;
};

export type Faq = {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
  /** Optional deep link into fuller help content (article/thread). */
  href?: string;
};