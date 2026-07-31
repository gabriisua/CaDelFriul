<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:gsd-workflow-rules -->
# GSD Workflow Enforcement

This project uses the Get-Shit-Done (GSD) workflow. Operate within these boundaries:

## State File
Read `.planning/STATE.md` first — it contains current phase, decisions, blockers, and accumulated context.

## Planning Documents
- `.planning/PROJECT.md` — living project context (what, why, who, constraints)
- `.planning/REQUIREMENTS.md` — checkable requirements with REQ-IDs and traceability
- `.planning/ROADMAP.md` — phase structure with success criteria
- `.planning/config.json` — workflow preferences

## Research
- `.planning/research/SUMMARY.md` — synthesized research findings
- `.planning/research/STACK.md` — technology stack recommendations
- `.planning/research/FEATURES.md` — feature landscape
- `.planning/research/ARCHITECTURE.md` — architecture research
- `.planning/research/PITFALLS.md` — domain-specific pitfalls

## Codebase Map
- `.planning/codebase/STACK.md` — current tech stack analysis
- `.planning/codebase/ARCHITECTURE.md` — current architecture analysis
- `.planning/codebase/CONCERNS.md` — technical debt and issues

## Commands
- `/gsd-discuss-phase <N>` — gather context and clarify approach before planning
- `/gsd-ui-phase <N>` — generate UI design contract for frontend phases
- `/gsd-plan-phase <N>` — plan a phase with task decomposition
- `/gsd-execute-phase <N>` — execute a planned phase
- `/gsd-transition` — transition between phases
- `/gsd-progress` — check project progress
<!-- END:gsd-workflow-rules -->
