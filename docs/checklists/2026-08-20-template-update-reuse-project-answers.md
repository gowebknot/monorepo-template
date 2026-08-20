# Template Update Reuses Project Answers

- Checklist ID: CHECKLIST-20260820-template-update-reuse-project-answers
- Created: 2026-08-20
- Planning completed: 2026-08-20
- Type: Bug fix
- Source request: `template:update` must not ask for project name again inside an existing project.
- Affected module: `scripts/update-template.mjs`
- Related active work: [Generated Project App And Package Management](./2026-08-20-project-app-package-management.md)
- Status legend: `[ ]` incomplete, `[x]` complete, `[/]` partial

## Acceptance Criteria

- [x] Bare `pnpm template:update` passes `--defaults` to Copier and does not prompt for `project_name`.
- [x] Explicit update arguments remain supported and are appended after the default flag.
- [x] Existing manifest, Git alias, exclusion, and error behavior remains unchanged.

## Validation Notes

- A direct generation using `--vcs-ref master` completed successfully, but its generated updater
  came from the committed template revision before this fix and failed with Copier's
  `Interactive session required` message. The current working-tree snapshot is used for the final
  end-to-end verification below so the generated project contains the fixed updater.
- The current-snapshot generated project initially failed `pnpm template:update` with Copier's
  `Destination repository is dirty` guard because generation intentionally leaves the initial files
  uncommitted. The project files will be temporarily stashed for the clean-destination update check.
- A clean, committed generated project ran the current `scripts/update-template.mjs` successfully
  with no arguments and no prompt: `Project "Local Management E2E" updated successfully.` The
  generated-project status remained clean afterward. The attempted stash of the new unborn repository
  was not possible because Git has no initial commit; no commit was created.
- The current-snapshot generated project's first `pnpm build` attempt failed because its destination
  dependencies had not been installed (`turbo: command not found`); installation is required before
  the generated build check.

## Exact Test Cases

### TEST-UPDATE-010: Reuse recorded answers

- **Small task:** Run a generated project update without asking already-recorded questions.
- **Source:** User report and Copier update behavior.
- **Test place:** `core/create-mono-stack/test/template-update.test.js`.
- **Starting state:** Valid generated manifest, local `.venv`, and no Git SSH alias.
- **Exact input or fixture:** `updateTemplate([])`.
- **Interaction steps:** Execute the update wrapper with no arguments and inspect Copier arguments.
- **Main behavior:** Copier receives its non-interactive defaults flag.
- **Expected result:** Copier arguments contain `--defaults` and no project-name prompt is possible.
- **Must change:** Copier argument construction.
- **Must not happen:** The wrapper must not prompt for or reconstruct `project_name`.
- **Planned command:** `node --test --test-name-pattern='recorded answers' core/create-mono-stack/test/template-update.test.js`
- **Expected result before the code change:** The new assertion fails because `--defaults` is absent for bare updates.
- **First observed run:** After correcting the fixture dependencies, the assertion failed as expected because bare updates omitted `--defaults`.
- **Passing rerun:** `TEST-UPDATE-010` passed; bare updates now include exactly one `--defaults` flag after stack exclusions.

### TEST-UPDATE-011: Preserve explicit arguments

- **Small task:** Keep caller-provided Copier update options after the default behavior.
- **Source:** Existing update wrapper API and current tests.
- **Test place:** `core/create-mono-stack/test/template-update.test.js`.
- **Starting state:** Valid generated manifest and local `.venv`.
- **Exact input or fixture:** `updateTemplate(["--vcs-ref", "v1.2.0"])`.
- **Interaction steps:** Execute the wrapper and inspect the final Copier argument order.
- **Main behavior:** Explicit revision remains forwarded.
- **Expected result:** Arguments contain `--defaults`, then `--vcs-ref`, then `v1.2.0`.
- **Must change:** No caller option semantics.
- **Must not happen:** Explicit arguments must not be dropped or reordered before required stack arguments.
- **Planned command:** `node --test --test-name-pattern='explicit update arguments' core/create-mono-stack/test/template-update.test.js`
- **Expected result before the code change:** Existing argument forwarding passes; the new default-order assertion is absent.
- **First observed run:** After correcting the fixture dependencies, the assertion failed as expected because `--defaults` was absent before the explicit revision.
- **Passing rerun:** `TEST-UPDATE-011` passed; explicit `--vcs-ref v1.2.0` remains after the default flag.

### TEST-UPDATE-012: Existing update regression suite

- **Small task:** Preserve all existing update behavior.
- **Source:** Existing update tests and package validation rules.
- **Test place:** `core/create-mono-stack/test/template-update.test.js` and package checks.
- **Starting state:** Current repository source and fixtures.
- **Exact input or fixture:** Existing update test suite.
- **Interaction steps:** Run focused update tests, full launcher tests, and lint.
- **Main behavior:** The bug fix does not regress update boundaries.
- **Expected result:** All tests and lint pass.
- **Must change:** Only the update default argument behavior.
- **Must not happen:** No auth, manifest, Git environment, or exclusion behavior changes.
- **Planned command:** `node --test core/create-mono-stack/test/template-update.test.js && pnpm --filter create-mono-stack test && pnpm --filter create-mono-stack lint`
- **Expected result before the code change:** Existing tests pass; the new regression assertion is not present.
- **First observed run:** Existing update tests were the baseline before the regression assertion.
- **Passing rerun:** Focused update tests passed all 12 cases; the full launcher suite passed 246 tests and package lint exited successfully.

## Test-To-Task Map

| Small task                  | Test IDs          |
| --------------------------- | ----------------- |
| Reuse recorded answers      | `TEST-UPDATE-010` |
| Preserve explicit arguments | `TEST-UPDATE-011` |
| Regression safety           | `TEST-UPDATE-012` |

## Implementation Steps

- [x] Add the failing regression assertion.
- [x] Add `--defaults` to the default Copier update invocation.
- [x] Run focused and package validation.
