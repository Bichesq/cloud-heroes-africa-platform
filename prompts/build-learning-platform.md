# Learning Platform Build Prompt

Use this prompt with Claude Code, GPT-5.4, or another coding agent to implement the Learning Platform.

***

## Prompt

Build the **Learning Platform** for the Cloud Heroes Africa platform in this folder: `learning-platform`.

### Source-of-truth files
You must use the following files as the primary references:

1. Requirements file: `docs/learning-platform/requirements/learning-platform-requirements.md`
2. Design evaluation file: `docs/learning-platform/learning-platform-design-evaluation.md`
3. Mockups located in: `docs/learning-platform/`
   - `Unit-View-Reading-Learning-Material.jpg`
   - `Unit-View-Video.jpg`
   - `Unit-View-Video-Transcript.jpg`
   - `Unit-View-Video-Notes.jpg`
   - `Unit-View-Video-Minimized-Side-Bar.jpg`
   - `Unit-View-Reading-Knowledge-Check-done-2.jpg`
   - and the other view images

### Important instruction
Do **not** blindly implement every mockup exactly as drawn.
The requirements file and the design evaluation file override outdated or conflicting mockup decisions.

In particular:
- The Learning Platform must follow a **reading / static visual / local TTS-first** model.
- Do **not** build a video-first course player as the default unit experience.
- Use the mockups selectively:
  - Keep the general shell, layout, breadcrumbs, left rail, and panel interaction patterns.
  - Use the reading-material view as the canonical unit-content reference.
  - Use the knowledge-check view as the canonical assessment reference.
  - Treat video-based mockups as layout inspiration only, not product truth.

### Product context
The Learning Platform is a **separate application surface** from Student Hub and Learning Management.
It is the student-facing runtime where students:
- browse enrolled learning content,
- open units,
- consume lesson material,
- complete knowledge checks,
- complete assessments,
- track progress.

It must integrate with a shared authentication and shared backend architecture, but its own UI, layout, and unit experience should feel like a dedicated application.

### Requirements you must implement
Read and follow `docs/learning-platform/requirements/learning-platform-requirements.md` in full.
At minimum, your implementation must support:

- Separate Learning Platform shell with its own navigation.
- Program → Module → Unit hierarchy.
- Reading/TTS-first unit content.
- Minimal-distraction unit layout.
- Secondary panels/tabs for notes, script/transcript-like text, assignments, and related content.
- Knowledge Checks separated from lesson content.
- Embedded Help entry on all unit and assessment screens.
- Points-based unlocking of units.
- Dual unit-state model: `Completed` and `Competent / Verified`.
- Goal deadline support for units.
- Hooks for Goals Meeting Streak.
- Exam readiness assessment support.
- Custom backend compatibility with Postgres-oriented data modeling.

### Design guidance from the evaluation file
Use `docs/learning-platform/learning-platform-design-evaluation.md` to decide what to keep, adapt, or replace.

Key guidance:
- Keep:
  - LP shell structure
  - breadcrumb structure
  - left learning rail
  - reading-material screen as the canonical lesson view
  - knowledge-check screen as the canonical assessment view
  - notes / side-panel interaction model
  - minimized-sidebar behavior as a focus mode
- Replace or redesign:
  - video-first lesson player as the default view
  - transcript concepts that assume content originates from video
  - any notes UX tied only to video or transcript highlighting
- Add missing product mechanics:
  - Help button/form with contextual metadata
  - points and unlock indicators
  - unit status indicators
  - goal deadline controls
  - readiness assessment states
  - fail / retake / escalation states for Knowledge Checks

### Build expectations
Design and implement the Learning Platform so that it is:
- production-minded,
- accessible,
- responsive,
- aligned with the mockup visual language where still valid,
- aligned with the requirements where mockups are outdated.

### Non-negotiable implementation rules
- Requirements file overrides mockups.
- Design evaluation file explains where mockups are outdated.
- Do not assume video as the core content type.
- Prefer static visual + rich text + local TTS controls.
- Keep the UI clean and distraction-minimized.
- Preserve a clear distinction between learning material and Knowledge Checks.

### Suggested implementation order
1. Build the Learning Platform shell and navigation.
2. Build the Program → Module → Unit left rail.
3. Build the canonical reading-material unit view.
4. Add local TTS controls and reading script panel.
5. Build notes panel and focus/minimized-sidebar behavior.
6. Build Knowledge Check view.
7. Add points / lock state / unit state indicators.
8. Add deadline/goals UI.
9. Add embedded Help entry.
10. Add readiness assessment entry points and results.

### Output expectation
Produce implementation-ready code and any supporting documentation needed to integrate this Learning Platform into the Cloud Heroes Africa codebase.

If there is a conflict between:
- the mockups,
- the requirements file,
- and the design evaluation file,

use this priority order:
1. `docs/learning-platform/requirements/learning-platform-requirements.md`
2. `docs/learning-platform/learning-platform-design-evaluation.md`
3. mockups in `docs/learning-platform/`