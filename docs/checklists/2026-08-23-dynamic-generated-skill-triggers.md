# Dynamic Generated Skill Triggers

- Checklist ID: CHECKLIST-20260823-dynamic-generated-skill-triggers
- Created: 2026-08-23
- Type: Generated-project tooling and test coverage
- Source request: Update `.claude/skill-triggers.json` from the CLI/TUI-created app paths.
- Related audit: `docs/checklists/2026-08-23-exhaustive-documentation-refresh.md`
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Add a launcher helper that rewrites app-specific frontend and backend trigger rules from generated app records.
- Run it after CLI/TUI setup and after project-management add/remove actions.
- Keep generic trigger rules and the repository template's canonical app rules unchanged.
- Verify custom names such as `admin-react`, `student-react`, and `student-expo` are enforced by the generated hook.

## Acceptance Criteria

- Generated frontend app paths require `frontend-standards`.
- Generated backend app paths require `backend-standards`.
- Custom names and multiple app instances are supported.
- Removing an app removes only its app-specific trigger rule.
- Generic rules such as `testing-policy`, `contract-validation`, and `react-19` remain unchanged.
- The generated trigger file is updated during CLI/TUI setup and project management.

## Exact Test Cases

### TEST-TRIGGER-001: Custom frontend and backend rules

- **Small task:** Build app-specific trigger rules from generated app records.
- **Source:** `.mono-stack.json` app records and `.claude/skill-triggers.json`.
- **Test place:** `core/create-mono-stack/test/skill-triggers.test.js`.
- **Starting state:** App records contain `admin-react`, `student-react`, `student-expo`, and `api`.
- **Exact input or fixture:** Features `web-vite`, `mobile-expo`, and `api-nest` with paths under `apps/`.
- **Interaction steps:** Synchronize triggers, parse the JSON, and call `collectRequired` for each app path.
- **Main behavior:** Each app path receives the correct required skill.
- **Expected result:** Frontend paths require `frontend-standards`; the API path requires `backend-standards`.
- **Must change:** Only app-specific rules change.
- **Must not happen:** Generic rules are removed or duplicated.
- **Planned command:** `node --test core/create-mono-stack/test/skill-triggers.test.js`
- **Expected result before the code change:** The helper and focused test file do not exist.
- **First observed run:** The focused helper test file did not exist.
- **Passing rerun:** `node --test core/create-mono-stack/test/skill-triggers.test.js` passed both focused cases.

### TEST-TRIGGER-002: CLI/TUI setup writes custom rules

- **Small task:** Synchronize triggers after project creation.
- **Source:** `createProject` final generated app records.
- **Test place:** `core/create-mono-stack/test/create-project-native.test.js`.
- **Starting state:** Copier has produced the default trigger file; scaffolding returns custom app records.
- **Exact input or fixture:** `apps/admin-react`, `apps/student-react`, `apps/student-expo`.
- **Interaction steps:** Run the isolated project-creation test and inspect the written trigger file.
- **Main behavior:** Setup rewrites app-specific rules using actual names.
- **Expected result:** Custom frontend paths are present and canonical `apps/web` is not used for those records.
- **Must change:** Generated `.claude/skill-triggers.json`.
- **Must not happen:** The repository source trigger file is modified by generation.
- **Planned command:** `node --test --test-name-pattern='skill triggers' core/create-mono-stack/test/create-project-native.test.js`
- **Expected result before the code change:** No trigger synchronization write occurs after scaffolding.
- **First observed run:** The existing creation test command found no matching trigger test and did not exercise synchronization.
- **Passing rerun:** The custom generated app-name test passed and verified `admin-react` and `student-expo` rules.

### TEST-TRIGGER-003: Management add and remove

- **Small task:** Keep triggers synchronized when the project manager changes apps.
- **Source:** `addApp` and `removeApp` manifest updates.
- **Test place:** `core/create-mono-stack/test/project-management.test.js`.
- **Starting state:** A generated project has `apps/web` and `apps/server` rules.
- **Exact input or fixture:** Add `student-react`, then remove `web`.
- **Interaction steps:** Add the app, inspect rules, remove the app, inspect rules again.
- **Main behavior:** Rules follow the current manifest.
- **Expected result:** The added rule appears; the removed rule disappears; unrelated rules remain.
- **Must change:** Generated `.claude/skill-triggers.json` after each operation.
- **Must not happen:** Rules for remaining apps are removed.
- **Planned command:** `node --test --test-name-pattern='skill triggers|adds an app|removes an app' core/create-mono-stack/test/project-management.test.js`
- **Expected result before the code change:** Add/remove operations update only `.mono-stack.json`.
- **First observed run:** The existing management test command found no matching trigger test and did not exercise synchronization.
- **Passing rerun:** Add and remove management tests passed with trigger-file assertions.

### TEST-TRIGGER-004: Full launcher regression

- **Small task:** Preserve all existing launcher behavior after trigger synchronization.
- **Source:** `core/create-mono-stack/AGENTS.md` validation requirements.
- **Test place:** Full create-mono-stack unit suite and lint.
- **Starting state:** Focused trigger tests pass.
- **Exact input or fixture:** Existing launcher test suite and current source tree.
- **Interaction steps:** Run the package test and lint commands.
- **Main behavior:** Existing setup and management behavior remains passing.
- **Expected result:** All launcher tests and lint pass.
- **Must change:** No unrelated behavior.
- **Must not happen:** Existing app scaffolding, manifest, or management tests regress.
- **Planned command:** `pnpm --filter create-mono-stack test && pnpm --filter create-mono-stack lint`
- **Expected result before the code change:** Existing suite is the baseline; new trigger behavior is untested.
- **First observed run:** The first full package run failed in five mock setups because the trigger file was absent, and the existing Ink test also timed out.
- **Passing rerun:** `pnpm --filter create-mono-stack test` passed all 262 tests and `pnpm --filter create-mono-stack lint` passed after missing files were made a safe no-op.

### TEST-UPDATE-012: Template update rewrites custom rules

- **Small task:** Synchronize generated skill triggers after a successful template update.
- **Source:** `scripts/update-template.mjs` successful Copier update boundary and the generated stack manifest.
- **Test place:** `core/create-mono-stack/test/template-update.test.js`.
- **Starting state:** The project has custom app records and a trigger file containing stale canonical app rules.
- **Exact input or fixture:** A successful mocked Copier update with `apps/dashboard` and `apps/expo` records.
- **Interaction steps:** Run `updateTemplate`, capture the trigger-file write, and inspect its rules.
- **Main behavior:** The update path rewrites app-specific rules using current manifest paths.
- **Expected result:** Custom app rules are present, stale canonical rules are absent, and generic rules remain.
- **Must change:** Generated `.claude/skill-triggers.json` after a successful update.
- **Must not happen:** Trigger synchronization runs after a failed Copier update.
- **Planned command:** `node --test --test-name-pattern='synchronizes skill triggers after a template update' core/create-mono-stack/test/template-update.test.js`
- **Expected result before the code change:** The test fails because `updateTemplate` does not write the trigger file.
- **First observed run:** The focused test failed because `updateTemplate` returned successfully without writing the trigger file.
- **Passing rerun:** `node --test --test-name-pattern='synchronizes skill triggers after a template update' core/create-mono-stack/test/template-update.test.js` passed.

### TEST-UPDATE-013: Failed template update leaves triggers unchanged

- **Small task:** Avoid trigger synchronization when Copier fails.
- **Source:** `scripts/update-template.mjs` failed update result handling.
- **Test place:** `core/create-mono-stack/test/template-update.test.js`.
- **Starting state:** The project has an existing trigger file and Copier returns a non-zero status.
- **Exact input or fixture:** A mocked update result with status `1` and a writable trigger fixture.
- **Interaction steps:** Run `updateTemplate` and inspect trigger writes.
- **Main behavior:** Failed updates do not rewrite generated skill triggers.
- **Expected result:** The trigger write count remains zero.
- **Must change:** Nothing in `.claude/skill-triggers.json`.
- **Must not happen:** Synchronization must not run after a failed Copier update.
- **Planned command:** `node --test --test-name-pattern='failed template update leaves triggers unchanged' core/create-mono-stack/test/template-update.test.js`
- **Expected result before the code change:** The test passes because synchronization is not yet present.
- **First observed run:** The focused test passed before implementation because synchronization did not run after the failed update.
- **Passing rerun:** `node --test --test-name-pattern='failed template update leaves triggers unchanged' core/create-mono-stack/test/template-update.test.js` passed.

### Validation failure

- The first full launcher run failed because several existing isolated creation fixtures omit the generated trigger file; the same run also reproduced the unrelated Ink timing failure.
- The synchronizer will treat a missing trigger file as a non-gated custom template and leave it untouched.
- The first `just check` after the implementation stopped at formatting because the two new test files needed Prettier formatting.
- After formatting, `just check` passed all lint, typecheck, formatting, skills, and template checks; the launcher suite passed all 262 tests.
- The first post-update package rerun passed 263 of 264 tests but hit the known intermittent Ink timeout in `interactive-wizard.test.js`; package lint and focused update tests passed.
- A subsequent `pnpm --filter create-mono-stack test` passed all 264 tests; the focused trigger, update, and management tests also passed after keeping the launcher helper self-contained.

## Implementation Plan

- [x] Add `core/create-mono-stack/src/skill-triggers.js` with focused rule mapping and JSON update logic.
- [x] Call synchronization after `createProject` scaffolding and before setup completes.
- [x] Call synchronization after `addApp` and `removeApp` manifest changes.
- [x] Add focused helper, creation, and management tests.
- [x] Add update-path synchronization and regression coverage.
- [x] Run focused checks and package lint; the full launcher suite passed 264 tests on rerun, while the repository gate remains affected by the intermittent Ink timeout.

## Risks

- Existing generated projects may have the trigger file missing or manually customized; missing files are left untouched and existing files retain unrelated rules.
- Historical checklists and the repository's canonical `.claude/skill-triggers.json` must not be rewritten for generated app names.

## Scope Update

- The initial implementation covered creation and manage add/remove, but did not synchronize after `scripts/update-template.mjs` completed a Copier update.
- The correction adds update-path synchronization and verifies that failed updates do not rewrite triggers.
