# Create Playwright E2E App

- Checklist ID: CHECKLIST-20260822-create-playwright-app
- Created: 2026-08-22
- Planning completed: 2026-08-22
- Type: Feature
- Source request: Create the Playwright app after adding the E2E regression test writer skill.
- Related checklists:
  - Origin: `docs/checklists/2026-08-22-e2e-regression-test-writer-skill.md`
- Affected paths: `apps/playwright/`, root workspace scripts and lockfile, and this checklist.
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Planning Record

- [x] Read repository guidance, existing app scripts, and the current web user flows.
- [x] Confirmed there is no existing Playwright config or E2E directory.
- [x] Defined focused executable cases before implementation.
- [x] Scope is limited to a dedicated Playwright runner targeting `apps/web`; no new product flow is added.

## Context and Scope

- [x] Add `apps/playwright` as a private workspace package with Playwright configuration and E2E specs.
  - [x] Start `apps/web` automatically through `webServer`.
  - [x] Use accessible user-facing locators and web-first assertions.
  - [x] Keep E2E execution separate from the existing Turbo `test` omission and expose a root convenience script.
- [x] Cover the existing web journeys.
  - [x] Home navigation reaches the form demo.
  - [x] Form validation rejects incomplete input visibly.
  - [x] Valid bug report submission displays the submitted values.

## Acceptance Criteria

- [x] `apps/playwright` is discovered as a workspace package and installs `@playwright/test`.
- [x] `pnpm --filter playwright-tests test` starts the web app and runs the Playwright suite.
- [x] Tests are independently runnable, use resilient selectors, and contain no arbitrary waits.
- [x] Root script `pnpm e2e` runs the Playwright package suite.
- [x] Package lint/format checks and the focused E2E suite pass.

## Small Task Breakdown

- [x] Create the Playwright workspace package.
  - [x] Add package scripts, config, package guidance, and browser setup command.
    - Test IDs: `TEST-E2E-001`, `TEST-E2E-004`
  - [x] Add the package dependency and update the workspace lockfile.
    - Test IDs: `TEST-E2E-001`

- [x] Add user-facing regression coverage for the web app.
  - [x] Test home-to-form navigation.
    - Test IDs: `TEST-E2E-002`
  - [x] Test incomplete form validation.
    - Test IDs: `TEST-E2E-003`
  - [x] Test valid form submission feedback.
    - Test IDs: `TEST-E2E-004`
- [x] Add root invocation and validate the new app.
  - [x] Add `pnpm e2e` convenience script.
    - Test IDs: `TEST-E2E-005`
  - [x] Run focused E2E, package lint, formatting, and workspace checks.
    - Test IDs: `TEST-E2E-006`

## Rules and Open Questions

- [x] The Playwright runner targets the existing `apps/web` app at a local Vite server.
  - Source: `apps/web/package.json` and `apps/web/vite.config.ts`
  - Test IDs: `TEST-E2E-001`, `TEST-E2E-002`
- [x] Existing flow behavior is authoritative: home links to `/form-demo`; the form requires valid title, password, description, category, and terms acceptance.
  - Source: `apps/web/src/routes/index.tsx`, `apps/web/src/routes/form-demo.tsx`, and `apps/web/src/routes/-form-demo-option.ts`
  - Test IDs: `TEST-E2E-002`, `TEST-E2E-003`, `TEST-E2E-004`
- [x] No authentication, external API, database, visual screenshot, or mobile coverage is added in this first app.
  - Source: current web flow and user scope
  - Test IDs: `TEST-E2E-006`
- [x] No unresolved questions block implementation.

## Exact Test Cases

### TEST-E2E-001: Playwright runner starts the target app

- Small task: Create the Playwright workspace package.
- Source: `apps/web/package.json`, `turbo.json`, and Playwright configuration conventions.
- Test place: `apps/playwright/playwright.config.ts`, package manifest, and focused command.
- Starting state: No Playwright package or config exists; `apps/web` exposes `dev: vite`.
- Exact input or fixture: Base URL `http://127.0.0.1:5173`; webServer command `pnpm --filter web dev --host 127.0.0.1`.
- Interaction steps: Run the Playwright suite and allow its configured web server to start.
- Main behavior: The runner can launch and reach the target web app.
- Expected result: Playwright starts the server, opens the base URL, and runs tests.
- Must change: New package, config, dependency, and lockfile.
- Must not happen: Tests must not require a manually running server or an external service.
- Planned command: `pnpm --filter playwright-tests test`
- Expected result before the code change: The filter reports that no `playwright-tests` package exists.
- First observed run: Timed out after 120 seconds because the webServer command passed an extra `--` to Vite.
- Passing rerun: `pnpm --filter playwright-tests test` passed all 3 tests after correcting the command and installing Chromium.

### TEST-E2E-002: User can reach the form demo from home

- Small task: Test home-to-form navigation.
- Source: `apps/web/src/routes/index.tsx`.
- Test place: `apps/playwright/tests/web-navigation.spec.ts`.
- Starting state: Local web app is running at the root route.
- Exact input or fixture: Link named `Form Demo`.
- Interaction steps: Open `/`; verify the `TanStack Demo` heading; click `Form Demo`.
- Main behavior: The user reaches the intended form route through the visible navigation.
- Expected result: URL is `/form-demo` and the `Bug Report` heading is visible.
- Must change: Browser URL and rendered route.
- Must not happen: No direct deep-link assertion may replace the navigation journey.
- Planned command: `pnpm --filter playwright-tests test -- tests/web-navigation.spec.ts`
- Expected result before the code change: The test file and runner do not exist.
- First observed run: Failed because `Bug Report` is rendered as visible text rather than a heading role.
- Passing rerun: Navigation test passed with an exact text locator.

### TEST-E2E-003: Incomplete bug report is rejected visibly

- Small task: Test incomplete form validation.
- Source: `apps/web/src/routes/-form-demo-option.ts` and form labels in `form-demo.tsx`.
- Test place: `apps/playwright/tests/bug-report.spec.ts`.
- Starting state: `/form-demo` is open with empty defaults.
- Exact input or fixture: Leave all fields empty and attempt submission through the `Submit` button.
- Interaction steps: Open `/form-demo`; click `Submit`; inspect the visible validation messages.
- Main behavior: Required and minimum-value validation prevents an incomplete report from submitting.
- Expected result: Validation messages include title, password, description, category, and terms errors; no submitted-values toast appears.
- Must change: Visible field error state only.
- Must not happen: The submitted-values toast must not appear.
- Planned command: `pnpm --filter playwright-tests test -- tests/bug-report.spec.ts -g "incomplete"`
- Expected result before the code change: The test file and runner do not exist.
- First observed run: Passed in the initial 3-test run.
- Passing rerun: Passed in the final focused suite.

### TEST-E2E-004: Valid bug report shows submitted values

- Small task: Test valid form submission feedback.
- Source: `apps/web/src/routes/form-demo.tsx` and `apps/web/src/routes/-form-demo-option.ts`.
- Test place: `apps/playwright/tests/bug-report.spec.ts`.
- Starting state: `/form-demo` is open with empty defaults.
- Exact input or fixture: Title `Login button fails`, password `correct-horse`, description `The login button fails on mobile devices.`, category `Bug`, and terms checked.
- Interaction steps: Fill labeled fields; select `Bug`; check terms; click `Submit`; inspect the toast.
- Main behavior: A valid report is accepted and its submitted values are shown to the user.
- Expected result: `Submitted values:` is visible and the toast contains the entered title and description.
- Must change: Visible toast content.
- Must not happen: Validation errors or a rejected submission must not remain visible.
- Planned command: `pnpm --filter playwright-tests test -- tests/bug-report.spec.ts -g "valid"`
- Expected result before the code change: The test file and runner do not exist.
- First observed run: Failed because the custom checkbox exposed two elements through `getByLabel`.
- Passing rerun: Valid submission test passed with a named checkbox role locator.

### TEST-E2E-005: Root convenience command delegates to the app

- Small task: Add root invocation.
- Source: Root `package.json` workspace scripts.
- Test place: Root package script and shell invocation.
- Starting state: No root E2E command exists.
- Exact input or fixture: Root command `pnpm e2e`.
- Interaction steps: Run the root command in a workspace with Playwright browsers installed.
- Main behavior: The root command delegates to the dedicated Playwright package.
- Expected result: The same E2E suite runs successfully.
- Must change: Root `package.json` scripts.
- Must not happen: The root command must not duplicate Playwright configuration.
- Planned command: `pnpm e2e`
- Expected result before the code change: pnpm reports that `e2e` is not a root script.
- First observed run: `pnpm e2e` passed all 3 tests after implementation.
- Passing rerun: `pnpm e2e` passed all 3 tests in the final validation.

### TEST-E2E-006: Package checks remain valid

- Small task: Validate the new app and workspace integration.
- Source: Repository `AGENTS.md`, package guidance, and testing policy.
- Test place: Playwright package lint, focused E2E, formatting, and workspace package discovery.
- Starting state: New app files and dependency are implemented.
- Exact input or fixture: `apps/playwright` package and current workspace.
- Interaction steps: Run focused E2E, package lint, root formatting, and workspace checks.
- Main behavior: The new app is maintainable and does not break existing checks.
- Expected result: All planned commands pass; browser installation is the only environment prerequisite.
- Must change: No source files during validation.
- Must not happen: No arbitrary waits, skipped tests, disabled checks, or external production traffic.
- Planned command: `pnpm --filter playwright-tests lint && pnpm exec prettier --check . && pnpm --filter playwright-tests test`
- Expected result before the code change: The package filter and files do not exist.
- First observed run: Initial formatting check found the two new specs and lockfile out of style; parallel lint also raced with generated results.
- Passing rerun: Package lint and `pnpm format:check` passed; the focused suite passed all 3 tests.

## Implementation Plan

- [x] Add `apps/playwright/package.json`.
  - [x] Use private package name `playwright-tests` and scripts `test`, `test:headed`, `test:ui`, and `install:browsers`.
  - [x] Add `@playwright/test` as a dev dependency and keep the package isolated from application runtime dependencies.
- [x] Add `apps/playwright/playwright.config.ts`.
  - [x] Set `testDir` to `./tests`, `baseURL` to `http://127.0.0.1:5173`, and a local `webServer` for `apps/web`.
  - [x] Configure Chromium as the initial project and preserve CI artifacts for failures.
- [x] Add `apps/playwright/tests/web-navigation.spec.ts`.
  - [x] Use `test.describe` and `test.step` for the home-to-form journey.
  - [x] Assert role/name, URL, and visible destination text.
- [x] Add `apps/playwright/tests/bug-report.spec.ts`.
  - [x] Add independent incomplete and valid submission tests.
  - [x] Use labels, roles, and visible toast/error assertions.
- [x] Add `apps/playwright/AGENTS.md` and `apps/playwright/CLAUDE.md`.
  - [x] Document local commands, fixture isolation, and no arbitrary waits.
- [x] Add root `e2e` script and update lockfile.
- [x] Install Chromium locally if needed and run all planned checks.

## Verification

- [x] Record each planned command result against its test ID.
- [x] Record validation failures before corrections.
- [x] Run the focused E2E suite before the broader checks.
- [x] Run package lint and formatting checks.
- [x] Review the complete diff and re-scan this checklist for stale items.

## Validation Notes

The workspace lockfile and dependencies installed successfully. The first E2E run timed out because the `webServer` command used an extra `--`; after correcting it and installing Chromium, the first real run found two assertion issues: the card title is not exposed as a heading, and the custom checkbox requires a role locator because its visible span and hidden input share a label. Both were corrected with user-facing locators, and the focused suite plus root `pnpm e2e` now pass all 3 tests.

Formatting failure: `pnpm exec prettier --check .` found formatting issues in the two new specs and `pnpm-lock.yaml`; they were formatted. A parallel final run also exposed that package lint scanned Playwright's generated `test-results` directory while the test runner recreated it, so the lint script now targets `playwright.config.ts` and `tests` explicitly. The generated directory is ignored by Git and Prettier.

## Risks and Follow-Up

- [ ] The first runner targets Chromium only; add browser projects when generated app support requires them.
- [ ] Browser binaries may require `pnpm --filter playwright-tests install:browsers` in a fresh environment.
