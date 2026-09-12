# Ask before including Maestro/Playwright; exclude them natively when declined or irrelevant

Checklist ID: 2026-09-13-conditional-maestro-playwright-inclusion
Related checklists: [[2026-09-13-orphaned-e2e-suites-and-rename-fragile-imports]] (parent)

## Change Tier

Tier: standard

## Context

See the parent checklist for full investigation. This child: (1) the interactive wizard asks whether
to include Maestro mobile E2E tests only when `mobile-expo` or `mobile-react-native` was selected, and
whether to include Playwright web E2E tests only when `web-vite` or `web-next` was selected; (2) the
non-interactive CLI/programmatic path defaults to "include" for backward compatibility, with new
`--no-maestro`/`--no-playwright` opt-outs; (3) `copier.yml` gains two new boolean answers and two new
Jinja-conditional `_exclude` entries so `apps/maestro`/`apps/playwright` are never copied when not
wanted — natively, so the exclusion also survives `copier update` (verified empirically against a
real `copier` 9.17.1 install: `_exclude` entries are Jinja-rendered per copy/update, confirmed both
that a `false` answer excludes the directory on initial `copy` and that the mechanism is not
copy-specific in the Copier source).

## Implementation Contract

### Feature Boundaries

- Included: `core/create-mono-stack/src/feature-config.js` (new `hasMobileFeature`/`hasWebFeature`
  helpers), `src/interactive-wizard.js` (two new wizard steps + Confirmation summary lines +
  `buildProjectArguments`), `src/create-project.js` (`parseArguments` new flags, `createProject`
  computing and passing `include_maestro_tests`/`include_playwright_tests` to Copier), `copier.yml`
  (two new questions + two new `_exclude` entries).
- Excluded: the rename-fragile dependency fix itself (sibling child checklist); any change to which
  native apps get scaffolded (unrelated `appDefinitions` mechanism in `native-scaffold.js`).
- Ownership: `create-mono-stack` owns both the wizard UX and the Copier data it feeds.

### Route-Group Ownership

Not applicable — CLI/TUI and template-generation configuration, not an HTTP route.

### User Journey

1. A user selects `mobile-expo` (or `mobile-react-native`) in the wizard's Stack features step. After
   naming that (and every other selected) feature's app instances, the wizard now asks "Maestro mobile
   E2E tests" (Include/Skip) before reaching Advanced options.
2. If the user also selected `web-vite` or `web-next`, the wizard additionally asks "Playwright web
   E2E tests" (Include/Skip) right after the Maestro question (or first, if no mobile feature was
   selected).
3. Neither question appears for a features selection with no mobile and no web feature (e.g.
   `api-nest` alone).
4. Declining either produces `--no-maestro`/`--no-playwright` in the generated CLI arguments;
   accepting (the default-focused choice) produces no extra flag, preserving today's argument shape.
5. `createProject` computes `include_maestro_tests`/`include_playwright_tests` (always `false` when
   the relevant feature is absent, regardless of any flag) and passes both to `copier copy` via
   `--data`; `copier.yml`'s conditional `_exclude` entries skip copying the directory when either is
   `false`.
6. Programmatic/non-interactive callers that pass no new flag keep getting both suites whenever the
   relevant feature is present — no behavior change from before this fix.

### Complete Test Matrix

| Test ID          | Path type | Small task                                                                                            | Trigger                                                                             | Expected result                                                                                                  | Status |
| ---------------- | --------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------ |
| TEST-E2EFLAG-001 | happy     | `hasMobileFeature`/`hasWebFeature` classify feature lists correctly                                   | Unit calls with various feature arrays                                              | Correct booleans for mobile-only, web-only, both, neither, mixed with unrelated ids                              | Passed |
| TEST-E2EFLAG-002 | happy     | Wizard asks the Maestro question when `mobile-expo` is selected                                       | Full Ink keyboard-driven wizard run selecting `mobile-expo`                         | "Maestro mobile E2E tests" screen renders before Advanced options                                                | Passed |
| TEST-E2EFLAG-003 | non-happy | Wizard does not ask either question when no mobile/web feature selected                               | Deselect `web-vite`, keep only `api-nest`, run the wizard                           | Advanced options reached directly after the last feature name step                                               | Passed |
| TEST-E2EFLAG-004 | happy     | Declining Maestro appends `--no-maestro`                                                              | Select the "Skip" choice on the Maestro question, complete the wizard               | `completed` args array contains `--no-maestro`                                                                   | Passed |
| TEST-E2EFLAG-005 | happy     | Declining Playwright appends `--no-playwright`                                                        | Select "Skip" on the Playwright question, complete the wizard                       | `completed` args array contains `--no-playwright`                                                                | Passed |
| TEST-E2EFLAG-006 | happy     | Back navigation from Playwright returns to Maestro when both were asked                               | Select both mobile + web features, reach Playwright question, press Back            | Maestro question re-renders                                                                                      | Passed |
| TEST-E2EFLAG-007 | happy     | Confirmation screen summarizes both choices only when asked                                           | Complete the wizard with both features selected, reach confirm                      | Summary shows both "Maestro mobile E2E tests" and "Playwright web E2E tests" lines                               | Passed |
| TEST-E2EFLAG-008 | happy     | `parseArguments` maps `--no-maestro`/`--no-playwright` to options                                     | `parseArguments(["--no-maestro", "--no-playwright", "--", "dest"])`                 | `includeMaestro: false, includePlaywright: false`                                                                | Passed |
| TEST-E2EFLAG-009 | non-happy | `createProject` forces exclusion when the relevant feature is absent, even without the flag           | `createProject({ features: "api-nest", ... })` (no mobile/web feature)              | `copierArguments` includes `include_maestro_tests=false` and `include_playwright_tests=false`                    | Passed |
| TEST-E2EFLAG-010 | happy     | `createProject` includes both by default when relevant features are present and no opt-out flag given | `createProject({ features: "web-vite,mobile-expo", ... })`                          | `copierArguments` includes `include_maestro_tests=true` and `include_playwright_tests=true`                      | Passed |
| TEST-E2EFLAG-011 | happy     | `createProject` respects explicit opt-out even when the feature is present                            | `createProject({ features: "web-vite", includePlaywright: false, ... })`            | `copierArguments` includes `include_playwright_tests=false`                                                      | Passed |
| TEST-E2EFLAG-012 | happy     | `copier.yml` declares both questions with the right defaults and `when` guards                        | Parse `copier.yml`                                                                  | `include_maestro_tests`/`include_playwright_tests` default `true`, `when` references the right `feature_*` flags | Passed |
| TEST-E2EFLAG-013 | happy     | `copier.yml`'s `_exclude` list contains the two new conditional entries                               | Parse `copier.yml`                                                                  | Entries reference `apps/maestro`/`apps/playwright` gated on both the feature flags and the new answers           | Passed |
| TEST-E2EFLAG-014 | happy     | Empirical: Copier's Jinja-conditional `_exclude` actually excludes the directory                      | Real `copier copy` (scratch venv, minimal fixture template) with the answer `false` | Directory absent from output; present when `true`                                                                | Passed |

### Unresolved Conflicts

None found. The user answered all three scoping questions directly via `AskUserQuestion`.

## Acceptance Criteria

- [x] `feature-config.js` exports `hasMobileFeature`/`hasWebFeature`, used by both
      `interactive-wizard.js` and `create-project.js` (no duplicated feature-id lists).
- [x] The wizard asks each question only when relevant, defaults the CLI-arg shape unchanged when the
      user accepts, and appends `--no-maestro`/`--no-playwright` only when declined.
- [x] `createProject` always computes `include_maestro_tests`/`include_playwright_tests` as
      `hasFeature && optionFlag !== false`, regardless of caller.
- [x] `copier.yml` excludes `apps/maestro`/`apps/playwright` natively via `_exclude`, verified against
      a real Copier install.
- [x] Every existing `interactive-wizard.test.js` golden-path test still passes (updated with the new
      step's `sendInput` where it now appears in the flow, with no change to expected `completed` args
      since accepting the default choice adds no new flag).
- [x] `pnpm --filter create-mono-stack test` passes in full (305/305).
- [x] `just check` passes.

## Exact Test Cases

### TEST-E2EFLAG-001

- Small task: classify a feature-id array as mobile/web-relevant.
- Source: user's `AskUserQuestion` answers (ask only when mobile/web selected).
- Test place: `core/create-mono-stack/test/feature-config.test.js` (new file, matching this package's
  per-module test-file convention).
- Starting state: none (pure function).
- Exact input or fixture: `[]`, `["api-nest"]`, `["mobile-expo"]`, `["mobile-react-native"]`,
  `["web-vite"]`, `["web-next"]`, `["web-vite", "mobile-expo"]`.
- Interaction steps: call `hasMobileFeature`/`hasWebFeature` with each input.
- Main behavior: correct boolean per input combination.
- Expected result: mobile true only for the two mobile ids (alone or combined); web true only for the
  two web ids; both false for `[]`/`["api-nest"]`.
- Must change: nothing (pure).
- Must not happen: a thrown error for an empty array.
- Planned command: `node --test core/create-mono-stack/test/feature-config.test.js`.
- Expected result before the code change: fails — module has no such exports yet.
- First observed run: Failed — `hasMobileFeature is not a function`, as expected.
- Passing rerun: Passed.

### TEST-E2EFLAG-002

- Small task: render the Maestro question when a mobile feature is selected.
- Source: `AskUserQuestion` answer ("ask if user has selected rn or expo").
- Test place: `core/create-mono-stack/test/interactive-wizard.test.js`.
- Starting state: fresh `ProjectWizard`.
- Exact input or fixture: toggle `mobile-expo` on in the Stack features step (deselecting nothing
  else), keep default web-vite/api-nest also selected.
- Interaction steps: navigate through destination/name/features/per-feature naming for all three
  features, then check the next screen.
- Main behavior: the wizard routes to the new Maestro step instead of straight to Advanced options.
- Expected result: frame matches `/Maestro mobile E2E tests/` before `/Advanced options/` appears.
- Must change: nothing persisted (assertion only).
- Must not happen: skipping straight to Advanced options.
- Planned command: `node --test core/create-mono-stack/test/interactive-wizard.test.js`.
- Expected result before the code change: fails — no such step exists.
- First observed run: Failed — frame never matched `/Maestro mobile E2E tests/`.
- Passing rerun: Passed.

### TEST-E2EFLAG-003

- Small task: skip both new questions when neither a mobile nor a web feature is selected.
- Source: `AskUserQuestion` answers (ask only when relevant).
- Test place: `core/create-mono-stack/test/interactive-wizard.test.js`.
- Starting state: fresh `ProjectWizard`.
- Exact input or fixture: in Stack features, deselect `web-vite` (space on the highlighted default
  item), keep only `api-nest`.
- Interaction steps: navigate to Stack features, deselect web-vite, submit, name the api-nest app.
- Main behavior: routing goes straight from the last (only) feature's name step to Advanced options.
- Expected result: frame matches `/Advanced options/` with no intervening Maestro/Playwright screen.
- Must change: nothing.
- Must not happen: either new question rendering.
- Planned command: `node --test core/create-mono-stack/test/interactive-wizard.test.js`.
- Expected result before the code change: passes already (no such step exists to intervene) — this
  case guards the _absence_ behavior after the fix, not a pre-fix failure.
- First observed run: Passed (no regression risk here, confirmed by construction).
- Passing rerun: Passed.

### TEST-E2EFLAG-004

- Small task: declining Maestro appends `--no-maestro` to the produced arguments.
- Source: `AskUserQuestion` answer + `buildProjectArguments`'s existing flag-omission convention.
- Test place: `core/create-mono-stack/test/interactive-wizard.test.js`.
- Starting state: fresh `ProjectWizard`, `mobile-expo` selected alongside defaults.
- Exact input or fixture: on the Maestro question, move down to "Skip" and press Enter.
- Interaction steps: full wizard walkthrough ending at confirm, then "Create project".
- Main behavior: `answers.includeMaestro` becomes `false`, flows into `buildProjectArguments`.
- Expected result: `completed[0]` includes the literal string `"--no-maestro"`.
- Must change: nothing external (in-memory args only).
- Must not happen: `--no-maestro` appearing when the default "Include" choice is accepted instead.
- Planned command: `node --test core/create-mono-stack/test/interactive-wizard.test.js`.
- Expected result before the code change: fails — no such step/flag exists.
- First observed run: Failed — as expected.
- Passing rerun: Passed.

### TEST-E2EFLAG-005

- Small task: declining Playwright appends `--no-playwright`.
- Source: same as TEST-E2EFLAG-004, mirrored for Playwright.
- Test place: `core/create-mono-stack/test/interactive-wizard.test.js`.
- Starting state: fresh `ProjectWizard`, default features (web-vite present).
- Exact input or fixture: on the Playwright question, move down to "Skip" and press Enter.
- Interaction steps: full wizard walkthrough ending at confirm, then "Create project".
- Main behavior: `answers.includePlaywright` becomes `false`.
- Expected result: `completed[0]` includes `"--no-playwright"`.
- Must change: nothing external.
- Must not happen: the flag appearing when "Include" is accepted.
- Planned command: `node --test core/create-mono-stack/test/interactive-wizard.test.js`.
- Expected result before the code change: fails.
- First observed run: Failed — as expected.
- Passing rerun: Passed.

### TEST-E2EFLAG-006

- Small task: Back from the Playwright question returns to the Maestro question when both apply.
- Source: standard wizard Back-navigation convention (every screen but the first offers Back).
- Test place: `core/create-mono-stack/test/interactive-wizard.test.js`.
- Starting state: `mobile-expo` and `web-vite` both selected.
- Exact input or fixture: reach the Playwright question, select the trailing "Back" list item.
- Interaction steps: navigate through features/names to Maestro (accept default), reach Playwright,
  select Back.
- Main behavior: `setStep` routes back to `"e2e-maestro"`.
- Expected result: frame matches `/Maestro mobile E2E tests/` again.
- Must change: nothing.
- Must not happen: jumping back past Maestro to a feature-name screen.
- Planned command: `node --test core/create-mono-stack/test/interactive-wizard.test.js`.
- Expected result before the code change: fails — screens don't exist yet.
- First observed run: Failed, then failed again for two more reasons found while iterating: (1) the
  test navigated to `mobile-expo` with only 3 `downArrow` presses; `FEATURE_DEFINITIONS` order is
  web-vite(0)/api-nest(1)/web-next(2)/api-express(3)/mobile-expo(4), so 3 presses landed on
  `api-express` and the `wrapped(/Expo React Native app —/)` wait timed out — fixed to 4 presses
  (this same off-by-one affected TEST-E2EFLAG-002/004/007 too, fixed identically in all four). (2) The
  test then used `tab` to reach the trailing "Back" item, copying `TextQuestion`'s Tab-to-focus-Back
  convention — but `ChoiceQuestion`'s Back is a plain `SelectInput` list item, navigated with
  `downArrow` like the existing "navigates backward through selectable wizard screens" test does; fixed
  to two `downArrow` presses.
- Passing rerun: Passed, after both fixes above.

### TEST-E2EFLAG-007

- Small task: Confirmation screen lists both choices only when both were asked.
- Source: existing `Confirmation` component's summary-line convention (`SummaryLine` per answer).
- Test place: `core/create-mono-stack/test/interactive-wizard.test.js`.
- Starting state: `mobile-expo` and `web-vite` both selected, both questions accepted at default.
- Exact input or fixture: full walkthrough to the confirm screen.
- Interaction steps: accept Maestro (Include), accept Playwright (Include), reach confirm.
- Main behavior: `Confirmation`'s `lines` array includes both new summary rows.
- Expected result: frame matches both `/Maestro mobile E2E tests: Included/` and
  `/Playwright web E2E tests: Included/`.
- Must change: nothing.
- Must not happen: either line appearing when its question was never asked (covered implicitly by
  TEST-E2EFLAG-003's no-feature case not reaching this screen with those lines).
- Planned command: `node --test core/create-mono-stack/test/interactive-wizard.test.js`.
- Expected result before the code change: fails — no such summary lines exist.
- First observed run: Failed — as expected.
- Passing rerun: Passed.

### TEST-E2EFLAG-008

- Small task: `parseArguments` recognizes the two new boolean flags.
- Source: existing `parseArguments` convention (`values["web-app-name"]` sparse-spread pattern).
- Test place: `core/create-mono-stack/test/interactive-wizard.test.js` or `cli.test.js` (colocated with
  existing `parseArguments` round-trip tests).
- Starting state: none (pure function over argv).
- Exact input or fixture: `["--no-maestro", "--no-playwright", "--", "/workspace/dest"]`.
- Interaction steps: call `parseArguments(args, "/workspace")`.
- Main behavior: both flags map to explicit `false` options.
- Expected result: returned object includes `includeMaestro: false, includePlaywright: false`.
- Must change: nothing.
- Must not happen: the keys appearing (even as `undefined`) when the flags are absent, preserving the
  existing "preserves leading hyphens in wizard values" test's exact-shape assertion.
- Planned command: `node --test core/create-mono-stack/test/interactive-wizard.test.js`.
- Expected result before the code change: fails — `parseArgs` rejects the unknown flags (`strict: true`).
- First observed run: Failed — `Unknown option '--no-maestro'`, as expected.
- Passing rerun: Passed.

### TEST-E2EFLAG-009

- Small task: force exclusion when the relevant feature is absent, independent of any flag.
- Source: parent checklist's core correctness requirement (never ship an orphaned suite).
- Test place: `core/create-mono-stack/test/project-management.test.js` or a new
  `create-project.test.js` — colocated with existing `createProject`/`copierArguments` assertions
  (checked at implementation time for the exact existing file/pattern).
- Starting state: mocked `runCommand`/`runInteractiveCommand` dependencies, no real Copier invocation.
- Exact input or fixture: `createProject({ destination, projectName, features: "api-nest" }, deps)`.
- Interaction steps: run `createProject`, capture the `copier copy` invocation's args.
- Main behavior: both `include_*_tests` data flags are computed as `false` even though neither was
  explicitly requested.
- Expected result: captured args include `--data include_maestro_tests=false` and
  `--data include_playwright_tests=false`.
- Must change: nothing external (mocked `runCommand`).
- Must not happen: either flag being `true` with no matching feature selected.
- Planned command: `node --test <the located test file>`.
- Expected result before the code change: fails — no such `--data` entries exist yet.
- First observed run: Failed — as expected.
- Passing rerun: Passed.

### TEST-E2EFLAG-010

- Small task: default to including both suites when their features are present and no opt-out given.
- Source: backward-compatibility requirement (existing scripted/CLI callers keep today's behavior).
- Test place: same file as TEST-E2EFLAG-009.
- Starting state: same mocked dependencies.
- Exact input or fixture: `createProject({ ..., features: "web-vite,mobile-expo" }, deps)`.
- Interaction steps: run `createProject`, capture the copier invocation's args.
- Main behavior: both flags computed `true` with no explicit `includeMaestro`/`includePlaywright`.
- Expected result: args include `include_maestro_tests=true` and `include_playwright_tests=true`.
- Must change: nothing external.
- Must not happen: either flag `false` without an explicit opt-out.
- Planned command: `node --test <the located test file>`.
- Expected result before the code change: fails — flags don't exist.
- First observed run: Failed — as expected.
- Passing rerun: Passed.

### TEST-E2EFLAG-011

- Small task: an explicit opt-out wins even when the feature is present.
- Source: same as TEST-E2EFLAG-008/010, combined.
- Test place: same file as TEST-E2EFLAG-009.
- Starting state: same mocked dependencies.
- Exact input or fixture: `createProject({ ..., features: "web-vite", includePlaywright: false }, deps)`.
- Interaction steps: run `createProject`, capture args.
- Main behavior: explicit `false` is honored despite the relevant feature being present.
- Expected result: args include `include_playwright_tests=false`.
- Must change: nothing external.
- Must not happen: the explicit `false` being overridden back to `true`.
- Planned command: `node --test <the located test file>`.
- Expected result before the code change: fails.
- First observed run: Failed — as expected.
- Passing rerun: Passed.

### TEST-E2EFLAG-012

- Small task: `copier.yml` declares the two new questions correctly.
- Source: `AskUserQuestion` answers; Copier `when`/`default` question syntax (empirically confirmed).
- Test place: `core/create-mono-stack/test/copier-template.test.js`.
- Starting state: none (static file parse).
- Exact input or fixture: `parse(await readFile(join(root, "copier.yml"), "utf8"))`.
- Interaction steps: read the two new question definitions.
- Main behavior: both default `true`; `when` references the correct `feature_*` flags.
- Expected result: `config.include_maestro_tests.default === true`,
  `config.include_playwright_tests.default === true`, `when` text matches
  `/feature_mobile_expo/`/`/feature_web_vite/` respectively.
- Must change: nothing (read-only assertion).
- Must not happen: a missing `when` guard (would ask the question even when irrelevant under direct
  interactive `copier copy`, outside the JS CLI's `--defaults` usage).
- Planned command: `node --test core/create-mono-stack/test/copier-template.test.js`.
- Expected result before the code change: fails — fields don't exist.
- First observed run: Failed — as expected.
- Passing rerun: Passed.

### TEST-E2EFLAG-013

- Small task: `_exclude` contains the two new conditional entries.
- Source: same as TEST-E2EFLAG-012.
- Test place: `core/create-mono-stack/test/copier-template.test.js`.
- Starting state: none.
- Exact input or fixture: same parsed `config`.
- Interaction steps: scan `config._exclude` for entries referencing each app path.
- Main behavior: each entry's Jinja text guards on both the relevant `feature_*` flag(s) and the new
  answer.
- Expected result: `config._exclude.some((e) => e.includes("apps/maestro"))` and the equivalent for
  `apps/playwright`, each also matching `/include_maestro_tests|include_playwright_tests/`.
- Must change: nothing.
- Must not happen: an entry that excludes unconditionally (would remove the directory for everyone).
- Planned command: `node --test core/create-mono-stack/test/copier-template.test.js`.
- Expected result before the code change: fails.
- First observed run: Failed — as expected.
- Passing rerun: Passed.

### TEST-E2EFLAG-014

- Small task: prove Copier itself honors the Jinja-conditional `_exclude` syntax used above.
- Source: manual empirical verification (`/private/tmp/.../scratchpad/exclude-probe`, `copier` 9.17.1
  installed in a scratch venv from this package's own `requirements/copier.txt` pin).
- Test place: manual, not part of the automated suite (matches the parent checklist's precedent of
  documenting real-Copier/real-network verification separately from the fast suite).
- Starting state: minimal two-file fixture template (`apps/web/file.txt`, `apps/maestro/file.txt`)
  with a `copier.yml` using the exact `<%!- if not X -!%>path<%!- endif -!%>` pattern.
- Exact input or fixture: `copier copy --defaults --trust --data want_maestro=false` vs. `=true`.
- Interaction steps: run both, list output files.
- Main behavior: the conditional entry is Jinja-rendered before glob-matching.
- Expected result: `apps/maestro/file.txt` absent when `false`, present when `true`; `apps/web/file.txt`
  present in both.
- Must change: nothing (scratch directory only).
- Must not happen: N/A.
- Planned command: (see checklist body above — ad hoc shell commands in scratchpad).
- Expected result before the code change: N/A — this validates a third-party tool's behavior, not this
  repo's code.
- First observed run: Confirmed on a minimal two-file fixture — `false` produced only
  `apps/web/file.txt`; `true` produced both.
- Passing rerun: Confirmed against the **real** `copier.yml` too, with an important gotcha discovered
  along the way: `copier copy` against a local path that is itself a Git repository reads from that
  repository's **last commit (HEAD)**, not the dirty working tree — pointing it directly at this
  checked-out repo with uncommitted edits silently exercised the _old_ `copier.yml`/`render-package-scope.mjs`
  every time (explains several confusing false-negative runs before this was identified). Working
  validation method: `rsync` the current working tree (excluding `.git`/`node_modules`/`.turbo`/`dist`)
  into a scratch directory, `git init && git add -A && git commit` there, then run `copier copy`
  against _that_ commit. Confirmed end-to-end against the real template: `feature_mobile_expo=false,
feature_mobile_react_native=false, include_maestro_tests=false` (with `web-vite`/`api-nest` still
  selected) produces `apps/{expo,mobile,next,playwright,server,web}` with `apps/maestro` absent;
  `feature_mobile_expo=true, include_maestro_tests=true, include_playwright_tests=true` produces both
  `apps/maestro` and `apps/playwright` present. The same run also confirmed the sibling
  [[2026-09-13-rename-safe-workspace-script-imports]] fix end-to-end: both apps'
  `"monorepo-template"` workspace dependency and bare import specifiers were correctly rewritten to
  `"acme-platform"` (the `--data project_name="Acme Platform"` slug), in the exact same real-Copier
  invocation.
