# Learning Platform — Open Decisions for Team

> File: `docs/learning-platform/open-decisions-for-team.md`  
> Purpose: Capture open or flexible decisions that are crucial for building the Learning Platform, so they can be explicitly resolved in team discussions.

---

## 1. Assessment & Assignment Design

- [ ] **Assessment types and structure**  
  - [ ] Decide which question types are supported beyond MCQ (multi‑select, short answer, drag‑and‑drop, code evaluation, etc.).  
  - [ ] Decide how answers, partial credit, and rubrics are stored and displayed.  
  - [ ] Decide how many attempts are allowed and whether partial progression without competence is allowed.

- [ ] **Practical assignments level & workflow**  
  - [ ] Decide where practical assignments live (program‑level only, module‑level + program‑level, or also unit‑level micro‑projects).  
  - [ ] Decide the submission UX (file upload, repo link, embedded code editor, recorded presentation, etc.).

- [ ] **Knowledge Check failure logic (final)**  
  - [ ] Confirm fail / retake / escalation rules (e.g. first fail → Retake, second fail → team follow‑up, further fails?).  
  - [ ] Decide how fail states affect points and access.

---

## 2. Progress, Points & Gating

- [ ] **Points model**  
  - [ ] Define how many points are awarded for unit completion, passing Knowledge Checks, passing standalone Assessments, and completing assignments / projects.  
  - [ ] Decide whether points can be lost (e.g. repeated failure, inactivity) or only earned.

- [ ] **Unit unlocking thresholds**  
  - [ ] Decide whether thresholds are fixed per unit, fixed per module, or dynamically computed (e.g. percentage of possible points in previous content).  
  - [ ] Decide how many locked units can appear ahead and what messaging students see when blocked.

- [ ] **Completed vs Competent / Verified semantics**  
  - [ ] Define what “Completed” means (visited all required content vs minimal path).  
  - [ ] Define what “Competent / Verified” means (passed all Knowledge Checks + Assessments vs some subset).  
  - [ ] Decide whether competence is required to unlock later units or only to pass the program.

---

## 3. Placement, Bypass & Pathways

- [ ] **Placement assessment location**  
  - [ ] Decide whether initial placement / level assessment lives in onboarding (Student Hub) or inside the Learning Platform as a special program / unit.

- [ ] **Advanced student bypass mechanism**  
  - [ ] Decide how advanced students skip lower‑level modules (admin / instructor override vs self‑assessment path).  
  - [ ] Decide how bypassed modules are displayed (e.g. “skipped but allowed” vs “marked competent”).

---

## 4. Goals, Streaks & Readiness

- [ ] **Goal‑setting granularity**  
  - [ ] Decide whether goals / deadlines are unit‑only or also module / program‑level.  
  - [ ] Decide whether multiple goals per unit are allowed (e.g. completion vs competence).

- [ ] **Goals Meeting Streak rules**  
  - [ ] Define what counts as meeting a deadline (exact day vs grace window).  
  - [ ] Define how streak breaks work (immediate reset vs step‑down).  
  - [ ] Decide whether any units are exempt from streak counting.

- [ ] **Exam Readiness assessment definition**  
  - [ ] Decide what constitutes an Exam Readiness assessment for each program (single high‑stakes exam vs multiple readiness checkpoints).  
  - [ ] Decide how readiness is encoded (numeric score, categorical level, badges / labels).  
  - [ ] Decide how often readiness can be recomputed and how historical readiness results are surfaced.

---

## 5. Help, Support & Escalation

- [ ] **Help Desk escalation thresholds**  
  - [ ] Decide which events trigger escalation (repeated Knowledge Check fails, repeated missed deadlines, low readiness scores).  
  - [ ] Decide the escalation channel (Help Desk ticket, instructor notification, both).

- [ ] **Help UX scope in Learning Platform**  
  - [ ] Decide what fields and options the embedded Help form exposes (categories, attachments, prior requests per unit).  
  - [ ] Decide whether students can view and track their help requests directly in LP.

---

## 6. Backend & Integration Boundaries

- [ ] **Data ownership between LM and LP**  
  - [ ] Decide which entities live in Learning Management vs Learning Platform tables (e.g. points, goals, readiness scores, unit status).  
  - [ ] Decide whether LP writes directly to shared tables or only via LM / Admin‑owned APIs.

- [ ] **Badges & gamification scope**  
  - [ ] Decide whether badges are launched with LP (unit / module / program level) or delayed.  
  - [ ] Decide how badges relate to points and competence (purely cosmetic vs requirement‑linked).

---

## 7. Design & System Decisions

- [ ] **Canonical unit view confirmation**  
  - [ ] Confirm that the reading / static visual / local TTS‑first unit view is the canonical learning experience.  
  - [ ] Decide which parts of legacy video‑based mockups are kept as layout inspiration and which are deprecated.

- [ ] **Accessibility & TTS engine choice**  
  - [ ] Decide on the preferred local TTS stack (browser‑native vs specific local / edge TTS model).  
  - [ ] Confirm minimum accessibility standards (keyboard navigation, color contrast, text size, alt text for images).

---

## Meeting Usage

Use this file as the agenda for Learning Platform design / architecture meetings. For each item:

- Discuss options.  
- Record the final decision in the main `decision-log.md`.  
- Check the box here once the team agrees and the decision is documented.