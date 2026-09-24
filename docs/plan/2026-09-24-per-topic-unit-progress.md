# Per-topic unit progress

**Date:** 2026-09-24
**Status:** Approved 2026-09-24 — implemented 2026-09-24; awaiting in-browser review

## Context

`decision-log.md` 2026-09-21 ("Unit progress: per-topic granularity", Team / Kris / Bichesq):
once a unit has Topics, progress should increment per topic completed ("10 topics → 10% each")
instead of the 0%/100% flip, and reaching 100% stays gated on passing the unit's Knowledge Check
("scrolling alone can't prove the content was actually read"). Kris, in the meeting: *"Another
reason to have a breakdown of topics… once you get to each topic, that could be a progress… if
you have 10 topics in a unit, when you finish two of them, you're 20% done."*

**What the Figma already shows** (`CHA Platform_4.fig`, "Unit View (Reading …)" frames, checked
first per your instruction): the rail puts a tick (`teenyicons:tick-circle-solid`) on each
completed topic item and a hollow circle on the not-yet-passed Knowledge Check, with a
"Progress %" bar in the content area. So the design already assumes per-topic completion state;
it just doesn't say how the percentage is computed.

**What exists today** (step 3 of `2026-09-23-learner-ui-figma-rebuild.md`): nothing is stored per
topic. The bar is derived from *which topic you're currently on* (`topicIndex / topicCount`), so
going back to topic 1 drops it again. Ticks only appear once the whole unit is `completed`, and
with one KC the formula `(content + passedKcs) / (1 + kcs)` shows 50% after the reading, not
"10% per topic".

## Goal

Each learner's completed topics are recorded server-side; the rail ticks them individually, the
bar rises per topic completed and survives reloads, and only a passed Knowledge Check takes the
unit to 100%.

## Scope

**In scope**
- A per-learner, per-topic completion record (new table).
- A topic-completion API route, with the same access gates as the unit page.
- Unit content becomes `completed` only once **every** navigable topic is complete (can't be
  skipped by jumping to the last topic's URL and pressing Next).
- Rail ticks per topic, a "N Topics · x/N Done" count, and the new progress formula.

**Out of scope** — see the end.

## Approach

1. **Schema (additive migration)** — new model in `prisma/schema/lp-core.prisma`:
   ```prisma
   model LpStudentTopic {
     studentId   String   @map("student_id") @db.Uuid
     topicId     String   @map("topic_id") @db.Uuid
     unitId      String   @map("unit_id")          // denormalized for per-unit reads
     completedAt DateTime @default(now()) @map("completed_at")

     topic LpTopic @relation(fields: [topicId], references: [id], onDelete: Cascade)
     unit  LpUnit  @relation(fields: [unitId], references: [id], onDelete: Cascade)

     @@id([studentId, topicId])
     @@index([studentId, unitId])
     @@map("lp_student_topics")
   }
   ```
   Created with `--create-only`. The auto-generated drops of the 9 hand-authored `student_id`
   FKs get stripped (same as the 09-21/09-23 migrations), and a hand-written
   `lp_student_topics_student_id_fkey → students(id)` is added so the new table follows the
   existing DB-only FK convention. Verify afterwards: 10 `%student_id_fkey` constraints.
2. **Store** — `lib/store/progress.ts`: `getCompletedTopicIds(studentId, unitId)` and
   `markTopicComplete(studentId, unitId, topicId)` (upsert, idempotent).
3. **API** — new `POST /api/progress/topics` with body `{ unitId, topicId }` (zod `strictObject`):
   - Auth; the unit must exist; the `topicId` must be one of *that unit's* navigable topics
     (IDOR, SECURITY.md §3).
   - Same token / module gates as `load-unit.ts` (shared helper, so the route and page can't drift).
   - Upserts the completion. When all of the unit's navigable topics are complete, it runs the
     *existing* unit-completion path: status `completed` + the idempotent tokens award, with no
     downgrade of `verified`/`retake`, extracted from `/api/progress` into a shared function.
   - Returns `{ completedTopicIds, unitStatus, tokensAwarded }`.
   - Rate limit: none. Other authenticated LP write routes don't have one either, so there's no
     per-route precedent to follow. See Open Question 3.
4. **Unchanged:** `POST /api/progress` `{ unitId }` keeps its request/response shape and still
   serves units **without** topics.
5. **UI** — `load-unit.ts` loads the completed topic ids. In `UnitShell`, Next on a topic calls the
   new route (the last topic's Next then goes on to the KC, as now), and the rail ticks each done
   topic and shows the x/N count. Progress uses the formula from Open Question 1.
6. **Tests** — vitest for the progress formula and the "all topics done → unit completed"
   rule, including skipping topics and revisiting already-completed ones.

## Files / modules affected

- `prisma/schema/lp-core.prisma` + new migration — `LpStudentTopic`
- `lib/store/progress.ts` — topic completion reads/writes
- `lib/unit-completion.ts` (new) — unit-completion logic shared by both progress routes
- `app/api/progress/route.ts` — calls the shared function (behaviour unchanged)
- `app/api/progress/topics/route.ts` (new)
- `app/(learner)/programs/[programId]/units/[unitId]/load-unit.ts`, `components/UnitShell.tsx`,
  `components/UnitRail.tsx`
- `lib/__tests__/topic-progress.test.ts` (new)

## Open questions / assumptions

1. **Progress formula — what exactly is "10% each" when the KC gates 100%?** Taken literally,
   10 topics × 10% = 100% before the KC is passed, which contradicts the gate. Options:
   - **(A) Recommended — topics fill up to a reading share, the KC takes the rest.** For example,
     topics fill 0 → 90% (9% each for 10) and passing the KC adds the final 10%. Closest to
     "roughly 10% each" while keeping the gate. The split (90/10) is adjustable.
   - (B) Equal steps: every topic and every KC is one step, so 10 topics + 1 KC ≈ 9.1% each.
     Simple, but the KC counts no more than a topic.
   - (C) Topics fill 0–100% of a separate "reading" bar, and verification is shown as a separate
     badge. It follows "10% each" literally, but you'd see two measures instead of one.
2. **What counts as "completing" a topic?** Recommended: pressing **Next** on it (an explicit
   action, same as today's "completing the reading is the act of advancing"). Kris's point is that
   scrolling proves nothing, and neither does this; the KC stays the real proof. Alternatives:
   reaching the end of the topic, or a minimum time on the page.
3. **Rate limit on the new write route?** SECURITY.md §7 suggests a per-user cap (60–100/min) on
   authenticated endpoints, but none of LP's existing write routes have one. Adding it only here
   would be inconsistent. I'd rather log it as a cross-route follow-up. Your call.
4. **Finding, not in scope to change silently:** the existing `POST /api/progress` checks
   sign-in and that the unit exists, but not the token/module gates the unit page applies. A
   learner could mark a locked unit complete (and collect its tokens) by calling the API
   directly. It's a SECURITY.md §3 gap. The new topic route will enforce the gates. Do you want
   `/api/progress` fixed in the same pass (my recommendation: yes, it's the same helper)?

## Risks / things that could go wrong

- **Migration drift** — the student-FK stripping must be done by hand again. Mitigated by
  `--create-only` + the constraint-count check (see memory note from 2026-09-23).
- **Existing learners** with `completed` units have no topic rows. The rail shows those units'
  topics as done when the unit status is `completed`/`verified`/`retake`, so nobody loses
  progress. No backfill needed.
- **Topic changes after completion** (an author adds a topic): an already-completed unit stays
  completed (never downgraded); the new topic just shows unticked.

## Out of scope (explicitly deferred)

- Time-on-page / scroll-depth tracking as proof of reading.
- Per-topic hero images (the Figma draws the illustration per topic; today it's per unit).
- Program/module-level progress bars picking up topic granularity (they read unit status; unchanged).
- A platform-wide rate-limiting layer (Open Question 3).

---

## Revision log

- 2026-09-24: initial draft (follow-up to the Sept 21 review of step 3; checked against the Figma
  reading frames first).
- 2026-09-24: approved by Bichesq with all four recommendations: (1) formula A — topics fill 0→90%,
  a passed KC adds the last 10% (units with no KC: topics fill 0→100%); (2) pressing Next completes
  a topic; (3) rate limiting deferred to a cross-route follow-up; (4) `POST /api/progress` gets the
  same token/module gates in this pass. Logo in the app stays as it is (not a Figma swap).
- 2026-09-24: implemented as planned. Migration `…_student_topic_progress` (student-FK drops stripped
  by hand, own `lp_student_topics_student_id_fkey` added; 10 student FKs verified). New
  `lib/unit-access.ts` (gates shared by load-unit.ts and both progress routes),
  `lib/unit-completion.ts`, `lib/topic-progress.ts`, `POST /api/progress/topics`. One addition beyond
  the draft: `POST /api/progress` now returns 409 for topic-split units, otherwise the reading could
  still be completed without the topics. Also: pressing Next on the last topic with earlier topics
  skipped sends the learner to the first unfinished topic instead of a locked KC. Typecheck clean;
  47 tests pass (12 new); gate + idempotency checked against the dev DB (test rows removed);
  routes 401 unauthenticated. Locked-gate path not exercised with real data (no dev unit needs more
  tokens than the one student has) — logic is the page's original gate, moved unchanged.
- 2026-09-24: adjustment requested by Bichesq — progress bar always visible, bottom-right as in the
  Figma "Unit View (Reading - Learning Material)" frame. The content card no longer scrolls as a
  whole (its inner content area does), and ProgressFooter is pinned below it with a 240px bar
  (Figma node 241×43: "Progress" extra-bold / "n%" medium, 22px orange-on-zinc track). The status
  word stays at the left of the same strip.
