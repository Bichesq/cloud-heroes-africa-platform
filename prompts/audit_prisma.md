CONTEXT:
This is a monorepo (cloud-heroes-africa-platform) currently containing 2 apps, with 2 more (Hub/Student Hub and Donor Hub) planned to join. All apps share ONE Postgres 16 database, Prisma ^6. There are currently 4 models duplicated across the existing apps' schema.prisma files.

Per docs/decision-log.md, the architecture is: one shared data store, multiple APIs/front-ends, with domain-based write ownership:
- Learning Management owns: programs, modules, units, learning materials, assessments, question banks, publishing state, events
- Administration owns: approved-email list, student status/admin actions, Help Desk tickets, Service Desk tickets, KB moderation/publication
- Learning Module owns: learning progress, unit completion, assessment attempts, question responses
- Hub / Identity domain owns: student profile, personal settings

The log explicitly does NOT settle whether non-owning apps should access shared data via direct Prisma models on shared tables, or via DTO-backed read APIs. Based on architectural analysis, the intended pattern is: Prisma models are an implementation detail of the OWNING domain only. Non-owning apps should consume typed DTOs from the owning domain's API, not raw Prisma models — except in rare cases of genuine cross-domain relational querying.

TASK: Audit and reclassify the current 4 shared/duplicated Prisma models, then produce a migration plan. Do NOT change any code yet in this pass — audit and plan first.

STEP 1 — Inventory
- Find every schema.prisma (or prisma/schema/*.prisma) file in the repo.
- List all models that appear in more than one app's schema, and confirm/correct the "4 shared models" assumption — there may be more or fewer once you check.
- For each duplicated model, note: exact field-level differences (if any) between the copies, and which app(s) currently read/write it via Prisma Client calls (grep for `.model_name.` usage, e.g. `prisma.event.create`, `prisma.event.findMany`).

STEP 2 — Classify each shared model into one of three buckets
  A. TRUE CROSS-APP PRISMA NEED — an app other than the owner does real relational Prisma work against it: joins, `include`/`select` across relations, direct writes it's authorized to make, or complex filtered queries that would be awkward/expensive to replicate as an API call.
  B. DISPLAY-ONLY / READ-ONLY SUMMARY — other apps only read this data to show a summary, status, or list, with no relational traversal. Candidate for DTO + API replacement.
  C. AMBIGUOUS — usage doesn't clearly fall into A or B (e.g., moderate query complexity, or unclear whether volume justifies a projection). Flag with your reasoning and a recommendation, but don't force a classification.

For bucket B specifically, note whether the read pattern is:
  - low-frequency/simple (→ recommend a direct API call to the owning domain)
  - high-frequency or requires aggregation/transformation (→ recommend a projection/materialized view or cached read model, per the decision-log's guidance on assessment analytics and dashboard rollups)

STEP 3 — Ownership mapping
For every model, confirm which domain (per the decision-log ownership table) should be the sole owner of `prisma migrate dev/deploy` for it. Flag any current schema where a non-owning app appears to run migrations against a shared table — this is a correctness risk given the single shared database, not just a style issue.

STEP 4 — Produce a written audit report (markdown file: docs/shared-schema-audit.md) containing:
  1. The corrected list of shared/duplicated models with their classification (A/B/C) and reasoning
  2. For bucket A models: proposed file-sharing mechanism — a symlinked shared .prisma file (e.g., /prisma-shared/<domain>-models.prisma symlinked into each consuming app's prisma/schema/ folder), confirming whether Prisma ^6 needs a previewFeatures flag for multi-file schema on this repo's exact Prisma version (check package.json / npx prisma version — do not assume GA without checking)
  3. For bucket B models: proposed DTO name, shape (fields only, based on actual current usage), and which owning-domain API endpoint should serve it (propose a route if one doesn't exist yet, e.g. GET /api/learning/dashboard-summary)
  4. A migration-ownership table: model → owning domain → which app's package.json scripts should be the only ones invoking `prisma migrate`
  5. A short "risks if left as-is" section specifically about the shared single database (migration history collisions, silent drift, unauthorized cross-domain writes)
  6. An explicit proposed addition to docs/decision-log.md formalizing the direct-read-vs-API-projection rule, since the log currently says this "remains an architectural decision that should be formally added"

CONSTRAINTS:
- Do not guess at Prisma's multi-file-schema GA status — verify against this repo's actual installed Prisma version and the official changelog/docs behavior (e.g., does it error without a previewFeatures flag).
- Do not modify schema.prisma files, delete models, or create symlinks in this pass. This is audit-and-plan only; implementation happens in a follow-up task after I review the report.
- If any duplicated model has diverged in fields/types between apps' current schemas, flag this explicitly and loudly at the top of the report — that's an active bug, not just a tradeoff to weigh.
- Where you're inferring intent rather than reading it directly from decision-log.md or code, say so explicitly rather than presenting it as settled fact.

Start with Step 1 and show me the inventory before proceeding to classification, so I can correct anything before you go further.