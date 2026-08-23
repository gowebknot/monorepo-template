# Portable Generated-Project Pre-Commit Hook

## Context

- Related history: [create-mono-stack 0.1.27 release checklist](2026-08-23-create-mono-stack-0.1.27-release.md).
- The root `.husky/pre-commit` and `scripts/pre-commit-checks.mjs` are copied into generated projects.
- Copier excludes `core/`, so generated projects do not contain `create-mono-stack`.

## Acceptance Criteria

- The copied hook runs without requiring the excluded `create-mono-stack` package.
- The copied hook skips optional workspace checks when their package is not selected.
- The source repository still runs all template-only checks, including launcher tests.
- Generation tests verify the hook's generated-project command selection.

## Test Cases

### TEST-HOOK-001: Generated projects omit template-only launcher checks

- **Small task:** Select checks for a generated project without `core/create-mono-stack`.
- **Source:** `copier.yml` excludes `core`; generated projects must not depend on excluded files.
- **Test place:** `core/create-mono-stack/test/copier-template.test.js`.
- **Starting state:** A temporary generated-project root contains `package.json`, `apps/server`, and no `core/create-mono-stack`.
- **Exact input or fixture:** Workspace package paths for `create-mono-stack` absent and `server` present.
- **Interaction steps:** Load the pre-commit command selector and inspect selected pnpm commands.
- **Main behavior:** Template-only launcher checks are omitted.
- **Expected result:** No command targets `create-mono-stack`.
- **Must change:** The command list reflects generated-project packages.
- **Must not happen:** The selector must not require or invoke the excluded core package.
- **Planned command:** `pnpm --filter create-mono-stack test`.
- **Expected result before the code change:** Fails because the selector is not yet exposed or remains unconditional.
- **First observed run:** `pnpm --filter create-mono-stack test` failed while loading `selectChecks` because the hook did not yet export a selector.
- **Passing rerun:** `pnpm --filter create-mono-stack test` passed all 260 tests, including TEST-HOOK-001.

### TEST-HOOK-002: Generated projects skip unselected server checks

- **Small task:** Select checks for a generated project without `apps/server`.
- **Source:** Feature selection can omit the API app; optional checks must not fail for absent packages.
- **Test place:** `core/create-mono-stack/test/copier-template.test.js`.
- **Starting state:** A temporary generated-project root contains no `apps/server` package.
- **Exact input or fixture:** Workspace package paths for both `create-mono-stack` and `server` absent.
- **Interaction steps:** Load the pre-commit command selector and inspect selected pnpm commands.
- **Main behavior:** Absent optional package checks are omitted.
- **Expected result:** No command targets `server` or `create-mono-stack`.
- **Must change:** The command list contains only checks applicable to the generated project.
- **Must not happen:** The hook must not fail merely because an optional app was not selected.
- **Planned command:** `pnpm --filter create-mono-stack test`.
- **Expected result before the code change:** Fails because the selector is not yet exposed or remains unconditional.
- **First observed run:** The same focused command failed during test-file loading because `selectChecks` was not yet exported.
- **Passing rerun:** `pnpm --filter create-mono-stack test` passed all 260 tests, including TEST-HOOK-002.

## Implementation Plan

- [x] Export a small workspace-aware command selector from `scripts/pre-commit-checks.mjs` without changing root behavior.
- [x] Include launcher tests only when `core/create-mono-stack/package.json` exists.
- [x] Include server tests only when `apps/server/package.json` exists.
- [x] Add focused generation tests for both optional-package combinations.
- [/] Run focused package tests, formatting, and generated-project validation. Focused package tests and formatting pass; integration reaches generated-project validation but remains blocked by the unrelated reference task graph mismatch.

## Risks

- Generated projects may select different app combinations; checks must remain valid for all supported feature selections.
- The root template must retain launcher coverage even though generated projects omit the launcher.

## Validation Notes

- The first post-implementation `pnpm --filter create-mono-stack test` run passed both new hook cases but failed one existing Ink wizard timing assertion (`selects additional stack features through the multiselect screen`). This is the same concurrency-sensitive one-second timeout recorded in the related release checklist; no hook assertion failed.
- `pnpm exec prettier --check scripts/pre-commit-checks.mjs core/create-mono-stack/test/copier-template.test.js docs/checklists/2026-08-23-portable-generated-project-precommit-hook.md` found formatting changes needed in the two source files.
- `pnpm --filter create-mono-stack lint` passed.
- `pnpm --filter create-mono-stack test:integration` completed generation, copying, updating, and cleanup, then failed on an unrelated reference task graph expectation because `@repo/ui#build` was present unexpectedly.
- The formatted rerun of `pnpm exec prettier --check scripts/pre-commit-checks.mjs core/create-mono-stack/test/copier-template.test.js docs/checklists/2026-08-23-portable-generated-project-precommit-hook.md` passed.
