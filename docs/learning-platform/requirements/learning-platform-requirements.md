# Learning Platform Requirements Checklist

> Scope: This checklist captures all requirements for the **Learning Platform** surface of the Cloud Heroes Africa platform, based strictly on the project decision log as of 2026‑07‑13 and assuming a custom backend using Postgres.[page:1]

---

## 1. Application Surface & Navigation

- The Learning Platform (LP) is a **separate application** from:
  - Student Hub
  - Learning Management
  - Administration
  - Donor Hub[page:1]
- LP has its **own top navigation** and layout, not just routes within Student Hub.[page:1]
- There is a clear **handshake flow** from Student Hub into LP:
  - Example: “Start learning” button on Student Hub opens the student’s current program/module/unit in LP.
  - Shared auth/session state is used during this transition.[page:1]
- LP uses the **shared authentication layer**:
  - Google OAuth against the admin-managed approved-email list.
  - LP does **not** implement separate login; it relies on the shared auth gateway.[page:1]

---

## 2. Content Hierarchy & Structure

- LP implements the official content hierarchy:
  - **Program → Module → Unit**.[page:1]
- Units are **content containers**, not assessments themselves:
  - Unit content is separate from assessments and knowledge checks.[page:1]
- LP must provide:
  - Program list for the logged-in student (enrolled programs).
  - Modules per program, with progress summaries.
  - Units per module, with access state (locked/unlocked).[page:1]

---

## 3. Content Format (Data-Light Delivery)

- LP uses a **data-light content strategy**:
  - **Static visuals + local text-to-speech (TTS)**.
  - No streaming video.
  - No stored audio files.[page:1]
- Unit content view must render:
  - Text (titles, body, code snippets).
  - Static images/diagrams.
  - A front-end trigger for **local TTS** reading the text aloud.[page:1]
- Unit/program content must support **multiple creators/instructors**:
  - A unit/program can credit multiple names.[page:1]

---

## 4. Knowledge Checks (In-Unit)

- LP supports **Knowledge Checks** as short, in-unit evaluation steps:
  - They are **separate from unit content**.
  - They typically unlock **after the unit is completed**.[page:1]
- Knowledge Check structure:
  - MCQ or similar short quiz format.
  - For each question: prompt, options, correct answer(s), explanation.[page:1]
- Failure flow (current Working Assumption):
  - If a student fails a Knowledge Check, the unit status resets to **“Retake”**.
  - After a second failure, a **team member is notified** to follow up.[page:1]

---

## 5. Standalone Assessments

- The platform defines **two assessment types**:[page:1]
  - **Knowledge Checks** – short embedded quizzes within units.
  - **Assessments** – standalone evaluations combining MCQ and practical submissions (outside units).
- LP must support **standalone Assessments** that:
  - Can be associated with program/module/unit (e.g., module finals, program exams).[page:1]
  - Combine MCQs and practical tasks such as:
    - File uploads
    - Code/project submissions
    - Links to external work (exact workflow still open).[page:1]
- Assessments must be **separate from content**:
  - Updating an assessment must **not** force students to redo unit content.[page:1]

---

## 6. Unit Status, Progress & Points

- LP tracks at least two statuses per student-unit (Working Assumption):[page:1]
  - **Completed** – student has finished the unit content.
  - **Competent / Verified** – student has passed the corresponding knowledge checks/assessments.
- LP records per student-unit:
  - Timestamp of unit completion.
  - Timestamp of competence/verification (if achieved).[page:1]
- LP implements a **points-based access system**:
  - Completing units and passing assessments earn **points**.
  - Starting a new unit requires a **minimum point threshold**.[page:1]
- LP behaviour:
  - Shows units as **locked** if the student lacks enough points.
  - Clearly indicates:
    - Current points.
    - Required points to unlock the unit.[page:1]

---

## 7. Goals & Deadlines (Goals Meeting Streak)

- Students can set **unit completion deadlines** (goal dates) in LP.[page:1]
- For each unit goal, LP stores:
  - Target completion date.
  - Actual completion date once completed.[page:1]
- LP exposes data for the **Goals Meeting Streak** widget (rendered in Student Hub):
  - Streak counts **consecutive deadlines met**, not login frequency.[page:1]
  - Must support:
    - Current streak length.
    - Historical streak information (for analytics/widgets).[page:1]

---

## 8. Exam Readiness Assessments

- LP defines **dedicated Exam Readiness assessments** separate from normal content consumption.[page:1]
- Requirements:
  - Readiness assessments per program/exam.
  - Capture readiness scores or levels (numeric or categorical).[page:1]
- LP must expose to Student Hub:
  - Latest readiness score per relevant program.
  - Optionally, readiness history/trend over multiple readiness assessments.[page:1]

---

## 9. Unit UX & Tabs

- Unit page layout follows the **minimal distraction principle**:[page:1]
  - **Main view**: core learning content (text, visuals, TTS trigger).
  - **Secondary tabs** for:
    - Notes
    - Assignments
    - Other non-essential information.[page:1]
- Non-essential elements (notes, assignments, extras) must **not** clutter the main content area:
  - They live in dedicated tabs/panels.[page:1]

---

## 10. Embedded Help & Contextual Tagging

- Each unit view in LP must include an **embedded Help button/form**.[page:1]
- When a student submits a help request from LP, the system must attach **contextual metadata** and send it to Help Desk:
  - Student identity.
  - Current program.
  - Current module.
  - Current unit.[page:1]
- LP does **not** implement its own ticketing engine:
  - It calls Help Desk APIs or routes with this context.
  - Help Desk operates as a separate program/codebase.[page:1]

---

## 11. Integration Boundaries

### 11.1 With Student Hub

- Student Hub responsibilities (LP must provide data, not duplicate UI):[page:1]
  - Progress previews:
    - Current unit
    - Courses remaining
    - Badges (once gamification scope is decided).
  - Assessment status summaries.
  - Widgets:
    - Calendar (events from Learning Management).
    - Goals Meeting Streak.
    - Exam Readiness.[page:1]
- LP must provide APIs/queries so Student Hub can:
  - Read progress and status data.
  - Read readiness and streak metrics.[page:1]

### 11.2 With Learning Management

- Learning Management responsibilities:[page:1]
  - Design and management of programs/modules/units.
  - Design and management of assessments and knowledge checks.
  - Administration of learning materials metadata.
- LP consumes Learning Management outputs:
  - Reads **published program/module/unit structures**.
  - Reads assessment and knowledge-check definitions.
  - Renders them for students.[page:1]
- LP writes back:
  - Unit completion and competence status.
  - Points earned.
  - Goal deadlines and completion dates.
  - Readiness assessment results.[page:1]

---

## 12. Backend & Data Orientation (Postgres)

- LP uses a **custom backend** instead of Payload CMS; Payload CMS has been explicitly abandoned for Student Hub and LP.[page:1]
- Backend responsibilities:
  - Provide Postgres-based relational structures for:
    - Programs, modules, units
    - Knowledge checks and standalone assessments
    - Student-unit progress and competence
    - Points ledger and thresholds
    - Goals (deadlines) and streak calculations
    - Exam Readiness assessments and scores
    - Help-context snapshots for Help Desk.[page:1]
  - Use JSON/JSONB where appropriate for flexible payloads:
    - Question definitions
    - Assessment configs
    - Rubrics.[page:1]
- All LP APIs must fit the **shared data store + multiple front-ends** architecture:
  - Common auth.
  - Common data model shared with other surfaces.
  - Separate front-ends for Student Hub, LP, Learning Management, Administration, Donor Hub.[page:1]

---

## 13. Open / Extension Areas (Not Fully Decided)

The following are still **Open** in the decision log but must be anticipated in LP’s design:[page:1]

- **Assessment design and storage details**:
  - Exact question types supported.
  - How answers, partial credit, and rubrics are stored.[page:1]
- **Assignment level and workflow**:
  - Are practical assignments required at:
    - Module level,
    - Program level,
    - Or both?
  - How submissions are captured: form upload, link, interview, etc.[page:1]
- **Badges & gamification scope**:
  - Whether badges are awarded at unit, module, and/or program level.
  - How badges appear in LP vs Student Hub.[page:1]
- **Placement assessment location**:
  - Whether initial placement/level assessment is:
    - Part of onboarding/registration,
    - Or fully inside LP as a special assessment flow.[page:1]
- **Advanced student bypass mechanism**:
  - Admin-granted exception vs separate self-assessment path enabling skipping lower levels.[page:1]

> LP should be implemented with **extension points** (e.g., extra tables/fields, flexible status flags) so these open decisions can be settled without major schema rewrites.[page:1]
