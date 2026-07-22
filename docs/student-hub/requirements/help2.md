# Help and Service Desk Requirements

## Purpose

This document defines the functional and UX requirements for the student-facing Help experience and the underlying Help Desk and Service Desk workflows for Cloud Heroes Africa. Help Desk and Service Desk are separate modules with different routing, ownership, and resolution patterns.[page:1]

## Scope

This document covers:

- Student-facing Help entry points in Student Hub and Learning Platform.[page:1]
- Help Desk for learning, content, course, and community-support questions.[page:1]
- Service Desk for account, access, MFA, and technical/infrastructure-related issues.[page:1]
- Knowledge base and common-question surfacing tied to support resolution.[page:1]

This document does not finalize unresolved workflow questions such as Service Desk intake channel, incident threshold, immediate-help classification, or exact Help Desk submission branching choices.[page:1]

## Product Principles

- Help Desk and Service Desk must remain distinct experiences even if they are surfaced together in one Help area.[page:1]
- Student support should be asynchronous first, with live sessions used only after escalation when async support is insufficient.[page:1]
- Help should prefer self-service first by surfacing existing answers before creating new requests.[page:1]
- Students should provide problem context, not taxonomy; the system should derive or prefill metadata where possible.[page:1]
- All support activity must be transparent, logged, and reviewable.[page:1]

## Module Definitions

### Help Desk

Help Desk handles student questions related to learning progress, lesson understanding, programs, modules, units, certificates, badges, calendar-related learning events, and other content/community inquiries.[page:1]

### Service Desk

Service Desk handles infrastructure and account-related issues such as login problems, MFA issues, account access problems, technical platform faults, and other operational support requests.[page:1]

## Entry Points

### Student Hub

The Student Hub dashboard/home must surface Help Desk access and Service Desk visibility to students.[page:1]

### Learning Platform

A help request button or form must be embedded directly inside each learning unit so a student can ask for help in context while working on content.[page:1]

### External-to-platform capture

If a legitimate support issue is raised in Telegram or similar social channels, staff may create a ticket on the student's behalf and redirect the student back to the platform thread so knowledge is preserved in-platform.[page:1]

## Student-Facing Help Experience

### Primary goals

The Help area should allow a student to:

- Search for an existing answer first.[page:1]
- Browse common topics/questions.[page:1]
- Open Help Desk questions for learning/content matters.[page:1]
- Open Service Desk tickets for account/technical matters.[page:1]
- Review the status and history of their submitted support requests.[page:1]

### Information architecture

The Help area should provide two clearly labeled paths:

- Help Desk
- Support Tickets / Service Desk

The labels may be refined in UI copy, but the product must preserve the distinction between content/learning help and operational/account support.[page:1]

### Search-first model

The Help Desk interaction model should be search-first:

1. Student enters a short problem summary.[page:1]
2. System shows matching existing answers, threads, or knowledge base items first.[page:1]
3. Student opens an existing answer if relevant.[page:1]
4. Student creates a new Help Desk thread only if existing answers do not solve the problem.[page:1]

### Community-visible thread model

New Help Desk requests should create a threaded support conversation that is community-visible only after moderation/screening for inappropriate content.[page:1]

### Escalation model

Help requests must follow this staged path:

1. Community-visible thread / async support first.[page:1]
2. Escalation to Help Desk queue if unresolved.[page:1]
3. Escalation to booked live help session if still unresolved.[page:1]

### Live help session model

Live help sessions follow a volunteer-slot model:

- Volunteers register recurring slots.[page:1]
- A session only opens when a student books it.[page:1]

## Help Desk Functional Requirements

### Intake requirements

At minimum, Help Desk intake must capture:

- Short description.[page:1]
- Long description.[page:1]

In addition, the system should store or derive:

- Student identity.[page:1]
- Current program.[page:1]
- Current module where applicable.[page:1]
- Current unit where applicable.[page:1]

Students should not be required to manually classify the request into detailed taxonomy categories.[page:1]

### Ticket/thread fields

Core support records must support the following fields:

- Student
- Topic
- Description
- Preferred channel
- Status
- Status date log
- Close date
- Resolution summary
- Assigned-to
- Resolved-by[page:1]

### Status model

Allowed statuses are:

- Open
- Pending
- Responded
- Resolved
- Cancelled / Out-of-scope[page:1]

Each status change must be stored with its date as a chronological log.[page:1]

### Ownership and collaboration

- Each support record must have explicit ownership through an assigned-to field.[page:1]
- Multiple team members may support one student in a shared logged channel; private one-to-one DMs are not the model.[page:1]

### Closure requirements

A ticket or thread cannot be closed without:

- A resolution summary.[page:1]
- Student consent to close, or second-review approval if the student is unresponsive after about two days.[page:1]

### SLA handling

Internal SLA tracking should exist for team monitoring and escalation, but SLA commitments should not yet be publicly promised to students in Phase 1.[page:1]

## Service Desk Functional Requirements

### Scope

Service Desk covers:

- Login/access problems.[page:1]
- MFA and authentication problems.[page:1]
- Account access changes and resets.[page:1]
- Technical/platform issues.[page:1]
- Other infrastructure or operational support concerns.[page:1]

### Security expectations

Sensitive Service Desk actions such as MFA resets or account access changes are expected to require a secondary approval step, though the exact workflow is still a working assumption and not yet finalized.[page:1]

### Unresolved areas

The following Service Desk details are still open and must be treated as pending requirements:

- Intake channel, such as support email, website form, Student Hub-linked form, or direct queue intake.[page:1]
- Recovery process for lost email access, identity verification, and account migration.[page:1]
- Incident escalation threshold for multiple related reports.[page:1]

## Knowledge Base Requirements

### Source of knowledge

Resolved Help Desk threads should feed future self-service support, but resolved tickets must not automatically become public knowledge base content.[page:1]

### Publication control

Each resolved case must be reviewed to determine whether it should:

- Become a knowledge base article.[page:1]
- Trigger a course/unit improvement.[page:1]
- Remain internal only.[page:1]

### Categorization

Knowledge base tagging and categorization is done by staff after resolution, not by students during submission.[page:1]

## Permissions and Interfaces

### Student interface

Students should be able to:

- Search support content.
- View common questions.
- Open new Help Desk requests.
- Open or track Service Desk requests.
- View their own request status and history.

### Admin/staff interface

The support system must include an admin interface distinct from the community-facing interface, with restricted permissions for community users.[page:1]

Staff/admin capabilities must include:

- Reviewing moderated submissions.[page:1]
- Assigning ownership.[page:1]
- Updating statuses.[page:1]
- Writing resolution summaries.[page:1]
- Reviewing KB publication decisions.[page:1]
- Creating KB articles directly when recurring issues appear.[page:1]

## UX Requirements

### Required visible elements in the student Help area

The student Help area should surface:

- Search
- Common questions / troubleshooting
- Topic-based entry points for common issue types
- A clear action for opening a ticket/request
- Navigation that distinguishes Help Desk from Service Desk / Support Tickets
- Visibility into submitted ticket state/history

### Recommended topic groupings

Suggested top-level categories for student navigation:

- Calendar & Events
- Community Inquiries
- Programs & Lessons
- Account & Login Issues
- Technical Problems
- Certificates & Badges

These groupings are useful for UI navigation, but they must not force students into deep taxonomy decisions during intake.[page:1]

### Context sensitivity

When Help is launched from a learning unit, the form should prefill or attach the relevant program/module/unit context automatically.[page:1]

## Non-Functional Requirements

- Support interactions must be fully logged and auditable.[page:1]
- Moderation must occur before community visibility where needed, potentially using AI-assisted screening.[page:1]
- The Help Desk should exist as its own program/codebase, even if linked from Student Hub.[page:1]
- The overall administration scope includes Help Desk, Service Desk, knowledge base management, and student management.[page:1]
- Student ratings/satisfaction surveys are out of scope for Phase 1.[page:1]

## Open Product Decisions

The following decisions remain unresolved and should be tracked separately from implementation-ready requirements:

- Whether intake explicitly branches into community-first, Help Desk-first, or live-session intent, or defaults into one threaded workflow first.[page:1]
- What qualifies as immediate help and how that affects routing.[page:1]
- Whether Help Desk starts with a single general queue or an expertise-split queue.[page:1]
- Which intake channel Service Desk should use in V1.[page:1]
- What formal Service Desk recovery and identity-verification workflow will be used.[page:1]

## V1 Implementation Guidance

For V1, the student-facing Help page should implement the following minimum set:

- Search bar for self-service discovery.[page:1]
- Common questions panel with links into KB or threads.[page:1]
- Clear separation between Help Desk and Support Tickets.[page:1]
- Topic cards for common help areas.
- Open support ticket/request CTA.
- Student-visible list or detail view for their own tickets with status.
- Staff moderation and assignment on the backend.[page:1]
- Resolution summary, ownership, and status log fields in the backend.[page:1]

## Acceptance Criteria

A V1 Help implementation is acceptable when:

- A student can distinguish Help Desk from Service Desk.[page:1]
- A student can search for existing help before opening a request.[page:1]
- A student can open a new request with short and long description.[page:1]
- The system records student and learning-context metadata automatically where available.[page:1]
- Staff can assign, update, and close support items with status history and resolution summary.[page:1]
- Help content can be reviewed for KB use rather than auto-published.[page:1]
- Escalation from async support to queue and then to live session is structurally supported, even if parts of the workflow are manual in V1.[page:1]