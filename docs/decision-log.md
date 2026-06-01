# Cloud Heroes Africa Decision Log

> Purpose: record project decisions, working assumptions, unresolved questions, and process changes for the Cloud Heroes Africa platform.

This file should be updated whenever the team makes a meaningful decision during planning, implementation, experimentation, or review.

---

## 1. How to Use This Log

Use this file to track:

- decisions that are fully made,
- temporary working assumptions,
- unresolved questions that still need discussion,
- and decisions changed later based on findings.

### Status meanings
- **Decided** — agreed and active
- **Working Assumption** — currently used to move forward, but not final
- **Open** — unresolved and needs discussion
- **Replaced** — previously used but superseded by a newer decision
- **Blocked** — cannot be finalized yet because another dependency is missing

---

## 2. Confirmed Decisions

These reflect decisions that are already clear from the meeting discussion or from the repo setup work already being established. [page:1]

| Date | Area | Decision | Status | Owner | Reason / Notes |
|---|---|---|---|---|---|
| 2026-05-18 | Delivery approach | Begin planning and pre-building before AWS approval is finalized | Decided | Team | Avoid project stagnation and gain practical build experience while waiting [page:1] |
| 2026-05-18 | Development leadership | Bichesq leads development in the central repository | Decided | Team | Kris explicitly asked Bichesq to lead development and commit centrally [page:1] |
| 2026-05-18 | Repo workflow | Use a shared repository as the main implementation path | Decided | Team | Team wants a central repo that others can pull, fork, or branch from [page:1] |
| 2026-05-18 | Planning approach | Build a documentation skeleton before large-scale Claude implementation | Decided | Team | Documentation is intended to become the project context for Claude [page:1] |
| 2026-05-18 | Collaboration model | Team members may fork or branch to test alternate approaches | Decided | Team | Experimentation is encouraged, with findings reviewed and potentially merged back [page:1] |
| 2026-05-18 | Demo direction | Aim to produce a working demo for Yannick, Samoa, Enda, and other stakeholders | Decided | Team | The team wants to show something concrete, not just a proposal [page:1] |
| 2026-05-18 | Planning output | Documentation should later be translated into Jira epics, stories, and subtasks | Decided | Team / Harriet | Kris explicitly linked the planning docs to later Jira structuring [page:1] |
| 2026-05-18 | Process standardization | Git commit and PR standards should be defined for this project | Decided | Team | Explicit action item from the meeting [page:1] |
| 2026-05-18 | Invite code scope | Invite codes are one-to-one, unique per student, and temporary (not bulk batch codes) | Decided | Team | Bulk codes risk leakage; one-to-one tied to student email is more secure [page:2] |
| 2026-05-18 | Access control | Platform access is gated by an invite code; open self-registration is not allowed | Decided | Team | Prevents unvetted users from entering the platform; ensures trust and quality control [page:2] |
| 2026-05-18 | Student intake flow | An external form (e.g., Google Form) is used to collect student interest; a human reviews responses before invites are sent | Decided | Team | Human-in-the-loop vetting ensures only suitable students receive invite codes [page:2] |
| 2026-05-18 | Invite code delivery | The platform generates invite codes and sends them via email to vetted students | Decided | Team | Codes tied to student email; email delivery confirmed over SMS or manual sharing [page:2] |
| 2026-05-18 | Registration gateway | Student must provide their email + invite code + complete reCAPTCHA to begin registration | Decided | Team | Combination of email and code is harder to brute-force; reCAPTCHA blocks bot attacks [page:2] |
| 2026-05-18 | Authentication method | Google OAuth is used to complete registration after invite code verification | Decided | Team | Reduces typing; pulls first name, last name, and email from Google account [page:2] |
| 2026-05-18 | Profile completion gate | Profile completion is not a hard blocker at login; students may explore the platform but must complete their profile before taking any courses | Decided | Team / Bichesq | Gives students flexibility to explore while enforcing completion before serious commitment [page:2] |
| 2026-05-18 | Assessment placement | Assessments belong inside the learning platform, not as a standalone external step in the onboarding flow | Decided | Team / Kris | Keeps education delivery and assessment together; avoids duplicating functionality outside the learning platform [page:2] |
| 2026-05-18 | Assessment hierarchy | Assessments are tiered: Unit assessment → Module assessment → Program assessment | Decided | Team | Mirrors the course hierarchy (Program > Module > Unit); each level has its own competency check [page:2] |

---

## 3. Working Assumptions

These are currently useful assumptions that let the team move forward, but they should still be reviewed in the next planning session.

| Date | Area | Working Assumption | Status | Owner | Reason / Notes |
|---|---|---|---|---|---|
| 2026-05-18 | Product shape | The platform may involve around three application surfaces | Working Assumption | Team | Kris suggested there appear to be about three applications, but said this must be reassessed [page:1] |
| 2026-05-18 | First implementation slice | Onboarding is the most logical first slice: login, registration, invite verification, assessment, dashboard entry | Working Assumption | Bichesq | These were the concrete screens and flows named in the planning discussion [page:1] |
| 2026-05-18 | Claude workflow | Claude will be used incrementally in bounded tasks rather than one giant build session | Working Assumption | Team | Meeting emphasized session boundaries, revisions, token limits, and structured workflow [page:1] |
| 2026-05-18 | Demo hosting | The first demo may run on a smaller or simplified environment before final AWS setup | Working Assumption | Team | Kris explicitly described showing a smaller-server demo before AWS approval [page:1] |
| 2026-05-18 | Validation path | Internal team members plus some outside testers will likely be the first evaluators of the platform | Working Assumption | Team | Team discussed external testers and emphasized that the user base is effectively internal/community-led at first [page:1] |
| 2026-05-18 | Jira workflow | Harriet may use repo documents, rather than raw meeting notes, as the main input for Jira creation | Working Assumption | Harriet / Team | This is implied by the plan to turn the documentation into stories and subtasks [page:1] |

---

## 4. Open Decisions

These decisions are important and should be resolved as early as possible.

| Date Logged | Area | Question | Status | Owner | Why It Matters |
|---|---|---|---|---|---|
| 2026-05-18 | Product structure | Is this one application, multiple apps in one repo, or multiple repos? | Open | Team | Affects architecture, repo structure, deployment, and Jira breakdown [page:1] |
| 2026-05-18 | Repo structure | If there are multiple application surfaces, should this be a monorepo? | Open | Bichesq / Team | Affects development workflow and implementation boundaries |
| 2026-05-18 | Invite flow | Will invite codes be delivered by email, SMS, or both? | Decided | Team | Resolved in May 18 session: delivery is by email only [page:2] |
| 2026-05-18 | Bot protection | Will Google reCAPTCHA be used, and if so which version or pricing tier? | Decided | Team | Resolved in May 18 session: reCAPTCHA is confirmed; specific version/tier still to be determined [page:2] |
| 2026-05-18 | Assessment design | What questions will the assessment ask, and how should answers be stored? | Open | Team | Explicitly raised in the meeting [page:1] |
| 2026-05-18 | Demo scope | What exactly must work live in the first stakeholder demo, and what can be mocked? | Open | Team | Critical for scoping the first build [page:1] |
| 2026-05-18 | Design system | What UI/design system direction should the app follow? | Open | Team | Explicitly called out as a required planning topic [page:1] |
| 2026-05-18 | API structure | What API style and conventions should be standardized? | Open | Team | Affects Claude prompt quality and implementation consistency |
| 2026-05-18 | Infrastructure | What minimum infrastructure is required for the first demo? | Open | Team | Needed to avoid overbuilding too early [page:1] |
| 2026-05-18 | Board interaction | Should the board be brought in before implementation starts, or after a first internal build exists? | Open | Team | Kris explicitly framed this as an unresolved strategic question [page:1] |
| 2026-05-18 | Invite code entry UX | Should the invite code be entered manually (copy-paste) or auto-populated via a link in the email? | Open | Team / Allen | Allen preferred copy-paste for security; Kris was open to either; not resolved [page:2] |
| 2026-05-18 | Advanced student bypass | How should advanced students bypass lower-level modules — admin-granted exception or a separate self-assessment? | Open | Team / Kris | Risk that students exploit bypass for privilege; needs a controlled, fair mechanism [page:2] |
| 2026-05-18 | Placement assessment | Should a placement/level assessment be included during onboarding registration, or handled entirely within the learning platform? | Open | Team / Bichesq | Bichesq suggested it may still be valid at registration for placing students at the right level [page:2] |

---

## 5. Decision Candidates for Next Session

These should be explicitly reviewed and either marked **Decided** or kept **Open** with blockers.

### Highest-priority decisions
1. One app vs multi-app structure
2. One repo vs monorepo vs multiple repos
3. First demo flow
4. Invite code entry UX (copy-paste vs auto-link)
5. reCAPTCHA provider and cost direction
6. Assessment structure and question design
7. Placement assessment — onboarding vs learning platform
8. Advanced student bypass mechanism
9. Minimal dashboard definition
10. Demo hosting approach
11. Design system direction
12. Jira board starting epic order [page:1]

---

## 6. Process Decisions

These entries track how the team works, not just what the product does.

| Date | Area | Decision / Assumption | Status | Owner | Notes |
|---|---|---|---|---|---|
| 2026-05-18 | Collaboration | Central implementation should happen through Bichesq's lens and direction | Decided | Team | Kris explicitly described the team observing and supporting through Bichesq's workflow [page:1] |
| 2026-05-18 | Experimentation | Experiments are allowed if contributors want to try alternate ideas independently | Decided | Team | These can happen through clones, forks, or branches and then be reviewed later [page:1] |
| 2026-05-18 | Session management | The team wants to define how to stop and resume Claude coding sessions cleanly | Open | Team | This was a major process concern raised during the meeting [page:1] |
| 2026-05-18 | AI skills usage | The team wants to explore different Claude skills and possibly multi-agent approaches later | Working Assumption | Team | Mentioned as an area for experimentation rather than an immediate requirement [page:1] |
| 2026-05-18 | Git conventions | Commit wording and PR wording should be standardized | Decided | Team | Explicit action item from meeting notes [page:1] |
| 2026-05-18 | AI token efficiency | Use Plan Mode in Claude before coding to reduce unnecessary context and token usage | Decided | Team | Meeting identified token bloat as a key risk to productive AI sessions [page:2] |
| 2026-05-18 | AI context management | Be highly specific in prompts and limit the number of active tools / MCPs to avoid context window bloat | Decided | Team | Discussed as a practical discipline to adopt immediately across all coding sessions [page:2] |
| 2026-05-18 | Local MCP servers | Team members should research and experiment with local MCP server setups to improve token efficiency | Working Assumption | Team | Raised as an action item at the close of the May 18 session; findings to be shared at next sync [page:2] |
| 2026-05-18 | AI tool exploration | Team members should test alternative AI/brain-mapping tools (e.g., Caveman Talk) to identify context-reduction strategies | Working Assumption | Team | Raised at close of session; not a firm commitment, but encouraged before next sync [page:2] |

---

## 7. Risks Logged

This section tracks risks the team has already recognized.

| Date | Risk | Status | Owner | Mitigation Direction |
|---|---|---|---|---|
| 2026-05-18 | Waiting for AWS approval could stall the project | Active | Team | Continue planning and pre-building while approval is pending [page:1] |
| 2026-05-18 | Scope could spread too early without a clear first demo path | Active | Bichesq / Team | Prioritize a bounded onboarding-to-dashboard slice |
| 2026-05-18 | AI sessions could become too large and hard to manage | Active | Team | Define stop/resume rules and work in smaller slices [page:1] |
| 2026-05-18 | Multiple contributors experimenting could create divergence | Active | Bichesq / Team | Keep central repo direction clear and review experiments before adoption [page:1] |
| 2026-05-18 | Important product decisions are still undocumented | Active | Team | Use next planning session to resolve the highest-impact open decisions [page:1] |

---

## 8. Changes to Prior Decisions

Use this section only when something actually changes.

| Date | Previous Decision | New Decision | Reason | Owner |
|---|---|---|---|---|
| \_TBD\_ | | | | |

---

## 9. Logging Template

Copy this block when adding a new entry.

### Decision Entry
- **Date:**
- **Area:**
- **Decision or Question:**
- **Status:** Decided / Working