# Student Hub – Dashboard (Primary View) Behaviours

## 1. Page-Level Behaviours

- **Route & Access**
  - Path: `/dashboard`.
  - Default landing page after successful auth for approved students.
  - Accessible only to authenticated students whose email is on the approved list.

- **Loading & Error States**
  - On initial load, show skeletons for:
    - "Resume Where You Left Off" banner.
    - Recent Enrolled Program card.
    - Your Progress list.
    - To Do List.
    - Activity Streak.
    - Calendar + Live class card.
  - If data fetch for any widget fails:
    - Show a localized error state for that widget with a "Retry" action.
    - Other widgets should still render if their data loads successfully.

---

## 2. “Welcome Back / Resume Where You Left Off” Banner

- **Content**
  - Greeting: "Welcome Back, [Preferred Name]!" using student’s preferred display name.
  - Track banner: shows current track/level (e.g., "DevOps Track Lv1").
  - CTA: "Resume Where You Left Off →".
  - Progress summary:
    - Overall track progress percentage (e.g., 60%).
    - Current module name (e.g., "Module 1: DevOps Foundations").
    - Short description of current focus.

- **Behaviour**
  - **Canonical next unit logic**:
    - Clicking the CTA navigates to the **first incomplete learning item in the sequence** for the current track/module.
    - Sequence is defined by curriculum ordering in the learning platform:
      - Lessons → labs → assessments, etc., as per design.
    - If all units in the current module are complete:
      - Move to the first incomplete unit in the next module within the same track.
    - If the entire track is complete:
      - Banner copy changes to a completion message and CTA points to:
        - Track review/recap page, or
        - Recommended next track (if configured).

- **Edge Cases**
  - If student has no track assigned:
    - Show a "Get started" style banner linking to Explore Programs.
  - If curriculum changes (units added/removed):
    - Next unit logic is recalculated on each dashboard load.

---

## 3. Recent Enrolled Program Card

- **Content**
  - Shows the **single active program** for the student:
    - Program title (e.g., "Cloud Practitioner").
    - Visual progress bar.
    - Summary: `<completedModules>/<totalModules> Modules Completed`.

- **Behaviour**
  - Only one program is considered active at a time:
    - Normally a student is not enrolled in two programs simultaneously.
    - Data model enforces a single `activeProgramId` per student.
  - Clicking the card:
    - Navigates to "My Program" page focused on the active program.
  - If no active program:
    - Show an empty state encouraging enrollment via Explore Programs.

---

## 4. Your Progress (Module-Level Progress)

- **Content**
  - List of modules belonging to the **active program/track**:
    - Module name.
    - Percentage completion.
    - Horizontal progress bar per module.

- **Behaviour**
  - Always scoped to the **current active program**.
  - Data pulled from module-level completion stats:
    - `completedUnits / totalUnits` per module converted to percent.
  - Interaction:
    - Clicking a module row navigates to that module’s detail page in "My Program".
    - Detail page shows units within the module and their states.

- **Edge Cases**
  - If there are many modules:
    - Consider limiting to top N and providing a “View all modules” link.

---

## 5. To Do List

- **Content**
  - List of tasks showing:
    - Task title.
    - Optional due date.
    - Completion status (checkbox or similar indicator).
  - Tasks may be:
    - System-generated.
    - Student-created.

- **Behaviour: Student-Editable AND System-Generated**
  - **Student-created tasks**
    - Students can:
      - Add new tasks (title, optional due date, optional link/reference).
      - Edit task title and due date.
      - Mark tasks as complete/incomplete via checkbox.
      - Delete tasks they created.
  - **System-generated tasks**
    - Platform can create tasks based on learning events, e.g.:
      - "Complete Module 1 assessment by Friday."
      - "Review your notes after DevOps class."
    - Students can:
      - Mark system tasks as complete/incomplete.
    - Policy decision:
      - Allow or disallow editing/deleting system tasks:
        - Recommended behaviour:
          - System tasks **cannot be deleted**, but may be dismissed (soft hide) with a reason.
          - Limited editing: e.g., adjusting due date, if allowed.
  - **Ordering & styling**
    - Overdue tasks surface near the top and may use a stronger visual style.
    - Completed tasks may appear in a collapsed/completed section or faded within the list.

- **Linking**
  - Tasks can optionally be linked to specific units, modules, or events:
    - Clicking such a task navigates to the associated resource.

---

## 6. Activity Streak

- **Content**
  - Weekly row with weekdays (Mo–Su) and icons indicating activity.
  - Streak summary label (e.g., "12 days").

- **Definition of Activity**
  - **Activity is defined as completing a unit.**
    - A “unit” is designed as ~20 minutes of study content.
    - Only completion of a unit counts as activity for streak calculation.
    - Mere viewing/opening content without completion does **not** count.

- **Behaviour**
  - Streak counts **consecutive days** where at least one unit is completed.
  - For each day:
    - If at least one unit is completed, mark that day as active in the visual streak row.
  - Streak value:
    - Number of consecutive active days ending today.
  - Interactions:
    - Clicking the streak widget may open:
      - A simple streak history (past weeks).
      - Or a more detailed activity log.

- **Edge Cases**
  - If student breaks the streak (no unit completed on a given day):
    - Streak resets to 0 and starts counting again from the next active day.
  - Timezone:
    - Streak calculation respects the student’s configured timezone from Profile.

---

## 7. Calendar & Events (Learning + Beyond)

- **Content**
  - Calendar widget:
    - Month view showing dates.
    - Events indicated on specific days.
  - Filters/buttons:
    - "Upcoming Today"
    - "Tomorrow"
    - "Next Week"
  - View toggles:
    - "Today"
    - "Week"
    - "Month"
  - Event list below or beside calendar, including:
    - Learning-related events (classes, deadlines).
    - **Beyond-learning events** (community sessions, meetups, AMA, etc.).
  - Live event card:
    - Shows next relevant session (e.g., "DevOps Class").
    - Time range + timezone.
    - Status badge, e.g., "Live" when in progress.

- **Event Types**
  - Learning-related events:
    - Live classes.
    - Assignment/assessment due dates.
    - Program milestones.
  - Beyond-learning events:
    - Community platform events (meetups, AMA sessions, office hours).
    - General announcements that have a time slot (e.g., webinar).
  - Events carry:
    - Type (learning, community, other).
    - Title and description.
    - Start/end time and timezone.
    - Link/target (classroom, meeting room, community page).

- **Behaviour**
  - Filters:
    - "Upcoming Today": show all events (learning + beyond-learning) scheduled for today.
    - "Tomorrow": events for the next day.
    - "Next Week": events within the next 7 days.
  - View toggles:
    - "Today": focuses on current date; list limited to today’s events.
    - "Week": shows week grid with events per day.
    - "Month": full month, with event indicators on days.
  - Live event card:
    - When current time is within event’s start–end range:
      - Show "Live" badge.
      - Optionally show "Join" or "Open" CTA.
    - Clicking the card navigates to:
      - The learning environment (for classes).
      - The relevant event page (for community events).

---

## 8. Sidebar / Navigation Context

- **Left Sidebar**
  - Main menu:
    - Dashboard (current).
    - My Program.
    - Calendar.
    - Analytics.
  - Account Management:
    - Notes.
    - Helpdesk.
    - My Profile.
  - Bottom:
    - Settings.
    - Log out.

- **Behaviours**
  - Clicking nav items navigates to the respective student surfaces.
  - Dashboard remains the default landing page after login.
  - Notes:
    - Entry point to student’s own note-taking space (spec defined separately).
  - Helpdesk:
    - Entry point to support/ticketing (spec defined separately).

---

## 9. Non-Functional & Cross-Cutting Behaviours

- **Authorization**
  - Only the logged-in student can see and modify their own Dashboard data.
  - Admin/staff dashboards and analytics are separate surfaces.

- **Audit & Logging**
  - Log changes to:
    - Student-created To Do items (create/edit/delete, complete/incomplete).
  - Track:
    - Unit completion timestamps (used for streak and progress).
    - Event attendance or join actions (for analytics).

- **Timezone & Localisation**
  - All dates/times on Dashboard use the student’s configured timezone and locale.
  - Streak and calendar calculations respect timezone.
