# Help

## Purpose

The Help page gives students a clear path to resolve problems, find guidance, and reach the right support channel without confusion.

It should answer:
- I’m stuck — what kind of help do I need?
- Can I solve this myself?
- Where do I go next?
- What happens after I ask for help?

## Route

- Path: `/help`
- Access: authenticated students only

## UX Intent

The Help page should feel:
- reassuring
- clear
- low-friction
- trustworthy
- supportive

A student using this page may already be frustrated.
The page should reduce uncertainty quickly.

## Primary Jobs

This page should:
- help the student identify their issue type
- surface self-service answers where appropriate
- provide a clear escalation path
- reduce support misrouting

## Platform Context

The platform distinguishes support concerns such as:
- in-platform learning/content/help issues
- broader access/account/service issues [cite]

The Help page should guide students toward the appropriate path without exposing unnecessary internal operational complexity.

## Layout Structure

### 1. Help Entry Area

Contains:
- clear page title
- search input
- short prompt such as “What do you need help with?”
- optional reassurance copy

This should be the most prominent area on the page.

### 2. Help Categories Area

Contains common issue groups, for example:
- course or lesson issue
- calendar/event issue
- account or login issue
- certificate/completion issue
- technical problem
- community/chats issue
- other support topic

The wording should be student-friendly, not internal team jargon.

### 3. Self-Service Area

Contains:
- suggested help articles
- common questions
- quick troubleshooting steps
- contextual resources

Self-service should be easy to try but must not block escalation if the student still needs help. Support UX guidance generally recommends self-service triage that reduces friction while preserving clear escalation. [web:77][web:79]

### 4. Contact / Ticket Area

Contains:
- open support request CTA
- ticket status if included
- contact method options if available
- expected response guidance if available

### 5. Existing Requests Area

If the product supports it, show:
- open issues
- recent requests
- current status
- latest update

## Components

### Search Bar

#### Purpose
Help students quickly find answers or route themselves.

#### Behaviour
- returns relevant help content
- may suggest categories or articles
- should tolerate simple, non-technical queries

### Help Category Cards

#### Purpose
Reduce uncertainty for students who do not know what to search.

#### Behaviour
- clicking a category reveals relevant articles, troubleshooting, or contact paths
- category names should reflect student mental models

### Suggested Articles / FAQ List

#### Purpose
Provide fast self-service resolution for common issues.

#### Behaviour
- should be concise and scannable
- should link to fuller help content where needed
- must not become the only available support path

### Support Request CTA

#### Purpose
Give the student a clear escalation path when self-service is insufficient.

#### Behaviour
- opens a ticket/contact flow
- may prefill issue category if launched from category context
- should set expectations where possible

### Ticket Status Module

#### Purpose
Let students know whether help is already in progress.

#### Possible content
- request title
- status
- last updated
- next expected action if available

## States

### Loading
Show skeletons for:
- search
- categories
- suggested articles
- support/ticket section

### Empty
Possible states:
- no help articles available for the category
- no open requests
- no search results

Provide alternative actions in each case.

### Error
Handle:
- article load failure
- search failure
- ticket submission failure
- ticket status fetch failure

### Escalated
If a student already has an open issue:
- clearly show it
- avoid encouraging duplicate submissions unnecessarily
- allow the student to review progress

## Interaction Rules

- The search bar should be the most obvious starting point.
- Categories should reduce cognitive effort, not add complexity.
- Self-service content should be helpful but should never trap the user in endless deflection.
- Escalation paths should remain visible and understandable. [web:77][web:79]

## Accessibility

- Search must have a visible label.
- Category cards and action buttons must be keyboard accessible.
- Status indicators must not depend on color alone.
- Support responses and updates must remain readable in plain language.

## Data Needed

- help categories
- searchable help content
- article summaries
- escalation/contact routes
- ticket/request metadata if exposed
- request status labels
- timestamps/last updates

## Edge Cases

- no matching search results
- support system temporarily unavailable
- duplicate issue already open
- student opens the wrong category
- student has limited context to describe the problem

## Design Notes

- Use language students naturally use, not internal support terminology.
- Keep reassurance visible without becoming verbose.
- Make it clear what the system can solve immediately versus what requires human support.
- If there is a distinction between Help Desk and Service Desk behind the scenes, the front-end experience should guide the student without making them understand the internal architecture first. [cite]