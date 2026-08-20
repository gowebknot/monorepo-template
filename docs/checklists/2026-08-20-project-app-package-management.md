# Generated Project App And Package Management

- Checklist ID: CHECKLIST-20260820-project-app-package-management
- Created: 2026-08-20
- Planning completed: 2026-08-20
- Type: Feature implementation
- Source request: Add and remove apps/packages in generated projects through the TUI when possible.
- Constraint: Template-owned packages are tightly coupled and must never be removable.
- Affected package: `core/create-mono-stack`
- Status legend: `[ ]` incomplete, `[x]` complete, `[/]` partial

## Implementation Description

- Add a `create-mono-stack manage [project]` workflow for existing generated projects.
- Provide TUI actions for adding/removing supported native apps and user-created workspace packages.
- Keep template-owned packages immutable and require confirmation before permanent deletion.
- Preserve existing apps while adding a new app and update `.mono-stack.json` after app removal.

## Acceptance Criteria

- [x] Management mode opens from an existing project without invoking creation-only destination checks.
- [x] TUI can add a supported app without deleting or replacing existing apps.
- [x] TUI can remove an app after explicit confirmation and keeps manifest metadata valid.
- [x] TUI can add a user-created package through the existing package scaffold command.
- [x] TUI lists user-created packages for removal but never template-owned packages.
- [x] Attempts to remove template-owned packages are rejected before filesystem changes.
- [x] Permanent deletion is explicit and followed by workspace installation.
- [x] Existing creation and update behavior remains unchanged.
- [x] A generated project can add a new app and package, run the app, and build both successfully.

## Exact Test Cases

### TEST-MANAGE-001: Management command routing

- **Small task:** Route the `manage` command to project management mode.
- **Source:** User request for a TUI in generated projects.
- **Test place:** `core/create-mono-stack/test/cli.test.js`.
- **Starting state:** CLI receives `manage /workspace/project`.
- **Exact input or fixture:** TTY input/output and a mocked management prompt.
- **Interaction steps:** Invoke the package entrypoint main function with the manage command.
- **Main behavior:** Management prompt is called instead of creation parsing.
- **Expected result:** The selected management operation is executed for `/workspace/project`.
- **Must change:** Command routing only.
- **Must not happen:** Creation wizard or empty-destination validation must not run.
- **Planned command:** `node --test core/create-mono-stack/test/cli.test.js --test-name-pattern='management'`
- **Expected result before the code change:** The command is rejected as an invalid creation destination.
- **First observed run:** The planned command used Node's test-file argument order incorrectly and failed before loading tests: Node treated the entire file/pattern text as a path. The corrected command will place `--test-name-pattern` before the test file.
- **Passing rerun:** `TEST-MANAGE-001` passed after correcting the command order; management received the project path without invoking creation.

### TEST-MANAGE-002: Add app preserves existing apps

- **Small task:** Add one supported app without replacing existing app directories.
- **Source:** Existing native scaffold behavior and user request.
- **Test place:** `core/create-mono-stack/test/project-management.test.js`.
- **Starting state:** Manifest contains `apps/web` and `apps/server`; `apps/web` has a sentinel file.
- **Exact input or fixture:** Add `web-next` named `admin-next`.
- **Interaction steps:** Run the app generator through a mocked command, write the generated app, and install dependencies.
- **Main behavior:** New app is created and existing app remains untouched.
- **Expected result:** `apps/admin-next` exists, sentinel remains, manifest has three app records, and install runs.
- **Must change:** New app directory and manifest app record.
- **Must not happen:** Existing app directories must not be removed or rewritten.
- **Planned command:** `node --test core/create-mono-stack/test/project-management.test.js --test-name-pattern='adds an app'`
- **Expected result before the code change:** No management add operation exists.
- **First observed run:** No management add operation existed before implementation.
- **Passing rerun:** Focused management tests passed; the new app was recorded and the existing app sentinel remained unchanged.

### TEST-MANAGE-003: Remove app with valid manifest update

- **Small task:** Permanently remove a selected app after confirmation.
- **Source:** User-approved permanent deletion behavior and `.mono-stack.json` ownership.
- **Test place:** `core/create-mono-stack/test/project-management.test.js`.
- **Starting state:** Manifest contains `apps/web` and `apps/server`; both directories exist.
- **Exact input or fixture:** Remove `apps/server`, confirmation `true`.
- **Interaction steps:** Confirm deletion, remove the directory, and write the updated manifest.
- **Main behavior:** Selected app is deleted and its feature is removed when no instances remain.
- **Expected result:** `apps/server` is absent, `apps/web` remains, and manifest features contain only `web-vite`.
- **Must change:** Selected directory and manifest.
- **Must not happen:** Other apps or files must not be deleted.
- **Planned command:** `node --test core/create-mono-stack/test/project-management.test.js --test-name-pattern='removes an app'`
- **Expected result before the code change:** No management remove operation exists.
- **First observed run:** No management remove operation existed before implementation.
- **Passing rerun:** Focused management tests passed; the selected app directory and feature metadata were updated correctly.

### TEST-MANAGE-004: Reject unconfirmed app deletion

- **Small task:** Leave an app unchanged when deletion is not confirmed.
- **Source:** Permanent deletion safety requirement.
- **Test place:** `core/create-mono-stack/test/project-management.test.js`.
- **Starting state:** Valid manifest and existing `apps/server` directory.
- **Exact input or fixture:** Remove `apps/server`, confirmation `false`.
- **Interaction steps:** Decline the confirmation prompt.
- **Main behavior:** Operation is cancelled before side effects.
- **Expected result:** Directory and manifest are unchanged; dependency installation is not called.
- **Must change:** Nothing.
- **Must not happen:** No deletion, manifest write, or install.
- **Planned command:** `node --test core/create-mono-stack/test/project-management.test.js --test-name-pattern='declines app removal'`
- **Expected result before the code change:** No management remove operation exists.
- **First observed run:** No management remove operation existed before implementation.
- **Passing rerun:** Focused management tests passed; declining removal left the directory and manifest unchanged and skipped installation.

### TEST-MANAGE-005: Add and list user packages

- **Small task:** Add a user-created package and expose it as removable.
- **Source:** Existing `pnpm package:create` scaffold and workspace layout.
- **Test place:** `core/create-mono-stack/test/project-management.test.js`.
- **Starting state:** Workspace contains only template-owned packages.
- **Exact input or fixture:** Package name `billing`.
- **Interaction steps:** Invoke `pnpm package:create billing`, then list packages.
- **Main behavior:** User package is created and appears in the management list.
- **Expected result:** `packages/billing` is listed; template-owned packages are not listed.
- **Must change:** User package directory and package-manager command invocation.
- **Must not happen:** Template-owned package directories must not change.
- **Planned command:** `node --test core/create-mono-stack/test/project-management.test.js --test-name-pattern='user package'`
- **Expected result before the code change:** No management package operation exists.
- **First observed run:** No management package operation existed before implementation.
- **Passing rerun:** Focused management tests passed; `billing` was created/listed and template-owned packages were omitted.

### TEST-MANAGE-006: Reject template-owned package removal

- **Small task:** Protect tightly coupled template-owned packages.
- **Source:** Explicit user constraint.
- **Test place:** `core/create-mono-stack/test/project-management.test.js`.
- **Starting state:** `packages/entities` exists and is selected as a removal target by a direct call.
- **Exact input or fixture:** Package name `entities`.
- **Interaction steps:** Request removal without relying on the TUI filter.
- **Main behavior:** Protection rejects the operation before filesystem access.
- **Expected result:** An immutable-package error is thrown and no deletion or install occurs.
- **Must change:** Nothing.
- **Must not happen:** `packages/entities` must remain intact.
- **Planned command:** `node --test core/create-mono-stack/test/project-management.test.js --test-name-pattern='template-owned'`
- **Expected result before the code change:** No immutable package boundary exists.
- **First observed run:** No immutable package boundary existed before implementation.
- **Passing rerun:** Focused management tests passed; removing `entities` was rejected before filesystem access.

### TEST-MANAGE-007: Existing flows regression

- **Small task:** Preserve creation, manifest validation, and template update behavior.
- **Source:** Existing package test suite and update workflow.
- **Test place:** Existing launcher tests and lint.
- **Starting state:** Current repository fixtures and source.
- **Exact input or fixture:** Existing test suite.
- **Interaction steps:** Run the full package tests and lint.
- **Main behavior:** Existing behavior remains passing.
- **Expected result:** All tests and lint pass.
- **Must change:** No existing behavior changes outside management mode.
- **Must not happen:** Existing tests or update semantics must not regress.
- **Planned command:** `pnpm --filter create-mono-stack test && pnpm --filter create-mono-stack lint`
- **Expected result before the code change:** Existing suite passes.
- **First observed run:** Existing package tests and lint were the baseline before implementation.
- **Passing rerun:** Full launcher suite passed 246 tests and package lint exited successfully.

### TEST-MANAGE-008: Generated project add, run, and build flow

- **Small task:** Prove the public workflow from project generation through managed app/package validation.
- **Source:** User acceptance requirement.
- **Test place:** `core/create-mono-stack/test/project-management.integration.test.js`.
- **Starting state:** A freshly generated project with the default web and server apps, a working local Python environment, and Docker available for the repository integration harness.
- **Exact input or fixture:** Add a Vite app named `admin`, add a package named `billing`, start the app through its production preview, and build both managed targets.
- **Interaction steps:** Generate the project, invoke the management operations, run dependency installation, build `admin` and `billing`, and verify the preview responds.
- **Main behavior:** Generated projects remain usable after adding managed workspace members.
- **Expected result:** The new app and package exist, both build successfully, and the app preview starts and serves successfully.
- **Must change:** Generated fixture contents only.
- **Must not happen:** Existing `web` and `server` apps must not be replaced; template-owned packages must not be altered.
- **Planned command:** `pnpm --filter create-mono-stack test:integration`
- **Expected result before the code change:** The generated project has no management operation for adding the requested app/package.
- **First observed run:** No management operation existed in the generated fixture before implementation.
- **Passing rerun:** Copier integration passed; a real Vite app and package were added, both built, and the new app preview responded successfully while existing apps remained intact.

## Test-To-Task Map

| Small task                   | Test IDs                                |
| ---------------------------- | --------------------------------------- |
| Enter management mode        | `TEST-MANAGE-001`                       |
| Add apps safely              | `TEST-MANAGE-002`                       |
| Remove apps safely           | `TEST-MANAGE-003`, `TEST-MANAGE-004`    |
| Manage user packages         | `TEST-MANAGE-005`                       |
| Protect template packages    | `TEST-MANAGE-006`                       |
| Regression safety            | `TEST-MANAGE-007`                       |
| Generated add/run/build flow | `TEST-MANAGE-008`                       |
| API contract validation      | Not applicable; no API boundary changes |

## Implementation Steps

- [x] Add management command routing and TUI.
- [x] Add safe app add/remove operations.
- [x] Add user package add/remove operations and immutable package protection.
- [x] Add focused tests and update documentation.
- [x] Prove generated-project add, run, and build behavior with the integration harness.
- [x] Run focused tests, package tests, lint, and formatting checks.

## Risks And Non-Goals

- App generators may require network access; unit tests must mock commands.
- Removing an app or user package does not rewrite imports in other source files.
- Template-owned packages remain present and managed by template updates.
- This change does not add new framework generators; it exposes the generators already supported by the launcher.
