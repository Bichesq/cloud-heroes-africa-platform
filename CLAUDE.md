## Security: SECURITY.md

**IMPORTANT: Before writing or editing any application code in this project — in
any app (`student-hub/`, `learning-platform/`, or any added later), for any
task, not just ones explicitly about security — you MUST read `SECURITY.md`
at the repo root and apply every rule in it.** SECURITY.md's own instruction
is that it covers all code regardless of whether the request mentions
security, and that violations should be flagged and corrected before
presenting code as final, without waiting to be asked.

Re-read `SECURITY.md` if it's been a while since your last check within a
long session — don't rely on having internalized it once at the start.

## Skill: Build Page From Screenshot

**IMPORTANT: Whenever creating, building, or reproducing any page, screen, or
UI component in this project — from a screenshot, mockup, Figma export, or
other reference image — you MUST invoke the `build-page-from-screenshot`
skill FIRST, before writing any component code.** This applies to every app
in this repo (`student-hub/`, `learning-platform/`, and any added later).

Do not implement pages from images ad hoc or from memory of HeroUI/CHA
conventions. The skill enforces reading the CHA design system tokens
(`docs/Cloud Heroes Africa Design System/`) and querying live HeroUI v3 docs
via the `heroui-react` MCP tools before any code is written — skipping it
risks off-brand styling or HeroUI v2 patterns that don't exist in this
codebase's v3 dependency.

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
