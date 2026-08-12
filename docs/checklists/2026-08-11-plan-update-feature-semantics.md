# Future Plan: Update Feature Semantics

- Checklist ID: CHECKLIST-20260811-plan-update-feature-semantics
- Created: 2026-08-11
- Planning completed: 2026-08-11
- Type: Future planning documentation
- Source request: Record whether template updates preserve disabled features or offer newly available features.
- Related checklists:
  - Plans folder: `docs/checklists/2026-08-11-create-plans-folder.md`
- Affected paths: `docs/plans/update-feature-semantics.md`
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Planning Record

- [x] Read the `docs/plans/` authoring guidance and existing checklist conventions.
- [x] Define this as a future decision, not an implementation task.

## Acceptance Criteria

- [x] The unresolved update-semantics decision is documented in `docs/plans/`.
- [x] Both preserve and opt-in feature-addition strategies are described.
- [x] No generator or updater behavior changes are made by this task.

## Implementation Plan

- [x] Add a future plan with decision criteria, open questions, and out-of-scope behavior.

## Verification

- [x] Run Prettier validation for the new Markdown files.
- [x] Run `git diff --check`.
- [x] Review the plan and re-scan this checklist for stale statuses.

## Validation Notes

Record active-task validation results here. Record failures before correcting them and passing reruns
afterward.

- 2026-08-11: `corepack pnpm exec prettier --check docs/plans/update-feature-semantics.md docs/checklists/2026-08-11-plan-update-feature-semantics.md` passed.
- 2026-08-11: `git diff --check` passed.
