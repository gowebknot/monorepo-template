# Interactive `pnpm dev` / `pnpm dev:reference` via Turborepo TUI

Status: active

## Scope

- [x] Let a developer send keypresses to one dev-server task (e.g. React Native Metro's `r`/`d`,
      Expo CLI's `r`/`m`) while `pnpm dev:reference` (or `pnpm dev`) runs every app's dev server
      concurrently, without breaking the aggregate command or any scripted/non-interactive use of
      it.
  - [x] Enable Turborepo's interactive terminal UI (`--ui tui`) for the root `dev` and
        `dev:reference` scripts only (not `build`/`lint`/`typecheck`).
  - [x] Confirm no task-level `turbo.json` change is needed (persistent tasks are interactive by
        default). Left `turbo.json` untouched; both tasks already had `persistent: true`.
  - [x] Document the new pane-focus/keypress workflow near the existing `pnpm dev` references in
        `AGENTS.md` and `README.md`.
  - [x] Confirm the change survives Copier's Jinja `include` propagation into generated projects
        (no separate `.jinja` edits needed). Confirmed empirically: the integration test's
        generated-project assertion of `package.json`'s `dev:reference` script picked up the new
        `--ui tui` value automatically via `package.json.jinja`'s `include "package.json"` —
        matching the plan's prediction, no `.jinja` file needed editing.

## Acceptance Criteria

- `pnpm dev` and `pnpm dev:reference` open Turborepo's TUI (pane-per-task) when run in a real
  terminal.
- A developer can focus the `mobile` (or `expo`) pane and type Metro/Expo CLI keypresses that reach
  that task's process.
- `core/create-mono-stack/test/copier-template.integration.runtime.js`'s `runReferenceDevelopment()`
  — which spawns `pnpm dev:reference` with piped, non-TTY stdio — still passes; TUI mode must not
  hang, crash, or corrupt the piped output when there's no real TTY attached.
- `build`, `lint`, `typecheck` are unaffected (flag is scoped to `dev`/`dev:reference` only).

## Test Cases

### TEST-DEVTUI-001: `dev:reference` still works non-interactively (piped stdio)

- Small task: Confirm `--ui tui` doesn't break the create-mono-stack integration test's
  non-interactive spawn of `pnpm dev:reference`.
- Source: `core/create-mono-stack/test/copier-template.integration.runtime.js:86-165`
  (`runReferenceDevelopment`), which spawns `pnpm dev:reference` with
  `stdio: ["ignore", "pipe", "pipe"]` (no TTY) and asserts on captured output + HTTP readiness of
  both the web and reference-server ports.
- Test place: `core/create-mono-stack/test/copier-template.integration.test.js` (full integration
  suite, `test:integration` script).
- Starting state: Root `package.json`'s `dev`/`dev:reference` scripts run plain `turbo dev[:reference]`
  (stream mode, the current default).
- Exact input or fixture: A project generated from the current working-tree template (via the same
  fixture-copy + git-init pattern the integration test itself uses), with `apps/web` and
  `apps/server`'s reference profiles active.
- Interaction steps: Run `pnpm --filter create-mono-stack test:integration`.
- Main behavior: `runReferenceDevelopment()` spawns `pnpm dev:reference`, waits for both the web
  dev server and the reference API's `/users` endpoint to respond, then cleanly closes the process
  tree.
- Expected result: Test passes — `result.webStatus === 200`, `Array.isArray(result.users)` is true,
  and `forcedKill` is `false` (graceful shutdown, not a forced kill from a hang).
- Must change: Root `package.json`'s `dev`/`dev:reference` scripts to add `--ui tui`.
- Must not happen: The spawned process hangs past the test's readiness timeout, crashes, or writes
  raw TUI/ANSI escape sequences that break the output-based assertions in `outputError()`.
- Planned command: `pnpm --filter create-mono-stack test:integration`
- Expected result before the code change: N/A — this test already passes with the current
  (non-TUI) scripts; this case exists to catch a regression from the change, not to fix an existing
  failure.
- First observed run: Confirmed passing baseline before the change — 1/1 pass, `reference-development.completed`
  reached cleanly (`runReferenceDevelopment` succeeded via the current non-TUI `pnpm dev:reference`).
- Passing rerun: Confirmed — after adding `--ui tui`, one hardcoded assertion in
  `copier-template.integration.helpers.js:24-27` (`assertGeneratedProject`) needed updating to the
  new expected script string (`"turbo dev:reference --ui tui"`), matching the same
  Jinja-`include`-propagation pattern already established for `package.json` this session. After
  that fix, `pnpm --filter create-mono-stack test:integration` passes 1/1, with
  `reference-development.completed` reached and no hang/crash — confirms Turborepo's TUI gracefully
  falls back to plain output for the non-TTY piped-stdio spawn in `runReferenceDevelopment`.

### TEST-DEVTUI-002: `build`/`lint`/`typecheck` are unaffected

- Small task: Confirm the `--ui tui` flag is scoped only to `dev`/`dev:reference` and doesn't leak
  into other turbo tasks.
- Source: Plan's explicit constraint — flag added to root `package.json` scripts, not `turbo.json`
  globally.
- Test place: Repo-root `just check` gate.
- Starting state: `build`, `lint`, `typecheck` run in default stream mode.
- Exact input or fixture: N/A — full gate run.
- Interaction steps: Run `just check`.
- Main behavior: `pnpm build`, `pnpm lint`, `pnpm typecheck` (and everything else `just check`
  covers) run exactly as before, unaffected by the `dev`/`dev:reference` script changes.
- Expected result: `just check` exits 0.
- Must change: N/A (verification only).
- Must not happen: Any new failure introduced by this change.
- Planned command: `just check`
- Expected result before the code change: Passes (established baseline from prior session work).
- First observed run: Failed — `core/create-mono-stack/test/copier-template.test.js:252-253`
  ("builds workspace dependencies before starting development") hardcodes the exact `dev`/
  `dev:reference` script strings and needed updating to `"turbo dev --ui tui"` /
  `"turbo dev:reference --ui tui"`, the same kind of stale-fixture pattern already fixed once this
  session for `ALLOWED_ORIGINS`. Not a real regression — the test itself needed to change to match
  the intended new script content.
- Passing rerun: Confirmed — after updating the two hardcoded script assertions, `just check` exits
  0 with all 230 `create-mono-stack` unit tests passing, plus the repo-wide lint/typecheck/build/
  format-check/skills-check gate.

### TEST-DEVTUI-003: Manual interactive verification (cannot be scripted)

- Small task: Confirm a developer can actually focus a pane and send a keypress that reaches
  Metro/Expo.
- Source: User's original report — "I am not able to interact with individual server... React
  Native for example, I need the server so that I can press keys."
- Test place: Manual, real-terminal check (outside this tool's non-TTY execution context).
- Starting state: N/A.
- Exact input or fixture: N/A.
- Interaction steps: In a real terminal, run `pnpm dev:reference`; once Turborepo's TUI renders,
  select the `mobile` (or `expo`) pane and press `r`.
- Main behavior: The keypress reaches Metro/Expo's process and triggers its documented reload
  behavior, visible in that pane's log output.
- Expected result: Reload happens; other panes keep running unaffected.
- Must change: N/A (behavioral verification only; this tool cannot execute it directly since it has
  no real TTY — reported here as a documented manual step for the user, not something this agent
  can mark passing).
- Must not happen: N/A.
- Planned command: `pnpm dev:reference` (manual, real terminal).
- Expected result before the code change: TUI does not exist; all output interleaved, no pane
  focus, no way to send a keypress to one task.
- First observed run: N/A — this is the reported problem, not a command result.
- Passing rerun: To be confirmed by the user in their own terminal; cannot be verified from within
  this tool session (no TTY available here).

## Task-to-Test Map

- Enable `--ui tui` on `dev`/`dev:reference` → TEST-DEVTUI-001, TEST-DEVTUI-003
- Scope confirmation (other tasks unaffected) → TEST-DEVTUI-002
- Documentation update → no automated test; reviewed by reading the edited `AGENTS.md`/`README.md`
  sections after the change.

## Validation Plan

- [x] Run `pnpm --filter create-mono-stack test:integration` before the change to record the
      passing baseline for `runReferenceDevelopment`.
- [x] Implement the `package.json` script changes.
- [x] Rerun `pnpm --filter create-mono-stack test:integration` and record the result for
      TEST-DEVTUI-001.
- [x] Run `just check` and record the result for TEST-DEVTUI-002.
- [x] Update `AGENTS.md` and `README.md` with the pane-focus/keypress note.
- [x] Run `pnpm format:check`.

## Notes

TEST-DEVTUI-003 (actually pressing a key and seeing Metro/Expo react) cannot be executed from
within this tool session — there is no real TTY available here, and Turborepo's TUI fundamentally
requires one to render. This is documented as a manual step for the user to confirm in their own
terminal; everything else that _can_ be verified from this session (the script change itself, no
regression in the non-TTY integration-test path, no regression in build/lint/typecheck, and doc
updates propagating correctly to generated projects) has been confirmed.
