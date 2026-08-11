# Exclude Checklists From Generated Projects

- Checklist ID: CHECKLIST-20260811-exclude-checklists
- Created: 2026-08-11
- Planning completed: 2026-08-11
- Type: Template boundary change
- Source request: Do not include repository checklists in CLI-generated projects.
- Related checklists:
  - Lifecycle policy: [Checklist lifecycle policy](./2026-08-11-checklist-lifecycle.md)
- Affected paths: `copier.yml` and `core/create-mono-stack/test/copier-template.integration.helpers.js`
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Planning Record

- [x] Read the Copier configuration and generation test harness.
- [x] Confirm that `core/` is excluded but `docs/checklists/` is currently not excluded.
- [x] Define the smallest fix: exclude the entire `docs/checklists/` directory and assert its absence in generated output.
- [x] Identify unrelated worktree changes that must remain untouched.

## Acceptance Criteria

- [x] Repository checklists remain available in the source repository.
- [x] Copier excludes `docs/checklists/` from generated projects.
  - [x] Generated projects do not contain `docs/checklists/`.
  - [x] The exclusion applies during both initial copy and template update behavior.
- [x] Generation tests prove the exclusion.
- [x] Existing unrelated changes are not staged or modified.

## Implementation Plan

- [x] Update `copier.yml`.
  - [x] Add `docs/checklists` to `_exclude`.
- [x] Update the focused generated-project assertion.
  - [x] Assert that the generated project has no `docs/checklists` directory.
  - [x] Keep the assertion in the existing generation helper without changing unrelated test behavior.
- [x] Preserve all existing skill and checklist changes from this task series.

## Validation Cases

- [x] TEST-TEMPLATE-001: Copier configuration lists `docs/checklists` as excluded.
- [x] TEST-TEMPLATE-002: Generated projects do not contain repository checklists.
- [x] TEST-TEMPLATE-003: Existing core exclusion behavior remains intact.
- [x] TEST-TEMPLATE-004: Focused template tests pass without staging unrelated files.

## Verification Plan

- [x] Run focused template tests.
- [/] Run `pnpm --filter create-mono-stack test`. <!-- partial: 49 passed, 2 unrelated user-added interactive wizard tests failed. -->
- [x] Run `pnpm --filter create-mono-stack lint`.
- [x] Run `pnpm template:test:integration` when the local Docker prerequisite is available.
- [x] Run `git diff --check`.
- [x] Inspect staged paths and confirm unrelated worktree files remain unstaged.
- [x] Re-scan this checklist for stale statuses.

## Validation Notes

Record active-task validation results here. Record failures before correcting them and passing reruns
afterward. This checklist is not committed yet, so update it in place rather than adding `## Updates`.

- 2026-08-11: `pnpm --filter create-mono-stack test` reported 2 failures in the user-added `test/interactive-wizard.test.js`; those files are unrelated to this exclusion change and were not modified.
- 2026-08-11: `pnpm --filter create-mono-stack lint` passed.
- 2026-08-11: Focused `copier-template.test.js` passed with 8/8 tests.
- 2026-08-11: `pnpm template:test:integration` passed with 1/1 test, including initial copy and update exclusion checks.
- 2026-08-11: Final targeted Prettier validation reported formatting issues in `core/create-mono-stack/test/copier-template.integration.helpers.js`; the failure was recorded before correction.
- 2026-08-11: Prettier validation, focused template tests (8/8), `create-mono-stack` lint, and `git diff --check` passed after the formatting correction.
- 2026-08-11: Staged paths contain only the intended Copier, skill, checklist, and synchronized-root changes; unrelated application and core worktree changes remain unstaged.
