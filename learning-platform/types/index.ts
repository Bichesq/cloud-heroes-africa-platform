import { DefaultSession } from "next-auth";

/* ================= Shared identity types (mirror student-hub) ================ */
/* These records live in the repo-root data/ stores shared with Student Hub.
 * Shapes must stay in sync with student-hub/types/index.ts. */

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

export type MfaMethod = {
  id: string;
  method: "email" | "authenticator" | "sms";
  transport: string;
  identifier: string;
  lastUsed: string | null;
  active: boolean;
  createdAt: string;
};

export type Passkey = {
  id: string;
  label: string;
  registeredAt: string;
  lastUsed: string | null;
};

export type Student = {
  id: string;
  approvedEmailId: string;
  email: string;
  givenName: string;
  familyName: string;
  legalName?: string;
  displayName?: string;
  phone?: string;
  alternateEmail?: string;
  birthDate?: string;
  city?: string;
  country?: string;
  timezone?: string;
  track?: string;
  avatarUrl?: string;
  photoPublic: boolean;
  countryPublic: boolean;
  mfaMethods: MfaMethod[];
  passkeys: Passkey[];
  activeProgramId?: string;
  status: StudentStatus;
  lastLogin: string;
  profileCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/* ======================= LP content hierarchy ======================= */
/* Program → Module → Unit → Section → Item, with reading items made of
 * ordered content blocks. JSON stores mirror docs/learning-platform/schema.sql
 * 1:1 so the Postgres migration only swaps the I/O layer. */

export type CreatorRef = {
  name: string;
  role?: string;
  avatarUrl?: string;
};

/** Ordered content blocks inside a reading item. The union is open by
 * design — a future "video" block (fast-follow per decision 2026-07-16)
 * slots in without schema changes. */
export type ContentBlock =
  | { id: string; order: number; type: "heading"; payload: { text: string; level?: 2 | 3 } }
  | { id: string; order: number; type: "richtext"; payload: { md: string } }
  | { id: string; order: number; type: "image"; payload: { src: string; alt: string; caption?: string } }
  | { id: string; order: number; type: "code"; payload: { lang: string; code: string } }
  | { id: string; order: number; type: "callout"; payload: { tone: "info" | "tip" | "warning"; md: string } };

/** V1 item types; the schema reserves "video" and "assessment" for later. */
export type LpItemType = "reading" | "knowledge_check";

export type LpItem = {
  id: string;
  title: string;
  type: LpItemType;
  order: number;
  durationMin: number;
  /** knowledge_check items point at their KC definition. */
  kcId?: string;
  /** reading items own their content. */
  blocks?: ContentBlock[];
  /** optional static hero visual shown above the reading. */
  heroImage?: string;
};

export type LpSection = {
  id: string;
  title: string;
  order: number;
  items: LpItem[];
};

export type LpUnit = {
  id: string;
  title: string;
  order: number;
  description: string;
  durationMin: number;
  /** Points granted when the unit is completed. */
  pointsAward: number;
  /** Minimum points balance required to start the unit (0 = always open). */
  pointsRequired: number;
  creators: CreatorRef[];
  sections: LpSection[];
};

export type LpModule = {
  id: string;
  title: string;
  order: number;
  description: string;
  units: LpUnit[];
};

export type LpProgram = {
  id: string;
  title: string;
  slug: string;
  blurb: string;
  heroImage: string;
  language: "en";
  delivery: "self-paced";
  creators: CreatorRef[];
  published: boolean;
  modules: LpModule[];
};

/* ======================== Knowledge Checks ========================== */

export type KcOption = { id: string; label: string };

export type KcQuestion = {
  id: string;
  prompt: string;
  options: KcOption[];
  correctOptionId: string;
  explanation: string;
};

export type KnowledgeCheck = {
  id: string;
  unitId: string;
  title: string;
  /** Fraction of correct answers needed to pass, e.g. 0.7. */
  passThreshold: number;
  questions: KcQuestion[];
};

/* ===================== Student learning state ======================= */

export type Enrollment = {
  studentId: string;
  programId: string;
  enrolledAt: string;
  status: "active" | "completed";
};

/** Per-item completion — drives the rail dots and unit progress %. */
export type StudentItem = {
  studentId: string;
  itemId: string;
  completedAt: string;
};

/** Dual-state model (decision 2026-05-21): a unit can be Completed
 * (content finished) without being Verified (KC passed). "retake" is the
 * post-KC-failure state. */
export type StudentUnitStatus = "in_progress" | "completed" | "retake" | "verified";

export type StudentUnit = {
  studentId: string;
  unitId: string;
  status: StudentUnitStatus;
  completedAt: string | null;
  verifiedAt: string | null;
  updatedAt: string;
};

export type KcAttempt = {
  id: string;
  studentId: string;
  kcId: string;
  attemptNo: number;
  /** questionId → chosen optionId (null = skipped). */
  answers: Record<string, string | null>;
  /** Fraction correct, 0..1. */
  score: number;
  passed: boolean;
  createdAt: string;
};

export type PointsSourceType =
  | "unit_completion"
  | "kc_pass"
  | "assessment"
  | "adjustment";

export type PointsEntry = {
  id: string;
  studentId: string;
  sourceType: PointsSourceType;
  sourceId: string;
  points: number;
  createdAt: string;
};

/* ======================= Goals & deadlines ========================== */

export type UnitGoal = {
  studentId: string;
  unitId: string;
  /** "YYYY-MM-DD" target completion date set by the student. */
  targetDate: string;
  setAt: string;
};

/* ========================= Assessments ============================== */
/* Two kinds share one table: "readiness" (exam-readiness, fully used in V1)
 * and "standalone" (MCQ + practical submissions — schema extension point;
 * submission workflow is an open decision). */

export type LpAssessmentKind = "standalone" | "readiness";
export type LpAssessmentScope = "program" | "module" | "unit";

export type ReadinessLevel = {
  /** Minimum score fraction (0..1) for this level. */
  min: number;
  label: string;
};

export type LpAssessment = {
  id: string;
  kind: LpAssessmentKind;
  scope: LpAssessmentScope;
  scopeId: string;
  title: string;
  description: string;
  config: {
    questions?: KcQuestion[];
    levels?: ReadinessLevel[];
    /** standalone extension point — practical task definition. */
    practical?: unknown;
  };
  rubric?: unknown;
};

export type AssessmentResult = {
  id: string;
  studentId: string;
  assessmentId: string;
  /** Fraction correct, 0..1. */
  score: number;
  /** Categorical readiness level derived from config.levels. */
  level: string | null;
  detail?: unknown;
  submittedAt: string;
};

/* ========================== Escalations ============================= */

export type Escalation = {
  id: string;
  studentId: string;
  kind: "kc_second_failure";
  /** Reference into the source record (kcId for KC failures). */
  refId: string;
  payload: {
    unitId?: string;
    programId?: string;
    attemptCount?: number;
  };
  /** Stub for the real team notification — an open decision. */
  acknowledged: boolean;
  createdAt: string;
};

/* ============================= Notes ================================ */

export type UnitNote = {
  studentId: string;
  unitId: string;
  body: string;
  updatedAt: string;
};

/* ======================= Help / Support (shared) ==================== */
/* Ticket shapes must stay in sync with student-hub/types/index.ts — both
 * apps write the same repo-root data/support-tickets.json store. */

export type SupportDesk = "help" | "service";

export type TicketStatus =
  | "open"
  | "pending"
  | "responded"
  | "resolved"
  | "cancelled";

export type TicketStatusEvent = {
  status: TicketStatus;
  at: string;
};

/** Snapshot of the student's learning context at submission time. The LP
 * always knows the exact program/module/unit the student is viewing, so it
 * fills this explicitly (requirement §10) rather than deriving it. */
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
  studentId: string | null;
  desk: SupportDesk;
  categoryId: string;
  topic: string;
  description: string;
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

/* ==================== next-auth session augmentation ================= */

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
