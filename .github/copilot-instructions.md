# Copilot Workspace Instructions

## Mandatory Pre-Flight (for every new chat/session)
Before proposing or implementing anything, read these files in order:
1. `_bmad-output/project-context.md`
2. `PROJECT_PROGRESS.md`
3. Relevant module files under `BE/src/modules/*` and `FE/src/app/components/pages/*`

If the user request conflicts with tracked project context/progress, ask a clarifying question first.

## Progress Discipline
- Treat `PROJECT_PROGRESS.md` as the source of truth for delivery status.
- After completing a module or major milestone, update `PROJECT_PROGRESS.md` immediately.
- Do not claim a module is done unless code behavior was validated.

## Execution Rules
- Prefer minimal, targeted changes over broad refactors.
- Preserve existing business rules from DB and docs.
- Keep FE and BE contracts aligned (request/response shape and status codes).
- For delete endpoints returning `204 No Content`, do not force JSON parsing on FE.

## Module Sequence (default)
1. Tenants
2. Contracts
3. Invoices
4. Dashboard/Reports polish

## Completion Checklist (before ending a task)
- Context files re-checked if scope changed.
- Relevant feature works in UI and API.
- `PROJECT_PROGRESS.md` updated when milestone/module status changed.
