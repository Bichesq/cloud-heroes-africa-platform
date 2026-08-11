# Learning Platform — Open Decisions for Team

> File: `docs/learning-platform/open-decisions-for-team.md`  
> Purpose: Capture open or flexible decisions that are crucial for building the Learning Platform, so they can be explicitly resolved in team discussions.

---

## 1. Assessment & Assignment Design

- [X] **Assessment types and structure**  
  - [x] Decide which question types are supported beyond MCQ (multi‑select, short answer, drag‑and‑drop, code evaluation, etc.).  
  - [x] Decide how answers, partial credit, and rubrics are stored and displayed.  
  - [x] Decide how many attempts are allowed and whether partial progression without competence is allowed.

- [x] **Practical assignments level & workflow**  
  - [x] Decide where practical assignments live (program‑level only, module‑level + program‑level, or also unit‑level micro‑projects).  
  - [x] Decide the submission UX (file upload, repo link, embedded code editor, recorded presentation, etc.).

- [x] **Knowledge Check failure logic (final)**  
  - [x] Confirm fail / retake / escalation rules (e.g. first fail → Retake, second fail → team follow‑up, further fails?).  
  - [x] Decide how fail states affect points and access.

---

## 2. Progress, Points & Gating

- [x **Points model**  
  - [x] Define how many points are awarded for unit completion, passing Knowledge Checks, passing standalone Assessments, and completing assignments / projects.  
  - [x] Decide whether points can be lost (e.g. repeated failure, inactivity) or only earned.

- [x] **Unit unlocking thresholds**  
  - [x] Decide whether thresholds are fixed per unit, fixed per module, or dynamically computed (e.g. percentage of possible points in previous content).  
  - [x] Decide how many locked units can appear ahead and what messaging students see when blocked.

- [x] **Completed vs Competent / Verified semantics**  
  - [x] Define what “Completed” means (visited all required content vs minimal path).  
  - [x] Define what “Competent / Verified” means (passed all Knowledge Checks + Assessments vs some subset).  
  - [x] Decide whether competence is required to unlock later units or only to pass the program.

---

## 3. Placement, Bypass & Pathways

- [x] **Placement assessment location**  
  - [x] Decide whether initial placement / level assessment lives in onboarding (Student Hub) or inside the Learning Platform as a special program / unit.

- [x] **Advanced student bypass mechanism**  
  - [x] Decide how advanced students skip lower‑level modules (admin / instructor override vs self‑assessment path).  
  - [x] Decide how bypassed modules are displayed (e.g. “skipped but allowed” vs “marked competent”).

---

## 4. Goals, Streaks & Readiness

- [x] **Goal‑setting granularity**  
  - [x] Decide whether goals / deadlines are unit‑only or also module / program‑level.  
  - [x] Decide whether multiple goals per unit are allowed (e.g. completion vs competence).

- [x] **Goals Meeting Streak rules**  
  - [x] Define what counts as meeting a deadline (exact day vs grace window).  
  - [x] Define how streak breaks work (immediate reset vs step‑down).  
  - [x] Decide whether any units are exempt from streak counting.

- [x] **Exam Readiness assessment definition**  
  - [x] Decide what constitutes an Exam Readiness assessment for each program (single high‑stakes exam vs multiple readiness checkpoints).  
  - [x] Decide how readiness is encoded (numeric score, categorical level, badges / labels).  
  - [x] Decide how often readiness can be recomputed and how historical readiness results are surfaced.

---

## 5. Help, Support & Escalation

- [x] **Help Desk escalation thresholds**  
  - [x] Decide which events trigger escalation (repeated Knowledge Check fails, repeated missed deadlines, low readiness scores).  
  - [x] Decide the escalation channel (Help Desk ticket, instructor notification, both).

- [x] **Help UX scope in Learning Platform**  
  - [x] Decide what fields and options the embedded Help form exposes (categories, attachments, prior requests per unit).  
  - [x] Decide whether students can view and track their help requests directly in LP.

---

## 6. Backend & Integration Boundaries

- [x] **Data ownership between LM and LP**  
  - [x] Decide which entities live in Learning Management vs Learning Platform tables (e.g. points, goals, readiness scores, unit status).  
  - [x] Decide whether LP writes directly to shared tables or only via LM / Admin‑owned APIs.

- [x] **Badges & gamification scope**  
  - [x] Decide whether badges are launched with LP (unit / module / program level) or delayed.  
  - [x] Decide how badges relate to points and competence (purely cosmetic vs requirement‑linked).

---

## 7. Design & System Decisions

- [x] **Canonical unit view confirmation**  
  - [x] Confirm that the reading / static visual / local TTS‑first unit view is the canonical learning experience.  
  - [x] Decide which parts of legacy video‑based mockups are kept as layout inspiration and which are deprecated.

- [x] **Accessibility & TTS engine choice**  
  - [x] Decide on the preferred local TTS stack (browser‑native vs specific local / edge TTS model).  
  - [x] Confirm minimum accessibility standards (keyboard navigation, color contrast, text size, alt text for images).

---

## Meeting Usage

Use this file as the agenda for Learning Platform design / architecture meetings. For each item:

- Discuss options.  
- Record the final decision in the main `decision-log.md`.  
- Check the box here once the team agrees and the decision is documented.