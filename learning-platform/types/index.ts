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
/* Program → Module → Unit → ContentBlock. Exactly three navigational levels
 * (2026-08-11, final) — Section/Item are gone; a Unit is a plain content
 * container holding its own ordered ContentBlocks directly. Postgres via
 * Prisma (prisma/schema.prisma) is the source of truth; these types mirror
 * it 1:1. */

export type CreatorRef = {
  name: string;
  role?: string;
  avatarUrl?: string;
};

/** Ordered content blocks inside a Unit's body. The union is open by
 * design — a future "video" block (fast-follow per decision 2026-07-16)
 * slots in without schema changes. */
export type ContentBlock = (
  | { id: string; order: number; type: "heading"; payload: { text: string; level?: 2 | 3 } }
  | { id: string; order: number; type: "richtext"; payload: { md: string } }
  | { id: string; order: number; type: "image"; payload: { src: string; alt: string; caption?: string } }
  | { id: string; order: number; type: "code"; payload: { lang: string; code: string } }
  | { id: string; order: number; type: "callout"; payload: { tone: "info" | "tip" | "warning"; md: string } }
  | { id: string; order: number; type: "video"; payload: { src: string; poster?: string } }
) & {
  /** Topic this block belongs to; null = the unit has no Topic breakdown. */
  topicId: string | null;
};

/** A navigable sub-page of a Unit (Sept 21 Unit → Topic decision). Only
 * topics with an `order` are navigable; tag-only LpTopic rows (assessment
 * weak-topic labels) are excluded when a unit is loaded. */
export type UnitTopic = {
  id: string;
  name: string;
  description: string;
  order: number;
};

/** Unit is the only level between Module and content — no `type`, no
 * children besides its own ContentBlocks. A Knowledge Check "belongs" to a
 * Unit by referencing its id (KnowledgeCheck.unitId), not by a flag here. */
export type LpUnit = {
  id: string;
  title: string;
  order: number;
  description: string;
  durationMin: number;
  heroImage?: string;
  /** Tokens granted when the unit is completed (renamed from pointsAward, §1). */
  tokensAward: number;
  /** Minimum token balance required to start the unit; 0 = always open
   * (renamed from pointsRequired, §1). */
  tokensRequired: number;
  creators: CreatorRef[];
  contentBlocks: ContentBlock[];
  /** Ordered navigable topics; empty = one flat reading (pre-Topic data). */
  topics: UnitTopic[];
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
  /** How many bank questions are randomly drawn per attempt (2026-09-21:
   * replaces the old fixed `questions` list — see LpKcQuestionBankItem). */
  questionsPerAttempt: number;
};

/** KC question bank item (2026-09-21, plan Phase 3 step 1). Narrower than
 * LpQuestionBankItem on purpose — single_choice only, no topic linkage (see
 * the schema's own comment on LpKcQuestionBankItem for why). */
export type KcQuestionBankItem = {
  id: string;
  kcId: string;
  difficulty: QuestionDifficulty;
  prompt: string;
  options: KcOption[];
  correctOptionId: string;
  explanation: string | null;
};

/** What the client receives for one question of a specific KC attempt, keyed
 * by attemptQuestionId (not the bank item id) so answers submit back against
 * the server-pinned snapshot. Ships `correctOptionId`/`explanation` inline —
 * same "no correctness during attempt, but the key itself is visible"
 * tradeoff KnowledgeCheckRunner already made pre-bank, kept for the existing
 * immediate per-question feedback UX. Flagged, not silently carried over. */
export type KcAttemptQuestionView = {
  attemptQuestionId: string;
  prompt: string;
  options: KcOption[];
  correctOptionId: string;
  explanation: string | null;
};

/* ===================== Student learning state ======================= */

export type Enrollment = {
  studentId: string;
  programId: string;
  enrolledAt: string;
  status: "active" | "completed";
};

/** Dual-state model (decision 2026-05-21): a unit can be Completed
 * (content finished) without being Verified (KC passed). "retake" is the
 * post-KC-failure state. (2026-08-11: with Section/Item removed, this is
 * the only progress-tracking table — there is no leaf-level completion
 * below Unit any more.) */
export type StudentUnitStatus = "in_progress" | "completed" | "retake" | "verified";

export type StudentUnit = {
  studentId: string;
  unitId: string;
  status: StudentUnitStatus;
  completedAt: string | null;
  verifiedAt: string | null;
  updatedAt: string;
};

/** 2026-09-21 (plan Phase 3): now created at attempt start (status
 * in_progress, score/passed/answers null) so its question selection can be
 * snapshotted before grading — see LpKcAttempt's schema comment. */
export type KcAttempt = {
  id: string;
  studentId: string;
  kcId: string;
  attemptNo: number;
  status: AttemptStatus;
  /** attemptQuestionId → chosen optionId (null = skipped). Null until
   * submitted. */
  answers: Record<string, string | null> | null;
  /** Fraction correct, 0..1. Null until submitted. */
  score: number | null;
  passed: boolean | null;
  createdAt: string;
  submittedAt: string | null;
};

/** Renamed from PointsSourceType (§1, 2026-08-11). */
export type TokenSourceType =
  | "unit_completion"
  | "kc_pass"
  | "assessment"
  | "adjustment";

/** Renamed from PointsEntry (§1). */
export type TokenEntry = {
  id: string;
  studentId: string;
  sourceType: TokenSourceType;
  sourceId: string;
  tokens: number;
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
/* 2026-08-11 rebuild: "readiness" and "standalone" are no longer one union
 * table — Exam Readiness stays a fixed, unchanged-shape assessment
 * (lp_readiness_assessments/lp_readiness_results); standalone Assessments
 * get a full question-bank + randomized-attempt engine of their own. */

export type ReadinessLevel = {
  /** Minimum score fraction (0..1) for this level. */
  min: number;
  label: string;
};

export type LpReadinessAssessment = {
  id: string;
  programId: string;
  title: string;
  description: string;
  config: {
    questions?: KcQuestion[];
    levels?: ReadinessLevel[];
  };
};

export type ReadinessResult = {
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

/** Links a question bank item back to the unit a student should review. */
export type LpTopic = {
  id: string;
  name: string;
  unitId: string | null;
};

/** Exactly one of moduleId/programId is set (module-end vs program-end
 * assessment). */
export type LpStandaloneAssessment = {
  id: string;
  moduleId: string | null;
  programId: string | null;
  title: string;
  description: string;
  questionsPerAttempt: number;
  /** e.g. {"easy":4,"medium":4,"difficult":2} */
  difficultyMix: Record<string, number>;
  /** Fraction correct needed to pass, e.g. 0.75. */
  passThreshold: number;
  /** null = untimed (decision 7c, 2026-10-05). */
  timeLimitSeconds: number | null;
  /** Cap on scored attempts (decision 7b); null = unlimited. */
  maxAttempts: number | null;
  /** First approved publish from Learning Management (ISO). Learners who
   * completed the module before it aren't gated by it; null = gates all. */
  firstPublishedAt: string | null;
};

/** V1 scope: single_choice and multi_select only. */
export type QuestionType = "single_choice" | "multi_select";
export type QuestionDifficulty = "easy" | "medium" | "difficult";

export type LpQuestionBankItem = {
  id: string;
  assessmentId: string;
  topicId: string | null;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  prompt: string;
  options: KcOption[];
  correctOptionIds: string[];
  pointsPossible: number;
  explanation: string | null;
};

/** Question bank item with correctness fields stripped — what the client
 * sees during an in-progress attempt ("no correctness during attempt"). */
export type PublicQuestionBankItem = Omit<
  LpQuestionBankItem,
  "correctOptionIds" | "explanation" | "topicId"
>;

export type AttemptStatus = "in_progress" | "submitted" | "expired";

/** topicId is null for the generic "review the full module" fallback (brief
 * §4: a failed attempt with no topic individually below threshold). */
export type WeakTopic = {
  topicId: string | null;
  topicName: string;
  unitId: string | null;
  scorePct: number;
};

export type LpAssessmentAttempt = {
  id: string;
  assessmentId: string;
  studentId: string;
  attemptNumber: number;
  status: AttemptStatus;
  score: number | null;
  passed: boolean | null;
  startedAt: string;
  lastSavedAt: string | null;
  submittedAt: string | null;
  nextEligibleAt: string | null;
  weakTopics: WeakTopic[] | null;
};

/** Snapshot of which bank items were randomly selected for a specific
 * attempt — preserved exactly even as retakes re-randomize. */
export type LpAttemptQuestion = {
  id: string;
  attemptId: string;
  questionBankItemId: string;
  orderIndex: number;
};

export type LpAttemptAnswer = {
  attemptQuestionId: string;
  selectedOptionIds: string[];
  /** Hidden from the client until submission; numeric to encode multi-select
   * partial credit. */
  pointsEarned: number | null;
  /** "Flag for Review" toggle — independent of Report Question. */
  flagged: boolean;
  answeredAt: string;
};

/** A learner-submitted issue report against a specific question (brief
 * §5.5), collected on the end-of-flow reporting screen. */
export type LpQuestionReport = {
  id: string;
  attemptId: string;
  questionBankItemId: string;
  studentId: string;
  detail: string;
  createdAt: string;
};

/** Per-question detail returned only after submit, and only for
 * module-level assessments (2026-08-20 decision: program-level assessments
 * don't expose a full answer-key review). */
export type GradedAttemptQuestion = {
  attemptQuestionId: string;
  orderIndex: number;
  prompt: string;
  type: QuestionType;
  options: KcOption[];
  correctOptionIds: string[];
  selectedOptionIds: string[];
  explanation: string | null;
  pointsPossible: number;
  pointsEarned: number;
  topicName: string | null;
};

/* ========================== Escalations ============================= */

export type EscalationKind = "kc_second_failure" | "assessment_repeated_failure";

export type Escalation = {
  id: string;
  studentId: string;
  kind: EscalationKind;
  /** Reference into the source record (kcId for KC failures, standalone
   * assessment id for repeated Assessment failure). */
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
