# Multi-Instance Development Port Allocation

- Checklist ID: CHECKLIST-20260820-multi-instance-port-allocation
- Created: 2026-08-20
- Planning completed: 2026-08-20
- Type: Bug fix
- Source request: Assign distinct development and reference ports to every generated app instance.
- Related release: `create-mono-stack@0.1.15`
- Status legend: `[ ]` incomplete, `[x]` complete, `[/]` partial

## Implementation Description

- Add generic per-instance `dev` and `reference` port assignments to the generated stack manifest.
- Allocate stable ports while skipping occupied ports and ports assigned to other instances.
- Add generated runtime helpers that inject the assigned port into Vite, Next, Nest, Expo, and React Native commands.
- Preserve existing single-instance defaults and assign ports to newly managed app instances.

## Acceptance Criteria

- [x] Multiple instances of the same app type receive distinct ports.
- [x] Different app instances do not receive conflicting ports within the same launch mode.
- [x] Occupied ports are skipped during allocation.
- [x] Existing assignments remain stable when the project is updated or a new app is added.
- [x] Generated app scripts use their assigned port for `dev` and `dev:reference`.
- [x] The generated project manifest remains valid and old manifests without port data remain usable.
- [x] The original single web/server workflow remains compatible.

## Validation Notes

- The first focused run passed the new allocator tests (`4/4`), generated helper tests (`2/2`), and
  launcher lint. The focused Prettier check reported formatting issues in five edited files; those
  files will be formatted before the validation rerun.
- The first full launcher test run then exposed three compatibility failures: the generated root
  script expectation was stale, and mocked creation/management fixtures did not materialize package
  files for script rewriting. The implementation will update the expectation and skip rewriting a
  package record when its fixture has no package file.
- The corrected launcher run passed `251/252`; the remaining failure was the expected manifest
  assertion, which still lacked the newly assigned `dev` and `reference` ports. The assertion will
  be updated to include those assignments.
- The first integration run then found one stale generated-root script assertion. The integration
  fixture will be updated to expect the port preflight script and to assign ports when it manually
  scaffolds native apps.
- The next integration run reached the generated web package and found its expected reference script
  still pointed at the old fixed-port command. The fixture will now expect the shared runtime launcher.
- The following integration run exposed that the runtime helper resolved the manifest from the app
  directory instead of the workspace root, and the fixture still rewrote the script to bypass the
  helper. Both paths will be corrected so the real shared launcher is exercised.
- The next integration run successfully started both generated services but could not fetch Vite's
  localhost URL because the helper did not force the test host address. The Vite reference command
  will bind explicitly to `127.0.0.1`.
- Final validation passed: launcher tests `252/252`, launcher lint, focused generated-helper tests
  `2/2`, focused formatting, and the full Copier integration flow `1/1`. The integration exercised
  the shared app launcher for both the generated web and Nest reference services.
- Added a legacy-project migration path in the generated port preflight so older app scripts are
  rewritten to the shared launcher when their project starts after a template update.
- The final focused formatting check found one layout issue in `scripts/dev-ports.test.mjs`; it will
  be formatted and rerun.
- Final rerun after preserving the existing single-instance reference defaults passed the allocator
  tests (`7/7` combined), launcher tests (`252/252`), launcher lint, formatting, skills validation,
  whitespace checks, and the full generated-project integration (`1/1`).

## Exact Test Cases

### TEST-PORT-001: Allocate distinct ports

- **Small task:** Assign distinct ports to repeated app instances.
- **Source:** User report and generated manifest requirements.
- **Test place:** Port allocator unit test.
- **Starting state:** Three Nest, two Vite, and two Expo app records with no ports.
- **Exact input or fixture:** App records with names `server`, `server-app-2`, `web`, `web-app-2`, `expo`, and `expo-app-2`.
- **Interaction steps:** Allocate ports for both `dev` and `reference` modes.
- **Main behavior:** Every app/mode pair receives a unique port.
- **Expected result:** No two assignments share a port; defaults remain in their documented families.
- **Must change:** Port assignments only.
- **Must not happen:** Existing app names or feature metadata change.
- **Planned command:** `node --test scripts/dev-ports.test.mjs`
- **Expected result before the code change:** No allocator exists and the test cannot pass.
- **First observed run:** Generated helper allocation test passed.
- **Passing rerun:** Full launcher validation passed with `252/252` tests.

### TEST-PORT-002: Skip occupied ports

- **Small task:** Avoid ports already bound by another process.
- **Source:** User request for free-port checking.
- **Test place:** Port allocator unit test with an injected port checker.
- **Starting state:** Preferred port `3001` is occupied and `3002` is free.
- **Exact input or fixture:** One API reference instance and a checker returning occupied for `3001`.
- **Interaction steps:** Allocate the instance port.
- **Main behavior:** The allocator advances to the next free port.
- **Expected result:** The assigned port is `3002`.
- **Must change:** Only the selected port.
- **Must not happen:** The allocator must not reuse the occupied port or probe indefinitely.
- **Planned command:** `node --test scripts/dev-ports.test.mjs --test-name-pattern='occupied'`
- **Expected result before the code change:** No free-port allocation behavior exists.
- **First observed run:** Occupied-port allocator test passed with the injected occupied port skipped.
- **Passing rerun:** Full launcher validation passed with the occupied-port behavior included.

### TEST-PORT-003: Preserve assignments and allocate new instances

- **Small task:** Keep existing ports stable when adding an app.
- **Source:** Manifest persistence and project management behavior.
- **Test place:** Manifest/management unit test.
- **Starting state:** Manifest contains `server` on `3001` and `server-app-2` on `3002`.
- **Exact input or fixture:** Add `server-app-3` while existing ports are free.
- **Interaction steps:** Read the manifest, add the app, and allocate only its missing ports.
- **Main behavior:** Existing assignments remain unchanged.
- **Expected result:** Existing ports stay `3001`/`3002`; the new app receives the next available port.
- **Must change:** New app record and its port data.
- **Must not happen:** Existing manifest records must not be renumbered.
- **Planned command:** `node --test core/create-mono-stack/test/project-management.test.js --test-name-pattern='port'`
- **Expected result before the code change:** Management does not assign port metadata.
- **First observed run:** Existing-port preservation test passed; management integration initially exposed only fixture package-file assumptions.
- **Passing rerun:** Full launcher validation passed and new managed apps retain existing port assignments.

### TEST-PORT-004: Inject ports into every supported app command

- **Small task:** Pass assigned ports to all generated app frameworks.
- **Source:** Existing package scripts for Vite, Next, Nest, Expo, and React Native.
- **Test place:** Generated script/runtime helper tests.
- **Starting state:** Manifest has assigned ports for each supported app and mode.
- **Exact input or fixture:** `web`, `next`, `server`, `expo`, and `mobile` app package directories.
- **Interaction steps:** Build the command for each app and mode.
- **Main behavior:** Each command receives its manifest-assigned port.
- **Expected result:** Vite/Next/Expo/RN receive `--port`; Nest receives the correct environment variable.
- **Must change:** Child process environment or argument list.
- **Must not happen:** Commands must not fall back to a shared default when an assignment exists.
- **Planned command:** `node --test scripts/dev-ports.test.mjs --test-name-pattern='framework commands'`
- **Expected result before the code change:** Existing scripts use shared defaults or fixed ports.
- **First observed run:** Framework command test passed for Vite, Next, Expo, and React Native; Nest environment injection is covered by the shared launcher implementation.
- **Passing rerun:** Full Copier integration passed while starting generated Vite and Nest services through the shared launcher.

### TEST-PORT-005: Preserve legacy manifests and defaults

- **Small task:** Keep existing generated projects usable without port metadata.
- **Source:** Existing schema validation and backward-compatible template updates.
- **Test place:** Stack manifest tests and generated project integration test.
- **Starting state:** Schema version 3 manifest with no `ports` fields.
- **Exact input or fixture:** Existing default web/server manifest and root `.env` defaults.
- **Interaction steps:** Validate the manifest and run the normal generated dev/reference setup.
- **Main behavior:** Missing port metadata is completed or defaults are used safely.
- **Expected result:** Existing projects remain valid and the default web/server ports continue to work.
- **Must change:** Port metadata may be added when required.
- **Must not happen:** Existing app records or user files must not be lost.
- **Planned command:** `pnpm --filter create-mono-stack test && pnpm --filter create-mono-stack test:integration`
- **Expected result before the code change:** Existing tests pass but no multi-instance port behavior exists.
- **First observed run:** The initial full launcher run failed on stale script/manifest expectations before implementation compatibility fixes.
- **Passing rerun:** Launcher tests passed `252/252` and the full generated-project integration test passed `1/1`.

## Test-To-Task Map

| Small task                      | Test IDs                         |
| ------------------------------- | -------------------------------- |
| Allocate distinct ports         | `TEST-PORT-001`, `TEST-PORT-002` |
| Preserve and extend assignments | `TEST-PORT-003`                  |
| Inject framework ports          | `TEST-PORT-004`                  |
| Preserve legacy behavior        | `TEST-PORT-005`                  |

## Risks And Non-Goals

- Port allocation does not automatically rewrite arbitrary user-authored API URLs; those mappings must remain explicit.
- A port can become occupied after allocation, so runtime launchers must report the conflict clearly.
- Mobile device networking and host LAN address discovery remain outside this change.
