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

These reflect decisions that are already clear from the meeting discussion or from the repo setup work already being established.

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
| 2026-05-21 | Application architecture | The registration/onboarding module and the learning platform are separate applications, sharing a common authentication mechanism | Decided | Team / Kris | Avoids monolith; allows each app to scale independently; Kris and Bichesq agreed explicitly |
| 2026-05-21 | Shared authentication | Authentication is the common layer across all platform modules; each new module piggybacks on the same auth setup | Decided | Team / Kris | Keeps login consistent across separate apps without duplicating auth logic |
| 2026-05-21 | Student help sessions | Open help sessions follow a volunteer-slot model: volunteers register for recurring slots (e.g., Wednesday/Saturday); sessions only open if a student has booked | Decided | Team / Kris | Prevents empty sessions; makes volunteer time purposeful; students book with topic so tutor can prepare |
| 2026-05-21 | Help request triage | Student help requests are handled asynchronously first (chat / short written answer); only escalated to a calendar session if the async response is insufficient | Decided | Team / Bichesq | Avoids blocking students on scheduling; keeps simple questions fast and light |
| 2026-05-25 | Help Desk vs Service Desk | Help Desk (content and learning queries) and Service Desk (infrastructure, account, and MFA issues) are two distinct modules with separate workflows | Decided | Team / Kris | Prevents misrouting of requests; ensures each type of issue is handled by the right people with the right process |
| 2026-05-25 | Help button placement | A help request form / button is embedded directly within each learning unit on the learning portal, not on a standalone page | Decided | Team / Kris | Provides immediate context (which unit, which slide) when a student submits a help request |
| 2026-05-25 | Student support chat model | Student support uses a many-to-one chat model: multiple team members can communicate with one student in a shared, fully logged channel; no private one-to-one DMs between individual team members and students | Decided | Team / Kris | Ensures transparency, accountability, and a full audit trail; allows senior members to monitor and intervene if needed |
| 2026-05-25 | Obsidian as second brain | Obsidian will be used as the team's second brain / knowledge vault; Claude Code continuously adds project knowledge to the Obsidian vault via a dedicated skill, reducing the need for large context windows in future sessions | Decided | Team / Kris | Discussed and agreed in session as the primary strategy for managing growing project knowledge without bloating the AI context window |
| 2026-05-28 | Help Desk interaction model | Help Desk will evolve toward a Stack Overflow-style threaded support model where students submit a short and detailed description, see matching existing answers first, and create a new community-visible thread only if no existing answer solves the problem | Decided | Team / Kris | Kris explicitly reframed the design away from a simple form-first model toward searchable threads that also build the knowledge base |
| 2026-05-28 | Help Desk escalation path | Help requests start in the community-visible thread workflow and escalate to the Help Desk queue if unresolved; if still unresolved, they can be escalated further to a booked live session | Decided | Team / Kris / Bichesq | The team aligned on a staged resolution path: existing answers → community responses → Help Desk assignment → optional live session |
| 2026-05-28 | Knowledge base creation model | Resolved Help Desk threads double as knowledge base content, and Help Desk staff can also create KB articles directly when recurring questions appear | Decided | Team / Kris | This avoids repeated re-research, supports self-service, and creates a reusable support memory over time |
| 2026-05-28 | Help Desk intake requirement | Help Desk intake should capture at least a short description and a long description of the student's problem | Decided | Team / Kris / Bichesq | Kris and Bichesq explicitly converged on these as the core initial submission fields needed to route and diagnose requests |
| 2026-05-28 | Support data preservation | When legitimate troubleshooting questions are raised in Telegram or similar social channels, Help Desk may manually create a ticket on the student's behalf and redirect the solution back to the platform thread | Decided | Team / Kris | This preserves institutional knowledge that would otherwise be lost in chat streams and keeps the official resolution trail in the platform |
| 2026-06-01 | Help Desk ticket core fields | Core ticket fields are: student, topic, description, preferred channel, status with paired date log, close date, resolution summary, assigned-to, and resolved-by | Decided | Team / Kris | These were the fields the team explicitly converged on during the June 1 session to support routing, ownership, closure, and knowledge base creation |
| 2026-06-01 | Ticket status values | Ticket statuses are: Open, Pending, Responded, Resolved, and Cancelled / Out-of-scope | Decided | Team / Kris | The June 1 discussion distinguished active, waiting, answered, resolved, and non-actionable states |
| 2026-06-01 | Status-date pairing | Every status change should be stored together with its date as a chronological status log | Decided | Team / Kris | Kris proposed pairing each status with its own date to support analytics, SLA tracking, and clearer historical review |
| 2026-06-01 | Ticket closure workflow | Ticket closure requires a resolution summary and student consent to close; if the student does not respond within about two days, a second-review process is triggered and another team member can approve closure | Decided | Team / Kris / Vin | This was agreed after discussing time zone issues and the reality that satisfied students may not return just to click close |
| 2026-06-01 | Resolution summary requirement | A resolution summary is required before closure, must clearly explain how the issue was resolved, and must be accepted by the student or approved via second review if the student is unresponsive | Decided | Team / Kris / Elvis | The team agreed the summary must be strong enough to become future-facing knowledge, not just an internal note |
| 2026-06-01 | Knowledge base content model | Closed Help Desk tickets feed the knowledge base using the topic, description, and final resolution summary, with contributor attribution where appropriate | Decided | Team / Kris | Kris explicitly tied closure quality to KB quality and noted that the actual resolving contributor should be identifiable |
| 2026-06-01 | KB tagging and categorization | Knowledge base categorization is done by staff after resolution, not by students during intake; tagging should use associated program, module, unit, or broader topic where relevant | Decided | Team / Kris | The team agreed students should not be burdened with choosing taxonomy during submission because they may classify issues inaccurately |
| 2026-06-01 | Ticket ownership | Help Desk tickets must support explicit ownership through an assigned-to field so difficult tickets are not ignored | Decided | Team / Allen / Kris | Allen raised ownership as the mechanism to prevent hard questions from remaining untouched, and Kris agreed |
| 2026-06-01 | Student rating and satisfaction surveys | Student ratings and satisfaction measurement are deferred to Phase 2, not included in Phase 1 | Decided | Team / Kris / Elvis | The team agreed rating is premature before funding, staffing, and internal SLA baselines are established |
| 2026-06-01 | Help Desk SLA timeframes and escalation triggers | Help Desk SLAs should exist internally in Phase 1 for team monitoring and escalation, but should not yet be publicly committed to students | Decided | Team / Kris | Kris explicitly said the team should self-grade and establish a baseline first before broadcasting service commitments |
| 2026-06-04 | POC readiness | AWS POC approval is confirmed and the team can now proceed with implementation planning and scoped delivery | Decided | Team / Kris | Kris stated that the POC had been approved and that the team could now move forward |
| 2026-06-04 | Help Desk deployment model | Help Desk will be its own program / codebase rather than being embedded directly inside another app | Decided | Team / Kris | Kris explicitly described Help Desk as its own program that can run independently |
| 2026-06-04 | Shared backend architecture | The platform should use one shared data store with multiple APIs and multiple front-ends across the separate application surfaces | Decided | Team / Kris / Bichesq | The team aligned on a shared database for consistency while keeping app surfaces independently deployable and scalable |
| 2026-06-04 | Help Desk interface model | Help Desk includes both an admin interface and a community-facing interface, with community users having restricted permissions | Decided | Team / Kris | Kris described separate views for admins and community members, with tighter controls for non-admin users |
| 2026-06-04 | Help Desk student input scope | Students should not manually classify tickets by taxonomy/topic; the platform should ask for the question/context and derive or prefill relevant metadata where possible | Decided | Team / Kris / Bichesq | The team explicitly removed student-entered topic selection to avoid poor categorization and reduce friction |
| 2026-06-04 | Help Desk contextual tagging | Help Desk tickets should capture system-derived context such as student identity, current program, current module, and possibly unit at the time of submission | Decided | Team / Kris | Kris described using student/session context as a snapshot so tickets can be tied back to the right learning surface |
| 2026-06-04 | Knowledge base publication control | Resolved Help Desk tickets are not automatically made visible as public knowledge base content; each case must be reviewed to determine whether it becomes a KB article, triggers a course update, or remains internal only | Decided | Team / Kris | The team explicitly rejected automatic visibility for every resolved question and introduced an action classification step |
| 2026-06-04 | Community visibility moderation | Help Desk submissions should be scanned before becoming community-visible, potentially using AI to detect vulgar or inappropriate content | Decided | Team / Kris | Kris explicitly said questions/descriptions may need screening before community exposure |
| 2026-06-04 | Student hub chat history | Global chat history is removed from the Student Hub because Help Desk threads/articles now serve as the structured support interaction model | Decided | Team / Kris | Kris explicitly concluded that chat history was no longer needed under the new Help Desk design |
| 2026-06-04 | Platform naming | The student-facing gateway/landing application is named Student Hub | Decided | Team / Kris | Kris explicitly renamed the former “blue module” / gateway app to Student Hub |
| 2026-06-04 | Platform naming | The course/program/module creation application is named Learning Management | Decided | Team / Kris / Eddie | The team agreed Learning Management is the right name for the creator/management surface |
| 2026-06-04 | App partitioning | The platform is structured into five application surfaces: Student Hub, Learning Platform, Learning Management, Administration, and Donor Hub | Decided | Team / Kris / Bichesq | Kris enumerated the five apps and Bichesq agreed this matched the earlier direction toward separate services |
| 2026-06-04 | Learning delivery architecture | The Learning Platform remains a separate application from Student Hub and Learning Management, acting as the student-facing viewer/executor of assessments and course content | Decided | Team / Kris / Bichesq | Kris argued for separate deployment to reduce coupling, and Bichesq confirmed that this matched a prior decision direction |
| 2026-06-04 | Course ownership model | Program creators own their programs; other collaborators default to read-only unless granted elevated permissions such as edit/admin access; super-admin can override when necessary | Decided | Team / Kris / Eddie | The discussion settled on owner-based permissions with delegated access and admin override for continuity |
| 2026-06-04 | Course creator permissions | Course creators / volunteer professors should not have student-management capabilities inside Learning Management | Decided | Team / Kris / Eddie | The team agreed course authors may need analytics or limited visibility, but not direct student management controls |
| 2026-06-04 | POC scope | The minimum POC deliverable can be scoped to Student Hub, Learning Management, and Learning Platform, while Administration and Donor Hub may follow later | Decided | Team / Kris / Bichesq | Kris explicitly said the POC could be narrowed to these three core apps if needed |
| 2026-06-04 | Delivery workflow | Kanban is preferred over Scrum for the implementation phase | Decided | Team / Kris | Kris said Kanban would likely be easier than Scrum for this build approach |
| 2026-06-04 | Parallel build approach | Kris and Bichesq should divide work across modules and proceed in parallel, with Mithil potentially joining as an additional contributor | Decided | Team / Kris / Bichesq | Kris proposed a divide-and-conquer approach and Bichesq signaled readiness to proceed |

***

## 3. Working Assumptions

These are currently useful assumptions that let the team move forward, but they should still be reviewed in the next planning session.

| Date | Area | Working Assumption | Status | Owner | Reason / Notes |
|---|---|---|---|---|---|
| 2026-05-18 | Product shape | The platform may involve around three application surfaces | Replaced | Team | Replaced by the June 4 decision confirming five application surfaces: Student Hub, Learning Platform, Learning Management, Administration, and Donor Hub |
| 2026-05-18 | First implementation slice | Onboarding is the most logical first slice: login, registration, invite verification, assessment, dashboard entry | Working Assumption | Bichesq | These were the concrete screens and flows named in the planning discussion |
| 2026-05-18 | Claude workflow | Claude will be used incrementally in bounded tasks rather than one giant build session | Working Assumption | Team | Meeting emphasized session boundaries, revisions, token limits, and structured workflow |
| 2026-05-18 | Demo hosting | The first demo may run on a smaller or simplified environment before final AWS setup | Working Assumption | Team | Kris explicitly described showing a smaller-server demo before AWS approval |
| 2026-05-18 | Validation path | Internal team members plus some outside testers will likely be the first evaluators of the platform | Working Assumption | Team | Team discussed external testers and emphasized that the user base is effectively internal/community-led at first |
| 2026-05-18 | Jira workflow | Harriet may use repo documents, rather than raw meeting notes, as the main input for Jira creation | Working Assumption | Harriet / Team | This is implied by the plan to turn the documentation into stories and subtasks |
| 2026-05-21 | Unit completion status | A two-status model is being designed for: "Completed" (finished course content) and "Competent" / "Verified" (passed the knowledge check); a student can complete a unit without yet being competent | Working Assumption | Team / Kris | Proposed by Kris and used as the design basis for the unit flow; not yet formally signed off |
| 2026-05-21 | Knowledge check delivery | Unit knowledge checks are treated as separate from the course content itself; a student finishes a unit and then receives / unlocks a knowledge check as a distinct step | Working Assumption | Team / Kris | Allows knowledge checks to be delivered via different channels and keeps content delivery clean |
| 2026-05-21 | Knowledge check failure flow | If a student fails a knowledge check, the unit status resets to "Retake"; after a second failure, a team member is notified to follow up with the student | Working Assumption | Team / Kris | Balances automated enforcement with human support; not yet formally approved |
| 2026-05-25 | Ticketing system intention | Both Help Desk and Service Desk requests will eventually be managed through a formal ticketing system with SLAs | Working Assumption | Team / Kris | Ensures professional accountability and a paper trail for all support interactions; specific tool, SLA timeframes, and ownership not yet agreed |
| 2026-05-25 | Service Desk approval process | Sensitive Service Desk actions (e.g., MFA resets, account access changes) will require a secondary approval step to create a secure paper trail and prevent unauthorised changes | Working Assumption | Team / Kris | Directional agreement in session; specific approval workflow and responsible parties not yet designed |
| 2026-05-25 | AI session continuity and token management | A `handoff.md` file will be maintained at the end of each Claude coding session to summarise progress and define the starting point for the next session; additional techniques under consideration as part of an integrated system include model routing, OLLAMA, prompt caching, token monitoring, and project-level CLAUDE.md instructions | Working Assumption | Team / Bichesq | Multiple strategies discussed in session; to be consolidated into a single coherent workflow once the team has hands-on experience applying them |
| 2026-05-28 | Help Desk SLA window | Community-first Help Desk threads may be given about two days before automatic escalation into the formal Help Desk queue | Working Assumption | Team / Kris | Kris proposed two days as the initial internal SLA example, but it was framed as a working timeframe rather than a finalized policy |
| 2026-05-28 | Queue specialization | The Help Desk queue may later be split by expertise areas such as networking, security, compute, storage, or database, though a general queue may be used first | Working Assumption | Team / Kris | Kris described multiple possible queue structures without locking one in |
| 2026-05-28 | Teams/API notifications | Help Desk tickets may later be broadcast into a staff Teams group using a service account with Microsoft Graph API permissions to improve visibility and collaboration | Working Assumption | Team / Kris / Vin | The capability and rough technical direction were discussed, but the notification workflow was not finalized |
| 2026-05-28 | Help Desk performance tracking | Help Desk work may eventually include a points/performance model where the person who truly resolves the issue should close the ticket and receive credit | Working Assumption | Team / Kris | Kris emphasized fairness, monitoring, and performance tracking, but the scoring rules and governance are not yet defined |
| 2026-06-04 | Service Desk intake channel | Service Desk may use either a support email intake path, a web form, or a directly connected website form into the queue/database | Working Assumption | Team / Kris | Several intake options were discussed on June 4, but the team intentionally deferred final selection |
| 2026-06-04 | Learning Management scope expansion | Learning Management may also become the place where live events and possibly attached presentations are created and managed | Working Assumption | Team / Kris / Bichesq | The idea was raised as likely, but not fully locked down as a final module boundary |

***

## 4. Open Decisions

These decisions are important and should be resolved as early as possible.

| Date Logged | Area | Question | Status | Owner | Why It Matters |
|---|---|---|---|---|---|
| 2026-05-18 | Repo structure | If there are multiple application surfaces, should this be a monorepo? | Open | Bichesq / Team | Affects development workflow and implementation boundaries |
| 2026-05-18 | Assessment design | What questions will the assessment ask, and how should answers be stored? | Open | Team | Explicitly raised in the meeting |
| 2026-05-18 | Demo scope | What exactly must work live in the first stakeholder demo, and what can be mocked? | Open | Team | Critical for scoping the first build |
| 2026-05-18 | Design system | What UI/design system direction should the app follow? | Open | Team | Explicitly called out as a required planning topic |
| 2026-05-18 | API structure | What API style and conventions should be standardized? | Open | Team | Affects Claude prompt quality and implementation consistency |
| 2026-05-18 | Infrastructure | What minimum infrastructure is required for the first demo? | Open | Team | Needed to avoid overbuilding too early |
| 2026-05-18 | Board interaction | Should the board be brought in before implementation starts, or after a first internal build exists? | Open | Team | Kris explicitly framed this as an unresolved strategic question |
| 2026-05-18 | Invite code entry UX | Should the invite code be entered manually (copy-paste) or auto-populated via a link in the email? | Open | Team / Allen | Allen preferred copy-paste for security; Kris was open to either; not resolved |
| 2026-05-18 | Advanced student bypass | How should advanced students bypass lower-level modules — admin-granted exception or a separate self-assessment? | Open | Team / Kris | Risk that students exploit bypass for privilege; needs a controlled, fair mechanism |
| 2026-05-18 | Placement assessment | Should a placement/level assessment be included during onboarding registration, or handled entirely within the learning platform? | Open | Team / Bichesq | Bichesq suggested it may still be valid at registration for placing students at the right level |
| 2026-05-21 | Assessments as a separate module | Should assessments be their own standalone module, separate from the learning platform, or remain integrated within it? | Open | Team / Kris | Payload CMS may not be optimally suited for dynamic assessment logic; separating it could give more flexibility but adds architectural complexity |
| 2026-05-21 | Student presentations / assignments | Should practical presentations or assignments be required at the module level or only at the program level? | Open | Team / Kris | Number of required presentations scales significantly as student numbers grow; level needs to be decided before the assessment system is built |
| 2026-05-21 | Payload CMS for learning platform | Is Payload CMS the right tool for the learning portal given the dynamic assessment and progress-tracking requirements, or does it need to be reconsidered? | Open | Team / Bichesq | This affects content modeling, assessments, and long-term implementation flexibility |
| 2026-05-28 | Help Desk submission UX | Should the student submission flow explicitly offer branching choices such as community-first, Help Desk-first, or live-session intent at the moment of intake, or should all requests default into the same threaded workflow first? | Open | Team / Kris / Bichesq | The team discussed several intake branching options but did not settle the final UX or routing choice |
| 2026-05-28 | Immediate-help classification | What should count as an "immediate help" case versus a standard asynchronous support case, and how should those categories affect routing and expectations? | Open | Team / Flora / Vin | This affects student guidance, turnaround promises, and whether certain problems should be handled differently from the start |
| 2026-05-28 | Service Desk intake and recovery process | How should Service Desk handle technical issues such as lost email access, account recovery, and identity verification when the user cannot access their normal communication channel? | Open | Team / Kris | Kris highlighted this as the next major process question, especially because identity verification becomes harder when the original email is unavailable |
| 2026-06-01 | Help Desk queue structure | Should the Help Desk queue be a single general queue first, or be split early by expertise areas such as networking, security, compute, storage, or database? | Open | Team / Kris | The team discussed specialization but did not finalize the initial queue design, and that choice affects routing and staffing |
| 2026-06-04 | Service Desk intake channel | Should Service Desk start with a support email, a website form, or a direct queue/database-connected intake mechanism? | Open | Team / Kris | The June 4 meeting explored several viable options but deliberately left the intake channel unresolved |
| 2026-06-04 | Incident threshold | At what point should multiple Service Desk reports be promoted into a formal incident, and what triage rules should trigger that escalation? | Open | Team / Kris | This affects operational response, prioritization, and whether users can game urgency classifications |
| 2026-06-04 | Learning Management scope | Should live events and their attached presentation assets be formally created and managed inside Learning Management? | Open | Team / Kris / Bichesq | The idea surfaced during June 4 planning, but the boundary between content/event management and other modules is still not final |

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
16. Jira board starting epic order
17. Help Desk submission UX: single threaded intake vs explicit branching choices
18. Help Desk queue structure: general queue vs expertise-based queues
19. Service Desk intake, identity verification, and lost-email recovery process
20. Immediate-help classification and routing criteria
21. Service Desk intake channel: support email vs web form vs direct queue integration
22. Incident escalation thresholds and triage rules
23. Learning Management scope for events and attached presentations

***

## 6. Process Decisions

These entries track how the team works, not just what the product does.

| Date | Area | Decision / Assumption | Status | Owner | Notes |
|---|---|---|---|---|---|
| 2026-05-18 | Collaboration | Central implementation should happen through Bichesq's lens and direction | Decided | Team | Kris explicitly described the team observing and supporting through Bichesq's workflow |
| 2026-05-18 | Experimentation | Experiments are allowed if contributors want to try alternate ideas independently | Decided | Team | These can happen through clones, forks, or branches and then be reviewed later |
| 2026-05-18 | Session management | The team wants to define how to stop and resume Claude coding sessions cleanly | Open | Team | This was a major process concern raised during the meeting |
| 2026-05-18 | AI skills usage | The team wants to explore different Claude skills and possibly multi-agent approaches later | Working Assumption | Team | Mentioned as an area for experimentation rather than an immediate requirement |
| 2026-05-18 | Git conventions | Commit wording and PR wording should be standardized | Decided | Team | Explicit action item from meeting notes |
| 2026-05-18 | AI token efficiency | Use Plan Mode in Claude before coding to reduce unnecessary context and token usage | Decided | Team | Meeting identified token bloat as a key risk to productive AI sessions |
| 2026-05-18 | AI context management | Be highly specific in prompts and limit the number of active tools / MCPs to avoid context window bloat | Decided | Team | Discussed as a practical discipline to adopt immediately across all coding sessions |
| 2026-05-18 | Local MCP servers | Team members should research and experiment with local MCP server setups to improve token efficiency | Working Assumption | Team | Raised as an action item at the close of the May 18 session; findings to be shared at next sync |
| 2026-05-18 | AI tool exploration | Team members should test alternative AI/brain-mapping tools (e.g., Caveman Talk) to identify context-reduction strategies | Working Assumption | Team | Raised at close of session; not a firm commitment, but encouraged before next sync |
| 2026-05-25 | Obsidian as project knowledge vault | Obsidian is adopted as the team's second brain; Claude Code continuously populates the Obsidian vault via a dedicated skill so that future sessions require smaller context windows | Decided | Team / Kris | Agreed in May 25 session as the primary long-term strategy for managing growing project knowledge; see also Section 2 |
| 2026-05-25 | AI session continuity and token management | A `handoff.md` file, model routing, OLLAMA for local inference, prompt caching for shared files, a terminal token monitoring status bar, and CLAUDE.md project instructions are all under consideration as part of an integrated system | Working Assumption | Team / Bichesq | Multiple strategies surfaced in May 25 session; to be consolidated into a coherent workflow through hands-on experience; see Section 3 for full detail |
| 2026-05-25 | LinkedIn posting ownership | Harriet coordinates LinkedIn posting alongside Enda and Samoa; student work deemed noteworthy should be posted by the student first, then reshared by Cloud Heroes | Decided | Team / Harriet | Assigned by Kris in May 25 session; resolves the open question from May 21 |
| 2026-05-25 | Meeting recap as regular routine | Each session begins with a brief review of what was discussed in the previous session to maintain continuity without re-reading all notes | Decided | Team / Kris | Proposed and agreed at the start of the May 25 session |
| 2026-05-28 | Requirements-first planning | The team will continue using discussion-heavy planning sessions to refine process details before asking Claude to implement modules, so Claude can work from explicit requirements instead of assumptions | Decided | Team / Kris | Kris explicitly stated that the purpose of these exercises is to talk through flows, summarize them precisely, and then give Claude a proper plan |
| 2026-05-28 | Next-session sequencing | The next session should first wrap up Help Desk, then define the Service Desk process, then return to the student platform | Decided | Team / Kris | Kris closed the meeting by setting this exact sequence for the next sync |
| 2026-05-28 | Help Desk flow documentation | Kris will try to prepare process-flow diagrams for Help Desk before the next session so the team can review the workflow visually | Working Assumption | Kris | Kris said he would try over the weekend to create process flows for review, but this is still a planned follow-up rather than a completed process artifact |
| 2026-06-01 | Donors module investigation | Tax receipt requirements for the Donors module must be investigated before donor-related flows are designed in detail | Working Assumption | Team / Kris | Raised as an action item in the June 1 session; this is not a product decision yet, but it affects future donor workflow design |
| 2026-06-04 | Planning sequence | After confirming the application partitions, the team should work module-by-module, create detailed requirements for Claude, and then build incrementally | Decided | Team / Kris | Kris explicitly outlined this as the next-step workflow after finalizing the app partitions |
| 2026-06-04 | Requirements sharing | The design / requirements page link should be shared with the group after the meeting for continued coordination | Decided | Team / Bichesq / Kris | Closing action from the June 4 meeting to keep the group aligned on the working design document |