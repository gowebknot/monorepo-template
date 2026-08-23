# Pre-Commit Validation Pipeline

- Checklist ID: CHECKLIST-20260823-pre-commit-validation-pipeline
- Created: 2026-08-23
- Type: Git hook validation and developer workflow
- Source request: Run formatting, policy checks, linting, type checking, builds, and unit tests from pre-commit, grouping independent work in parallel.
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Replace the multi-line Husky hook with `pnpm precommit:checks`.
- Run staged formatting and staged policy checks before other validation.
- Run build and independent unit suites concurrently, then run lint and typecheck concurrently after build artifacts exist.
- Keep browser E2E tests out of pre-commit because they require a running application and browser.

## Acceptance Criteria

- [x] Staged formatting runs before validation.
- [x] Staged skill and shared-component checks run before validation.
- [x] Build and unit suites run concurrently.
- [x] Lint and typecheck run concurrently after build completion.
- [x] Any failed command terminates the hook with a nonzero status.
- [x] Browser E2E tests remain an explicit command rather than a pre-commit dependency.

## Exact Test Cases

### TEST-HOOK-001: Successful pre-commit pipeline

- **Small task:** Run all required pre-commit validation phases.
- **Source:** User request and repository package scripts.
- **Test place:** Repository pre-commit orchestrator.
- **Starting state:** Valid working tree with installed dependencies.
- **Exact input or fixture:** Current repository source and staged files.
- **Interaction steps:** Run `pnpm precommit:checks`.
- **Main behavior:** Formatting, policy checks, build, unit tests, lint, and typecheck complete.
- **Expected result:** The command exits zero.
- **Must change:** The hook and orchestration script.
- **Must not happen:** E2E browser startup must not be required.
- **Planned command:** `pnpm precommit:checks`
- **Expected result before the code change:** No aggregate pre-commit command exists.
- **First observed run:** Passed on 2026-08-23.
- **Passing rerun:** Passed on 2026-08-23; all build, unit, lint, and typecheck tasks completed.

### TEST-HOOK-002: Orchestrator syntax and formatting

- **Small task:** Keep the new hook orchestrator executable and formatted.
- **Source:** Repository JavaScript and Prettier conventions.
- **Test place:** Script syntax and repository format checks.
- **Starting state:** New `scripts/pre-commit-checks.mjs` exists.
- **Exact input or fixture:** The orchestrator source and package metadata.
- **Interaction steps:** Run syntax and formatting checks.
- **Main behavior:** The script parses and changed files follow formatting rules.
- **Expected result:** Both commands exit zero.
- **Must change:** Orchestrator source and root script entry.
- **Must not happen:** The hook must not use skipped verification flags.
- **Planned command:** `node --check scripts/pre-commit-checks.mjs && pnpm format:check`
- **Expected result before the code change:** The new script does not exist.
- **First observed run:** Syntax passed; the first combined formatting attempt incorrectly included the extensionless Husky file and was corrected.
- **Passing rerun:** `node --check scripts/pre-commit-checks.mjs` and `pnpm format:check` passed on 2026-08-23.

## Implementation Plan

- [x] Add the cross-platform Node orchestrator with staged, parallel, and dependent phases.
- [x] Add the root `precommit:checks` script.
- [x] Reduce `.husky/pre-commit` to the aggregate command.
- [x] Validate the complete pipeline and formatting.
