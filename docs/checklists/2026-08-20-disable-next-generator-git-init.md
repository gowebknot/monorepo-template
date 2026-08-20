# Disable create-next-app's automatic Git initialization during scaffolding

Status: active

Related: [2026-08-17-wire-next-expo-react-native-targets.md](2026-08-17-wire-next-expo-react-native-targets.md) (introduced the `next` generator case in `native-scaffold.js` that this checklist fixes)

## Scope

- [x] Prevent `create-next-app@latest` from initializing its own `.git` repository while
      `create-mono-stack` scaffolds a generated project's `apps/next`.
  - [x] Pass the CLI's git-disabling flag in `commandFor()`'s `"next"` case.
  - [x] Keep the existing post-hoc `.git` cleanup in `removeTemporaryArtifacts()` unchanged as
        defense-in-depth (not the primary fix).

## Root Cause

`core/create-mono-stack/src/native-scaffold.js`, `commandFor()`, case `"next"` (around lines 98-116),
invokes `pnpm dlx create-next-app@latest <target> ...` without any flag to suppress git
initialization. `create-next-app` runs its own `git init` by default. The scaffolder runs this
command with `cwd: dependencies.temporaryRoot`, a fresh `mkdtemp` directory that is not inside any
git repository, so `create-next-app` creates a nested `.git` there. This is currently masked only by
`removeTemporaryArtifacts()` deleting `.git` from the temp native-app directory before it's copied
into `apps/<name>` — fragile post-hoc cleanup rather than prevention. The sibling generators already
prevent this at the source: `"nestjs"` passes `--skip-git` (NestJS CLI flag name), `"react-native"`
passes `--skip-git-init` (React Native CLI flag name). Verified live against the official Next.js CLI
docs (nextjs.org/docs/app/api-reference/cli/create-next-app, version 16.3.1): the correct
`create-next-app` flag is `--disable-git` ("Explicitly tell the CLI to disable git initialization") —
**not** `--skip-git`, which is a different CLI's flag name and does not exist on `create-next-app`.

## Acceptance Criteria

- `commandFor()`'s `"next"` case passes `--disable-git` to `create-next-app@latest`.
- No other generator's command (`vite`, `nestjs`, `expo`, `react-native`) changes.
- `native-scaffold.test.js`'s assertion of the exact `next` command args reflects the new flag.

## Test Cases

### TEST-SCAFFOLD-001: `create-next-app` invocation includes the git-disabling flag

- Small task: Add `--disable-git` to the `"next"` case's args array in `commandFor()`.
- Source: Official Next.js CLI docs (`create-next-app` reference table) and the existing pattern for
  `"nestjs"`/`"react-native"` in the same file.
- Test place: `core/create-mono-stack/test/native-scaffold.test.js`, `TEST-COMMAND-005`.
- Starting state: The expected args array in `TEST-COMMAND-005` does not include `--disable-git`, and
  `commandFor()`'s `"next"` case does not pass it either.
- Exact input or fixture: `scaffoldNativeApps({ appNames: { "web-next": "next" }, features: ["web-next"], destination: fixture.destination }, dependencies(fixture))`.
- Interaction steps: Run the test file directly with `node --test`.
- Main behavior: The recorded fake-CLI call's `args` array for the `next` generator includes
  `--disable-git`.
- Expected result: `assert.deepEqual(fixture.calls, [...])` passes with `--disable-git` present in the
  expected args list.
- Must change: `core/create-mono-stack/src/native-scaffold.js` (`commandFor()`, `"next"` case) and
  `core/create-mono-stack/test/native-scaffold.test.js` (`TEST-COMMAND-005` expected args).
- Must not happen: Any other generator's (`vite`, `nestjs`, `expo`, `react-native`) recorded args
  change.
- Planned command: `node --test core/create-mono-stack/test/native-scaffold.test.js`
- Expected result before the code change: `TEST-COMMAND-005` fails — actual args array is missing
  `--disable-git` relative to the updated expectation.
- First observed run: Confirmed failing — `TEST-COMMAND-005` failed with
  `AssertionError [ERR_ASSERTION]`, diff showing expected `--disable-git` missing from the actual args
  array (8 pass / 1 fail overall).
- Passing rerun: Pending.

### TEST-SCAFFOLD-002: Full `create-mono-stack` unit suite stays green

- Small task: Confirm the change does not regress any other unit test in the package.
- Source: `core/create-mono-stack/AGENTS.md` validation section.
- Test place: `core/create-mono-stack` full unit test suite.
- Starting state: All unit tests pass before this change (pre-existing baseline).
- Exact input or fixture: N/A — full suite run.
- Interaction steps: Run `pnpm --filter create-mono-stack test`.
- Main behavior: Every test file in the suite passes, including the updated
  `native-scaffold.test.js`.
- Expected result: Exit code 0, no failing tests.
- Must change: N/A (verification only).
- Must not happen: Any unrelated test regressing.
- Planned command: `pnpm --filter create-mono-stack test`
- Expected result before the code change: N/A (baseline is expected to already pass except
  TEST-SCAFFOLD-001's target assertion once it's updated ahead of the implementation).
- First observed run: 227/230 pass after the implementation. The 3 failures
  (`TEST-ENV-001 provides safe environment defaults`, `builds workspace dependencies before starting
development`, `keeps project identity adapters synchronized with live source files`, all in
  `copier-template.test.js`) are pre-existing and unrelated to this task — they assert on
  `ALLOWED_ORIGINS`/`REFERENCE_ALLOWED_ORIGINS` env-fixture content tied to the separate, still
  in-progress `docs/checklists/2026-08-20-nest-root-env-config.md` task (its "Update generated-template
  fixtures and Turbo environment declarations" item is still unchecked). `copier-template.test.js` was
  already modified before this task started and contains no reference to `create-next-app` or
  `--disable-git`. Out of scope for this checklist.
- Passing rerun: `native-scaffold.test.js` (the file this task actually changes): 9/9 pass. Full suite
  is 227/230 pass with the 3 unrelated pre-existing failures above being the only remaining fails.

### TEST-SCAFFOLD-003: Integration test (`test:integration`) stays green

- Small task: Confirm the generated-output change satisfies the mandatory integration check.
- Source: `core/create-mono-stack/AGENTS.md` — "Any change to generated output must retain the
  `core/` exclusion and pass the create/update integration test."
- Test place: `core/create-mono-stack/test/copier-template.integration.test.js` (local-fixture based,
  `runCommand` is stubbed — no real network calls to `create-next-app`).
- Starting state: Integration suite passes before this change.
- Exact input or fixture: N/A — full integration suite run.
- Interaction steps: Run `pnpm --filter create-mono-stack test:integration`.
- Main behavior: The stubbed native-scaffold flow (which does not assert on `create-next-app`'s exact
  args) continues to pass.
- Expected result: Exit code 0, no failing tests.
- Must change: N/A (verification only).
- Must not happen: A new failure caused by the added flag.
- Planned command: `pnpm --filter create-mono-stack test:integration`
- Expected result before the code change: Passes (unaffected by the change, since this suite has no
  hardcoded `create-next-app` arg assertions).
- First observed run: Failed, but for a reason fully unrelated to this task —
  `assertReferenceBuilds` (`copier-template.integration.helpers.js:181-198`) fails with
  `ENOENT: apps/server/dist/reference/main.js` after `pnpm --filter server build:reference` inside the
  generated project. Confirmed this integration test only exercises
  `features: ["web-vite", "api-nest"]` (`copier-template.integration.native.js:130-134`) — the `"next"`
  generator case this task changes is never invoked here, so the flag addition cannot be the cause.
  The failure traces to the fixture-copied working tree (`copyTemplateFixture` copies live working-tree
  files, including uncommitted state) reflecting the separate, still in-progress
  `docs/checklists/2026-08-20-nest-root-env-config.md` task, whose "Apply the equivalent configuration
  to the reference server with `referenceServerEnvSchema`" item is still unchecked. Out of scope for
  this checklist; not fixed here. Flagging for the owning checklist/task instead.
- Passing rerun: Confirmed — the owning `docs/checklists/2026-08-20-nest-root-env-config.md` task fixed
  the root cause (`apps/server/reference/main.ts` importing across into `src/` broke the reference
  build's TypeScript `rootDir` inference, emitting to `dist/reference/reference/main.js` instead of
  `dist/reference/main.js`). `pnpm --filter create-mono-stack test:integration` now passes end-to-end
  (`build.completed`, `reference-preview.completed`, `reference-development.completed` all reached).

### TEST-SCAFFOLD-004: Lint stays clean

- Small task: Confirm the edited source file has no lint regressions.
- Source: `core/create-mono-stack/AGENTS.md` validation section.
- Test place: `core/create-mono-stack` ESLint config.
- Starting state: Lint passes before this change.
- Exact input or fixture: N/A.
- Interaction steps: Run `pnpm --filter create-mono-stack lint`.
- Main behavior: No new lint errors/warnings from the one-line array addition.
- Expected result: Exit code 0.
- Must change: N/A (verification only).
- Must not happen: New lint errors.
- Planned command: `pnpm --filter create-mono-stack lint`
- Expected result before the code change: Passes (baseline).
- First observed run: N/A — run after the implementation change (single-run check, no separate
  before/after state to compare for a lint pass/fail).
- Passing rerun: Confirmed — `pnpm --filter create-mono-stack lint` exits 0, no errors.

## Task-to-Test Map

- Add `--disable-git` flag → TEST-SCAFFOLD-001
- No regression in full unit suite → TEST-SCAFFOLD-002
- No regression in integration suite → TEST-SCAFFOLD-003
- No lint regression → TEST-SCAFFOLD-004

## Validation Plan

- [x] Run `node --test core/create-mono-stack/test/native-scaffold.test.js` before the change and
      record the failing result for TEST-SCAFFOLD-001.
- [x] Implement the flag addition.
- [x] Rerun `node --test core/create-mono-stack/test/native-scaffold.test.js` and record the passing
      result.
- [x] Run `pnpm --filter create-mono-stack test`. (227/230 pass; 3 pre-existing unrelated failures,
      see TEST-SCAFFOLD-002.)
- [x] Run `pnpm --filter create-mono-stack test:integration`. (Failed for a pre-existing, unrelated
      reason not exercising the changed code path; see TEST-SCAFFOLD-003.)
- [x] Run `pnpm --filter create-mono-stack lint`.

## Notes

The 4 pre-existing failures surfaced while validating this task (3 in `copier-template.test.js`, 1 in
`copier-template.integration.test.js`) are all traced to the separate, still in-progress
`docs/checklists/2026-08-20-nest-root-env-config.md` task and are unrelated to the `--disable-git`
change. See that checklist's `## Updates` section for the cross-link and follow-up.
