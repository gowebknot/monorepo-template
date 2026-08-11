# Checklist Lifecycle Policy

- Checklist ID: CHECKLIST-20260811-checklist-lifecycle
- Created: 2026-08-11
- Planning completed: 2026-08-11
- Type: Repository skill change
- Source request: Edit active checklists in place; append updates only for committed history.
- Related checklists:
  - Current workflow: [Plan-before-checklist workflow](./2026-08-11-plan-before-checklist-workflow.md)
- Affected paths: `skills/test-first-workflow`, `skills/checklist-tracking`, and synchronized skill roots
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Planning Record

- [x] Read the current workflow and checklist policies.
- [x] Define the checklist lifecycle boundary.
  - [x] Treat staged or unstaged, uncommitted checklists as active working documents.
  - [x] Treat committed checklists as immutable historical records.
  - [x] Keep the new-task and same-task rules distinct.
- [x] Define acceptance, validation, implementation, dependencies, and risks before creating this checklist.

## Acceptance Criteria

- [x] Active uncommitted checklists can be updated in place.
  - [x] Update the plan first when scope or approach changes.
  - [x] Update checklist items, statuses, and validation notes in place.
  - [x] Do not create `## Updates` for ordinary active-task changes.
- [x] Committed checklists remain immutable history.
  - [x] Do not rewrite, reorder, delete, or change committed plans, items, or statuses.
  - [x] Add `## Updates` only when a later task finds a defect in committed work.
  - [x] Append dated updates at the bottom with reason, evidence, impact, corrective action, validation, and links.
- [x] Every genuinely new task or bug still receives a new checklist.
  - [x] Do not merge a new task into an unrelated active checklist merely because it is uncommitted.
  - [x] Link related checklists in both directions when a committed checklist receives a later update.
- [x] Active validation failures are recorded before correction.
  - [x] Record failures under the current validation item or validation notes section.
  - [x] Record the passing rerun before marking the item complete.

## Implementation Plan

- [x] Update `skills/test-first-workflow/SKILL.md`.
  - [x] Document active versus committed checklist behavior.
  - [x] Require replanning before editing an active checklist.
  - [x] Restrict `## Updates` to post-commit defects and corrections.
  - [x] Preserve new-checklist-per-new-task behavior.
- [x] Update `skills/test-first-workflow/templates/task-checklist.md`.
  - [x] Remove the empty `## Updates` section from new checklists.
  - [x] Add editable validation notes for active-task failures and reruns.
  - [x] Explain when to add `## Updates` later.
- [x] Update `skills/test-first-workflow/references/plan-to-test.md`.
  - [x] Define in-place active checklist changes.
  - [x] Define append-only committed history changes.
  - [x] Preserve failure-before-fix recording.
- [x] Update `skills/checklist-tracking/SKILL.md` and its policy reference.
  - [x] Make commit state the history boundary.
  - [x] Preserve arbitrary nesting and cross-checklist links.

## Validation Cases

- [x] TEST-SKILL-014: Uncommitted checklist changes are made in place without an updates log.
- [x] TEST-SKILL-015: Committed checklist defects append dated updates without changing prior content.
- [x] TEST-SKILL-016: New tasks and bugs receive new checklists regardless of prior checklist commit state.
- [x] TEST-SKILL-017: Active validation failures and passing reruns are recorded in the checklist.
- [x] TEST-SKILL-018: All four portable skill roots remain identical after synchronization.

## Verification Plan

- [x] Run `pnpm skills:sync`.
- [x] Run `pnpm skills:check`.
- [x] Run `pnpm skills:test`.
- [x] Run Prettier validation for changed Markdown files.
- [x] Run an exact-reference scan for active versus committed checklist rules.
- [x] Run `git diff --check`.
- [x] Review the intended diff and re-scan this checklist for stale statuses.

## Validation Notes

Record active-task validation results here. Record a failure before correcting it and record the
passing rerun afterward. Add a bottom `## Updates` section only when a later task corrects committed
work.

- 2026-08-11: `pnpm skills:check` passed with 16 portable skills validated.
- 2026-08-11: `pnpm skills:test` passed with 4/4 tests passing.
- 2026-08-11: Targeted Prettier validation passed.
- 2026-08-11: Exact lifecycle-reference scan and `git diff --check` passed.
