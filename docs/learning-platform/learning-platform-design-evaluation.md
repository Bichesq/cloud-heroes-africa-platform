# Learning Platform Design Evaluation

> Purpose: Evaluate the current Learning Platform mockups against the documented requirements in `docs/learning-platform/requirements/learning-platform-requirements.md` and identify gaps before implementation.

> Inputs reviewed:
- `Unit-View-Reading-Learning-Material.jpg`
- `Unit-View-Video.jpg`
- `Unit-View-Video-Transcript.jpg`
- `Unit-View-Video-Notes.jpg`
- `Unit-View-Video-Minimized-Side-Bar.jpg`
- `Unit-View-Reading-Knowledge-Check-done-2.jpg`

> Evaluation basis:
- Separate Learning Platform app surface with its own navigation
- Program → Module → Unit hierarchy
- Static visuals + local TTS (no video / no stored audio as primary format)
- Minimal-distraction unit view
- Notes / transcript / secondary material in separate tabs or panels
- Knowledge Checks separate from learning content
- Embedded Help entry on each unit / assessment screen
- Points-based unlocking
- Unit progress states (`Completed`, `Competent / Verified`)
- Goals / deadlines and streak support
- Exam readiness support

***

## Overall Assessment

The current mockups are **partially aligned** with the Learning Platform requirements.

### What already works well
- The Learning Platform feels like a **separate application surface** with its own top navigation and clear module/unit context.
- The designs show a strong **Program → Module → Unit** structure through breadcrumbs and side navigation.
- The layouts generally follow a **minimal-distraction approach**, especially by moving transcript and notes into side panels.
- The reading material and knowledge check designs are much closer to the current product direction than the video views.
- The Knowledge Check screen clearly separates assessment from content and includes explanation feedback.

### Main issues across the design set
- The design system still relies heavily on **video-first learning**, while the current requirements specify **static visuals + local TTS** as the primary delivery mode.
- No mockup shows a visible **Help** button/form embedded in the unit or assessment view.
- No mockup visibly supports **points-based unlocking** for units.
- No mockup clearly communicates dual unit states such as **Completed** vs **Competent / Verified**.
- No mockup visibly supports **goal deadlines**, **streak tracking**, or **exam readiness** status.
- The notes/transcript experiences are still written and structured around a **video-based workflow** rather than a reading/TTS-first workflow.

***

## View 1 — `Unit-View-Reading-Learning-Material.jpg`

### Summary
This is the closest design to the current requirements because it uses static visual content, visible TTS controls, and a reading-oriented layout rather than a video-first layout.

### Evaluation

| Area | Status | Notes |
|------|--------|-------|
| Separate LP app feel | Pass | Dedicated top navigation and clear learning context are present. |
| Program → Module → Unit context | Pass | Breadcrumb and left rail support the hierarchy clearly. |
| Static visuals + local TTS | Pass | Static image plus visible TTS controls align well with the current requirement. |
| Minimal-distraction main unit view | Partial | Main content is focused, but the right-side learning material panel may still be too persistent/heavy. |
| Notes / secondary material separation | Partial | Right panel exists, but it is content-heavy rather than clearly secondary notes/assignments tabs. |
| Knowledge Check separation | Pass | The left rail distinguishes content items from the Knowledge Check item. |
| Embedded Help button/form | Gap | No visible Help action. |
| Points-based unlocking | Gap | No points total, unlock threshold, or locked-state UI is shown. |
| Completed vs Competent / Verified states | Gap | Only progress percentage is visible; no dual-state progression model is represented. |
| Goals / deadlines / streak | Gap | No deadline or streak interaction appears. |
| Exam readiness support | Gap | No readiness state or readiness entry point appears. |

### Recommendations
- Keep this as the **primary canonical unit view** for the Learning Platform.
- Replace the persistent right sidebar with a more explicit **secondary tabs/panels model** for Notes, Assignments, Transcript/Script, and Help.
- Add a persistent **Help** action within the unit frame.
- Add a visible **unit status strip** showing:
  - Completed / Not Completed
  - Competent / Verified / Pending
  - Points earned
  - Points required for the next unit
- Add a lightweight **goal deadline card** and/or “Set deadline” interaction.

***

## View 2 — `Unit-View-Video.jpg`

### Summary
This is a polished course-player layout, but it is no longer aligned with the current product direction because it treats video as the primary learning medium.

### Evaluation

| Area | Status | Notes |
|------|--------|-------|
| Separate LP app feel | Pass | Feels like a distinct learning app surface. |
| Program → Module → Unit context | Pass | Breadcrumb and left rail support the hierarchy well. |
| Static visuals + local TTS | Gap | The core experience is a video player, which conflicts with the current requirements. |
| Minimal-distraction main unit view | Pass | Transcript and notes are kept outside the main content area. |
| Notes / secondary material separation | Pass | Transcript and Notes are secondary actions rather than cluttering the main area. |
| Knowledge Check separation | Partial | The left rail suggests assessment is separate, but this screen does not show the flow clearly. |
| Embedded Help button/form | Gap | No Help action is visible. |
| Points-based unlocking | Gap | No points or lock state is shown. |
| Completed vs Competent / Verified states | Gap | No unit state model is visible. |
| Goals / deadlines / streak | Gap | No goal/deadline UI. |
| Exam readiness support | Gap | No readiness signal or assessment entry point. |

### Recommendations
- Do **not** use this as the canonical learning-material view unless the content policy changes.
- If retained at all, reframe it as a rare or future optional media variant rather than the primary model.
- Replace the video player with a **static hero visual + reading/TTS content block**.
- Keep the layout logic (left rail + central content + optional right-side tools), but rebuild it around text-first learning.

***

## View 3 — `Unit-View-Video-Transcript.jpg`

### Summary
This view improves text access by exposing transcript content directly, but it still assumes video is the main source and transcript is secondary.

### Evaluation

| Area | Status | Notes |
|------|--------|-------|
| Separate LP app feel | Pass | Strong LP identity and navigation context. |
| Program → Module → Unit context | Pass | Clearly represented. |
| Static visuals + local TTS | Gap | Still video-led rather than reading/TTS-led. |
| Minimal-distraction main unit view | Pass | Secondary content is compartmentalized well. |
| Notes / secondary material separation | Pass | Transcript and Notes are isolated appropriately. |
| Knowledge Check separation | Partial | Assessment remains separate conceptually, but not demonstrated strongly in the flow. |
| Embedded Help button/form | Gap | No Help action. |
| Points-based unlocking | Gap | No unlock mechanics shown. |
| Completed vs Competent / Verified states | Gap | No dual-state unit progression shown. |
| Goals / deadlines / streak | Gap | No deadline or streak UI. |
| Exam readiness support | Gap | No readiness support shown. |

### Recommendations
- Recast “Transcript” into a **Lesson Script** or **Reading Panel** so the text becomes the primary instructional artifact.
- Preserve the side-panel interaction model, but make it support:
  - Lesson Script
  - Notes
  - Help
  - Assignment / practical follow-up
- Remove the assumption that content originates from video.

***

## View 4 — `Unit-View-Video-Notes.jpg`

### Summary
This view handles note-taking well and supports the “secondary tabs/panels” requirement, but it is still designed around a video lesson.

### Evaluation

| Area | Status | Notes |
|------|--------|-------|
| Separate LP app feel | Pass | Clear LP layout and navigation. |
| Program → Module → Unit context | Pass | Well represented. |
| Static visuals + local TTS | Gap | Main content remains a video player. |
| Minimal-distraction main unit view | Pass | Notes are separated rather than crowding the main lesson. |
| Notes / secondary material separation | Pass | Strong execution of a dedicated notes panel. |
| Knowledge Check separation | Partial | Knowledge Check is visible in the left rail but not part of this interaction flow. |
| Embedded Help button/form | Gap | No Help action visible. |
| Points-based unlocking | Gap | No point thresholds or lock states shown. |
| Completed vs Competent / Verified states | Gap | No unit state model shown. |
| Goals / deadlines / streak | Gap | No deadline or streak representation. |
| Exam readiness support | Gap | No readiness cues. |

### Recommendations
- Keep the **notes panel pattern**, but rewrite the notes UX to work for:
  - reading-based lessons,
  - TTS-based lessons,
  - highlighted lesson text,
  - practical assignment notes.
- Remove wording that assumes the student is saving notes “under the video” or “from the transcript” only.
- Add a contextual Help entry inside the same right-side action rail.

***

## View 5 — `Unit-View-Video-Minimized-Side-Bar.jpg`

### Summary
This view is useful as a focus mode because collapsing the left rail gives the main content more space, but the content is still video-first.

### Evaluation

| Area | Status | Notes |
|------|--------|-------|
| Separate LP app feel | Pass | Still clearly part of the LP app surface. |
| Program → Module → Unit context | Pass | Breadcrumb remains strong. |
| Static visuals + local TTS | Gap | Video remains the core format. |
| Minimal-distraction main unit view | Pass | This is one of the strongest focus-mode variants. |
| Notes / secondary material separation | Pass | Transcript and Notes remain outside the primary content area. |
| Knowledge Check separation | Partial | The left rail collapse helps focus, but assessment flow is not reinforced. |
| Embedded Help button/form | Gap | No Help action visible. |
| Points-based unlocking | Gap | No lock-state or points UI. |
| Completed vs Competent / Verified states | Gap | No unit status model. |
| Goals / deadlines / streak | Gap | No goal/deadline support in UI. |
| Exam readiness support | Gap | No readiness support shown. |

### Recommendations
- Keep this as a **layout behavior**, not a separate content strategy.
- Apply the minimized-sidebar behavior to the **reading/TTS-first canonical view** instead of the video layout.
- Add a compact top or bottom summary for unit state, points, and deadline when the left rail is minimized.

***

## View 6 — `Unit-View-Reading-Knowledge-Check-done-2.jpg`

### Summary
This is the best-aligned assessment view in the set. It clearly separates the Knowledge Check from the lesson content and provides correctness feedback plus explanation.

### Evaluation

| Area | Status | Notes |
|------|--------|-------|
| Separate LP app feel | Pass | Fits the LP layout pattern. |
| Program → Module → Unit context | Pass | Module and unit context remain visible. |
| Static visuals + local TTS | Pass | No dependency on video is shown; TTS controls appear available. |
| Minimal-distraction main unit view | Pass | The question is the central focus. |
| Knowledge Check separation | Pass | Clearly represented as a separate step from content. |
| Immediate feedback/explanation | Pass | Strong instructional feedback is shown. |
| Embedded Help button/form | Gap | No Help action is present. |
| Failure / retake logic visibility | Gap | The screen does not show what happens on fail or second fail. |
| Completed vs Competent / Verified states | Partial | A correct answer is shown, but not how this affects competence/verification status overall. |
| Points-based unlocking | Gap | No points effect of passing/failing is shown. |
| Goals / deadlines / streak | Gap | No deadline-related behavior. |
| Exam readiness support | Gap | No relation to readiness assessment flows is visible. |

### Recommendations
- Use this as the **base pattern** for Knowledge Checks.
- Add result-state messaging for:
  - pass → contributes to Competent / Verified,
  - fail → Retake,
  - repeated fail → support escalation.
- Show whether passing the Knowledge Check earns points or unlocks the next unit.
- Add a contextual Help action for students who are stuck during the Knowledge Check.

***

## Cross-Cutting Gaps to Resolve Before Implementation

| Gap | Why it matters | Required change |
|-----|----------------|-----------------|
| Video-first lesson model | Conflicts with the current product decision for static visuals + local TTS | Replace video-first canonical views with reading/TTS-first views |
| Missing Help entry | Unit and assessment screens require embedded contextual help | Add Help button/form to all unit and Knowledge Check screens |
| Missing points-based unlock UI | Unit access is governed by points thresholds | Add lock states, points earned, and required points indicators |
| Missing dual-state unit progression | Requirements distinguish `Completed` vs `Competent / Verified` | Surface both statuses in unit-level and module-level UI |
| Missing goals/deadlines UI | Required for Goals Meeting Streak integration | Add deadline setting, deadline status, and streak-aware feedback |
| Missing readiness assessment cues | Required for Exam Readiness widget integration | Add readiness assessment entry points and result states |
| Notes/transcript language tied to video | Conflicts with reading/TTS-first delivery | Rewrite notes/script interactions to support text-first learning |

***

## Recommended Design Direction

### Keep and build on
- The **overall LP shell** (top nav, breadcrumbs, left unit rail).
- The **reading-material view** as the starting point for the canonical lesson screen.
- The **Knowledge Check view** as the base for in-unit assessment.
- The **right-side notes/transcript panel pattern**, but adapted to reading/TTS-first content.
- The **minimized sidebar behavior** as an optional focus mode.

### Replace or redesign
- The **video-first lesson player** as the default learning-material experience.
- Transcript and notes wording that assumes all learning comes from video.
- Any interaction model that depends on stored audio/video playback rather than local TTS.

### Add before implementation begins
- Embedded Help action.
- Unit state indicators.
- Points and lock-state UI.
- Goals/deadline controls.
- Readiness assessment cues.
- Explicit support messaging for pass/fail/retake/escalation states in Knowledge Checks.

***

## Implementation Note

When building the Learning Platform, the implementation should use:
- `docs/learning-platform/requirements/learning-platform-requirements.md` as the source of truth for product requirements.
- This design evaluation file as the source of truth for which mockups can be adopted directly, which should be adapted, and which should be replaced.

The safest implementation path is:
1. Use the **reading-material view** as the canonical unit-content pattern.
2. Use the **Knowledge Check view** as the canonical in-unit assessment pattern.
3. Rebuild transcript/notes/minimized-sidebar behavior around a **reading/TTS-first** lesson model.
4. Add the currently missing product mechanics (Help, points, deadlines, status, readiness) before finalizing the LP UI system.