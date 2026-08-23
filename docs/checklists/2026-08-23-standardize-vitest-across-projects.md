# Standardize Vitest Across Projects

- Checklist ID: CHECKLIST-20260823-standardize-vitest-across-projects
- Created: 2026-08-23
- Planning completed: 2026-08-23
- Type: Test tooling and generated-project behavior
- Source request: Use Vitest unit tests in all projects and replace Jest with Vitest in NestJS.
- Related checklist: [Maestro mobile e2e](./2026-08-23-add-maestro-mobile-e2e.md)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Add executable Vitest unit-test scripts and representative unit cases to web, Next, Expo, and
  React Native projects.
- Migrate NestJS unit and HTTP e2e tests from Jest to Vitest, including coverage and watch scripts.
- Keep canonical apps and managed generated templates synchronized.
- Verify generated projects contain the intended runner and no Jest configuration in NestJS output.

## Acceptance Criteria

- Every generated application profile has a working `test` script backed by Vitest.
- Web, Next, Expo, and React Native unit cases run without a simulator or device.
- NestJS unit and e2e cases run under Vitest; Jest packages and configuration are removed.
- Coverage works through a Vitest coverage provider.
- Generated-project tests verify copied configs, scripts, dependencies, and executable tests.

## Exact Test Cases

### TEST-UNIT-001: Web unit tests

- **Small task:** Run a representative web utility or schema unit test with Vitest.
- **Source:** Web reference behavior and Vitest migration request.
- **Test place:** `apps/web` test file and package test script.
- **Starting state:** Web package has no unit-test script or Vitest dependency.
- **Exact input or fixture:** Valid and invalid bug-report form values and class-name inputs.
- **Interaction steps:** Run the web package test command.
- **Main behavior:** Vitest executes the web unit suite.
- **Expected result:** Valid values pass, invalid values reject, and utility output is stable.
- **Must change:** Web script, dependency, config, and test files.
- **Must not happen:** Production web build behavior changes.
- **Planned command:** `pnpm --filter web test`
- **Expected result before the code change:** The command is unavailable because no test script exists.
- **First observed run:** `pnpm --filter web test` was unavailable before the change because no test script existed.
- **Passing rerun:** Vitest passed 2 files and 8 tests.

### TEST-UNIT-002: Next unit tests

- **Small task:** Run a representative Next reference unit test with Vitest.
- **Source:** All-project testing request and Next reference profile.
- **Test place:** `apps/next` test file and package test script.
- **Starting state:** Next package has no Vitest unit-test script.
- **Exact input or fixture:** A pure reference utility or validation behavior.
- **Interaction steps:** Run the Next package test command.
- **Main behavior:** Vitest executes without starting a Next server.
- **Expected result:** The focused unit cases pass.
- **Must change:** Next script, dependency, config, and test file.
- **Must not happen:** Next production build configuration changes.
- **Planned command:** `pnpm --filter next test`
- **Expected result before the code change:** The command is unavailable because no test script exists.
- **First observed run:** `pnpm --filter next test` was unavailable before the change because no test script existed.
- **Passing rerun:** Vitest passed 2 files and 8 tests.

### TEST-UNIT-003: Expo unit tests

- **Small task:** Run native-safe Expo unit tests with Vitest.
- **Source:** Expo app guidance and all-project testing request.
- **Test place:** `apps/expo` test file and package test script.
- **Starting state:** Expo package has no unit-test runner.
- **Exact input or fixture:** Pure configuration or validation behavior that does not require Expo APIs.
- **Interaction steps:** Run the Expo package test command without a device.
- **Main behavior:** Vitest runs deterministic native-safe tests.
- **Expected result:** Unit cases pass without launching Metro or Expo.
- **Must change:** Expo script, dependency, config, and test file.
- **Must not happen:** Device-backed tests are introduced as unit-test prerequisites.
- **Planned command:** `pnpm --filter expo test`
- **Expected result before the code change:** The command is unavailable because no test script exists.
- **First observed run:** `pnpm --filter expo test` was unavailable before the change because no test script existed.
- **Passing rerun:** Vitest passed 2 files and 2 tests without a device.

### TEST-UNIT-004: React Native unit tests

- **Small task:** Run native-safe React Native unit tests with Vitest.
- **Source:** React Native app guidance and all-project testing request.
- **Test place:** `apps/mobile` test file and package test script.
- **Starting state:** Mobile package has no unit-test runner.
- **Exact input or fixture:** Pure configuration or validation behavior that does not require Metro.
- **Interaction steps:** Run the mobile package test command without a simulator.
- **Main behavior:** Vitest runs deterministic native-safe tests.
- **Expected result:** Unit cases pass without launching Metro or a device.
- **Must change:** Mobile script, dependency, config, and test file.
- **Must not happen:** Device-backed tests are introduced as unit-test prerequisites.
- **Planned command:** `pnpm --filter mobile test`
- **Expected result before the code change:** The command is unavailable because no test script exists.
- **First observed run:** `pnpm --filter mobile test` was unavailable before the change because no test script existed.
- **Passing rerun:** Vitest passed 2 files and 2 tests without a simulator.

### TEST-UNIT-005: NestJS unit tests

- **Small task:** Run existing NestJS controller and allowed-origin tests under Vitest.
- **Source:** Existing `src/**/*.spec.ts` behavior and explicit Jest replacement request.
- **Test place:** `apps/server/src/*.spec.ts` and managed server equivalents.
- **Starting state:** Existing tests pass under Jest.
- **Exact input or fixture:** Existing controller health and allowed-origin fixtures.
- **Interaction steps:** Run the server unit-test command.
- **Main behavior:** Existing assertions execute under Vitest.
- **Expected result:** All existing unit assertions pass with no Jest runtime.
- **Must change:** Server scripts, config, dependencies, and test imports if needed.
- **Must not happen:** Existing behavior or assertions are weakened.
- **Planned command:** `pnpm --filter server test`
- **Expected result before the code change:** Jest passes 3 tests; Vitest is not configured.
- **First observed run:** Jest passed 3 tests.
- **Passing rerun:** Vitest passed 2 files and 3 tests.

### TEST-UNIT-006: NestJS HTTP e2e tests

- **Small task:** Run the health endpoint e2e test under Vitest.
- **Source:** Existing `test/app.e2e-spec.ts` behavior and complete Jest removal requirement.
- **Test place:** Server e2e test and Vitest e2e config.
- **Starting state:** E2E test runs through `test/jest-e2e.json`.
- **Exact input or fixture:** GET `/health` and expected `Hello World!` response.
- **Interaction steps:** Start the Nest testing application, request `/health`, close the app.
- **Main behavior:** Vitest executes the HTTP boundary test.
- **Expected result:** HTTP status is 200 and response body is `Hello World!`.
- **Must change:** E2E script/config and test runner dependencies.
- **Must not happen:** Jest config or Jest packages remain in the server template.
- **Planned command:** `pnpm --filter server test:e2e`
- **Expected result before the code change:** Jest e2e configuration passes; Vitest equivalent is absent.
- **First observed run:** `pnpm --filter server test:e2e` used Jest before the change.
- **Passing rerun:** Vitest passed the health endpoint E2E test.

### TEST-UNIT-007: NestJS coverage

- **Small task:** Generate coverage through Vitest.
- **Source:** Existing `test:cov` script and coverage requirement.
- **Test place:** Server package coverage script.
- **Starting state:** Jest coverage is configured under `coverage/`.
- **Exact input or fixture:** Existing server unit-test suite.
- **Interaction steps:** Run the coverage command and inspect its exit status/output.
- **Main behavior:** Vitest invokes the configured coverage provider.
- **Expected result:** Coverage completes successfully and writes a report.
- **Must change:** Coverage provider dependency and script/config.
- **Must not happen:** Coverage relies on Jest or silently skips tests.
- **Planned command:** `pnpm --filter server test:cov`
- **Expected result before the code change:** Jest coverage works; Vitest coverage is unavailable.
- **First observed run:** `pnpm --filter server test:cov` used Jest before the change.
- **Passing rerun:** Vitest coverage passed with the v8 provider and generated a report.

### TEST-UNIT-008: Generated project test tooling

- **Small task:** Verify generated app manifests, configs, and test files.
- **Source:** Copier reference profiles and generated-project contract.
- **Test place:** `create-mono-stack` integration helpers and generated fixture.
- **Starting state:** Generated projects have no Vitest tooling for web/native apps and Jest for server.
- **Exact input or fixture:** Generated web, Next, Expo, React Native, and NestJS profiles.
- **Interaction steps:** Generate/prepare the fixture, inspect package manifests and files, run tests.
- **Main behavior:** Template changes survive profile copying and dependency merging.
- **Expected result:** Vitest scripts/configs/tests exist in every selected app; generated NestJS has no Jest.
- **Must change:** Integration assertions and generated-project test execution.
- **Must not happen:** Core tooling or credentials enter generated output.
- **Planned command:** `pnpm --filter create-mono-stack test:integration`
- **Expected result before the code change:** Existing integration only builds references and does not verify Vitest.
- **First observed run:** The initial integration run failed on a stale Turbo graph expectation before reaching the new test assertions.
- **Passing rerun:** Generated-project integration passed, including generated web Vitest tests and generated NestJS unit and E2E Vitest tests.

**Validation note:** The first integration run reached the existing Turbo graph assertion but
failed because generated web now correctly includes `@repo/ui#build` as an upstream dependency.

**Validation note:** The first affected-app lint run found an unused `expect` import in the migrated
NestJS E2E test; the test only needs lifecycle and assertion helpers from Vitest.

**Validation note:** The first launcher suite after implementation failed 26 cases because native
scaffold fixtures did not yet contain the new Vitest config files. Adding those fixture entries
reduced the failure to two stale profile expectations for the new native `test` script.

### TEST-UNIT-009: Repository validation

- **Small task:** Validate lint, typecheck, build, formatting, and focused package tests.
- **Source:** Repository validation guidance.
- **Test place:** Workspace and affected packages.
- **Starting state:** Vitest changes are implemented and dependency lockfile is updated.
- **Exact input or fixture:** Current worktree.
- **Interaction steps:** Run focused tests, package checks, integration, and full repository gate.
- **Main behavior:** The migration is complete without regressions.
- **Expected result:** All required commands exit successfully.
- **Must change:** No source changes during validation.
- **Must not happen:** Checks are not bypassed or disabled.
- **Planned command:** `just check`
- **Expected result before the code change:** The repository passes with the old Jest/no-test setup.
- **First observed run:** The initial affected-app lint run found an unused Vitest `expect` import in the NestJS E2E test.
- **Passing rerun:** `just check` passed all build, lint, typecheck, format, skills, and template checks.

## Implementation Steps

- [x] Add Vitest scripts, dependencies, and configs to canonical web, Next, Expo, and mobile apps.
- [x] Add deterministic unit cases for each canonical app.
- [x] Mirror runner changes and tests into managed web, Next, Expo, and mobile templates.
- [x] Replace NestJS Jest unit and e2e configuration with Vitest.
- [x] Migrate managed NestJS tests and remove Jest files/dependencies.
- [x] Update profile/fixture assertions and generated-project execution.
- [x] Update lockfile and app guidance where commands changed.
- [x] Run all focused and repository validation commands.

## Risks And Non-Goals

- Native unit tests must not require a simulator, device, Metro, or Expo runtime.
- React component rendering tests are not required for this migration; device UI coverage remains
  with Maestro and browser UI coverage remains with Playwright.
- Vitest configs may need separate Node-compatible variants because web, native, and NestJS use
  different module/build systems.
- This change does not include a package release, commit, tag, or npm publication.
