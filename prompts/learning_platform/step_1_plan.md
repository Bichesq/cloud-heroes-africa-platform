Read prompts/learning_platform/learning-platform-backend-migration-brief.md in full — this is a migration and rebuild brief for the existing learning-platform/ app, not a green-field scaffold. Do not write any code yet.

First, do the discovery step the brief calls for in §0.2: inspect the actual current contents of every file in learning-platform/data/*.json (not just the filenames) and report back the real shape of each — specifically whether the program/module/unit/section/item/content-block hierarchy is nested inside single documents (e.g. one big lp-programs.json tree) or split across flat per-table files. The brief was written without seeing these contents directly, so don't assume the schema.sql table boundaries match the JSON file boundaries.

Then produce a written plan (no code) covering:
1. The exact Prisma schema you'll write from §3, flagging anything in the current JSON data that doesn't cleanly map to it (e.g. data that assumed the old lp_sections/lp_items split, or the dropped 'practical' assessment field).
2. The one-time data migration script's approach — how it will walk the actual JSON shape you found and produce the flattened lp_units rows per the §2 mapping.
3. Which existing route handlers and lib/ files will need to change for the Phase 2 module-by-module swap (§6), grouped by module (content, progress, knowledge-checks, assessments, goals/readiness).
4. Anything in the brief that's ambiguous or that you'd resolve differently — flag it, don't silently pick an interpretation.

Stop after the plan. I'll review it before you touch any code.