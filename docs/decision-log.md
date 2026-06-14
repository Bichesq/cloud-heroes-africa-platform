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
| 2026-05-18 | Invite code scope | Invite codes are one-to-one, unique per student, and temporary (not bulk batch codes) | Replaced | Team | Replaced by the June 11 decision to eliminate invite codes entirely in favour of an approved-email list |
| 2026-05-18 | Access control | Platform access is gated by an invite code; open self-registration is not allowed | Replaced | Team | Replaced by the June 11 decision: access is now gated by an admin-managed approved-email list checked during Google Auth |
| 2026-05-18 | Student intake flow | An external form (e.g., Google Form) is used to collect student interest; a human reviews responses before invites are sent | Decided | Team | Human-in-the-loop vetting ensures only suitable students are approved; still applies under the new email-list model |
| 2026-05-18 | Invite code delivery | The platform generates invite codes and sends them via email to vetted students | Replaced | Team | Replaced by the June 11 decision: approved students are added directly to an approved-email list; no invite code is generated or sent |
| 2026-05-18 | Registration gateway | Student must provide their email + invite code + complete reCAPTCHA to begin registration | Replaced | Team | Replaced by the June 11 decision: the invite code and reCAPTCHA steps are eliminated; Google Auth checks the approved-email list instead |
| 2026-05-18 | Authentication method | Google OAuth is used to complete registration after invite code verification | Decided | Team | Remains valid; Google Auth is still the authentication method, now checking the approved-email list instead of an invite code |
| 2026-05-18 | Profile completion gate | Profile completion is not a hard blocker at login; students may explore the platform but must complete their profile before taking any courses | Decided | Team / Bichesq | Gives students flexibility to explore while enforcing completion before serious commitment |
| 2026-05-18 | Assessment placement | Assessments belong inside the learning platform, not as a standalone external step in the onboarding flow | Decided | Team / Kris | Keeps education delivery and assessment together; avoids duplicating functionality outside the learning platform |
| 2026-05-18 | Assessment hierarchy | Assessments are tiered: Unit assessment → Module assessment → Program assessment | Decided | Team | Mirrors the course hierarchy (Program > Module > Unit); each level has its own competency check |
| 2026-05-21 | Application architecture | The registration/onboarding module and the learning platform are separate applications, sharing a common authentication mechanism | Decided | Team / Kris | Avoids monolith; allows each app to scale independently |
| 2026-05-21 | Shared authentication | Authentication is the common layer across all platform modules; each new module piggybacks on the same auth setup | Decided | Team / Kris | Keeps login consistent across separate apps without duplicating auth logic |
| 2026-05-21 | Student help sessions | Open help sessions follow a volunteer-slot model: volunteers register for recurring slots (e.g., Wednesday/Saturday); sessions only open if a student has booked | Decided | Team / Kris | Prevents empty sessions; makes volunteer time purposeful |
| 2026-05-21 | Help request triage | Student help requests are handled asynchronously first; only escalated to a calendar session if the async response is insufficient | Decided | Team / Bichesq | Avoids blocking students on scheduling; keeps simple questions fast and light |
| 2026-05-25 | Help Desk vs Service Desk | Help Desk (content and learning queries) and Service Desk (infrastructure, account, and MFA issues) are two distinct modules with separate workflows | Decided | Team / Kris | Prevents misrouting of requests; ensures each type of issue is handled by the right people |
| 2026-05-25 | Help button placement | A help request form / button is embedded directly within each learning unit on the learning portal, not on a standalone page | Decided | Team / Kris | Provides immediate context when a student submits a help request |
| 2026-05-25 | Student support chat model | Student support uses a many-to-one chat model: multiple team members can communicate with one student in a shared, fully logged channel; no private one-to-one DMs | Decided | Team / Kris | Ensures transparency, accountability, and auditability |
| 2026-05-25 | Obsidian as second brain | Obsidian will be used as the team's second brain / knowledge vault; Claude Code continuously adds project knowledge to the Obsidian vault via a dedicated skill | Decided | Team / Kris | Reduces the need for large context windows in future sessions |
| 2026-05-28 | Help Desk interaction model | Help Desk will evolve toward a Stack Overflow-style threaded support model where students submit a short and detailed description, see matching existing answers first, and create a new community-visible thread only if no existing answer solves the problem | Decided | Team / Kris | Kris explicitly reframed the design away from a simple form-first model |
| 2026-05-28 | Help Desk escalation path | Help requests start in the community-visible thread workflow and escalate to the Help Desk queue if unresolved; if still unresolved, they can be escalated further to a booked live session | Decided | Team / Kris / Bichesq | The team aligned on a staged resolution path |
| 2026-05-28 | Knowledge base creation model | Resolved Help Desk threads double as knowledge base content, and Help Desk staff can also create KB articles directly when recurring questions appear | Decided | Team / Kris | This avoids repeated re-research and supports self-service |
| 2026-05-28 | Help Desk intake requirement | Help Desk intake should capture at least a short description and a long description of the student's problem | Decided | Team / Kris / Bichesq | Core initial submission fields needed to route and diagnose requests |
| 2026-05-28 | Support data preservation | When legitimate troubleshooting questions are raised in Telegram or similar social channels, Help Desk may manually create a ticket on the student's behalf and redirect the solution back to the platform thread | Decided | Team / Kris | Preserves institutional knowledge otherwise lost in chat streams |
| 2026-06-01 | Help Desk ticket core fields | Core ticket fields are: student, topic, description, preferred channel, status with paired date log, close date, resolution summary, assigned-to, and resolved-by | Decided | Team / Kris | Supports routing, ownership, closure, and knowledge base creation |
| 2026-06-01 | Ticket status values | Ticket statuses are: Open, Pending, Responded, Resolved, and Cancelled / Out-of-scope | Decided | Team / Kris | Distinguishes active, waiting, answered, resolved, and non-actionable states |
| 2026-06-01 | Status-date pairing | Every status change should be stored together with its date as a chronological status log | Decided | Team / Kris | Supports analytics, SLA tracking, and clearer historical review |
| 2026-06-01 | Ticket closure workflow | Ticket closure requires a resolution summary and student consent to close; if the student does not respond within about two days, a second-review process is triggered | Decided | Team / Kris / Vin | Handles time zone issues and non-response realistically |
| 2026-06-01 | Resolution summary requirement | A resolution summary is required before closure and must be accepted by the student or approved via second review if the student is unresponsive | Decided | Team / Kris / Elvis | The summary must be strong enough to become future-facing knowledge |
| 2026-06-01 | Knowledge base content model | Closed Help Desk tickets feed the knowledge base using the topic, description, and final resolution summary, with contributor attribution where appropriate | Decided | Team / Kris | Closure quality directly affects KB quality |
| 2026-06-01 | KB tagging and categorization | Knowledge base categorization is done by staff after resolution, not by students during intake | Decided | Team / Kris | Students should not be burdened with choosing taxonomy during submission |
| 2026-06-01 | Ticket ownership | Help Desk tickets must support explicit ownership through an assigned-to field so difficult tickets are not ignored | Decided | Team / Allen / Kris | Prevents hard questions from remaining untouched |
| 2026-06-01 | Student rating and satisfaction surveys | Student ratings and satisfaction measurement are deferred to Phase 2, not included in Phase 1 | Decided | Team / Kris / Elvis | Rating is premature before funding, staffing, and internal SLA baselines are established |
| 2026-06-01 | Help Desk SLA timeframes and escalation triggers | Help Desk SLAs should exist internally in Phase 1 for team monitoring and escalation, but should not yet be publicly committed to students | Decided | Team / Kris | The team should self-grade and establish a baseline first |
| 2026-06-04 | POC readiness | AWS POC approval is confirmed and the team can now proceed with implementation planning and scoped delivery | Decided | Team / Kris | Kris stated that the POC had been approved and that the team could move forward |
| 2026-06-04 | Help Desk deployment model | Help Desk will be its own program / codebase rather than being embedded directly inside another app | Decided | Team / Kris | Kris explicitly described Help Desk as its own program |
| 2026-06-04 | Shared backend architecture | The platform should use one shared data store with multiple APIs and multiple front-ends across the separate application surfaces | Decided | Team / Kris / Bichesq | Shared database for consistency while keeping app surfaces independently deployable |
| 2026-06-04 | Help Desk interface model | Help Desk includes both an admin interface and a community-facing interface, with community users having restricted permissions | Decided | Team / Kris | Separate views for admins and community members |
| 2026-06-04 | Help Desk student input scope | Students should not manually classify tickets by taxonomy/topic; the platform should ask for the question/context and derive or prefill relevant metadata where possible | Decided | Team / Kris / Bichesq | Avoids poor categorization and reduces friction |
| 2026-06-04 | Help Desk contextual tagging | Help Desk tickets should capture system-derived context such as student identity, current program, current module, and possibly unit at the time of submission | Decided | Team / Kris | Uses student/session context as a snapshot |
| 2026-06-04 | Knowledge base publication control | Resolved Help Desk tickets are not automatically made visible as public knowledge base content; each case must be reviewed to determine whether it becomes a KB article, triggers a course update, or remains internal only | Decided | Team / Kris | Explicitly rejected automatic visibility for every resolved question |
| 2026-06-04 | Community visibility moderation | Help Desk submissions should be scanned before becoming community-visible, potentially using AI to detect vulgar or inappropriate content | Decided | Team / Kris | Questions/descriptions may need screening before community exposure |
| 2026-06-04 | Student hub chat history | Global chat history is removed from the Student Hub because Help Desk threads/articles now serve as the structured support interaction model | Decided | Team / Kris | Chat history was no longer needed under the new Help Desk design |
| 2026-06-04 | Platform naming | The student-facing gateway/landing application is named Student Hub | Decided | Team / Kris | Renamed the former "blue module" / gateway app to Student Hub |
| 2026-06-04 | Platform naming | The course/program/module creation application is named Learning Management | Decided | Team / Kris / Eddie | Agreed name for the creator/management surface |
| 2026-06-04 | App partitioning | The platform is structured into five application surfaces: Student Hub, Learning Platform, Learning Management, Administration, and Donor Hub | Decided | Team / Kris / Bichesq | Kris enumerated the five apps and Bichesq agreed |
| 2026-06-04 | Learning delivery architecture | The Learning Platform remains a separate application from Student Hub and Learning Management, acting as the student-facing viewer/executor of assessments and course content | Decided | Team / Kris / Bichesq | Separate deployment reduces coupling |
| 2026-06-04 | Course ownership model | Program creators own their programs; other collaborators default to read-only unless granted elevated permissions such as edit/admin access; super-admin can override when necessary | Decided | Team / Kris / Eddie | Settled on owner-based permissions with delegated access and admin override |
| 2026-06-04 | Course creator permissions | Course creators / volunteer professors should not have student-management capabilities inside Learning Management | Decided | Team / Kris / Eddie | Course authors may need analytics or limited visibility, but not student-management controls |
| 2026-06-04 | POC scope | The minimum POC deliverable can be scoped to Student Hub, Learning Management, and Learning Platform, while Administration and Donor Hub may follow later | Decided | Team / Kris / Bichesq | The POC can be narrowed to these three core apps if needed |
| 2026-06-04 | Delivery workflow | Kanban is preferred over Scrum for the implementation phase | Decided | Team / Kris | Kanban would likely be easier than Scrum for this build approach |
| 2026-06-04 | Parallel build approach | Kris and Bichesq should divide work across modules and proceed in parallel, with Mithil potentially joining as an additional contributor | Decided | Team / Kris / Bichesq | Divide-and-conquer approach |
| 2026-06-08 | Student Hub implementation order | Student Hub is the first implementation slice and should be built first as the gateway into the wider platform | Decided | Team / Kris | Kris explicitly said the team would start with Student Hub so students can register, land on a homepage, and connect into the other modules |
| 2026-06-08 | Student Hub dashboard scope | Student Hub home/dashboard should surface learning progress, assessment status, Help Desk access, Service Desk visibility, alerts, updates, calendar view, and knowledge base view | Decided | Team / Kris / Bichesq | The meeting clarified what belongs on the student-facing home screen, even though the underlying management lives in other modules |
| 2026-06-08 | Administration module scope | Administration encapsulates Help Desk, Service Desk, knowledge base management, and student management | Decided | Team / Kris | Kris explicitly reorganized the modules so these capabilities sit together under Administration |
| 2026-06-08 | Learning Management event ownership | Events are created and managed in Learning Management and surfaced to students through calendar views in Student Hub and related student-facing surfaces | Decided | Team / Kris | Kris explicitly placed event creation on the Learning Management side |
| 2026-06-08 | Learning Management authentication | Learning Management uses Microsoft SSO with Cloud Heroes Africa organization accounts; separate in-app profile/password management is not required | Decided | Team / Kris / Bichesq | Kris explicitly said volunteer/author access will use organizational Microsoft accounts and Entra profile data |
| 2026-06-08 | Learning Management core scope | Learning Management is responsible for program/module/unit design and management, assessment design and management, and learning-material administration | Decided | Team / Kris / Bichesq | The June 8 session clarified that Learning Management is where program structures, assessments, and learning materials are designed and maintained |
| 2026-06-11 | Invite code elimination | The invite code system is fully removed from the platform; no invite code is generated, sent, or entered by students | Decided | Team / Kris | Kris proposed and the team agreed to simplify the flow; invite codes added complexity and manual steps without sufficient additional security over an approved-email list |
| 2026-06-11 | reCAPTCHA removal | reCAPTCHA is removed from the registration/login flow alongside the invite code elimination | Decided | Team / Kris | No longer needed once the invite code step is gone; the approved-email list provides the access gate |
| 2026-06-11 | Student access control mechanism | Access to the platform is now controlled by an admin-managed approved-email list; when a student authenticates with Google, the system checks whether their Gmail is on the approved list; if yes they enter the platform, if no they are redirected to the registration form | Decided | Team / Kris / Bichesq | Replaces the invite code gate; simpler for students, requires an admin operation to approve new students |
| 2026-06-11 | Approved student list in Administration | Administration will include a managed list of approved new students (Gmail addresses) that serves as the authentication gate for Student Hub | Decided | Team / Kris | Admins add a student's Gmail to this list after vetting; the list is the firewall replacing the invite code |
| 2026-06-11 | Student Hub login page button model | The login page has two buttons — Get Started and Student Sign-In (Continue with Google) — but both lead to the same Google Auth flow; if the Gmail is on the approved list the student is logged in, if not they are redirected to the registration form | Decided | Team / Kris / Bichesq / Allen | Both paths resolve to the same outcome; two buttons improve UX clarity for new vs returning students without requiring separate logic paths |
| 2026-06-11 | Calendar on Student Hub | The calendar is surfaced as a widget on the Student Hub dashboard rather than a dedicated full page | Decided | Team / Kris / Bichesq | Keeps the dashboard consolidated; event detail can be expanded from the widget |
| 2026-06-11 | Welcome video on Student Hub login page | A welcome/community introduction video will be embedded on the Student Hub login/landing page | Decided | Team / Kris / Herman | Herman raised the idea and Kris agreed; content and production details to be decided separately |
| 2026-06-11 | Student Hub requirements structure | Student Hub requirements will be written as a Project Overview MD file plus individual per-screen MD files (e.g., login.md, profile.md, dashboard.md); screenshot references to inspiration designs may be included | Decided | Team / Kris / Bichesq | Kris proposed this structure explicitly; gives Claude precise, bounded context per screen rather than one large prompt |

***

## 3. Working Assumptions

These are currently useful assumptions that let the team move forward, but they should still be reviewed in the next planning session.

| Date | Area | Working Assumption | Status | Owner | Reason / Notes |
|---|---|---|---|---|---|
| 2026-05-18 | Product shape | The platform may involve around three application surfaces | Replaced | Team | Replaced by the June 4 decision confirming five application surfaces |
| 2026-05-18 | First implementation slice | Onboarding is the most logical first slice: login, registration, invite verification, assessment, dashboard entry | Replaced | Bichesq | Replaced by the June 11 decision eliminating invite codes and reCAPTCHA; the first slice is now login (Google Auth against approved-email list), registration redirect, and dashboard entry |
| 2026-05-18 | Claude workflow | Claude will be used incrementally in bounded tasks rather than one giant build session | Working Assumption | Team | Meeting emphasized session boundaries, revisions, token limits, and structured workflow |
| 2026-05-18 | Demo hosting | The first demo may run on a smaller or simplified environment before final AWS setup | Working Assumption | Team | Kris explicitly described showing a smaller-server demo before AWS approval |
| 2026-05-18 | Validation path | Internal team members plus some outside testers will likely be the first evaluators of the platform | Working Assumption | Team | Early validation is expected to be internal/community-led |
| 2026-05-18 | Jira workflow | Harriet may use repo documents, rather than raw meeting notes, as the main input for Jira creation | Working Assumption | Harriet / Team | Implied by the plan to turn documentation into stories and subtasks |
| 2026-05-21 | Unit completion status | A two-status model is being designed for: "Completed" and "Competent" / "Verified"; a student can complete a unit without yet being competent | Working Assumption | Team / Kris | Proposed by Kris and used as the design basis for the unit flow; not yet formally signed off |
| 2026-05-21 | Knowledge check delivery | Unit knowledge checks are treated as separate from the course content itself; a student finishes a unit and then receives / unlocks a knowledge check as a distinct step | Working Assumption | Team / Kris | Keeps content delivery clean and allows flexible knowledge-check delivery |
| 2026-05-21 | Knowledge check failure flow | If a student fails a knowledge check, the unit status resets to "Retake"; after a second failure, a team member is notified to follow up with the student | Working Assumption | Team / Kris | Balances automated enforcement with human support |
| 2026-05-25 | Ticketing system intention | Both Help Desk and Service Desk requests will eventually be managed through a formal ticketing system with SLAs | Working Assumption | Team / Kris | Specific tool, SLA timeframes, and ownership not yet agreed |
| 2026-05-25 | Service Desk approval process | Sensitive Service Desk actions (e.g., MFA resets, account access changes) will require a secondary approval step to create a secure paper trail and prevent unauthorised changes | Working Assumption | Team / Kris | Directional agreement exists, but workflow details are not yet designed |
| 2026-05-25 | AI session continuity and token management | A `handoff.md` file will be maintained at the end of each Claude coding session, with additional context-management techniques under consideration | Working Assumption | Team / Bichesq | Multiple strategies discussed; to be consolidated into a coherent workflow |
| 2026-05-28 | Help Desk SLA window | Community-first Help Desk threads may be given about two days before automatic escalation into the formal Help Desk queue | Working Assumption | Team / Kris | Proposed as an initial internal SLA example, not a finalized policy |
| 2026-05-28 | Queue specialization | The Help Desk queue may later be split by expertise areas such as networking, security, compute, storage, or database, though a general queue may be used first | Working Assumption | Team / Kris | Multiple possible queue structures were discussed without locking one in |
| 2026-05-28 | Teams/API notifications | Help Desk tickets may later be broadcast into a staff Teams group using a service account with Microsoft Graph API permissions | Working Assumption | Team / Kris / Vin | Technical direction discussed, but workflow not finalized |
| 2026-05-28 | Help Desk performance tracking | Help Desk work may eventually include a points/performance model where the person who truly resolves the issue should close the ticket and receive credit | Working Assumption | Team / Kris | Fairness/performance direction exists, but scoring rules are not defined |
| 2026-06-04 | Service Desk intake channel | Service Desk may use either a support email intake path, a web form, or a directly connected website form into the queue/database | Working Assumption | Team / Kris | Several intake options were discussed, but final selection was deferred |
| 2026-06-04 | Learning Management scope expansion | Learning Management may also become the place where live events and possibly attached presentations are created and managed | Replaced | Team / Kris / Bichesq | Replaced by the June 8 decision confirming event creation/management in Learning Management |
| 2026-06-08 | Student intake implementation | Student registration intake remains external in Phase 1 via Google Form with human vetting before invite issuance | Working Assumption | Team / Kris / Bichesq | Kris explicitly chose an external Google Form for now, but framed app integration as a possible later phase |
| 2026-06-08 | Service Desk recovery path | Account recovery may use account migration to a new email identity, supported by a unique student ID and strict manual verification | Working Assumption | Team / Kris | The meeting leaned this way strongly, but did not finalize the exact operational procedure |
| 2026-06-08 | Learning Management assignment model | Learning Management may need flexible support for assignments and materials beyond fixed quiz-style tasks, including uploads, presentations, interviews, or document submissions | Working Assumption | Team / Kris / Bichesq | The meeting explored multiple assignment formats, but did not lock the exact data model or workflow |
| 2026-06-08 | Global admin creation control | Creation of new administrators should likely be handled above the normal Administration module rather than delegated broadly to administrators/volunteers | Working Assumption | Team / Kris | Kris explicitly expressed concern that normal admins should not be able to create other volunteers without a stronger governance process |
| 2026-06-11 | UI library for Student Hub | HeroUI V3 (formerly NextUI) is the leading candidate for the Student Hub dashboard UI library; ShadCN was also raised as an alternative | Working Assumption | Team / Kris / Bichesq | Kris pointed to HeroUI V3 as the leading option seen in multiple searches; final selection should be confirmed before screen-level requirements are written |

***

## 4. Open Decisions

These decisions are important and should be resolved as early as possible.

| Date Logged | Area | Question | Status | Owner | Why It Matters |
|---|---|---|---|---|---|
| 2026-05-18 | Repo structure | If there are multiple application surfaces, should this be a monorepo? | Open | Bichesq / Team | Affects development workflow and implementation boundaries |
| 2026-05-18 | Assessment design | What questions will the assessment ask, and how should answers be stored? | Open | Team | Explicitly raised in the meeting |
| 2026-05-18 | Demo scope | What exactly must work live in the first stakeholder demo, and what can be mocked? | Open | Team | Critical for scoping the first build |
| 2026-05-18 | Design system | What UI/design system direction should the app follow? | Open | Team | HeroUI V3 is the leading candidate (June 11) but not yet locked; needs final confirmation before detailed screen specs are written |
| 2026-05-18 | API structure | What API style and conventions should be standardized? | Open | Team | Affects Claude prompt quality and implementation consistency |
| 2026-05-18 | Infrastructure | What minimum infrastructure is required for the first demo? | Open | Team | Needed to avoid overbuilding too early |
| 2026-05-18 | Board interaction | Should the board be brought in before implementation starts, or after a first internal build exists? | Open | Team | Strategic sequencing question |
| 2026-05-18 | Invite code entry UX | Should the invite code be entered manually (copy-paste) or auto-populated via a link in the email? | Replaced | Team / Allen | Resolved by the June 11 decision to eliminate invite codes entirely; no longer applicable |
| 2026-05-18 | Advanced student bypass | How should advanced students bypass lower-level modules — admin-granted exception or a separate self-assessment? | Open | Team / Kris | Needs a controlled and fair mechanism |
| 2026-05-18 | Placement assessment | Should a placement/level assessment be included during onboarding registration, or handled entirely within the learning platform? | Open | Team / Bichesq | Affects placement accuracy and onboarding flow |
| 2026-05-21 | Assessments as a separate module | Should assessments be their own standalone module, separate from the learning platform, or remain integrated within it? | Open | Team / Kris | Architectural flexibility vs complexity trade-off |
| 2026-05-21 | Student presentations / assignments | Should practical presentations or assignments be required at the module level or only at the program level? | Open | Team / Kris | This affects scale, workload, and assessment design |
| 2026-05-21 | Payload CMS for learning platform | Is Payload CMS the right tool for the learning portal given the dynamic assessment and progress-tracking requirements, or does it need to be reconsidered? | Open | Team / Bichesq | This affects content modeling, assessments, and long-term implementation flexibility |
| 2026-05-28 | Help Desk submission UX | Should the student submission flow explicitly offer branching choices such as community-first, Help Desk-first, or live-session intent at the moment of intake, or should all requests default into the same threaded workflow first? | Open | Team / Kris / Bichesq | Intake branching and routing are still not fully settled |
| 2026-05-28 | Immediate-help classification | What should count as an "immediate help" case versus a standard asynchronous support case, and how should those categories affect routing and expectations? | Open | Team / Flora / Vin | Affects promises, routing, and expectations |
| 2026-05-28 | Service Desk intake and recovery process | How should Service Desk handle technical issues such as lost email access, account recovery, identity verification, and migration to a new email when the user cannot access their normal account? | Open | Team / Kris | June 8 added clarity that recovery may require unique student IDs, strict verification, and account migration, but the full process is still unresolved |
| 2026-06-01 | Help Desk queue structure | Should the Help Desk queue be a single general queue first, or be split early by expertise areas such as networking, security, compute, storage, or database? | Open | Team / Kris | The choice affects routing and staffing |
| 2026-06-04 | Service Desk intake channel | Should Service Desk start with a support email, a website form, a Student Hub-linked loss-of-access form, or a direct queue/database-connected intake mechanism? | Open | Team / Kris | June 8 expanded the options and highlighted visibility needs on login and/or Student Hub |
| 2026-06-04 | Incident threshold | At what point should multiple Service Desk reports be promoted into a formal incident, and what triage rules should trigger that escalation? | Open | Team / Kris | Affects operational response and prioritization |
| 2026-06-08 | Student identity display policy | Should students be allowed to set a separate display name / preferred name for platform and event visibility, or should visible names stay tightly aligned to verified identity data? | Open | Team / Kris / Bichesq | Kris raised moderation, abuse, and identity clarity concerns, but the policy was not finalized |
| 2026-06-08 | Assignment delivery workflow | Should assignments be handled through structured submission forms in-platform, direct communication with instructors, live interview-style completion, or a mixed model? | Open | Team / Kris / Bichesq | June 8 clarified the need for flexible assignment formats, but not the final workflow or implementation pattern |
| 2026-06-11 | Student Hub login page — admin/volunteer sign-in path | Should the Student Hub login page also surface a Microsoft SSO path for admin/volunteers (and a Donor Hub login), or should those remain on separate entry pages? | Open | Team / Kris | Kris raised the idea of putting multiple sign-in options on one page but the team did not finalize whether to co-locate them |
| 2026-06-11 | Calendar RSVP / attendance feature | Should the calendar widget on the Student Hub dashboard allow students to indicate attendance or RSVP for events? | Open | Team / Kris / Flora | Raised during the June 11 discussion but not resolved; affects event management complexity |
| 2026-06-11 | Student vetting process design | What is the formal structure of the student vetting process — individual interviews, group welcome sessions, behavioural scoring, or a simpler form-only review — and how does it feed the approved-email list? | Open | Team / Kris | Kris explicitly said this needs to be figured out separately; the approved-email list gates access but the upstream vetting workflow is undefined |

## 5. Decision Candidates for Next Session

These should be explicitly reviewed and either marked **Decided** or kept **Open** with blockers.

### Highest-priority decisions
1. Monorepo vs separate repos (repo structure)
2. Assessments as a separate module vs integrated in the learning platform
3. Payload CMS suitability for the learning portal
4. Student presentation / assignment level (module vs program)
5. UI library final selection for Student Hub (HeroUI V3 vs ShadCN vs other)
6. Assessment question design and storage
7. Placement assessment — onboarding vs learning platform
8. Advanced student bypass mechanism
9. Home screen detailed data wiring and API dependencies
10. Ticketing system tool selection and SLA timeframes (Help Desk and Service Desk)
11. Service Desk approval workflow and responsible parties
12. First demo flow and scope
13. Minimal dashboard definition for the first POC
14. Jira board starting epic order
15. Help Desk submission UX: single threaded intake vs explicit branching choices
16. Help Desk queue structure: general queue vs expertise-based queues
17. Service Desk intake, identity verification, and lost-email recovery process
18. Immediate-help classification and routing criteria
19. Service Desk intake channel: support email vs web form vs Student Hub-linked form vs direct queue integration
20. Incident escalation thresholds and triage rules
21. Student visible-name / display-name policy
22. Assignment delivery workflow and submission model
23. Learning Management content-sharing model for reusing units/modules across programs
24. Student Hub login page — co-location of admin/volunteer and donor sign-in paths
25. Calendar RSVP / attendance feature on Student Hub dashboard
26. Student vetting process design and how it feeds the approved-email list

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
| 2026-05-18 | AI token efficiency | Use Plan Mode in Claude before coding to reduce unnecessary context and token usage | Decided | Team | Token bloat identified as a key risk |
| 2026-05-18 | AI context management | Be highly specific in prompts and limit the number of active tools / MCPs to avoid context window bloat | Decided | Team | Practical discipline to adopt across coding sessions |
| 2026-05-18 | Local MCP servers | Team members should research and experiment with local MCP server setups to improve token efficiency | Working Assumption | Team | Findings to be shared at next sync |
| 2026-05-18 | AI tool exploration | Team members should test alternative AI/brain-mapping tools to identify context-reduction strategies | Working Assumption | Team | Encouraged before next sync, not a firm commitment |
| 2026-05-25 | Obsidian as project knowledge vault | Obsidian is adopted as the team's second brain; Claude Code continuously populates the Obsidian vault via a dedicated skill so that future sessions require smaller context windows | Decided | Team / Kris | Primary long-term strategy for managing growing project knowledge |
| 2026-05-25 | AI session continuity and token management | A `handoff.md` file, model routing, OLLAMA for local inference, prompt caching, token monitoring, and CLAUDE.md instructions are all under consideration as part of an integrated system | Working Assumption | Team / Bichesq | To be consolidated into a coherent workflow through hands-on experience |
| 2026-05-25 | LinkedIn posting ownership | Harriet coordinates LinkedIn posting alongside Enda and Samoa; student work deemed noteworthy should be posted by the student first, then reshared by Cloud Heroes | Decided | Team / Harriet | Assigned by Kris in May 25 session |
| 2026-05-25 | Meeting recap as regular routine | Each session begins with a brief review of what was discussed in the previous session to maintain continuity without re-reading all notes | Decided | Team / Kris | Proposed and agreed at the start of the May 25 session |
| 2026-05-28 | Requirements-first planning | The team will continue using discussion-heavy planning sessions to refine process details before asking Claude to implement modules | Decided | Team / Kris | Claude should work from explicit requirements instead of assumptions |
| 2026-05-28 | Next-session sequencing | The next session should first wrap up Help Desk, then define the Service Desk process, then return to the student platform | Decided | Team / Kris | Kris closed the meeting by setting this sequence |
| 2026-05-28 | Help Desk flow documentation | Kris will try to prepare process-flow diagrams for Help Desk before the next session so the team can review the workflow visually | Working Assumption | Kris | Planned follow-up rather than completed artifact |
| 2026-06-01 | Donors module investigation | Tax receipt requirements for the Donors module must be investigated before donor-related flows are designed in detail | Working Assumption | Team / Kris | Affects future donor workflow design |
| 2026-06-04 | Planning sequence | After confirming the application partitions, the team should work module-by-module, create detailed requirements for Claude, and then build incrementally | Decided | Team / Kris | Next-step workflow after finalizing app partitions |
| 2026-06-04 | Requirements sharing | The design / requirements page link should be shared with the group after the meeting for continued coordination | Decided | Team / Bichesq / Kris | Closing action from the June 4 meeting |
| 2026-06-08 | POC-first development approach | Bichesq should take an exploratory first crack at the Student Hub POC before all requirements are finalized, so implementation questions can surface early and feed later planning | Decided | Team / Kris / Bichesq | Kris explicitly asked Bichesq to build an exploratory proof of concept before Thursday |
| 2026-06-08 | External website as student-facing entry point | The Cloud Heroes Africa website acts as the public-facing welcome layer, while Student Hub handles authenticated student entry and post-invite flows | Decided | Team / Kris / Bichesq | The June 8 discussion treated the website as the main welcome page rather than creating a separate redundant welcome surface |
| 2026-06-11 | Screen-by-screen requirements writing | The team will write Student Hub requirements screen by screen, producing one MD file per screen, before handing off to Claude for implementation | Decided | Team / Kris / Bichesq / Eddie | Kris and the team agreed in the June 11 session that screen-by-screen design and documentation is the correct sequencing before any build work |
| 2026-06-11 | Design-before-build approach | The team will design screens visually (or descriptively with screenshot references) before writing requirements MD files, so that Claude receives a precise design target rather than guessing | Decided | Team / Kris / Eddie / Bichesq | Kris outlined two paths and the team leaned toward designing screens ahead of time to get exactly what is envisioned |