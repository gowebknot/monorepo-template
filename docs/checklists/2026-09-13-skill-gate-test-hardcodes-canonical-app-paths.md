# TEST-GATE-024 hardcodes canonical app paths, breaking the first commit for renamed apps

Checklist ID: 2026-09-13-skill-gate-test-hardcodes-canonical-app-paths
Related checklists: [[2026-09-13-skills-manifest-desync-on-project-rename]] (a different bug with the
same symptom class — generated-project customization breaking the mandatory pre-commit gate on the
first commit), [[2026-09-13-relative-import-check-blocks-first-commit]] (same symptom class, different
root cause)

## Change Tier

Tier: standard

## Context

The user generated a fresh project (`gfjgbvj`) with a web app named `dashboard` (feature `web-vite`,
`.mono-stack.json` records `{ "feature": "web-vite", "name": "dashboard", "path": "apps/dashboard",
... }`) and an API app kept at its default name (`apps/server`). Their first
`git commit -m "chore: initialize project"` was rejected by the mandatory `skills:test` pre-commit
step:

```
✖ TEST-GATE-024 canonical trigger table covers the API chain (6.045792ms)
  AssertionError [ERR_ASSERTION]: apps/web/src/App.tsx
      ...
    actual: false,
    expected: true,
```

### Root cause

`scripts/skill-gate.test.mjs`'s `TEST-GATE-024` reads the real, on-disk `.claude/skill-triggers.json`
(not a synthetic fixture — every other test in this file uses a local hardcoded `triggers` object
instead) and asserts that specific hardcoded canonical file paths
(`apps/web/src/App.tsx`, `apps/next/src/app/page.tsx`, `apps/expo/App.tsx`, `apps/mobile/App.tsx`,
`apps/server/src/example.controller.ts`) are covered by `require`d skills in that table.

`.claude/skill-triggers.json` itself is correctly kept in sync with each project's actual, possibly
customized app paths (confirmed by reading the generated project's own file directly: its `web-vite`
rule's `when` array is `["apps/dashboard/**"]`, not `["apps/web/**"]`, matching the renamed app). The
interactive wizard lets a user name any `web-vite`, `web-next`, `mobile-expo`, `mobile-react-native`,
or `api-nest` app anything they like (`scripts/stack-config.mjs`'s own validator only requires
`app.path === "apps/${app.name}"`, not a fixed canonical name) — but `TEST-GATE-024`'s file-path
literals assume every project keeps every app at its canonical default name. Once a user renames any
one of these five apps (the common case for anyone who doesn't want a literal folder named `web`),
the corresponding hardcoded probe path no longer matches any `when` pattern in the correctly-rewritten
table, and `requiredFor(...)` returns `[]` instead of the expected skill list — a false-positive test
failure that blocks the mandatory, hard-reject `skills:test` step on every affected project's very
first commit.

This is a fourth instance this session of "a generation-time customization that
`render-package-scope.mjs`/the wizard correctly applies breaks a mandatory pre-commit check that
assumed the un-customized default," following the same symptom pattern as the first-commit
relative-import check, the shipped-skills scope-rewrite desync, and (differently rooted) the earlier
maestro/playwright conditional-inclusion work.

### Confirmed scope of the bug

Only `TEST-GATE-024` is affected. Every other test in `scripts/skill-gate.test.mjs` (`TEST-GATE-002`
through `TEST-GATE-023`, `TEST-GATE-025` onward, and the standalone `collectRequired` test) builds and
uses its own local, hardcoded `triggers` fixture object — a self-contained unit-test fixture that
never touches the real on-disk `.claude/skill-triggers.json` and is unaffected by any project's actual
app naming. `TEST-GATE-017` also reads the real file, but only asserts that every named skill in it
has a real `skills/<name>` directory — no app-path assumption, unaffected. Confirmed via
`grep -n "apps/web\|apps/next\|apps/expo\|apps/mobile\b\|apps/server" scripts/skill-gate.test.mjs` and
reading each matching test's context.

`apps/playwright` and `apps/maestro` are excluded from the rename concern: they are fixed
infrastructure directories toggled on/off by the wizard (`include_playwright_tests`/
`include_maestro_tests`), never renamed, so their two literal probe paths in `TEST-GATE-024`
(`apps/playwright/tests/auth.spec.ts`, `apps/maestro/flows/auth.yaml`) stay correct.

## Implementation Contract

### Feature Boundaries

- Included: `TEST-GATE-024`'s five renameable-app probe paths (`web-vite`, `web-next`, `mobile-expo`,
  `mobile-react-native`, `api-nest`) resolve the actual configured app path from the project's own
  `.mono-stack.json` (via `scripts/stack-config.mjs`'s existing `readStackConfig`) when the manifest
  exists, falling back to today's canonical default path (`apps/web`, `apps/next`, `apps/expo`,
  `apps/mobile`, `apps/server`) when it does not — which is always the case inside this template
  repository itself, since it is the template source, not a generated project, and ships no
  `.mono-stack.json`.
- Excluded: the two infrastructure-only probe paths (Playwright, Maestro), which stay literal; any
  other test in this file (all confirmed unaffected above); any change to
  `.claude/skill-triggers.json` itself (already correct) or to `scripts/skill-gate.mjs`'s evaluation
  logic (already correct — it is only the test's own fixed expectations that are wrong for a renamed
  project).
- Ownership: `scripts/skill-gate.test.mjs` owns this regression test; `scripts/stack-config.mjs`
  already owns reading and validating a project's app configuration and is reused, not duplicated.

### Route-Group Ownership

Not applicable — a repository test file and a mandatory pre-commit validation step, not an HTTP
route.

### User Journey

1. A user renames their `web-vite` (or any other renameable) app away from its canonical default
   during the interactive wizard, generates the project, and `.claude/skill-triggers.json` is
   correctly rewritten to reference the actual chosen path.
2. Their first `git commit` runs the mandatory `skills:test` step, which now resolves
   `TEST-GATE-024`'s probe file paths from the same `.mono-stack.json` the wizard itself wrote,
   matching the real, renamed app path, and passes.
3. A maintainer running the same test inside this template repository itself (no `.mono-stack.json`
   present) sees the test fall back to today's canonical default paths and observes identical
   behavior to before this fix.

### Complete Test Matrix

| Test ID               | Path type | Small task                                                                                    | Trigger                                                                                                     | Expected result                                                           | Status |
| --------------------- | --------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------ |
| TEST-GATE-024 (fixed) | happy     | Passes against this repository's own `.claude/skill-triggers.json` with no `.mono-stack.json` | `node --test scripts/skill-gate.test.mjs`                                                                   | Passes, using canonical default fallback paths                            | Passed |
| TEST-GATE-031         | happy     | Passes against a fixture `.mono-stack.json` where the `web-vite` app is renamed               | Temp directory with a `.mono-stack.json` naming the web app `dashboard` and a matching skill-triggers table | `requiredFor("apps/dashboard/src/App.tsx")` includes both required skills | Passed |
| TEST-GATE-032         | invalid   | Falls back to the canonical default path when a feature has no configured app entry           | Fixture `.mono-stack.json` that omits (for example) `mobile-expo`                                           | Falls back to `apps/expo/App.tsx` without throwing                        | Passed |

### Unresolved Conflicts

None found. The winning decision (recorded above under Root Cause / Feature Boundaries) is to resolve
app paths dynamically from `.mono-stack.json` via the existing `readStackConfig` helper rather than
hardcoding canonical defaults, since that manifest is the single source of truth the wizard itself
already writes and `render-package-scope.mjs`/`skill-triggers.mjs` already trust.

## Acceptance Criteria

- [x] `TEST-GATE-024` resolves its five renameable-app probe paths from `.mono-stack.json` when
      present, falling back to canonical defaults otherwise.
- [x] A new test proves the fix against a fixture where an app is renamed (reproducing the user's
      exact failure shape).
- [x] A new test proves the fallback path still works when a feature's app entry is absent from the
      manifest.
- [x] `node --test scripts/skill-gate.test.mjs` passes in this repository (no `.mono-stack.json`).
- [x] A real reproduction using the user's own generated project's `.mono-stack.json` shape passes.
- [x] `just check` passes.

## Validation Notes

- `node --test scripts/skill-gate.test.mjs` — 37/37 passed (35 pre-existing + `TEST-GATE-031`/`032`),
  `TEST-GATE-024` passing via the canonical-default fallback in this repository's own context.
- `pnpm skills:test` — 170/170 passed.
- `just check` — exit 0.
- The user's `gfjgbvj` project directory was removed (by the user, outside this session) before a
  live re-verification against it could be run; the exact `.mono-stack.json` and
  `.claude/skill-triggers.json` shapes captured earlier in this conversation were used to build
  `TEST-GATE-031`'s fixture instead, so the reproduction is faithful to the real failure even though
  the original directory no longer exists to re-check directly.

## Exact Test Cases

### TEST-GATE-024 (fixed)

- Small task: confirm the existing test still passes unmodified in this repository's own context.
- Source: the user's reported failure; `scripts/stack-config.mjs`'s `readStackConfig`.
- Test place: `scripts/skill-gate.test.mjs`.
- Starting state: this repository, which has no `.mono-stack.json`.
- Exact input or fixture: this repository's real `.claude/skill-triggers.json`.
- Interaction steps: run the test.
- Main behavior: with no manifest, every probe path falls back to its canonical default, exactly
  matching today's hardcoded literals.
- Expected result: passes, identical outcome to before this fix.
- Must change: nothing in `.claude/skill-triggers.json`.
- Must not happen: a regression in this repository's own gate coverage.
- Planned command: `node --test scripts/skill-gate.test.mjs`.
- Expected result before the code change: passes (this is the currently-passing case; the bug only
  reproduces in a generated project with a renamed app).
- First observed run: 2026-09-13, confirmed passing before this fix (`node --test
scripts/skill-gate.test.mjs` — 35/35, all pre-existing tests green, establishing the pre-fix
  baseline this repository must not regress).
- Passing rerun: 2026-09-13, `node --test scripts/skill-gate.test.mjs` — 37/37 (35 pre-existing + the
  2 new cases), `TEST-GATE-024` passing unchanged via the canonical-default fallback path.

### TEST-GATE-031

- Small task: prove the fix resolves a renamed app's real path, reproducing the user's exact bug.
- Source: the user's reported failure; the real `gfjgbvj` project's `.mono-stack.json` shape.
- Test place: `scripts/skill-gate.test.mjs`.
- Starting state: a temp directory containing a `.mono-stack.json` with a `web-vite` app named
  `dashboard` (`path: "apps/dashboard"`) and a `.claude/skill-triggers.json` whose `web-vite` rule
  targets `apps/dashboard/**` (mirroring what `.claude/skill-triggers.json` correctly contains in a
  real renamed project).
- Exact input or fixture: `{ schemaVersion: 3, features: ["web-vite"], apps: [{ feature: "web-vite",
generator: "vite", name: "dashboard", path: "apps/dashboard", referenceProfile: null }] }`.
- Interaction steps: resolve the probe path for `web-vite` and call `requiredFor` against it.
- Main behavior: the probe path is built from the manifest's actual `path`, not the canonical default.
- Expected result: `requiredFor("apps/dashboard/src/App.tsx")` includes `frontend-standards` and
  `domain-driven-app-structure`.
- Must change: nothing (read-only fixture assertion).
- Must not happen: falling back to `apps/web/...` when a manifest entry exists.
- Planned command: `node --test scripts/skill-gate.test.mjs`.
- Expected result before the code change: this exact case cannot be expressed with the pre-fix
  hardcoded literal, since it never consults a manifest — N/A as a "before" state; the case exists to
  lock in the new behavior.
- First observed run: N/A (new-behavior case).
- Passing rerun: Passed, as part of the same `node --test scripts/skill-gate.test.mjs` run above
  (37/37). Also independently confirmed against the real values read directly from the user's own
  `gfjgbvj` project before it was removed: its `.mono-stack.json` recorded
  `{ feature: "web-vite", name: "dashboard", path: "apps/dashboard" }` and its
  `.claude/skill-triggers.json` already contained a `when: ["apps/dashboard/**"]` rule — exactly the
  shape this fixture reproduces.

### TEST-GATE-032

- Small task: prove a missing manifest entry for one feature still falls back safely.
- Source: defensive-coding parity — a project might select `web-vite` only, so `mobile-expo` has no
  app entry at all.
- Test place: `scripts/skill-gate.test.mjs`.
- Starting state: a fixture `.mono-stack.json` whose `apps` array omits `mobile-expo` entirely.
- Exact input or fixture: a manifest with only a `web-vite` app entry.
- Interaction steps: resolve the probe path for `mobile-expo`.
- Main behavior: the resolver falls back to the canonical default path when no matching feature entry
  exists.
- Expected result: resolves to `apps/expo/App.tsx` without throwing.
- Must change: nothing.
- Must not happen: a crash or `undefined` path.
- Planned command: `node --test scripts/skill-gate.test.mjs`.
- Expected result before the code change: N/A (new-behavior case).
- First observed run: N/A.
- Passing rerun: Passed, as part of the same `node --test scripts/skill-gate.test.mjs` run above
  (37/37).

## Updates

### 2026-09-13 - Correction: the fix still asserted coverage for unconfigured app types

The user reported that a real generated project configuring only `web-vite` (renamed to
`apps/dashbohjk`) and `api-nest` (renamed to `apps/lkjhgf`) still failed `TEST-GATE-024` on its first
commit, this time for the `mobile-expo`/`mobile-react-native`/`web-next` probes. Root cause: this
checklist's fix resolved a _renamed_ app's real path correctly, but `resolveAppPath`'s fallback to the
canonical default path (`apps/expo`, `apps/mobile`, `apps/next`) was applied even when the manifest
exists but simply never configured that feature at all — the correct, intentional behavior of
`scripts/skill-triggers.mjs`'s `buildAppTriggerRules` (and its duplicate,
`core/create-mono-stack/src/skill-triggers.js`) is to emit _no rule whatsoever_ for an app type the
project never selected, so probing a canonical default path for an unselected feature always resolves
to zero required skills — a mismatch between this fix's assumption ("every renameable app type is
always gated somewhere") and the generator's real contract ("only configured app types are gated").
`TEST-GATE-032` specifically asserted the wrong outcome (that an unconfigured feature falls back to
being gated at its canonical default), which is exactly backwards.

See [TEST-GATE-024 asserts coverage for unconfigured app types](2026-09-13-skill-gate-test-covers-unconfigured-apps.md)
for the corrected fix, its own full test matrix, and validation results.

## Missing-Case Review

1. Every small task maps to a test ID above.
2. No new user-facing contract, schema, route, or authorization surface is introduced; this is a
   repository regression test fix.
3. Boundary cases considered: no manifest (this repository itself), a manifest with the app renamed,
   and a manifest missing one feature's app entry entirely.
4. No retry/duplicate/permission cases apply — deterministic, read-only file resolution.
