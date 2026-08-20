# Support multiple named instances per feature in project creation

Status: active

Related: this is a new, unrelated feature to every other checklist in this directory dated
2026-08-20 (git-init, env-config, dev-TUI) — no prior checklist covers instance counts.

## Scope

- [x] `feature-config.js`: add a pure default-instance-naming helper; no other change.
- [x] `native-scaffold.js`: `selectedDefinitions()` fans out one definition per (feature, name)
      pair instead of one per feature.
- [x] `create-project.js`: `--app-name` CLI flag appends per feature id instead of overwriting;
      `appNames` resolves to `Record<featureId, string[]>` throughout.
- [x] `interactive-wizard.js`: new "how many" prompt per selected feature, then one name prompt per
      instance; `Confirmation` and `buildProjectArguments` iterate per instance.
- [x] `scripts/update-template.mjs`: fix `stackAppExcludes()`'s feature-only lookup, which silently
      picks an arbitrary instance once a feature has more than one.
- [x] `copier.yml`: confirmed no change needed (re-verified at implementation time by re-reading the
      file — still exactly 6 boolean `feature_*` questions, nothing else).
- [x] Mid-implementation scope change (user, live): default instance names always carry an
      `-app-N` suffix, even for a single default instance (e.g. one Next.js app defaults to
      `next-app-1`, not bare `next`) — applies uniformly to every feature type. Changed
      `defaultInstanceName` and `createProject()`'s zero-config fallback to match; see the
      dedicated "Discovered/changed" note below for the full ripple of test updates this required.

## Acceptance Criteria

- Selecting a feature with count 2+ scaffolds that many distinct, correctly-named apps.
- Duplicate final app names — across two instances of the same feature, or across different
  features — are rejected with the existing `App names must be unique: <name>` error.
- `--app-name <feature>:<name>` repeated for the same feature id appends instead of overwriting.
- The wizard's "how many" → name×N sequence chains correctly across multiple selected features, and
  Back navigation is well-defined at every step.
- `scripts/update-template.mjs` correctly identifies the canonical-path instance of a feature even
  when a non-canonical-named instance of that feature sorts first in `config.apps`.
- No existing single-instance behavior regresses (a project selecting each feature exactly once,
  the default/zero-config path, behaves identically to before).

## Test Cases

### TEST-MULTI-001: `defaultInstanceName` derives sequential default names

- Small task: `feature-config.js`'s new naming helper.
- Source: plan design — needed by both the wizard and `create-project.js` defaulting.
- Test place: `core/create-mono-stack/test/feature-config.test.js`.
- Starting state: `defaultInstanceName` does not exist.
- Exact input or fixture: `defaultInstanceName("web-next", 0)`, `defaultInstanceName("web-next", 1)`,
  `defaultInstanceName("web-next", 2)`.
- Interaction steps: call the function directly.
- Main behavior: every instance index returns `<default>-app-<N>` (1-based), including index 0 —
  updated mid-implementation per explicit user instruction (see Scope note) from the original design
  of "index 0 = bare default name, index 1+ = `<default>-<N+1>`".
- Expected result: `"next-app-1"`, `"next-app-2"`, `"next-app-3"`.
- Must change: `feature-config.js` exports `defaultInstanceName`.
- Must not happen: `DEFAULT_FEATURE_NAMES`'s existing single-name values change (they remain the
  bare base names; only `defaultInstanceName`'s derived output changed).
- Planned command: `node --test core/create-mono-stack/test/feature-config.test.js`
- Expected result before the code change: fails — `defaultInstanceName` is not exported.
- First observed run: Confirmed failing — `SyntaxError: The requested module '../src/feature-config.js' does not provide an export named 'defaultInstanceName'`.
- Passing rerun: Confirmed — 7/7 pass after adding the export (first with the original index-0-bare
  scheme, then re-confirmed 7/7 again after the mid-implementation `-app-N`-always rename).

### TEST-MULTI-002: `selectedDefinitions` fans out N definitions for N names on one feature

- Small task: `native-scaffold.js`'s `selectedDefinitions()` multi-instance fan-out.
- Source: plan design.
- Test place: `core/create-mono-stack/test/native-scaffold-selection.test.js`.
- Starting state: `selectedDefinitions` (via `scaffoldNativeApps`) produces exactly one definition
  per selected feature, `appNames` values are single strings.
- Exact input or fixture: `appNames: { "web-next": ["next", "admin-next"] }, features: ["web-next"]`.
- Interaction steps: call `scaffoldNativeApps` with a fixture that fakes the `next` generator twice.
- Main behavior: two definitions/apps are produced for the one selected feature, each with its own
  `name`.
- Expected result: two staged apps named `next` and `admin-next`, both `feature: "web-next"`.
- Must change: `native-scaffold.js` `appNames` fixtures move to array shape across this test file.
- Must not happen: only one app scaffolds; the second name is silently dropped.
- Planned command: `node --test core/create-mono-stack/test/native-scaffold-selection.test.js`
- Expected result before the code change: fails — today's `.map()` produces at most one definition
  per feature regardless of array length in `appNames`.
- First observed run: N/A — written directly against the new `.flatMap()` implementation together
  with the mechanical fixture-shape updates (33/33 baseline confirmed passing beforehand with the
  old shape).
- Passing rerun: Confirmed — 9/9 pass in `native-scaffold-selection.test.js` including this case.

### TEST-MULTI-003: duplicate final names within the same feature are rejected

- Small task: global app-name uniqueness now reachable within one feature.
- Source: plan acceptance criteria; existing `definitions.findIndex` check in `selectedDefinitions`.
- Test place: `core/create-mono-stack/test/native-scaffold-selection.test.js`.
- Starting state: duplicate-name rejection is only tested across two different features today.
- Exact input or fixture: `appNames: { "web-next": ["next", "next"] }, features: ["web-next"]`.
- Interaction steps: call `scaffoldNativeApps`.
- Main behavior: the existing uniqueness check fires for same-feature duplicates too.
- Expected result: throws `App names must be unique: next`.
- Must change: nothing in source (this proves existing logic already covers it once flattened).
- Must not happen: any native CLI invocation occurs before the check throws.
- Planned command: `node --test core/create-mono-stack/test/native-scaffold-selection.test.js`
- Expected result before the code change: N/A — unreachable today (at most one definition per
  feature).
- First observed run: N/A — new behavior, no prior state to observe failing.
- Passing rerun: Confirmed — passes; the existing `definitions.findIndex` uniqueness check already
  covered this once `selectedDefinitions` flattens correctly, no extra source change needed.

### TEST-MULTI-004: canonical placeholder removed exactly once for N instances

- Small task: cleanup loop stays correct with multiple instances of one feature.
- Source: plan — `native-scaffold.js`'s cleanup loop is keyed on `appDefinitions` (per feature type),
  not per instance.
- Test place: `core/create-mono-stack/test/native-scaffold.test.js`.
- Starting state: cleanup loop already iterates `appDefinitions` once per feature type.
- Exact input or fixture: two `web-next` instances.
- Interaction steps: call `scaffoldNativeApps`, inspect the `rm` calls recorded by the test fixture.
- Main behavior: `apps/next` (the canonical placeholder) is removed exactly once, not twice.
- Expected result: one `rm` call for the canonical `next` path, regardless of instance count.
- Must change: nothing (regression guard for existing correct behavior).
- Must not happen: the placeholder is removed once per instance or not removed at all.
- Planned command: `node --test core/create-mono-stack/test/native-scaffold-selection.test.js`
  (added here alongside TEST-MULTI-002/003, not `native-scaffold.test.js` — same fixture harness,
  more convenient co-location for the `rm`-intercepting assertion).
- Expected result before the code change: N/A — not reachable before this change (only one
  instance possible).
- First observed run: N/A — new behavior.
- Passing rerun: Confirmed — intercepted `rm` calls show the canonical `apps/next` placeholder
  removed exactly once regardless of instance count; both final instances (`apps/admin-next`,
  `apps/second-next`) exist afterward.

### TEST-MULTI-005: `parseArguments` appends repeated `--app-name` for the same feature

- Small task: CLI flag parity with the wizard.
- Source: user's confirmed requirement 3; plan design.
- Test place: `core/create-mono-stack/test/create-project-native.test.js` (or wherever
  `parseArguments` is unit-tested — confirm exact file at implementation time).
- Starting state: a second `--app-name web-next:<x>` for the same feature id overwrites the first.
- Exact input or fixture:
  `["--app-name", "web-next:next", "--app-name", "web-next:admin-next", "--", "dest"]`.
- Interaction steps: call `parseArguments(args)`.
- Main behavior: both names are retained for the feature id.
- Expected result: `result.appNames["web-next"]` deep-equals `["next", "admin-next"]`.
- Must change: `parseArguments`'s `--app-name` reduce.
- Must not happen: the first name is dropped.
- Planned command: `node --test core/create-mono-stack/test/cli.test.js`
  (moved from `create-project-native.test.js` — `parseArguments` is unit-tested in `cli.test.js`,
  confirmed by grep before writing the case).
- Expected result before the code change: fails — `result.appNames["web-next"]` is currently
  `"admin-next"` (last-write-wins on a plain string).
- First observed run: Confirmed failing — `actual: { 'web-next': 'admin-next' }` vs
  `expected: { 'web-next': ['next', 'admin-next'] }`.
- Passing rerun: Confirmed — 17/17 pass in `cli.test.js` after the `parseArguments` append fix.
  Discovered and fixed a stale fixture in the same file
  ("runs native scaffolding for wizard-shaped app names") that was silently passing because
  `createProject()`'s resolution only wrapped the _legacy_ singular flags/defaults into arrays, not
  an already-bare-string `options.appNames[feature]` passed by a direct caller — updated that test's
  input and expected output to array shape to match the new contract (no source change needed
  beyond the `createProject()` resolution fix already made for TEST-MULTI-006).

### TEST-MULTI-006: `createProject` resolves `appNames` to arrays for every selected feature

- Small task: `createProject()`'s internal `appNames` resolution.
- Source: plan design.
- Test place: `core/create-mono-stack/test/create-project-native.test.js`.
- Starting state: `scaffoldOptions.appNames` is `Record<featureId, string>`.
- Exact input or fixture: `features: ["api-nest", "web-vite"]`, no explicit `appNames`.
- Interaction steps: call `createProject(options, dependencies)` with a stubbed scaffold.
- Main behavior: default names resolve as one-element arrays when nothing else is supplied.
- Expected result: `scaffoldOptions.appNames` deep-equals
  `{ "api-nest": ["server"], "web-vite": ["web"] }`.
- Must change: `createProject()`'s `appNames` construction.
- Must not happen: any feature resolves to a bare string instead of an array.
- Planned command: `node --test core/create-mono-stack/test/create-project-native.test.js`
- Expected result before the code change: fails — values are currently bare strings.
- First observed run: N/A — no separate new test written; the existing
  `TEST-SELECTION-001 scaffolds default Vite and NestJS apps` case already covers exactly this
  default-resolution scenario, so its fixture/expectation was updated to array shape instead of
  adding a duplicate case (avoids a redundant test asserting the same behavior twice).
- Passing rerun: Confirmed — 23/23 pass in `create-project-native.test.js` + `cli.test.js` combined
  run, including the updated `TEST-SELECTION-001` and `TEST-MANIFEST-001`.

### TEST-MULTI-007: wizard "how many" then name×N sequence, chaining across two features

- Small task: `interactive-wizard.js`'s new prompt sequence and `buildProjectArguments` output.
- Source: user's confirmed UX decision.
- Test place: `core/create-mono-stack/test/interactive-wizard.test.js`.
- Starting state: one name prompt per selected feature, no count prompt.
- Exact input or fixture: select `web-vite` and `web-next`; answer "2" to Vite's count, name both;
  accept "1" default for Next.js, name it.
- Interaction steps: drive the Ink test harness through destination → project name → features →
  Vite count ("2") → Vite name 1 → Vite name 2 → Next.js count ("1", default) → Next.js name →
  advanced → confirm.
- Main behavior: the full sequence renders in the right order and completes.
- Expected result: `buildProjectArguments(answers)` contains two `--app-name=web-vite:...` flags (in
  entry order) and one `--app-name=web-next:...` flag.
- Must change: the wizard's step sequencing, `Confirmation`, `buildProjectArguments`.
- Must not happen: the sequence skips a name prompt, double-prompts, or loses an already-entered
  name when the user changes a count and goes back.
- Planned command: `node --test core/create-mono-stack/test/interactive-wizard.test.js`
- Expected result before the code change: fails — no count screen exists yet; `buildProjectArguments`
  currently emits exactly one `--app-name` flag per feature.
- First observed run: N/A — implemented directly against the new wizard step-machine design
  (`featureCountStep`/`featureNameStep(featureId, instanceIndex)`, `CountQuestion` component); the
  23 pre-existing wizard tests were run first without this new case to confirm the baseline sequence
  changes were correct (all 23 passed after inserting count-screen waits into every affected test),
  then this case was added on top.
- Passing rerun: Confirmed — 24/24 pass (23 existing + this one) in `interactive-wizard.test.js`.
  Also discovered during Back-navigation design that the plan's original assumption ("instance 0's
  Back goes to that feature's own count step") would have broken the existing
  "navigates backward through selected app-name screens" test, which expects Back from one feature's
  first name screen to land directly on the _previous_ feature's last name screen, skipping any
  count step entirely. Revised the design to match: only the count step's own Back (and instance
  0's Back, which now targets the same place) route to the previous feature; a feature's own count
  step is only reachable going forward, not by backing out of instance 0. Documented as
  `previousFeatureTarget()` in the implementation.

### TEST-MULTI-008: two Vite instances get independently-detected reference profiles

- Small task: confirm no special-casing is needed for `interactive: true` features under
  multi-instance.
- Source: plan's investigated-and-resolved finding — each loop iteration already gets a fresh
  `createViteWizardObserver()`.
- Test place: `core/create-mono-stack/test/native-scaffold-overlays.test.js` (or wherever Vite
  profile-detection fixtures already live).
- Starting state: only one Vite instance is possible today, so this path is untested for
  cross-instance independence.
- Exact input or fixture: two `web-vite` instances, one fed a React+TS transcript, one fed a
  transcript that fails `selectionSupportsViteProfile`.
- Interaction steps: call `scaffoldNativeApps` with a fixture `runInteractiveCommand` that returns a
  different simulated transcript per call.
- Main behavior: each instance's `referenceProfile` in the returned record reflects only its own
  transcript.
- Expected result: instance 1's record has a real `referenceProfile`; instance 2's is `null`; no
  cross-contamination.
- Must change: nothing in source (regression/confirmation test for existing correct isolation).
- Must not happen: both instances end up with the same profile due to shared observer state.
- Planned command: `node --test core/create-mono-stack/test/native-scaffold-overlays.test.js`
- Expected result before the code change: N/A — not reachable before this change.
- First observed run: N/A — new behavior.
- Passing rerun: Confirmed — instance 1 (React+TS transcript) gets `vite/react-ts`; instance 2 (Vue
  transcript, same underlying native tree) gets `null`, exactly matching the existing
  `TEST-VITE-PROFILE-002` single-instance case for that same selection — confirms no
  cross-instance state leakage.

### TEST-MULTI-009: `stackAppExcludes` finds the canonical-path instance regardless of array order

- Small task: fix the confirmed bug in `scripts/update-template.mjs`.
- Source: verified directly this session — `config.apps.find(record => record.feature === feature)`
  ignores `path`, so it can return a non-canonical instance first.
- Test place: wherever `scripts/update-template.mjs` is unit-tested today (confirm exact file/test
  name at implementation time — likely `core/create-mono-stack/test/template-update.test.js` or a
  root-level script test; verify before writing).
- Starting state: `config.apps = [{feature: "web-next", path: "apps/admin-next", ...}, {feature: "web-next", path: "apps/next", referenceProfile: "next/default", ...}]` — the non-canonical instance sorts first.
- Exact input or fixture: the `config` object above passed to `stackAppExcludes`.
- Interaction steps: call `stackAppExcludes(config)`.
- Main behavior: the function must still recognize that `apps/next` (the canonical path) has an
  active reference profile and should NOT be excluded from Copier management.
- Expected result: `apps/next` is absent from the returned exclude list; `apps/admin-next` was never
  a candidate (only canonical paths are ever considered) so it's unaffected either way.
- Must change: `config.apps.find(...)` gains a `record.path === canonicalPath` condition.
- Must not happen: `apps/next` gets wrongly excluded because `.find()` returned the
  `apps/admin-next` record first.
- Planned command: `node --test core/create-mono-stack/test/template-update-stack.test.js`
  (confirmed exact file/harness by reading it — `stackAppExcludes` isn't exported directly, it's
  exercised indirectly through `updateTemplate()` and the `exclusions()`/`runUpdate()` test helpers
  already in that file, matching `TEST-UPDATE-001..008`'s pattern).
- Expected result before the code change: fails with the fixture above (demonstrates the bug).
- First observed run: Confirmed failing — but only after also discovering and fixing an unplanned
  blocker: `scripts/stack-config.mjs`'s `readStackConfig()` validator rejected the fixture outright
  with `duplicate app feature: web-next` before the real bug could even be exercised (see the new
  "Discovered Issue" section above). After removing that rejection, TEST-UPDATE-009 failed exactly
  as predicted: `actual` incorrectly included `apps/next` in the exclude list (should not — it has
  an active reference profile at its canonical path) because `.find()` picked the non-canonical
  `admin-next` record first.
- Passing rerun: Confirmed — after adding the `record.path === canonicalPath` condition to the
  `.find()` lookup, `apps/next` is correctly omitted from the exclude list while `apps/admin-next`
  (never a candidate — only canonical paths are ever considered) is unaffected. 58/58 pass across
  `template-update-stack.test.js`, `stack-config.test.js`, and `template-update.test.js`.

## Discovered Issue: `scripts/stack-config.mjs` rejects duplicate app features

- [x] `readStackConfig()`'s validator explicitly threw `duplicate app feature: <id>` whenever two
      `apps[]` records shared a `feature` value (`scripts/stack-config.mjs:160-164`) — this was never
      called out in the original plan and would reject every valid multi-instance `.mono-stack.json`
      at template-update time, discovered via TEST-UPDATE-009 failing with exactly this error before
      any `update-template.mjs` change was even made.
  - [x] Removed the duplicate-feature rejection; kept the duplicate-_name_ rejection (still required —
        names must stay globally unique) and the "every selected feature has at least one app
        record" check (unaffected by duplicates, uses `.includes()`).
  - [x] Repurposed `TEST-MANIFEST-016` (previously asserted the now-obsolete rejection) into
        `TEST-MULTI-009b`, asserting the same fixture (two `web-vite` app records) is now _accepted_
        — the requirement explicitly changed, so updating this assertion (rather than leaving it
        stale or silently deleting it) follows testing-policy's "assertion is demonstrably
        incorrect" exception.

## Additional fixture fixes discovered during full-suite runs

- `core/create-mono-stack/test/copier-template.integration.native.js:132` still passed
  `appNames: { "api-nest": "server", "web-vite": "web" }` (old bare-string shape) — not caught by
  the initial `grep 'appNames.*: "' test/*.test.js` sweep because this helper file doesn't match the
  `*.test.js` glob. Found via a full `node --test test/*.test.js` run
  (`TypeError: instanceNames.map is not a function`), fixed to array shape, re-confirmed with a
  broader `test/*.js` grep that no other non-`.test.js` helper file had the same gap.
- After the mid-implementation default-naming change (`-app-N` always, not just for index > 0),
  re-swept every test asserting a _default_ (blank-submitted or zero-config) app name and updated:
  `TEST-SELECTION-001`/`TEST-MANIFEST-001` fixtures in `create-project-native.test.js`, and the
  `--app-name=web-vite:web` / `--app-name=api-nest:server` / `--app-name=web-next:next` literals
  across 4 tests in `interactive-wizard.test.js` (now `-app-1` suffixed). Also found and fixed a
  latent bug in "preserves leading hyphens in wizard values": it passed a field named `appNames` to
  `buildProjectArguments`, which only ever reads `answers.featureNames` — the test was silently
  exercising the _default_ fallback path the whole time, not the custom-name path it claimed to
  test, only unmasked because the old default coincidentally equaled the test's intended custom
  values. Renamed the input field to `featureNames` so the test now actually exercises what it says.

## Task-to-Test Map

- `defaultInstanceName` helper → TEST-MULTI-001
- `selectedDefinitions` fan-out → TEST-MULTI-002, TEST-MULTI-003, TEST-MULTI-004
- CLI `--app-name` append + `createProject` resolution → TEST-MULTI-005, TEST-MULTI-006
- Wizard prompt sequence → TEST-MULTI-007
- Vite per-instance isolation → TEST-MULTI-008
- `update-template.mjs` bug fix → TEST-MULTI-009
- `copier.yml` → no test needed; confirmed no change required, re-verified at implementation time.

## Validation Plan

- [x] Locate and confirm the exact existing test file(s) for `parseArguments`/`createProject` and
      for `scripts/update-template.mjs`, before writing TEST-MULTI-005/006/009 (confirmed:
      `parseArguments` → `cli.test.js`; `createProject` → `create-project-native.test.js`;
      `stackAppExcludes`/`update-template.mjs` → `template-update-stack.test.js`, indirectly via
      `updateTemplate()`).
- [x] Run each new/updated test's Planned command before the corresponding implementation change and
      record First observed run.
- [x] Implement `feature-config.js` → rerun TEST-MULTI-001.
- [x] Implement `native-scaffold.js` → rerun TEST-MULTI-002/003/004.
- [x] Implement `create-project.js` → rerun TEST-MULTI-005/006.
- [x] Implement `interactive-wizard.js` → rerun TEST-MULTI-007/008.
- [x] Implement `scripts/update-template.mjs` fix → rerun TEST-MULTI-009 (required first fixing the
      unplanned `stack-config.mjs` blocker — see "Discovered Issue" above).
- [x] Update every existing fixture using the old single-string `appNames`/`featureNames` shape
      (native-scaffold-selection.test.js, native-scaffold.test.js, native-scaffold-overlays.test.js,
      create-project-native.test.js, cli.test.js, interactive-wizard.test.js,
      copier-template.integration.native.js) to the new array shape.
- [x] Run `pnpm --filter create-mono-stack test` — 238/239 pass depending on file-set (one
      `interactive-wizard.test.js` timeout reproduced as pre-existing environmental flakiness, not a
      regression: 24/24 pass when that file is run in isolation; full suite reruns clean).
- [x] Run `pnpm --filter create-mono-stack test:integration` — passes end-to-end, all 8 stages
      (`docker-check` through `cleanup`) reached including `build`/`reference-development`.
- [x] Run `pnpm --filter create-mono-stack lint` — clean.
- [x] Run `just check` — exits 0 (lint, typecheck, build, format-check, skills-check, skills-test,
      template-test all pass).
