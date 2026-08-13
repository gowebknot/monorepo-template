# Test-First Workflow Checklist

- Checklist ID: CHECKLIST-20260811-test-first-workflow
- Created: 2026-08-11
- Type: Repository skill change
- Related checklists: None
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Requirements

- [x] Create this new checklist before changing implementation files.
- [x] Make every new task create a new unique checklist document.
  - [x] Use `docs/checklists/<YYYY-MM-DD>-<task-slug>.md`.
  - [x] Choose a unique filename when the date and slug already exist.
  - [x] Do not reuse an older checklist for a new task.
- [x] Make every new bug create its own checklist document.
  - [x] Read relevant previous checklists before planning the fix.
  - [x] Consider previous plans, implementations, tests, and updates.
  - [x] Link the new bug checklist to each relevant previous checklist.
- [x] Preserve previous checklists as immutable history.
  - [x] Never rewrite, reorder, delete, or change previous plans, items, or statuses.
  - [x] Append defect updates only at the bottom of the original checklist.
  - [x] Add a dated `## Updates` entry with reason, evidence, impact, corrective action, and validation.
  - [x] Link the new checklist from the appended update.
- [x] Require detailed checklists with arbitrary nesting.
  - [x] Track nested children independently.
  - [x] Keep a parent incomplete until all descendants are complete.
  - [x] Use `[ ]`, `[/]`, and `[x]` consistently.
  - [x] Use `TEST-<AREA>-<NUMBER>` for durable test cases.

## Implementation Plan

- [x] Update `skills/test-first-workflow/SKILL.md`.
  - [x] Require creating a new checklist as the first task artifact.
  - [x] Require reading relevant prior checklists before planning implementation.
  - [x] Require explicit links between related old and new checklists.
  - [x] Require append-only updates when prior work is defective.
  - [x] Require following and updating the new checklist throughout the task.
- [x] Add `skills/test-first-workflow/templates/task-checklist.md`.
  - [x] Include task metadata and a stable checklist ID.
  - [x] Include scope, context, acceptance criteria, discovery, test cases, implementation, verification, and risks.
  - [x] Include nested task examples without imposing a fixed nesting depth.
  - [x] Include a bottom `## Updates` section.
- [x] Update `skills/test-first-workflow/references/plan-to-test.md`.
  - [x] Place checklist creation before acceptance-case planning.
  - [x] Require prior-checklist review for new bugs.
  - [x] Preserve append-only update behavior when a prior plan fails.
- [x] Update `skills/checklist-tracking/SKILL.md` or its policy reference where needed.
  - [x] Make arbitrary nesting and immutable historical checklists explicit.
  - [x] Define the required dated update fields and cross-links.

## Validation Cases

- [x] TEST-SKILL-001: A new task creates a new unique checklist before implementation planning.
- [x] TEST-SKILL-002: A new bug reads and links relevant previous checklists before planning.
- [x] TEST-SKILL-003: A defective prior plan receives an appended dated update without changing prior content.
- [x] TEST-SKILL-004: New and original checklists contain bidirectional references.
- [x] TEST-SKILL-005: Checklist instructions support arbitrarily nested independently tracked items.
- [x] TEST-SKILL-006: All four portable skill roots remain identical after synchronization.
- [x] TEST-SKILL-007: Skill structure and frontmatter pass the repository skill validator.

## Verification Plan

- [x] Run `pnpm skills:sync`.
- [x] Run `pnpm skills:check`.
- [x] Run `pnpm skills:test`.
- [x] Run Prettier validation for changed Markdown files.
- [x] Review the complete diff for unintended changes.
- [x] Re-scan this checklist for stale or incorrectly completed items.

## Updates

### 2026-08-11 - Record validation results before correction

- Evidence: The initial workflow wording recorded a failed validation only after failures were fixed.
- Impact: The checklist could lose the original failure evidence and no longer provide a reliable task history.
- Corrective action: Record every observed validation result, including failures, before making the correction; record the rerun result after the correction.
- Validation: Passed `pnpm skills:check`, `pnpm skills:test` (4/4), targeted Prettier validation, `git diff --check`, and the exact instruction scan after the correction.
- Related checklist: None

### 2026-08-11 - Planning must precede checklist creation

- Reason: The workflow order was corrected so the agent plans before creating the checklist, then implements from that checklist.
- Evidence: The prior workflow required checklist creation before planning.
- Impact: The earlier order did not let the checklist reflect a completed implementation plan.
- Corrective action: A new workflow-order checklist and skill update now require planning, then checklist creation, then implementation.
- Validation: Pending workflow synchronization and validation.
- Related checklist: [Workflow order correction](./2026-08-11-plan-before-checklist-workflow.md)

### 2026-08-11 - Planning-first order validated

- Evidence: The updated skill and references now place planning before checklist creation and implementation.
- Impact: New tasks can capture a completed plan in a fresh checklist before implementation begins.
- Corrective action: None; the requested workflow order is now implemented.
- Validation: Passed `pnpm skills:sync`, `pnpm skills:check`, `pnpm skills:test` (4/4), targeted Prettier validation, `git diff --check`, and the exact-reference scan.
- Related checklist: [Workflow order correction](./2026-08-11-plan-before-checklist-workflow.md)

### 2026-08-12 - Require small tasks and exact test cases

- Reason: The workflow still allowed broad plans such as "add focused tests" without splitting the
  work or listing every exact test situation.
- Evidence: The skill asked for focused tests and broad case areas, but it did not require each small
  task, rule, input, limit, and expected result to have its own detailed case.
- Impact: An agent could test only the main success and failure paths while missing separate rules,
  empty values, exact limits, state changes, errors, and work that must not happen.
- Corrective action: The new workflow keeps splitting work until each item can be tested on its own,
  requires exact test details for every item, and blocks coding until all known rules map to test IDs.
- Validation: Passed all 77 skill tests, all 16 portable skill copy checks, targeted Prettier, and
  `git diff --check`. Repository lint, typecheck, and 86 template tests passed; the full `just check`
  remains blocked only by unrelated formatting in
  `docs/checklists/2026-08-12-hybrid-native-reference-profiles.md`.
- Related checklist: [Detailed Test Planning](./2026-08-12-detailed-test-planning.md)
