# API Test Boundaries

- Checklist ID: CHECKLIST-20260823-api-test-boundaries
- Created: 2026-08-23
- Type: Backend test command and harness architecture
- Related checklist: `docs/checklists/2026-08-23-api-chain-skill-gate.md`
- Source request: Establish explicit unit, in-process API E2E, and running-server API smoke boundaries before CI/CD is added.
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Add explicit server commands for unit tests, in-process API E2E tests, and running-server API smoke tests.
- Keep exhaustive HTTP behavior in the in-process Nest testing harness.
- Add a small black-box smoke harness for the real server's `/health` route, startup, environment wiring, localhost networking, and cleanup.
- Add root and `Justfile` commands so future CI can invoke the layers independently.
- Keep Playwright and Maestro outside pre-commit and this backend test slice.

## Scope Decisions

- The real server currently exposes only `GET /health`; the reference CRUD server remains a separate example application and is not included in this first test-boundary implementation.
- No new endpoint, database behavior, or application runtime behavior will be added.
- The smoke test uses a dynamically selected local port, a test environment, and no third-party services.

## Acceptance Criteria

- `pnpm --filter server test:unit` runs only unit tests under `src/**/*.spec.ts`.
- `pnpm --filter server test:api:e2e` runs the in-process Nest/Supertest suite under `test/**/*.e2e-spec.ts` without binding a network port.
- `pnpm --filter server test:api:smoke` builds or validates the server artifact, starts it as a child process, waits for readiness, sends a localhost request, and always tears it down.
- Root scripts and `Justfile` expose the same backend boundaries.
- `just check` runs the complete unit and in-process API E2E suites but does not run the running-server smoke suite.
- The smoke suite is available as an explicit local or future CI command.

## Exact Test Cases

### TEST-API-001: Unit command boundary

- **Small task:** Separate server unit tests from API E2E tests.
- **Source:** Requested test command structure and existing `apps/server/vitest.config.ts`.
- **Test place:** `apps/server/package.json` and Vitest command execution.
- **Starting state:** Server package contains unit specs under `src/` and an in-process API test under `test/`.
- **Exact input or fixture:** `apps/server/src/app.controller.spec.ts`, `apps/server/src/allowed-origins.spec.ts`, and `apps/server/test/app.e2e-spec.ts`.
- **Interaction steps:** Run the unit command and inspect collected tests.
- **Main behavior:** Unit command runs source unit tests without the API E2E file.
- **Expected result:** Unit command passes and does not collect `test/app.e2e-spec.ts`.
- **Must change:** Add the explicit package script and preserve the existing Vitest source include.
- **Must not happen:** Unit command must not create a Nest HTTP server.
- **Planned command:** `pnpm --filter server test:unit`.
- **Expected result before the code change:** Command is unavailable because `test:unit` does not exist.
- **First observed run:** `pnpm --filter server test:unit` reported that no `test:unit` script exists.
- **Passing rerun:** `pnpm --filter server test:unit` passed 3 tests across 2 unit files and did not collect the API E2E file.

### TEST-API-002: In-process API E2E boundary

- **Small task:** Give the existing in-process API suite an explicit API E2E command.
- **Source:** Existing `apps/server/test/app.e2e-spec.ts` and requested exhaustive in-process API coverage.
- **Test place:** `apps/server/vitest.e2e.config.ts` and `apps/server/test/app.e2e-spec.ts`.
- **Starting state:** The Nest app is created with `Test.createTestingModule`, initialized without `listen`, and closed after each test.
- **Exact input or fixture:** `GET /health`.
- **Interaction steps:** Run the API E2E command; issue a Supertest request against the in-memory Nest HTTP adapter; close the app.
- **Main behavior:** HTTP behavior is tested through Nest without a real network port.
- **Expected result:** `GET /health` returns status `200` and body `Hello World!`; the suite exits cleanly.
- **Must change:** Add the explicit package script and keep the existing in-process harness.
- **Must not happen:** No localhost port or child server process is used.
- **Planned command:** `pnpm --filter server test:api:e2e`.
- **Expected result before the code change:** Command is unavailable because `test:api:e2e` does not exist.
- **First observed run:** `pnpm --filter server test:api:e2e` reported that no `test:api:e2e` script exists.
- **Passing rerun:** `pnpm --filter server test:api:e2e` passed the in-process `/health` request without binding a real network port.

### TEST-API-003: Running-server smoke success

- **Small task:** Verify the packaged server over a real localhost boundary.
- **Source:** Requested running-server smoke behavior and `apps/server/src/main.ts`.
- **Test place:** `apps/server/test/server-smoke.test.mjs`.
- **Starting state:** The built `dist/main.js` is available; no server process is running on the selected test port.
- **Exact input or fixture:** `NODE_ENV=test`, `PORT=<dynamically selected local port>`, `ALLOWED_ORIGINS=http://localhost:5173`, request `GET /health`.
- **Interaction steps:** Spawn `node dist/main.js` as a child; poll `GET /health` until ready; send the assertion request; terminate and await the child in cleanup.
- **Main behavior:** The packaged app starts with test environment wiring and responds through a real HTTP socket.
- **Expected result:** Readiness succeeds; `/health` returns `200` with `Hello World!`; the child exits after teardown.
- **Must change:** Add the smoke harness and package command.
- **Must not happen:** No live third-party service, fixed shared port, or orphaned process.
- **Planned command:** `pnpm --filter server build && pnpm --filter server test:api:smoke`.
- **Expected result before the code change:** The smoke command is unavailable because no smoke harness or script exists.
- **First observed run:** `pnpm --filter server test:api:smoke` reported that no `test:api:smoke` script exists.
- **Passing rerun:** `pnpm test:api:smoke` built the server and passed the localhost health smoke test after the close-wait race was fixed.

### TEST-API-004: Running-server smoke failure cleanup

- **Small task:** Ensure smoke setup failures cannot leave a server process running.
- **Source:** Requested guaranteed teardown and deterministic local testing policy.
- **Test place:** `apps/server/test/server-smoke.test.mjs` cleanup path.
- **Starting state:** A smoke child process has been spawned and the readiness/request assertion throws.
- **Exact input or fixture:** A failed readiness assertion or request failure during the smoke test.
- **Interaction steps:** Enter the failure path; execute `finally`; send termination signal; await process close; rethrow the assertion failure.
- **Main behavior:** Cleanup runs independently of smoke assertion success.
- **Expected result:** The test reports the original failure and no child process remains.
- **Must change:** Keep process termination and close waiting in a `finally` block.
- **Must not happen:** Cleanup must not be skipped or hide the original assertion error.
- **Planned command:** `pnpm --filter server test:api:smoke` with the harness cleanup path exercised by its assertions.
- **Expected result before the code change:** No cleanup contract exists because the smoke harness does not exist.
- **First observed run:** The smoke command was initially unavailable; after implementation, its cleanup path timed out because the close wait could miss the child-process close event.
- **Passing rerun:** The smoke suite passed its intentional callback-failure case and completed cleanup without leaving the child process running.

## Implementation Plan

- [x] Add `test:unit`, `test:api:e2e`, and `test:api:smoke` scripts to `apps/server/package.json`.
- [x] Preserve and explicitly verify the existing Vitest unit and in-process E2E configs.
- [x] Add `apps/server/test/server-smoke.test.mjs` with dynamic port selection, readiness polling, real HTTP assertions, bounded timeout, and `finally` teardown.
- [x] Add root scripts and `Justfile` recipes for unit and in-process API E2E; keep smoke explicit rather than part of `just check`.
- [x] Document the execution policy and reference-server scope in server guidance or repository documentation.
- [x] Run focused tests, server checks, and `just check`.

## Validation Notes

- Initial observations: the repository has an in-process health test but no explicit API E2E name, no smoke harness, and no root server-test commands.
- First observed run: Unit and in-process API E2E commands passed; the first smoke run exposed a child-process teardown race and timed out. The first formatting check reported the new smoke file needed Prettier formatting.
- Passing rerun: Server unit tests passed 3 tests, in-process API E2E passed 1 test, running-server smoke passed 2 tests, server typecheck and lint passed, `pnpm format:check` passed, and `just check` passed including 101 skills tests and 264 launcher tests.
- Formatting failure: `pnpm format:check` reported that the new `apps/server/test/server-smoke.test.mjs` needed Prettier formatting.

## Non-Goals

- Do not add product endpoints or change the health response.
- Do not duplicate every reference CRUD endpoint in a black-box suite.
- Do not run Playwright or Maestro in pre-commit or `just check`.
- Do not add CI configuration in this task.

## Risks

- The smoke harness depends on the built Nest artifact and workspace package builds; its command must make that dependency explicit.
- Port allocation and process teardown must remain deterministic on developer machines and future CI runners.
