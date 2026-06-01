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
| 2026-05-21 | Application architecture | The registration/onboarding module and the learning platform are separate applications, sharing a common authentication mechanism | Decided | Team / Kris | Avoids monolith; allows each app to scale independently (e.g., fewer containers for registration, more for learning); Kris and Bichesq agreed explicitly [page:3] |
| 2026-05-21 | Shared authentication | Authentication is the common layer across all platform modules; each new module piggybacks on the same auth setup | Decided | Team / Kris | Keeps login consistent across separate apps without duplicating auth logic [page:3] |
| 2026-05-21 | Student help sessions | Open help sessions follow a volunteer-slot model: volunteers register for recurring slots (e.g., Wednesday/Saturday); sessions only open if a student has booked | Decided | Team / Kris | Prevents empty sessions; makes volunteer time purposeful; students book with topic so tutor can prepare [page:3] |
| 2026-05-21 | Help request triage | Student help requests are handled asynchronously first (chat / short written answer); only escalated to a calendar session if the async response is insufficient | Decided | Team / Bichesq | Avoids blocking students on scheduling; keeps simple questions fast and light [page:3] |
| 2026-05-25 | Help Desk vs Service Desk | Help Desk (content and learning queries) and Service Desk (infrastructure, account, and MFA issues) are two distinct modules with separate workflows | Decided | Team / Kris | Prevents misrouting of requests; ensures each type of issue is handled by the right people with the right process [page:4] |
| 2026-05-25 | Help button placement | A help request form / button is embedded directly within each learning unit on the learning portal, not on a standalone page | Decided | Team / Kris | Provides immediate context (which unit, which slide) when a student submits a help request [page:4] |
| 2026-05-25 | Student support chat model | Student support uses a many-to-one chat model: multiple team members can communicate with one student in a shared, fully logged channel; no private one-to-one DMs between individual team members and students | Decided | Team / Kris | Ensures transparency, accountability, and a full audit trail; allows senior members to monitor and intervene if needed [page:4] |
| 2026-05-25 | Obsidian as second brain | Obsidian will be used as the team's second brain / knowledge vault; Claude Code continuously adds project knowledge to the Obsidian vault via a dedicated skill, reducing the need for large context windows in future sessions | Decided | Team / Kris | Discussed and agreed in session as the primary strategy for managing growing project knowledge without bloating the AI context window [page:4] |

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
| 2026-05-21 | Unit completion status | A two-status model is being designed for: "Completed" (finished course content) and "Competent" / "Verified" (passed the knowledge check); a student can complete a unit without yet being competent | Working Assumption | Team / Kris | Proposed by Kris and used as the design basis for the unit flow; not yet formally signed off [page:3] |
| 2026-05-21 | Knowledge check delivery | Unit knowledge checks are treated as separate from the course content itself; a student finishes a unit and then receives / unlocks a knowledge check as a distinct step | Working Assumption | Team / Kris | Allows knowledge checks to be delivered via different channels (in-platform or email link) and keeps content delivery clean [page:3] |
| 2026-05-21 | Knowledge check failure flow | If a student fails a knowledge check, the unit status resets to "Retake"; after a second failure, a team member is notified to follow up with the student | Working Assumption | Team / Kris | Balances automated enforcement with human support; not yet formally approved [page:3] |
| 2026-05-25 | Ticketing system intention | Both Help Desk and Service Desk requests will eventually be managed through a formal ticketing system with SLAs (defined acknowledgement and resolution timeframes) | Working Assumption | Team / Kris | Ensures professional accountability and a paper trail for all support interactions; specific tool, SLA timeframes, and ownership not yet agreed [page:4] |
| 2026-05-25 | Service Desk approval process | Sensitive Service Desk actions (e.g., MFA resets, account access changes) will require a secondary approval step to create a secure paper trail and prevent unauthorised changes | Working Assumption | Team / Kris | Directional agreement in session; specific approval workflow and responsible parties not yet designed [page:4] |
| 2026-05-25 | AI session continuity and token management | A `handoff.md` file will be maintained at the end of each Claude coding session to summarise progress and define the starting point for the next session; additional techniques under consideration as part of an integrated system include: model routing (different models for different task types), OLLAMA for running models locally, prompt caching for shared project files, a token monitoring status bar in the terminal, and project-level CLAUDE.md instructions to keep context focused | Working Assumption | Team / Bichesq | Multiple strategies discussed in session; to be consolidated into a single coherent workflow once the team has hands-on experience applying them [page:4] |

---

## 4. Open Decisions

These decisions are important and should be resolved as early as possible.

| Date Logged | Area | Question | Status | Owner | Why It Matters |
|---|---|---|---|---|---|
| 2026-05-18 | Product structure | Is this one application, multiple apps in one repo, or multiple repos? | Decided | Team | Resolved in May 21 session: separate applications sharing a common auth layer [page:3] |
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
| 2026-05-21 | Assessments as a separate module | Should assessments be their own standalone module, separate from the learning platform, or remain integrated within it? | Open | Team / Kris | Payload CMS may not be optimally suited for dynamic assessment logic; separating it could give more flexibility but adds architectural complexity [page:3] |
| 2026-05-21 | Student presentations / assignments | Should practical presentations or assignments be required at the module level or only at the program level? | Open | Team / Kris | Number of required presentations scales significantly as student numbers grow; level needs to be decided before the assessment system is built [page:3] |
| 2026-05-21 | Payload CMS for learning platform | Is Payload CMS the right tool for the learning portal given the dynamic assessment and progress-tracking requirements, or does it need to be reconsidered? | Open | Team / Bichesq |

## 5. Decision Candidates for Next Session

These should be explicitly reviewed and either marked **Decided** or kept **Open** with blockers.

### Highest-priority decisions
1. Monorepo vs separate repos (repo structure)
2. Assessments as a separate module vs integrated in the learning platform
3. Payload CMS suitability for the learning portal
4. Student presentation / assignment level (module vs program)
5. Invite code entry UX (copy-paste vs auto-link)
6. reCAPTCHA provider and cost direction
7. Assessment question design and storage
8. Placement assessment — onboarding vs learning platform
9. Advanced student bypass mechanism
10. Home screen detailed design (alerts, updates, progress, calendar integration)
11. Ticketing system tool selection and SLA timeframes (Help Desk and Service Desk)
12. Service Desk approval workflow and responsible parties
13. First demo flow and scope
14. Design system direction
15. Minimal dashboard definition
16. Jira board starting epic order [page:1]

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
| 2026-05-25 | Obsidian as project knowledge vault | Obsidian is adopted as the team's second brain; Claude Code continuously populates the Obsidian vault via a dedicated skill so that future sessions require smaller context windows | Decided | Team / Kris | Agreed in May 25 session as the primary long-term strategy for managing growing project knowledge; see also Section 2 [page:4] |
| 2026-05-25 | AI session continuity and token management | A `handoff.md` file, model routing, OLLAMA for local inference, prompt caching for shared files, a terminal token monitoring status bar, and CLAUDE.md project instructions are all under consideration as part of an integrated system | Working Assumption | Team / Bichesq | Multiple strategies surfaced in May 25 session; to be consolidated into a coherent workflow through hands-on experience; see Section 3 for full detail [page:4] |
| 2026-05-25 | LinkedIn posting ownership | Harriet coordinates LinkedIn posting alongside Enda and Samoa; student work deemed noteworthy should be posted by the student first, then reshared by Cloud Heroes | Decided | Team / Harriet | Assigned by Kris in May 25 session; resolves the open question from May 21 [page:4] |
| 2026-05-25 | Meeting recap as regular routine | Each session begins with a brief review of what was discussed in the previous session to maintain continuity without re-reading all notes | Decided | Team / Kris | Proposed and agreed at the start of the May 25 session [page:4] |