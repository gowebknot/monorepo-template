# TEST-GATE-024 asserts coverage for unconfigured app types, breaking single-frontend projects

Checklist ID: 2026-09-13-skill-gate-test-covers-unconfigured-apps
Related checklists: [[2026-09-13-skill-gate-test-hardcodes-canonical-app-paths]] (the prior, incomplete
fix this corrects — see its own `## Updates` section), [[2026-09-13-skills-manifest-desync-on-project-rename]]
(same symptom class: a generation-time customization breaking the mandatory pre-commit gate)

## Change Tier

Tier: standard

## Context

After [[2026-09-13-skill-gate-test-hardcodes-canonical-app-paths]] shipped (`create-mono-stack`
0.1.61), the user reported the mandatory `skills:test` pre-commit step still failing on a real
generated project's first commit. That project's `.mono-stack.json` configures exactly two apps:
`web-vite` (renamed to `apps/dashbohjk`) and `api-nest` (renamed to `apps/lkjhgf`) — no `web-next`,
`mobile-expo`, or `mobile-react-native` app at all. `scripts/skill-triggers.mjs`'s
`buildAppTriggerRules` (and its duplicate, `core/create-mono-stack/src/skill-triggers.js`, used during
initial generation via `create-project.js`) only emits a skill-gate rule for each app that is actually
present in `apps`, so that project's `.claude/skill-triggers.json` has no rule at all for
`apps/next`, `apps/expo`, or `apps/mobile` — correctly, since those apps do not exist in the project.

The prior fix's `resolveAppPath` still asserted that every one of the four frontend app types must be
gated _somewhere_, falling back to the canonical default path (`apps/expo`, `apps/mobile`,
`apps/next`) whenever a feature had no configured app entry. That fallback is the bug: probing a
canonical default path for a feature the project never selected always resolves to zero required
skills (there is no rule to match), so the assertion fails — a real mismatch between the sync script's
intentional behavior (gate only what is configured) and the test's assumption (every renameable app
type is always gated somewhere). Reproduced directly:

```
buildAppTriggerRules([
  { feature: "web-vite", path: "apps/dashbohjk" },
  { feature: "api-nest", path: "apps/lkjhgf" }
])
// -> only two rules, for apps/dashbohjk/** and apps/lkjhgf/**

requiredFor("apps/expo/App.tsx")   // -> []
requiredFor("apps/mobile/App.tsx") // -> []
requiredFor("apps/next/src/app/page.tsx") // -> []
```

This is not a new defect introduced by the prior fix in the sense of a regression — the _original_,
pre-0.1.61 hardcoded-path version of `TEST-GATE-024` would have failed identically for this exact
project shape, since it also unconditionally probed all four canonical frontend paths regardless of
which features were actually selected. The prior fix corrected the _renamed-but-still-configured_ case
but never addressed the _not configured at all_ case, which is arguably the more common real-world
shape (most projects pick one web framework and, optionally, one mobile framework — not all four).

## Implementation Contract

### Feature Boundaries

- Included: `TEST-GATE-024`'s five renameable-app probes only assert coverage for a feature when it is
  actually configured in `.mono-stack.json` (using its real, possibly renamed path) — or, when no
  manifest exists at all (this template repository itself, which hand-maintains one rule covering all
  four canonical frontend paths unconditionally), fall back to the canonical default as before. When a
  manifest exists but a feature has no configured app, the probe is skipped entirely: there is no
  expectation of coverage, matching `buildAppTriggerRules`'s real contract. `TEST-GATE-032` is
  corrected to assert the right outcome (skip, not "falls back to being gated anyway").
- Excluded: changing `scripts/skill-triggers.mjs`/`core/create-mono-stack/src/skill-triggers.js`
  themselves (both already behave correctly — only-gate-what's-configured is the intended design, not
  a bug); deduplicating those two independently-maintained, currently-identical implementations (a
  real DRY observation worth a future cleanup, but not required to fix this test's incorrect
  assumption and out of scope for a targeted bug-fix release).
- Ownership: `scripts/skill-gate.test.mjs` owns this regression test; `scripts/stack-config.mjs`
  already owns reading a project's app configuration and is reused, not duplicated.

### Route-Group Ownership

Not applicable — a repository test file and a mandatory pre-commit validation step, not an HTTP
route.

### User Journey

1. A user selects only `web-vite` and `api-nest` (or any other subset of the five renameable app
   types), optionally renaming either, generates the project, and `.claude/skill-triggers.json`
   correctly contains rules only for the apps they actually selected.
2. Their first `git commit` runs the mandatory `skills:test` step, which now only asserts coverage for
   the app types they actually configured, matching the real, intentionally-pruned trigger table, and
   passes.
3. A maintainer running the same test inside this template repository itself (no `.mono-stack.json`,
   every frontend path unconditionally covered) sees no change in behavior from before either fix.

### Complete Test Matrix

| Test ID       | Path type | Small task                                                                                                      | Trigger                                                                                                                              | Expected result                                                                                  | Status |
| ------------- | --------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------ |
| TEST-GATE-024 | happy     | Corrected version passes against this repository's own `.claude/skill-triggers.json` with no `.mono-stack.json` | `node --test scripts/skill-gate.test.mjs`                                                                                            | Passes, asserting coverage for all five canonical default paths                                  | Passed |
| TEST-GATE-032 | invalid   | Corrected version: an unconfigured feature is skipped, not asserted against a canonical-default fallback        | Fixture `.mono-stack.json` with only a `web-vite` app; probe `mobile-expo`                                                           | Resolver reports "not configured" rather than a fallback path                                    | Passed |
| TEST-GATE-033 | happy     | Reproduces the user's exact real-world shape: two configured apps, three entirely absent app types              | Fixture `.mono-stack.json` with only `web-vite` (renamed) and `api-nest` (renamed) configured, and a matching two-rule trigger table | The two configured probes are covered; the three absent-feature probes are skipped, not asserted | Passed |

### Unresolved Conflicts

None found. The winning decision is: assert coverage only where `buildAppTriggerRules` would actually
produce a rule (configured features, using their real path), and skip the assertion entirely for a
feature with no configured app — never assume an uncorrelated fallback path is gated.

## Acceptance Criteria

- [x] `TEST-GATE-024` only asserts frontend/backend skill coverage for renameable app types that are
      actually configured in `.mono-stack.json` (or all five, using canonical defaults, when no
      manifest exists at all).
- [x] `TEST-GATE-032` is corrected to assert that an unconfigured feature is skipped, not that it falls
      back to a canonical-default path that would never actually be gated.
- [x] A new test (`TEST-GATE-033`) reproduces the user's exact real-world shape (two configured,
      renamed apps; three entirely unselected app types) and passes.
- [x] `node --test scripts/skill-gate.test.mjs` passes in this repository (no `.mono-stack.json`).
- [x] `just check` passes.

## Validation Notes

- `node --test scripts/skill-gate.test.mjs` — 38/38 passed (35 pre-existing + `TEST-GATE-031/032/033`).
- `pnpm skills:test` — 171/171 passed.
- `just check` — exit 0.
- Directly confirmed `resolveAppProbe`'s "no manifest" branch is exercised (not silently skipped) in
  this repository: `readStackConfig(repositoryRoot)` throws `"Stack configuration is missing..."`
  here, so every one of `TEST-GATE-024`'s five probes still resolves `covered: true` at its canonical
  default and asserts real coverage, exactly matching pre-fix behavior for this repository.
- The user's exact real-world manifest shape (`web-vite` renamed to `apps/dashbohjk`, `api-nest`
  renamed to `apps/lkjhgf`, no other app configured) was reproduced directly against the real,
  unmodified `buildAppTriggerRules` both ad hoc (see Context) and as the permanent `TEST-GATE-033`.

## Exact Test Cases

### TEST-GATE-024 (corrected)

- Small task: confirm the existing test still passes unmodified in this repository's own context.
- Source: the user's second reported failure; `scripts/stack-config.mjs`'s `readStackConfig`;
  `scripts/skill-triggers.mjs`'s `buildAppTriggerRules`.
- Test place: `scripts/skill-gate.test.mjs`.
- Starting state: this repository, which has no `.mono-stack.json`.
- Exact input or fixture: this repository's real `.claude/skill-triggers.json`.
- Interaction steps: run the test.
- Main behavior: with no manifest, every one of the five probes is asserted against its canonical
  default path, exactly matching this repository's own hand-maintained, always-cover-everything table.
- Expected result: passes, identical outcome to the 0.1.61 fix.
- Must change: nothing in `.claude/skill-triggers.json`.
- Must not happen: a regression in this repository's own gate coverage.
- Planned command: `node --test scripts/skill-gate.test.mjs`.
- Expected result before the code change: passes already (this repository has no manifest, so the bug
  cannot reproduce here — it only reproduces in a generated project missing one or more app types).
- First observed run: 2026-09-13, confirmed the pre-correction baseline in this repository still
  passed 38/38 (the corrected assertions had already been drafted at this point but their behavior in
  this no-manifest context is identical to before, since `resolveAppProbe` returns `covered: true` at
  the canonical default for every probe whenever no `.mono-stack.json` exists — confirmed directly:
  `readStackConfig(repositoryRoot)` throws "Stack configuration is missing" in this repository).
- Passing rerun: 2026-09-13, `node --test scripts/skill-gate.test.mjs` — 38/38 (35 pre-existing +
  `TEST-GATE-031/032/033`), `TEST-GATE-024` passing with all five probes still asserted here.

### TEST-GATE-032 (corrected)

- Small task: prove an unconfigured feature is correctly skipped, not falsely expected to be gated.
- Source: the user's second reported failure; `buildAppTriggerRules`'s real contract (no rule for an
  unselected app type).
- Test place: `scripts/skill-gate.test.mjs`.
- Starting state: a fixture `.mono-stack.json` whose `apps` array contains only a `web-vite` entry.
- Exact input or fixture: a manifest with only a `web-vite` app entry; probe feature `mobile-expo`.
- Interaction steps: resolve the probe for `mobile-expo`.
- Main behavior: the resolver reports that `mobile-expo` has no configured app, rather than returning
  a fallback path implying it should be gated.
- Expected result: the resolver's result indicates "not configured" (no assertion is made against any
  file path for this feature).
- Must change: nothing.
- Must not happen: asserting `requiredFor("apps/expo/App.tsx")` includes `frontend-standards` when
  `mobile-expo` was never selected (this was the prior, incorrect assertion).
- Planned command: `node --test scripts/skill-gate.test.mjs`.
- Expected result before the code change: fails in the opposite direction — the pre-correction test
  asserted the wrong outcome and could not express "not configured" at all.
- First observed run: reproduced directly via `buildAppTriggerRules`/`collectRequired` (see Context):
  `requiredFor("apps/expo/App.tsx")` returns `[]` for a manifest that only configures `web-vite`,
  confirming the prior fallback assumption was wrong.
- Passing rerun: Passed, as part of the same `node --test scripts/skill-gate.test.mjs` run above
  (38/38). `resolveAppProbe("/fake-project", "mobile-expo", "apps/expo", readManifest)` returns
  `{ covered: false }`, and the test asserts exactly that instead of asserting a fallback file path.

### TEST-GATE-033

- Small task: reproduce the user's exact real-world project shape end to end.
- Source: the user's second reported failure, verbatim (`web-vite` renamed to `apps/dashbohjk`,
  `api-nest` renamed to `apps/lkjhgf`, no other app configured).
- Test place: `scripts/skill-gate.test.mjs`.
- Starting state: a fixture `.mono-stack.json` with exactly those two apps, and a trigger table built
  by the real `buildAppTriggerRules(apps)` (not hand-written, to stay faithful to what generation
  actually produces).
- Exact input or fixture: `apps: [{ feature: "web-vite", path: "apps/dashbohjk" }, { feature:
"api-nest", path: "apps/lkjhgf" }]`.
- Interaction steps: build the real trigger rules from this fixture, then run the corrected
  `TEST-GATE-024`-style assertion logic against it.
- Main behavior: `apps/dashbohjk` and `apps/lkjhgf` are covered by their respective skills;
  `web-next`/`mobile-expo`/`mobile-react-native` probes are skipped without failing.
- Expected result: no assertion failure; the two configured apps are confirmed covered.
- Must change: nothing (read-only fixture assertion).
- Must not happen: any assertion failure for the three unconfigured app types.
- Planned command: `node --test scripts/skill-gate.test.mjs`.
- Expected result before the code change: fails, reproducing the user's exact second report.
- First observed run: reproduced directly (see Context) — `requiredFor` returns `[]` for all three
  unconfigured app types' canonical default paths under the prior fix's logic.
- Passing rerun: Passed, as part of the same `node --test scripts/skill-gate.test.mjs` run above
  (38/38). Using the real `buildAppTriggerRules` (not a hand-written fixture table) against this
  exact `apps` array produces only two rules (`apps/dashbohjk/**`, `apps/lkjhgf/**`); the web and
  server probes resolve `covered: true` with the correct required skills, and all three unconfigured
  frontend feature probes resolve `covered: false`, matching the corrected expectation exactly.

## Missing-Case Review

1. Every small task maps to a test ID above.
2. No new user-facing contract, schema, route, or authorization surface is introduced; this is a
   repository regression test fix.
3. Boundary cases considered: no manifest (this repository itself), a manifest configuring every app
   type, a manifest configuring only a subset (the user's real, common shape), and a manifest missing
   one specific feature entirely (already covered by the corrected `TEST-GATE-032`).
4. No retry/duplicate/permission cases apply — deterministic, read-only file resolution.
