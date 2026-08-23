# Add Maestro Mobile E2E Coverage

- Checklist ID: CHECKLIST-20260823-MAESTRO-MOBILE-E2E
- Scope: Add Maestro flows for the existing `apps/expo` reference app, with a separate
  `maestro-tests` workspace package and explicit iOS/Android runner support.
- Related prior record: No matching prior checklist was found.

## Acceptance Criteria

- [x] `maestro-tests` owns two independent flows: navigation smoke and Todos CRUD.
- [x] The Todos screen exposes only the four requested consumer-provided test IDs.
- [x] The runner starts reference server and Expo processes, waits for ports, runs requested
      platform parameterizations, and always tears both processes down.
- [x] Root scripts expose `e2e:web` and `e2e:mobile`; the old root `e2e` name is removed.
- [x] Root `AGENTS.md` documents the deliberate breaking rename and the new mobile command.
- [/] Static validation passes; device-backed flows remain blocked because Maestro CLI is not
  installed and no booted iOS Simulator is available.

## Small Task Breakdown

### 1. Define mobile flow contracts

- [x] Add navigation flow using visible text and the platform-specific Expo Go deep link.
- [x] Add Todos CRUD flow with generated per-run user data, test IDs only for unlabeled inputs, and
      visible text for headings and buttons.

### 2. Add runner package

- [x] Add `apps/maestro/package.json`, `AGENTS.md`, and `CLAUDE.md`.
- [x] Implement `scripts/run-flows.mjs` with platform parsing, child-process cleanup, port polling,
      and Maestro CLI invocation.
- [x] Add ESLint coverage for the runner script.

### 3. Add application selectors

- [x] Add `todos-create-user-id`, `todos-create-title`, `todos-create-submit`, and
      `todos-filter-user-id` to `apps/expo/app/reference/todos.tsx`.

### 4. Wire root commands and validate

- [x] Rename root `e2e` to `e2e:web` and add `e2e:mobile`.
- [x] Run focused static checks, package checks, and repository checks where feasible.
- [/] Run iOS and Android Maestro flows when the required local device/tooling preconditions exist.
  Maestro CLI is not installed; iOS has no booted Simulator. Android has a booted emulator but
  cannot run until the shared CLI prerequisite is installed.

## Test Cases

### TEST-MAESTRO-001: Navigation flow file is valid and uses accessible selectors

- Small task: Add the independent navigation smoke flow.
- Source: User request and existing Expo reference navigation labels.
- Test place: `apps/maestro/flows/mobile-navigation.yaml` plus YAML parse/scan validation.
- Starting state: No app-specific flow files exist.
- Exact input or fixture: `${MAESTRO_APP_ID}`, `${MAESTRO_HOST}`, port `8082`, and visible labels
  `Expo reference app`, `Open Reference`, `Reference`, `Open Todos`, `Todos`.
- Interaction steps: Open Expo Go through the deep link, assert the home heading, navigate through
  Reference, then open Todos.
- Main behavior: The flow follows the mobile navigation journey on either platform.
- Expected result: The file parses and contains the expected interpolated app ID, host, and visible
  text interactions without arbitrary waits.
- Must change: Add one navigation YAML flow.
- Must not happen: Add platform-specific duplicate flows or brittle coordinates.
- Planned command: `pnpm exec prettier --check apps/maestro/flows/mobile-navigation.yaml`
- Expected result before the code change: The new flow file does not exist, so the check cannot pass.
- First observed run: `pnpm exec prettier --check apps/maestro/flows/mobile-navigation.yaml` failed because the flow file did not exist yet.
- Passing rerun: `pnpm exec prettier --check apps/maestro/flows/mobile-navigation.yaml` and the
  `YAML.parseAllDocuments` validation passed after adding the flow.

### TEST-MAESTRO-002: Todos flow creates, filters, and deletes an isolated todo

- Small task: Add the independent Todos CRUD flow.
- Source: User request and `apps/expo/app/reference/todos.tsx` behavior.
- Test place: `apps/maestro/flows/todos-crud.yaml` on a booted device.
- Starting state: Reference server and Expo reference app are ready; no assumption is made about
  prior todo data.
- Exact input or fixture: A generated `maestro-e2e-<timestamp>` user ID and title `Buy oat milk`.
- Interaction steps: Generate the ID, deep-link to Todos, set the filter first, fill the create
  user/title fields, submit, assert the title, tap Delete, and assert the title is absent.
- Main behavior: The user can create a filtered todo and remove it.
- Expected result: The generated todo appears under the selected user and disappears after Delete.
- Must change: Add the CRUD flow and four app-level test IDs.
- Must not happen: Reuse hardcoded user data, use arbitrary sleeps, or leave the created todo after
  successful deletion.
- Planned command: `pnpm --filter maestro-tests test:ios` with a booted iOS Simulator and Maestro.
- Expected result before the code change: The package and flow do not exist, so the command cannot
  run.
- First observed run: `pnpm --filter maestro-tests test:ios` could not run because the workspace package did not exist yet.
- Passing rerun: Not reached; `pnpm --filter maestro-tests test:ios` started both services and
  cleaned them up, then failed with `spawn maestro ENOENT` before a device flow could execute.

### TEST-MAESTRO-003: Runner selects platforms and tears down processes

- Small task: Implement the runner lifecycle and platform selection.
- Source: User request, `scripts/run-app.mjs`, and exported `isPortAvailable` in
  `scripts/dev-ports.mjs`.
- Test place: `apps/maestro/scripts/run-flows.mjs` via lint and a controlled command invocation.
- Starting state: No runner exists; reference ports are 3001 and 8082.
- Exact input or fixture: No argument means iOS then Android; `--platform ios` selects only iOS;
  `--platform android` selects only Android.
- Interaction steps: Parse arguments, spawn both reference apps, poll both ports, invoke Maestro
  with the correct `MAESTRO_APP_ID` and `MAESTRO_HOST`, then terminate children in success and
  failure paths.
- Main behavior: The runner manages the complete local test lifecycle.
- Expected result: Correct platform invocations occur and child processes are terminated in a
  `finally` path even when Maestro exits nonzero.
- Must change: Add a focused ESM runner using the shared port helper.
- Must not happen: Duplicate port allocation logic, leak child processes, or run unrelated platform
  flows when a platform flag is supplied.
- Planned command: `pnpm --filter maestro-tests lint`
- Expected result before the code change: The package does not exist, so lint cannot run.
- First observed run: `pnpm --filter maestro-tests lint` reported that no workspace projects matched because the package did not exist yet.
- Passing rerun: `pnpm --filter maestro-tests lint` passed; the invalid-platform invocation failed
  closed, and the iOS runner invocation confirmed service startup, readiness polling, and cleanup.

### TEST-MAESTRO-004: Expo selector props preserve type safety

- Small task: Add the four requested test IDs without changing runtime behavior.
- Source: User request and existing `TextInputProps`/`PressableProps` forwarding components.
- Test place: `apps/expo/app/reference/todos.tsx` and Expo TypeScript project.
- Starting state: Todos controls have no explicit test IDs.
- Exact input or fixture: The four exact string IDs from the request.
- Interaction steps: Typecheck the Expo package after adding the props.
- Main behavior: Existing form and filter controls remain type-correct.
- Expected result: Expo typecheck passes with all four IDs present once each.
- Must change: Add only the four selector props.
- Must not happen: Change query behavior, labels, routes, or mutation logic.
- Planned command: `pnpm --filter expo typecheck`
- Expected result before the code change: The existing app typecheck is the baseline and should pass;
  no new selector IDs are present.
- First observed run: `pnpm --filter expo typecheck` passed before the selector changes.
- Passing rerun: `pnpm --filter expo typecheck` passed after adding all four selector IDs.

### TEST-MAESTRO-005: Root commands and repository checks remain consistent

- Small task: Wire root e2e command names and verify affected repository checks.
- Source: User request and root package conventions.
- Test place: Root `package.json`, package metadata, and repository validation commands.
- Starting state: Root script is named `e2e` and invokes Playwright.
- Exact input or fixture: `e2e:web` invokes `playwright-tests`; `e2e:mobile` invokes
  `maestro-tests`; no `e2e` key remains.
- Interaction steps: Inspect scripts and run formatting, lint, typecheck, and build checks.
- Main behavior: Mobile e2e remains outside Turbo and `just check`, matching Playwright precedent.
- Expected result: Script names and package metadata are exact; unrelated checks remain passing.
- Must change: Root script entries only; no Turbo or Justfile changes.
- Must not happen: Add a Turbo `test` task or include device-backed tests in `just check`.
- Planned command: `pnpm format:check && pnpm lint && pnpm typecheck && pnpm build && just check`
- Expected result before the code change: Existing repository checks provide the baseline; the new
  package and root script entries do not yet exist.
- First observed run: The combined repository command was deferred until the new package and root wiring exist.
- Passing rerun: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` passed. `just
check` passed lint and typecheck but stopped at the pre-existing formatting failure in
  `apps/expo/tsconfig.json`.

## Implementation Plan

1. Create `apps/maestro` metadata and docs, explicitly documenting the managed Expo Go prerequisite,
   iOS/Android app IDs, deep-link hosts, and the renamed root command.
2. Add the two flow files under `apps/maestro/flows`, using `evalScript` output assignment confirmed
   by current Maestro documentation.
3. Implement the runner with `spawn`, `isPortAvailable`, bounded readiness polling, platform mapping,
   `maestro test flows`, and signal-safe cleanup in `finally`.
4. Add the four selector props to the existing Expo Todos screen.
5. Update root scripts and `AGENTS.md`, run focused checks, record observed failures here, correct
   them, and rerun.

## Risks and Constraints

- This checkout calls the target app `expo`; no `student-expo` directory exists.
- Maestro CLI is installed outside npm and device runs require Expo Go plus a booted simulator/emulator.
- `.mono-stack.json` is generated/absent in this checkout; the runner should use the documented
  reference ports and the app scripts' existing port resolution.
- The request explicitly excludes Playwright fixes, skill changes, form/table flows, Turbo changes,
  and Justfile changes.

## Validation Notes

- Maestro CLI/device flow validation is environment-blocked: `maestro` is not installed, iOS has no
  booted Simulator, and the available Android emulator cannot be used without the CLI.
- `just check` has one pre-existing formatting failure in `apps/expo/tsconfig.json`; the file was
  restored after Expo's startup command rewrote it during the runner lifecycle check.

## Follow-up Validation

- [/] Format `apps/expo/tsconfig.json` and rerun `just check`. Deferred by user because device-backed
  validation is not required for this template-repository change.
- [/] Install the official Maestro CLI and rerun the available Android flow. Deferred by user because
  device-backed validation is not required for this template-repository change.
- [/] Record whether the Android flow reaches the app or exposes an additional environment/device
  issue. Deferred by user.

### Follow-up Findings

- The first Android run reached the Todos screen and passed creation, but the keyboard obscured
  `Delete`; the flow now dismisses the keyboard before the deletion assertion.
- The first suite run left Expo Go on the previous flow's screen before the navigation smoke flow;
  both flows now begin with `clearState` so they remain independent.

- User-directed deferral: device-backed Maestro assertions are intentionally not a completion
  requirement for this template-repository change.

## Updates

### 2026-08-23: Add dedicated Maestro authoring guidance

- Reason: The mobile command and flows were added without a dedicated writing skill, and the existing
  web skill did not explicitly require complete reachable non-happy-path accounting or test-specific
  seeded preconditions.
- Evidence: `pnpm e2e:mobile` exists, but no `maestro-mobile-e2e-test-writer` skill was present.
- Impact: Agents lacked portable guidance for authoring Maestro flows and deterministic seeded test
  data.
- Corrective action: Added the new skill and expanded the Playwright guidance in
  `docs/checklists/2026-08-23-expand-e2e-negative-path-and-maestro-skill.md`.
- Validation: Tracked in the linked checklist.
