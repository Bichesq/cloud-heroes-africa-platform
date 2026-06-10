# Cloud Heroes Africa Decision Log

> Purpose: record project decisions, working assumptions, unresolved questions, and process changes for the Cloud Heroes Africa platform.

This file should be updated whenever the team makes a meaningful decision during planning, implementation, experimentation, or review.

***

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

***

## 2. Confirmed Decisions

These reflect decisions that are already clear from the meeting discussion or from repo and planning work already established.

| Date | Area | Decision | Status | Owner | Reason / Notes |
|---|---|---|---|---|---|
| 2026-05-18 | Delivery approach | Begin planning and pre-building before AWS approval is finalized | Decided | Team | Avoid project stagnation and gain practical build experience while waiting |
| 2026-05-18 | Development leadership | Bichesq leads development in the central repository | Decided | Team | Kris explicitly asked Bichesq to lead development and commit centrally |
| 2026-05-18 | Repo workflow | Use a shared repository as the main implementation path | Decided | Team | Team wants a central repo that others can pull, fork, or branch from |
| 2026-05-18 | Planning approach | Build a documentation skeleton before large-scale Claude implementation | Decided | Team | Documentation is intended to become the project context for Claude |
| 2026-05-18 | Collaboration model | Team members may fork or branch to test alternate approaches | Decided | Team | Experimentation is encouraged, with findings reviewed and potentially merged back |
| 2026-05-18 | Demo direction | Aim to produce a working demo for Yannick, Samoa, Enda, and other stakeholders | Decided | Team | The team wants to show something concrete, not just a proposal |
| 2026-05-18 | Planning output | Documentation should later be translated into Jira epics, stories, and subtasks | Decided | Team / Harriet | Kris explicitly linked the planning docs to later Jira structuring |
| 2026-05-18 | Process standardization | Git commit and PR standards should be defined for this project | Decided | Team | Explicit action item from the meeting |
| 2026-05-18 | Invite code scope | Invite codes are one-to-one, unique per student, and temporary (not bulk batch codes) | Decided | Team | Bulk codes risk leakage; one-to-one tied to student email is more secure |
| 2026-05-18 | Access control | Platform access is gated by an invite code; open self-registration is not allowed | Decided | Team | Prevents unvetted users from entering the platform; ensures trust and quality control |
| 2026-05-18 | Student intake flow | An external form (e.g., Google Form) is used to collect student interest; a human reviews responses before invites are sent | Decided | Team | Human-in-the-loop vetting ensures only suitable students receive invite codes |
| 2026-05-18 | Invite code delivery | The platform generates invite codes and sends them via email to vetted students | Decided | Team | Codes tied to student email; email delivery confirmed over SMS or manual sharing |
| 2026-05-18 | Registration gateway | Student must provide their email + invite code + complete reCAPTCHA to begin registration | Decided | Team | Combination of email and code is harder to brute-force; reCAPTCHA blocks bot attacks |
| 2026-05-18 | Authentication method | Google OAuth is used to complete registration after invite code verification | Decided | Team | Reduces typing; pulls first name, last name, and email from Google account |
| 2026-05-18 | Profile completion gate | Profile completion is not a hard blocker at login; students may explore the platform but must complete their profile before taking any courses | Decided | Team / Bichesq | Gives students flexibility to explore while enforcing completion before serious commitment |
| 2026-05-18 | Assessment placement | Assessments belong inside the learning platform, not as a standalone external step in the onboarding flow | Decided | Team / Kris | Keeps education delivery and assessment together; avoids duplicating functionality outside the learning platform |
| 2026-05-18 | Assessment hierarchy | Assessments are tiered: Unit assessment → Module assessment → Program assessment | Decided | Team | Mirrors the course hierarchy (Program > Module > Unit); each level has its own competency check |
| 2026-05-21 | Application architecture | The registration/onboarding module and the learning platform are separate applications, sharing a common authentication mechanism | Decided | Team / Kris | Avoids monolith; allows each app to scale independently |
| 2026-05-21 | Shared authentication | Authentication is the common layer across all platform modules; each new module piggybacks on the same auth setup | Decided | Team / Kris | Keeps login consistent across separate apps without duplicating auth logic |
| 2026-05-21 | Student help sessions | Open help sessions follow a volunteer-slot model: volunteers register for recurring slots (e.g., Wednesday/Saturday); sessions only open if a student has booked | Decided | Team / Kris | Prevents empty sessions; makes volunteer time purposeful; students book with topic so tutor can prepare |
| 2026-05-21 | Help request triage | Student help requests are handled asynchronously first; only escalated to a calendar session if the async response is insufficient | Decided | Team / Bichesq | Avoids blocking students on scheduling; keeps simple questions fast and light |
| 2026-05-25 | Help Desk vs Service Desk | Help Desk (content and learning queries) and Service Desk (infrastructure, account, and MFA issues) are two distinct modules with separate workflows | Decided | Team / Kris | Prevents misrouting of requests; ensures each type of issue is handled by the right people with the right process |
| 2026-05-25 | Help button placement | A help request form / entry point is embedded directly within each learning unit on the learning portal, not on a standalone page | Decided | Team / Kris | Provides immediate context when a student submits a help request |
| 2026-05-25 | Student support chat model | Student support uses a many-to-one transparent model; no private one-to-one DMs between individual team members and students | Decided | Team / Kris | Ensures transparency, accountability, and a full audit trail |
| 2026-05-25 | Obsidian as second brain | Obsidian will be used as the team's second brain / knowledge vault; Claude Code continuously adds project knowledge to the Obsidian vault via a dedicated skill | Decided | Team / Kris | Strategy for managing growing project knowledge without bloating the AI context window |
| 2026-05-28 | Help Desk interaction model | Help Desk will evolve toward a Stack Overflow-style threaded support model where students submit a short and detailed description, see matching existing answers first, and create a new community-visible thread only if no existing answer solves the problem | Decided | Team / Kris | Reframed away from a simple form-first model toward searchable threads that also build the knowledge base |
| 2026-05-28 | Help Desk escalation path | Help requests start in the community-visible thread workflow and escalate to the Help Desk queue if unresolved; if still unresolved, they can be escalated further to a booked live session | Decided | Team / Kris / Bichesq | Staged resolution path: existing answers → community responses → Help Desk assignment → optional live session |
| 2026-05-28 | Knowledge base creation model | Resolved Help Desk threads can become reusable knowledge base content, and Help Desk staff can also create KB articles directly when recurring questions appear | Decided | Team / Kris | Supports self-service and creates reusable institutional knowledge |
| 2026-05-28 | Help Desk intake requirement | Help Desk intake should capture at least a short description and a long description of the student's problem | Decided | Team / Kris / Bichesq | Core submission fields needed to route and diagnose requests; see June 4 refinement for student-facing simplification |
| 2026-05-28 | Support data preservation | When legitimate troubleshooting questions are raised in Telegram or similar social channels, Help Desk may manually create a ticket on the student's behalf and redirect the solution back to the platform thread | Decided | Team / Kris | Preserves knowledge that would otherwise be lost in chat streams |
| 2026-06-01 | Help Desk ticket core fields | Core ticket fields are: student, topic/context association, description, status with paired date log, close date, resolution summary, assigned-to, and resolved-by | Decided | Team / Kris | June 1 defined the operational fields needed for routing, ownership, closure, and knowledge capture; June 4 refined the student-facing intake so students only enter a question and context/description, while topic/module/unit/program association is system-derived or staff-tagged later |
| 2026-06-01 | Ticket status values | Ticket statuses are: Open, Pending, Responded, Resolved, and Cancelled / Out-of-scope | Decided | Team / Kris | Distinguishes active, waiting, answered, resolved, and non-actionable states |
| 2026-06-01 | Status-date pairing | Every status change should be stored together with its date as a chronological status log | Decided | Team / Kris | Supports analytics, SLA tracking, and historical review |
| 2026-06-01 | Ticket closure workflow | Ticket closure requires a resolution summary and student consent to close; if the student does not respond within about two days, a second-review process is triggered and another team member can approve closure | Decided | Team / Kris / Vin | Balances student consent with operational reality |
| 2026-06-01 | Resolution summary requirement | A resolution summary is required before closure, must clearly explain how the issue was resolved, and must be accepted by the student or approved via second review if the student is unresponsive | Decided | Team / Kris / Elvis | Summary must be strong enough to become future-facing knowledge |
| 2026-06-01 | Knowledge base content model | Closed Help Desk tickets can feed the knowledge base using the topic, description, and final resolution summary, with contributor attribution where appropriate | Decided | Team / Kris | Closure quality directly affects KB quality |
| 2026-06-01 | KB tagging and categorization | Knowledge base categorization is done by staff after resolution, not by students during intake; tagging should use associated program, module, unit, or broader topic where relevant | Decided | Team / Kris | Students should not be burdened with choosing taxonomy during submission |
| 2026-06-01 | Ticket ownership | Help Desk tickets must support explicit ownership through an assigned-to field so difficult tickets are not ignored | Decided | Team / Allen / Kris | Ownership prevents hard questions from remaining untouched |
| 2026-06-01 | Student rating and satisfaction surveys | Student ratings and satisfaction measurement are deferred to Phase 2, not included in Phase 1 | Decided | Team / Kris / Elvis | Rating is premature before staffing and internal SLA baselines are established |
| 2026-06-01 | Help Desk SLA timeframes and escalation triggers | Help Desk SLAs should exist internally in Phase 1 for team monitoring and escalation, but should not yet be publicly committed to students | Decided | Team / Kris | Team should establish a baseline first before broadcasting service commitments |
| 2026-06-04 | Platform architecture | The platform is implemented as five platform apps — Student Hub, Learning Platform, Learning Management, Administration, and Donor Hub — with Help Desk as an additional separate support app, all sharing a common backend datastore and separated mainly at the frontend and API layers | Decided | Team / Kris / Bichesq | Team explicitly aligned on one shared database with multiple frontends/APIs and distinct app boundaries for scale, deployment independence, and cleaner responsibilities |
| 2026-06-04 | Help Desk app architecture | Help Desk is its own app/codebase with at least two views: an admin/staff management view and a restricted community-facing view for students and volunteers | Decided | Team / Kris | Keeps ticket operations separate while still supporting community participation and admin-only controls |
| 2026-06-04 | Help Desk student intake simplification | Student-entered Help Desk intake is simplified to just a question and supporting context/description; student identity and course context should be pre-populated or derived from where the ticket is created | Decided | Team / Kris | Reduces student confusion and improves data quality by avoiding unnecessary categorization questions at intake |
| 2026-06-04 | Help Desk topic association | Topic, program, module, and unit associations should be derived from the student's current context or added by staff later rather than requiring the student to classify the request manually | Decided | Team / Kris | Students may classify inaccurately; system-derived and staff-reviewed context is more reliable |
| 2026-06-04 | Help Desk knowledge base pre-check | When a student begins entering a Help Desk question, the system should search for matching knowledge base entries before creating a new ticket | Decided | Team / Kris | Reduces duplicate tickets and encourages self-service before new thread creation |
| 2026-06-04 | Help Desk duplicate prevention | Students should be able to see their active tickets and the system should guard against duplicate submissions of the same issue | Decided | Team / Kris | Prevents confusion, repeated submissions, and unnecessary queue duplication |
| 2026-06-04 | Ticket action outcome tracking | Each Help Desk ticket must record how it was actioned, such as KB article, course update only, or another internal outcome | Decided | Team / Kris | Some tickets should become reusable KB content while others should only trigger internal content fixes |
| 2026-06-04 | KB visibility control | Not every resolved Help Desk ticket becomes a visible knowledge base article; some tickets remain internal when the proper resolution is to update the course rather than publish a public article | Decided | Team / Kris | Keeps the KB high-value and avoids publishing items that are better resolved by improving course content directly |
| 2026-06-04 | Help Desk vs Service Desk definition | Help Desk is for in-platform learning, content, career, and student-support issues raised by users who can already access the platform; Service Desk is for out-of-platform access, account, MFA, recovery, and broader technical incident issues affecting entry to the platform | Decided | Team / Kris | June 4 clarified the boundary crisply so students and staff can distinguish support paths |
| 2026-06-04 | Learning Management permissions | People who create and manage programs, modules, and units do not manage students directly; they may later see restricted aggregate stats, but student account and access operations belong elsewhere | Decided | Team / Kris | Separates educational content management from student administration and protects privacy |
| 2026-06-04 | Program ownership and delegated edit rights | Programs have owners; by default, non-owners should only have read-only access, while a super admin can grant additional edit rights to other contributors when needed | Decided | Team / Kris | Supports collaboration without losing accountability or blocking urgent fixes when original owners are unavailable |
| 2026-06-04 | Learning platform separation | The Learning Platform is kept separate from the Student Hub and Learning Management so content delivery and assessment execution can evolve and deploy independently from the hub and authoring tools | Decided | Team / Kris / Bichesq | Reduces coupling and allows more frequent changes to the content-viewing experience without destabilizing other apps |
| 2026-06-04 | Delivery workflow | The team will lean toward a Kanban-style delivery flow rather than strict Scrum for the POC and early build stages | Decided | Team / Kris | The work is still being shaped module by module, making continuous flow more practical than rigid sprint structure |

***

## 3. Working Assumptions

These are currently useful assumptions that let the team move forward, but they should still be reviewed in future planning sessions.

| Date | Area | Working Assumption | Status | Owner | Reason / Notes |
|---|---|---|---|---|---|
| 2026-05-18 | Product shape | The platform may involve around three application surfaces | Replaced | Team | Superseded by the June 4 architecture decision establishing five platform apps plus a separate Help Desk support app |
| 2026-05-18 | First implementation slice | Onboarding is the most logical first slice: login, registration, invite verification, assessment, dashboard entry | Working Assumption | Bichesq | These were the concrete screens and flows named in the planning discussion |
| 2026-05-18 | Claude workflow | Claude will be used incrementally in bounded tasks rather than one giant build session | Working Assumption | Team | Meeting emphasized session boundaries, revisions, token limits, and structured workflow |
| 2026-05-18 | Demo hosting | The first demo may run on a smaller or simplified environment before final AWS setup | Working Assumption | Team | Demo hosting details are still flexible |
| 2026-05-18 | Validation path | Internal team members plus some outside testers will likely be the first evaluators of the platform | Working Assumption | Team | User base is expected to be internal/community-led at first |
| 2026-05-18 | Jira workflow | Harriet may use repo documents, rather than raw meeting notes, as the main input for Jira creation | Working Assumption | Harriet / Team | Implied by the plan to turn the documentation into stories and subtasks |
| 2026-05-21 | Unit completion status | A two-status model is being designed for: "Completed" and "Competent" / "Verified"; a student can complete a unit without yet being competent | Working Assumption | Team / Kris | Proposed and used as design basis, but not yet formally signed off |
| 2026-05-21 | Knowledge check delivery | Unit knowledge checks are treated as separate from the course content itself; a student finishes a unit and then receives / unlocks a knowledge check as a distinct step | Working Assumption | Team / Kris | Keeps content delivery and verification separable |
| 2026-05-21 | Knowledge check failure flow | If a student fails a knowledge check, the unit status resets to "Retake"; after a second failure, a team member is notified to follow up | Working Assumption | Team / Kris | Balances automation with human support |
| 2026-05-25 | Ticketing system intention | Both Help Desk and Service Desk requests will eventually be managed through a formal ticketing system with SLAs | Working Assumption | Team / Kris | Overall direction agreed, but tool selection and exact workflows remain open |
| 2026-05-25 | Service Desk approval process | Sensitive Service Desk actions (e.g., MFA resets, account access changes) will require a secondary approval step | Working Assumption | Team / Kris | Directional agreement exists, but exact workflow is not yet designed |
| 2026-05-25 | AI session continuity and token management | A `handoff.md` file, model routing, OLLAMA for local inference, prompt caching for shared files, token monitoring, and CLAUDE.md instructions are under consideration as part of an integrated system | Working Assumption | Team / Bichesq | Strategies still being consolidated through use |
| 2026-05-28 | Help Desk SLA window | Community-first Help Desk threads may be given about two days before escalation into the formal Help Desk queue | Working Assumption | Team / Kris | June 1 confirmed internal-only SLAs, but exact operational timings are still soft |
| 2026-05-28 | Queue specialization | The Help Desk queue may later be split by expertise areas such as networking, security, compute, storage, or database, though a general queue may be used first | Working Assumption | Team / Kris | Queue specialization remains undecided |
| 2026-05-28 | Teams/API notifications | Help Desk tickets may later be broadcast into a staff Teams group using a service account with Microsoft Graph API permissions | Working Assumption | Team / Kris / Vin | Capability discussed, workflow not finalized |
| 2026-05-28 | Help Desk performance tracking | Help Desk work may eventually include a points/performance model where the person who truly resolves the issue receives credit | Working Assumption | Team / Kris | Fairness and tracking were emphasized, but rules are not yet defined |
| 2026-05-28 | Help Desk flow documentation | Kris will try to prepare process-flow diagrams for Help Desk before the next session so the team can review the workflow visually | Working Assumption | Kris | Planned follow-up artifact, not yet a confirmed process asset |
| 2026-06-01 | Donors module investigation | Tax receipt requirements for the Donors module must be investigated before donor-related flows are designed in detail | Working Assumption | Team / Kris | Important prerequisite, but not yet a product decision |
| 2026-06-04 | Help Desk moderation before public visibility | Help Desk questions should likely be scanned for vulgar or inappropriate content before becoming visible to the community, potentially using AI moderation | Working Assumption | Team / Kris | The policy direction was clear, but the implementation mechanism and exact moderation rules were not finalized |

***

## 4. Open Decisions

These decisions are important and should be resolved as early as possible.

| Date Logged | Area | Question | Status | Owner | Why It Matters |
|---|---|---|---|---|---|
| 2026-05-18 | Repo structure | If there are multiple application surfaces, should this be a monorepo? | Open | Bichesq / Team | Affects development workflow and implementation boundaries |
| 2026-05-18 | Assessment design | What questions will the assessment ask, and how should answers be stored? | Open | Team | Needed before assessment implementation |
| 2026-05-18 | Demo scope | What exactly must work live in the first stakeholder demo, and what can be mocked? | Open | Team | Critical for scoping the first build |
| 2026-05-18 | Design system | What UI/design system direction should the app follow? | Open | Team | Required for implementation consistency |
| 2026-05-18 | API structure | What API style and conventions should be standardized? | Open | Team | Affects Claude prompt quality and implementation consistency |
| 2026-05-18 | Infrastructure | What minimum infrastructure is required for the first demo? | Open | Team | Needed to avoid overbuilding too early |
| 2026-05-18 | Board interaction | Should the board be brought in before implementation starts, or after a first internal build exists? | Open | Team | Strategic sequencing question |
| 2026-05-18 | Invite code entry UX | Should the invite code be entered manually (copy-paste) or auto-populated via a link in the email? | Open | Team / Allen | Affects onboarding UX and security posture |
| 2026-05-18 | Advanced student bypass | How should advanced students bypass lower-level modules — admin-granted exception or a separate self-assessment? | Open | Team / Kris | Needs a controlled, fair mechanism |
| 2026-05-18 | Placement assessment | Should a placement/level assessment be included during onboarding registration, or handled entirely within the learning platform? | Open | Team / Bichesq | Needed to place students at the right level |
| 2026-05-21 | Assessments as a separate module | Should assessments be their own standalone module, separate from the learning platform, or remain integrated within it? | Open | Team / Kris | Affects flexibility and architecture |
| 2026-05-21 | Student presentations / assignments | Should practical presentations or assignments be required at the module level or only at the program level? | Open | Team / Kris | Affects assessment workload and scale |
| 2026-05-21 | Payload CMS for learning platform | Is Payload CMS the right tool for the learning portal given the dynamic assessment and progress-tracking requirements, or does it need to be reconsidered? | Open | Team / Bichesq | Tool choice affects core implementation strategy |
| 2026-05-28 | Help Desk submission UX | Should the student submission flow explicitly offer branching choices such as community-first, Help Desk-first, or live-session intent at intake, or should all requests default into the same threaded workflow first? | Open | Team / Kris / Bichesq | Final intake UX and routing choice is still unresolved |
| 2026-05-28 | Immediate-help classification | What should count as an "immediate help" case versus a standard asynchronous support case, and how should those categories affect routing and expectations? | Open | Team / Flora / Vin | Affects guidance, turnaround promises, and routing |
| 2026-05-28 | Service Desk intake and recovery process | How should Service Desk handle technical issues such as lost email access, account recovery, and identity verification when the user cannot access their normal communication channel? | Open | Team / Kris | High-risk process that needs careful design |
| 2026-06-01 | Help Desk queue structure | Should the Help Desk queue be a single general queue first, or be split early by expertise areas such as networking, security, compute, storage, or database? | Open | Team / Kris | Affects routing, staffing, and scaling |
| 2026-06-04 | Service Desk intake channel | What should be the exact Service Desk intake channel: support email, web form, direct queue integration, or a hybrid approach? | Open | Team / Kris | The team agreed Service Desk is definitely outside the platform, but the exact intake channel and flow are still to be finalized |
| 2026-06-04 | Incident threshold | At what point should repeated Service Desk complaints about the same access issue be promoted from individual requests to a platform incident? | Open | Team / Kris | Affects escalation, communications, and operational response |
| 2026-06-04 | Service Desk verification workflow | What exact verification questions and steps should be required before account recovery, MFA reset, or similar sensitive Service Desk actions? | Open | Team / Kris | Needed to prevent account compromise while still helping legitimate users |
| 2026-06-04 | Student hub vs learning platform boundary | Which exact student-facing functions belong in the Student Hub versus the Learning Platform, and what should remain separated at launch? | Open | Team / Kris / Bichesq | Important for clean app boundaries and implementation sequencing |

## 5. Decision Candidates for Next Session

These should be explicitly reviewed and either marked **Decided** or kept **Open** with blockers.

### Highest-priority decisions
1. Monorepo vs separate repos
2. Assessments as a separate module vs integrated in the learning platform
3. Payload CMS suitability for the learning portal
4. Student presentation / assignment level (module vs program)
5. Invite code entry UX (copy-paste vs auto-link)
6. reCAPTCHA provider and cost direction
7. Assessment question design and storage
8. Placement assessment — onboarding vs learning platform
9. Advanced student bypass mechanism
10. Home screen detailed design (alerts, updates, progress, calendar integration)
11. Ticketing system tool selection and internal SLA operational details
12. Service Desk approval workflow and responsible parties
13. First demo flow and scope
14. Design system direction
15. Minimal dashboard definition
16. Jira board starting epic order
17. Help Desk submission UX: single threaded intake vs explicit branching choices
18. Help Desk queue structure: general queue vs expertise-based queues
19. Service Desk intake, identity verification, and lost-email recovery process
20. Immediate-help classification and routing criteria
21. Incident threshold for repeated Service Desk complaints
22. Student Hub vs Learning Platform functional boundary
23. Service Desk intake channel: email, form, queue, or hybrid

***

## 6. Process Decisions

These entries track how the team works, not just what the product does.

| Date | Area | Decision / Assumption | Status | Owner | Notes |
|---|---|---|---|---|---|
| 2026-05-18 | Collaboration | Central implementation should happen through Bichesq's lens and direction | Decided | Team | Kris explicitly described the team observing and supporting through Bichesq's workflow |
| 2026-05-18 | Experimentation | Experiments are allowed if contributors want to try alternate ideas independently | Decided | Team | These can happen through clones, forks, or branches and then be reviewed later |
| 2026-05-18 | Session management | The team wants to define how to stop and resume Claude coding sessions cleanly | Open | Team | Major process concern raised during the meeting |
| 2026-05-18 | AI skills usage | The team wants to explore different Claude skills and possibly multi-agent approaches later | Working Assumption | Team | Mentioned as an area for experimentation rather than an immediate requirement |
| 2026-05-18 | Git conventions | Commit wording and PR wording should be standardized | Decided | Team | Explicit action item from meeting notes |
| 2026-05-18 | AI token efficiency | Use Plan Mode in Claude before coding to reduce unnecessary context and token usage | Decided | Team | Token bloat identified as a key risk to productive AI sessions |
| 2026-05-18 | AI context management | Be highly specific in prompts and limit the number of active tools / MCPs to avoid context window bloat | Decided | Team | Practical discipline to adopt immediately across coding sessions |
| 2026-05-18 | Local MCP servers | Team members should research and experiment with local MCP server setups to improve token efficiency | Working Assumption | Team | Findings to be shared at a later sync |
| 2026-05-18 | AI tool exploration | Team members should test alternative AI/brain-mapping tools to identify context-reduction strategies | Working Assumption | Team | Encouraged, but not a firm commitment |
| 2026-05-25 | Obsidian as project knowledge vault | Obsidian is adopted as the team's second brain; Claude Code continuously populates the Obsidian vault via a dedicated skill so that future sessions require smaller context windows | Decided | Team / Kris | Long-term strategy for managing growing project knowledge |
| 2026-05-25 | AI session continuity and token management | A `handoff.md` file, model routing, OLLAMA for local inference, prompt caching for shared files, a terminal token monitoring status bar, and CLAUDE.md project instructions are under consideration as part of an integrated system | Working Assumption | Team / Bichesq | Multiple strategies surfaced; still being consolidated |
| 2026-05-25 | LinkedIn posting ownership | Harriet coordinates LinkedIn posting alongside Enda and Samoa; student work deemed noteworthy should be posted by the student first, then reshared by Cloud Heroes | Decided | Team / Harriet | Ownership assigned explicitly |
| 2026-05-25 | Meeting recap as regular routine | Each session begins with a brief review of what was discussed in the previous session to maintain continuity without re-reading all notes | Decided | Team / Kris | Agreed routine |
| 2026-05-28 | Requirements-first planning | The team will continue using discussion-heavy planning sessions to refine process details before asking Claude to implement modules | Decided | Team / Kris | Claude should work from explicit requirements instead of assumptions |
| 2026-05-28 | Next-session sequencing | The next session should first wrap up Help Desk, then define the Service Desk process, then return to the student platform | Replaced | Team / Kris | This sequencing guided the next session and has now been superseded by the June 4 planning sequence |
| 2026-06-04 | Delivery planning sequence | With the platform partitions now clearer, the team should move module by module, create detailed requirements, define timelines, and identify ownership before implementation begins | Decided | Team / Kris | June 4 explicitly shifted the team toward structured per-module planning after clarifying the app boundaries |
| 2026-06-04 | Divide-and-conquer implementation | Team members may split work across different modules and then circle back to review and integrate learnings | Decided | Team / Kris / Bichesq | Kris explicitly proposed dividing responsibility across modules while coordinating through shared planning |