# Fix Named React Native Entry Files

- Checklist ID: CHECKLIST-20260821-fix-named-react-native-entry
- Created: 2026-08-21
- Planning completed: 2026-08-21
- Type: Bug fix
- Source request: Fix the Metro error where a named mobile app resolves the stale root `apps/mobile` path.
- Related checklist: [Revalidate Persisted Development Ports](./2026-08-21-revalidate-persisted-dev-ports.md)
- Related release: `create-mono-stack@0.1.17`
- Status legend: `[ ]` incomplete, `[x]` complete, `[/]` partial

## Implementation Description

- Generate static root React Native entry and Metro config branches from the manifest's React Native app paths.
- Pass the selected app path to Metro through `MONO_STACK_APP_PATH`.
- Run the manifest preflight after a successful `template:update` so reverted generated root files are restored.
- Keep the app-specific `index.js` and `metro.config.js` files in each `apps/<name>` directory.

## Acceptance Criteria

- [x] A named React Native app starts Metro from its own app entry file.
- [x] A project with multiple named React Native apps does not resolve `apps/mobile/index.js`.
- [x] Root native files are generated from the current manifest before startup.
- [x] A single canonical `apps/mobile` project keeps its supported behavior.
- [x] The `ancd` Android bundle no longer returns the shown module resolution error.
- [x] No unrelated files in `ancd` were changed by the template preflight.
- [x] `pnpm template:update` runs the refreshed preflight so it regenerates reverted root native files.

## Exact Test Cases

### TEST-MOBILE-001: Generate the named app root entry

- **Small task:** Generate root native files from named React Native app records.
- **Source:** `abcd/index.js` imports missing `./apps/mobile/index.js`; its manifest uses `apps/mobile-app-1` and `apps/mobile-app-2`.
- **Test place:** `scripts/dev-ports.test.mjs`.
- **Starting state:** A manifest has apps at `apps/mobile-app-1` and `apps/customer-mobile`; root native files are missing.
- **Exact input or fixture:** Mock project root, named app records, and mocked file writes.
- **Interaction steps:** Run `ensureProjectPorts` for the project.
- **Main behavior:** The preflight writes a dispatcher for every named app.
- **Expected result:** Root files contain branches for both exact manifest paths and no hardcoded `apps/mobile` path.
- **Must change:** Only the two generated root files.
- **Must not happen:** The named app directories or their entry files must not be changed.
- **Planned command:** `node --test scripts/dev-ports.test.mjs --test-name-pattern='named app root entry'`
- **Expected result before the code change:** The test fails because preflight does not generate root files.
- **First observed run:** The previous stale-file test passed, but it only proved deletion and did not prove that React Native could resolve a named entry.
- **Passing rerun:** `node --test scripts/dev-ports.test.mjs --test-name-pattern='TEST-MOBILE-001'` passed; generated root files contain both manifest paths.

### TEST-MOBILE-002: Generate the canonical single app

- **Small task:** Generate the canonical root files for the legacy `apps/mobile` layout.
- **Source:** Existing single-app generated projects may still use the canonical mobile path.
- **Test place:** `scripts/dev-ports.test.mjs`.
- **Starting state:** A manifest has one React Native app at `apps/mobile`.
- **Exact input or fixture:** Canonical app manifest and mocked file writes.
- **Interaction steps:** Run `ensureProjectPorts` for the project.
- **Main behavior:** Preflight generates a dispatcher for the canonical path.
- **Expected result:** Root files reference `apps/mobile` and set no invalid named-app path.
- **Must change:** Only the two generated root files.
- **Must not happen:** Canonical app files must not be removed or changed.
- **Planned command:** `node --test scripts/dev-ports.test.mjs --test-name-pattern='canonical single app'`
- **Expected result before the code change:** The test fails because preflight does not generate root files.
- **First observed run:** The previous canonical-preservation test passed without exercising root-file generation.
- **Passing rerun:** `node --test scripts/dev-ports.test.mjs --test-name-pattern='TEST-MOBILE-002'` passed; canonical root files are generated.

### TEST-MOBILE-003: Resolve the named Android bundle

- **Small task:** Confirm Metro bundles the named app entry instead of the stale root entry.
- **Source:** The reported Android URL returns HTTP 500 because `/abcd/index.js` imports missing `apps/mobile/index.js`.
- **Test place:** Local generated-project runtime check in `/Users/mr_adventurous/my-adventures/experiments/abcd`.
- **Starting state:** `abcd` has named React Native apps and stale root native files.
- **Exact input or fixture:** `apps/mobile-app-2`, Android bundle URL on a controlled local Metro port.
- **Interaction steps:** Run the port preflight, start `mobile-app-2` Metro, request its Android bundle, then stop Metro.
- **Main behavior:** Metro resolves `apps/mobile-app-2/index.js` and returns the bundle.
- **Expected result:** The bundle request does not return HTTP 500 for missing `apps/mobile/index.js`.
- **Must change:** Only stale root files and any required generated runtime metadata.
- **Must not happen:** Other app directories and unrelated user files must not change.
- **Planned command:** `pnpm exec react-native start --port 8090 --no-interactive`
- **Expected result before the code change:** The bundle returns HTTP 500 with `Unable to resolve module ./apps/mobile/index.js`.
- **First observed run:** The first generated dispatcher returned HTTP 500 because Metro rejected its dynamic `require(appEntries[selectedPath])` call.
- **Passing rerun:** After generating static manifest-derived branches, the `apps/mobile-app-2` Android bundle returned HTTP 200.

### TEST-MOBILE-004: Pass the selected app path to Metro

- **Small task:** Select the named app in each Metro process.
- **Source:** `scripts/run-app.mjs` launches each React Native app in its own process.
- **Test place:** `scripts/dev-ports.test.mjs` command/environment test.
- **Starting state:** A React Native manifest record has path `apps/customer-mobile`.
- **Exact input or fixture:** App record and reference mode.
- **Interaction steps:** Build or run the React Native launch command.
- **Main behavior:** The child process receives the manifest app path.
- **Expected result:** `MONO_STACK_APP_PATH` equals `apps/customer-mobile`.
- **Must change:** React Native child environment only.
- **Must not happen:** The selected path must not be hardcoded to `apps/mobile`.
- **Planned command:** `node --test scripts/dev-ports.test.mjs --test-name-pattern='selected app path'`
- **Expected result before the code change:** The environment has no selected app path.
- **First observed run:** `run-app.mjs` did not add `MONO_STACK_APP_PATH`.
- **Passing rerun:** `node --test scripts/dev-ports.test.mjs --test-name-pattern='TEST-MOBILE-004'` passed with `apps/customer-mobile`.

### TEST-MOBILE-005: Remove native roots when no native app exists

- **Small task:** Avoid leaving generated React Native root files in projects without a native app.
- **Source:** Root native files are generated artifacts owned by the template preflight.
- **Test place:** `scripts/dev-ports.test.mjs`.
- **Starting state:** A manifest contains only a Vite app and the project root has generated native files.
- **Exact input or fixture:** Vite-only app manifest and mocked file removal calls.
- **Interaction steps:** Run `ensureProjectPorts` for the project.
- **Main behavior:** Preflight removes obsolete generated native roots.
- **Expected result:** Both root native files are removed.
- **Must change:** Only the two generated root files.
- **Must not happen:** The Vite app files must not be changed.
- **Planned command:** `node --test scripts/dev-ports.test.mjs --test-name-pattern='TEST-MOBILE-005'`
- **Expected result before the code change:** The existing stale-file cleanup behavior is retained for non-native projects.
- **First observed run:** The non-native cleanup test passed after the implementation.
- **Passing rerun:** `node --test scripts/dev-ports.test.mjs --test-name-pattern='TEST-MOBILE-005'` passed and removed both root files.

### TEST-UPDATE-012: Run native preflight after Copier update

- **Small task:** Regenerate manifest-owned native root files after a successful template update.
- **Source:** The user reverts `ancd/metro.config.js` and expects `pnpm template:update` to restore it.
- **Test place:** `core/create-mono-stack/test/template-update.test.js`.
- **Starting state:** Copier succeeds and the generated project contains `scripts/dev-ports.mjs` plus named React Native apps.
- **Exact input or fixture:** Mock Copier success and a project cwd of `/workspace/project`.
- **Interaction steps:** Run `updateTemplate` with default update arguments.
- **Main behavior:** The updater launches the freshly copied preflight after Copier exits successfully.
- **Expected result:** `node scripts/dev-ports.mjs` is the final subprocess, with the project cwd and inherited update environment.
- **Must change:** Generated root native files through the preflight.
- **Must not happen:** The preflight must not run before Copier or when Copier fails.
- **Planned command:** `node --test core/create-mono-stack/test/template-update.test.js --test-name-pattern='native preflight'`
- **Expected result before the code change:** Copier is the final subprocess and no native preflight runs.
- **First observed run:** The preflight-specific test had no implementation assertion; existing SSH-alias coverage failed because it expected Copier to remain the final subprocess.
- **Passing rerun:** `node --test test/template-update.test.js test/template-update-stack.test.js` passed 23 tests, including post-Copier ordering and environment assertions.

### TEST-UPDATE-013: Skip native preflight after Copier failure

- **Small task:** Preserve Copier failure status without running post-update generation.
- **Source:** Failed template updates must not mutate generated files after an unsuccessful copy.
- **Test place:** `core/create-mono-stack/test/template-update.test.js`.
- **Starting state:** Copier returns status `1`.
- **Exact input or fixture:** Mock Copier failure and a project cwd of `/workspace/project`.
- **Interaction steps:** Run `updateTemplate` with default update arguments.
- **Main behavior:** The updater returns the Copier failure without launching the preflight.
- **Expected result:** Return value is `1`; no `node scripts/dev-ports.mjs` call occurs.
- **Must change:** Nothing after the failed Copier call.
- **Must not happen:** The preflight must not run.
- **Planned command:** `node --test core/create-mono-stack/test/template-update.test.js --test-name-pattern='failed Copier'`
- **Expected result before the code change:** No preflight runs, and the test remains passing.
- **First observed run:** No preflight ran before implementation.
- **Passing rerun:** `node --test test/template-update.test.js --test-name-pattern='TEST-UPDATE-013'` passed with Copier status `1` and no node preflight call.

## Test-To-Task Map

| Small task                  | Test IDs                             |
| --------------------------- | ------------------------------------ |
| Generate named app roots    | `TEST-MOBILE-001`, `TEST-MOBILE-002` |
| Verify Android Metro bundle | `TEST-MOBILE-003`                    |
| Select the launched app     | `TEST-MOBILE-004`                    |
| Remove unused native roots  | `TEST-MOBILE-005`                    |
| Run preflight after update  | `TEST-UPDATE-012`, `TEST-UPDATE-013` |

## Risks And Non-Goals

- This change does not alter React Native app source code or native Android/iOS projects.
- Metro can still fail for unrelated dependency or native build errors after entry resolution succeeds.
- The root files are treated as template-owned generated files when removing them from named projects.

## Validation Notes

- The first `pnpm template:test` run had one unrelated Ink timing failure in `selects additional stack features through the multiselect screen`; 252 of 253 tests passed. The focused named-entry tests and integration test passed.
- The exact interactive-wizard test passed on rerun, and the complete `pnpm template:test` rerun passed 253/253 tests.
- The first post-update focused run exposed one expected fixture mismatch: the SSH-alias test still expected Copier to be the final subprocess after the new preflight call. The implementation behavior was correct; the fixture is being updated to assert the new call explicitly.
