# Workflow Order Correction Checklist

- Checklist ID: CHECKLIST-20260811-plan-before-checklist
- Created: 2026-08-11
- Type: Repository skill change
- Source request: Plan before checklist creation; implement from the checklist.
- Related checklists:
  - Previous workflow change: [Test-first workflow checklist](./2026-08-11-test-first-workflow-checklist.md)
- Affected paths: `skills/test-first-workflow`, `skills/checklist-tracking`, and synchronized skill roots
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Acceptance Criteria

- [x] Planning happens before checklist creation.
  - [x] Read the request and applicable repository guidance during planning.
  - [x] For bugs, read relevant previous checklists, updates, implementations, and tests.
  - [x] Define acceptance criteria, validation cases, implementation approach, dependencies, and risks.
- [x] A new unique checklist is created from the completed plan.
  - [x] Use `docs/checklists/<YYYY-MM-DD>-<task-slug>.md`.
  - [x] Add a unique suffix instead of reusing an existing path.
  - [x] Capture the plan as detailed, arbitrarily nested checklist items.
- [x] Implementation begins only after the new checklist exists and reflects the plan.
  - [x] Follow checklist work items in order and preserve dependencies.
  - [x] Record observed validation failures before correcting them.
  - [x] Record passing rerun results before completing items.
- [x] Previous checklists remain immutable history.
  - [x] Do not change their prior plans, items, or statuses.
  - [x] Append a dated update at the bottom when prior work is defective.
  - [x] Include reason, evidence, impact, corrective action, validation, and a link to the new checklist.

## Implementation Plan

- [x] Update `skills/test-first-workflow/SKILL.md`.
  - [x] Replace checklist-first ordering with plan-first ordering.
  - [x] Require prior-checklist review for new bugs before planning.
  - [x] Require creating a new checklist from the completed plan before implementation.
  - [x] Preserve failure-before-fix recording and append-only historical updates.
- [x] Update `skills/test-first-workflow/templates/task-checklist.md`.
  - [x] Add a planned approach section that captures the completed plan.
  - [x] Preserve detailed nested acceptance, validation, implementation, and verification sections.
- [x] Update `skills/test-first-workflow/references/plan-to-test.md`.
  - [x] Make planning the first phase.
  - [x] Make checklist creation the second phase.
  - [x] Make implementation follow the completed checklist.
- [x] Update `skills/checklist-tracking/SKILL.md` and its policy reference.
  - [x] Require plan and context review before checklist creation.
  - [x] Preserve arbitrary nesting and immutable historical checklist rules.
- [x] Append the ordering correction to the previous checklist only under its bottom `## Updates` section.

## Validation Cases

- [x] TEST-SKILL-008: Plan instructions precede checklist creation instructions.
- [x] TEST-SKILL-009: Bug workflow reads prior checklists before planning and links related records.
- [x] TEST-SKILL-010: Implementation is explicitly blocked until the new checklist captures the plan.
- [x] TEST-SKILL-011: Previous checklist content remains unchanged before its appended update section.
- [x] TEST-SKILL-012: Validation failures are recorded before fixes and passing reruns are recorded afterward.
- [x] TEST-SKILL-013: All four portable skill roots remain identical after synchronization.

## Verification Plan

- [x] Run `pnpm skills:sync`.
- [x] Run `pnpm skills:check`.
- [x] Run `pnpm skills:test`.
- [x] Run Prettier validation for changed Markdown files.
- [x] Run an exact-reference scan confirming plan-before-checklist-before-implementation wording.
- [x] Run `git diff --check`.
- [x] Review the complete intended diff and re-scan this checklist for stale statuses.

## Updates

### 2026-08-11 - Prettier reported a formatting failure

- Evidence: Targeted Prettier validation reported formatting issues in `skills/test-first-workflow/references/plan-to-test.md`.
- Impact: The updated planning reference was not yet compliant with repository formatting rules.
- Corrective action: Apply the repository formatter to the affected Markdown file, then rerun all relevant validation.
- Validation: Pending correction and rerun.
- Related checklist: None

### 2026-08-11 - Formatting correction validated

- Evidence: The affected reference was formatted and all focused checks completed successfully.
- Impact: The planning reference now complies with repository formatting rules.
- Corrective action: None; the formatting correction is complete.
- Validation: Passed `pnpm skills:sync`, `pnpm skills:check`, `pnpm skills:test` (4/4), targeted Prettier validation, `git diff --check`, and the exact-reference scan.
- Related checklist: None
