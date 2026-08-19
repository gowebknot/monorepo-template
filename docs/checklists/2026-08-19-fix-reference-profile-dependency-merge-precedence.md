# Fix Reference Profile Dependency Merge Precedence For Overlay Profiles

- Checklist ID: `CHK-2026-08-19-MERGE-PRECEDENCE`
- Status legend: `[ ]` not started, `[/]` partial, `[x]` complete
- Related previous checklist:
  [2026-08-12-hybrid-native-reference-profiles.md](2026-08-12-hybrid-native-reference-profiles.md) —
  introduced `mergeProfilePackageJson` and its "native versions win for overlapping dependencies"
  policy (`TEST-MERGE-001`), recorded there as a deliberate "user-selected hybrid policy." This
  checklist narrows that policy for one specific, previously-unhandled case; it does not reverse it.
- Last updated: 2026-08-19

## Context

Regenerating a project from this template with the `mobile-react-native` feature selected produces an
`apps/mobile/package.json` where `react-native-safe-area-context` silently drifts away from this
template's tested, pinned `"5.9.1"` to whatever version the upstream `@react-native-community/cli@latest
init` scaffold currently bundles by default. Observed concretely: the drifted version (`^5.5.2`,
resolving to `5.7.0`) fails to compile against `react-native@0.87.0` with a Kotlin error:

```
SafeAreaView.kt:59:23 Unresolved reference 'uiImplementation'
```

Root cause, traced through `core/create-mono-stack/src/native-scaffold.js` and
`core/create-mono-stack/src/reference-profiles.js`: `scaffoldNativeApps` always runs the real upstream
generator un-pinned (`pnpm dlx @react-native-community/cli@latest init ...`,
`native-scaffold.js:129-145`) into a temporary directory, then `applyReferenceProfile` merges that
fresh native `package.json` with this template's `apps/mobile/package.json` via
`mergeProfilePackageJson` (`reference-profiles.js:203-249`). For any dependency name present in both,
the native scaffold's version always wins:

```js
dependencies: { ...templateDependencies /* only names NOT in native */, ...nativePackage.dependencies };
```

Since the upstream RN CLI template happens to bundle `react-native-safe-area-context` by default, this
template's pinned `5.9.1` is discarded and replaced by whatever "latest" the CLI declares that day — a
non-reproducible drift. This exact precedence is intentional, documented policy for most profiles
(`TEST-MERGE-001`), but it is wrong for **overlay** profiles specifically: `nestjs/default`,
`expo/default`, and `react-native/default` (`reference-profiles.js:64-172`) delete and fully replace
the native scaffold's own source (`App.tsx`, `src/`, etc.) with this template's. For those, the native
scaffold's chosen dependency versions describe code that no longer exists in the output; this
template's pinned, tested versions should be authoritative for anything the overlaid code actually
uses.

One exception inside an overlay profile: the core framework package itself (`react-native` for the
`react-native` generator; `expo` and `react-native` for the `expo` generator) must keep the native
scaffold's version. The native `android`/`ios` project files that generator actually produces (Gradle
plugin versions, Kotlin version, autolinking config) are baked in at generation time and tied to
whatever RN version the CLI actually scaffolded; overriding only the `package.json` string would desync
it from those already-generated native files. Every other autolinked native module (like
`react-native-safe-area-context`, `react-native-screens`) gets its native code autolinked fresh from
whatever is actually installed, so this template's pin is safe to prefer for those.

`nestjs/default` is also an overlay profile but has no demonstrated drift bug and no framework-version
coupling to already-generated native files (it produces no compiled native artifacts). It is left with
today's unchanged "native wins" behavior — out of scope for this checklist, since the fix targets an
opt-in field profiles must explicitly set, and `nestjs/default` will not set it.

## Acceptance Criteria

- [x] `mergeProfilePackageJson` accepts a new optional `nativeOwnedDependencies` parameter. When
      omitted (all existing callers/tests unless changed here), its `dependencies`/`devDependencies`
      merge behavior is byte-for-byte identical to today.
- [x] When `nativeOwnedDependencies` is provided, for any dependency name present in both the native
      and template manifests: the template's version wins unless the name is listed in
      `nativeOwnedDependencies`, in which case the native scaffold's version wins (unchanged from
      today for that name).
- [x] `"react-native/default"` sets `nativeOwnedDependencies: ["react-native"]`.
- [x] `"expo/default"` sets `nativeOwnedDependencies: ["expo", "react-native"]`.
- [x] `"nestjs/default"` and every `referenceEntries`/`codeOnly` profile are unchanged (no
      `nativeOwnedDependencies` field; existing "native wins" behavior for all of them, proven by
      `TEST-MERGE-001` through `TEST-MERGE-008` continuing to pass unmodified).
- [x] The fix is proven end-to-end (through `scaffoldNativeApps`/`applyReferenceProfile`, not only the
      unit-level merge function) for both `react-native/default` and `expo/default`.

## Small Task Breakdown

### 1. Extend `mergeProfilePackageJson` with opt-in native-owned-dependency precedence

- [x] Add a 5th optional parameter, default unset, preserving the exact current behavior when absent.
- [x] When present, compute `dependencies`/`devDependencies` as: all of the template's entries, then
      overlay native's entries that are either not present in the template at all, or explicitly
      listed in the parameter.
- [x] Do not change the `scripts`, `name`, or other top-level field merge logic.
- [x] (Discovered during implementation, not in the original plan) Preserve the existing cross-field
      placement rule for the default path: a template dependency is excluded if native declares that
      name in _either_ `dependencies` or `devDependencies`, not just the matching field. My first
      implementation attempt computed this per-field independently and broke `TEST-MERGE-008 keeps
native dependency placement`; fixed by passing the combined native-name set into the shared
      `mergeDependencyMap` helper instead of deriving it per field.

### 2. Wire the new parameter through the two affected profile definitions

- [x] `"react-native/default"` declares `nativeOwnedDependencies: ["react-native"]`.
- [x] `"expo/default"` declares `nativeOwnedDependencies: ["expo", "react-native"]`.
- [x] `applyReferenceProfile` passes `profile.nativeOwnedDependencies` through to
      `mergeProfilePackageJson`.

### 3. Prove the default (no-parameter) path is unchanged

- [x] `TEST-MERGE-001` through `TEST-MERGE-008` in `reference-profiles.test.js` pass unmodified.

### 4. Prove the new precedence at the unit level

- [x] A dependency present in both manifests, not in `nativeOwnedDependencies`, resolves to the
      template's version.
- [x] A dependency present in both manifests, listed in `nativeOwnedDependencies`, resolves to the
      native scaffold's version.

### 5. Prove the fix end-to-end for both affected profiles

- [x] `react-native/default`: an overlapping non-framework dependency resolves to the template
      fixture's version; `react-native` itself still resolves to the native fixture's version.
- [x] `expo/default`: an overlapping non-framework dependency resolves to the template fixture's
      version; `expo` still resolves to the native fixture's version (`react-native` itself is not
      declared in the expo template/native test fixtures, so it is not separately exercised at the
      integration level; the unit-level `TEST-MERGE-010` already proves the owned-exception mechanism
      generically).

## Test-to-Task Map

| Small task                       | Test IDs                                         | Reason                                                                              |
| -------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Extend `mergeProfilePackageJson` | `TEST-MERGE-009`, `TEST-MERGE-010`               | Unit-level proof of the new opt-in precedence, both branches (owned vs. not owned). |
| Wire profile definitions         | `TEST-OVERLAY-011` (updated), `TEST-OVERLAY-012` | End-to-end proof through the real scaffold merge call sites for both profiles.      |
| Prove default path unchanged     | `TEST-MERGE-001` through `TEST-MERGE-008`        | Regression guard: existing profiles and callers must be untouched.                  |
| API contract validation          | Not applicable                                   | No schemas, routes, payloads, or API client contracts change.                       |
| Security boundary testing        | Not applicable                                   | Pure local dependency-version selection logic; no secrets, auth, or external input. |

## Exact Test Cases

### TEST-MERGE-009: Non-owned overlapping dependency prefers the template version

- **Small task:** Extend `mergeProfilePackageJson` with opt-in native-owned-dependency precedence.
- **Source:** This checklist's Context; the concrete `react-native-safe-area-context` drift bug.
- **Test place:** `core/create-mono-stack/test/reference-profiles.test.js`, unit test.
- **Starting state:** `mergeProfilePackageJson` has no `nativeOwnedDependencies` parameter yet.
- **Exact input or fixture:** `nativePackage()` with `"react-native-safe-area-context": "^5.5.2"` in
  `dependencies`; `templatePackage()` with `"react-native-safe-area-context": "5.9.1"` in
  `dependencies`; call with `nativeOwnedDependencies: ["react-native"]` (the name under test is not in
  this list).
- **Interaction steps:** Call `mergeProfilePackageJson(native, template, "mobile", [], ["react-native"])`.
- **Main behavior:** A dependency present in both manifests, not listed in `nativeOwnedDependencies`,
  resolves to the template's version.
- **Expected result:** `merged.dependencies["react-native-safe-area-context"] === "5.9.1"`.
- **Must change:** `mergeProfilePackageJson`'s dependency-map computation.
- **Must not happen:** The native scaffold's `^5.5.2` value must not appear in the merged result.
- **Planned command:** `pnpm --filter create-mono-stack test -- --test-name-pattern "TEST-MERGE-009"`
- **Expected result before the code change:** Fails — the function has no 5th parameter, so this call
  either throws or (if the extra argument is silently ignored) falls back to today's "native wins"
  behavior, returning `^5.5.2` instead of `5.9.1`.
- **First observed run:** Failed as expected: `AssertionError: '^5.5.2' !== '5.9.1'` — the extra 5th
  argument is currently silently ignored, so native's version still wins.
- **Passing rerun:** `pnpm --filter create-mono-stack test -- --test-name-pattern "TEST-MERGE-009"`
  passes; full suite rerun (`pnpm --filter create-mono-stack test`) shows 230/230 passing.

### TEST-MERGE-010: Owned overlapping dependency keeps the native version

- **Small task:** Extend `mergeProfilePackageJson` with opt-in native-owned-dependency precedence.
- **Source:** This checklist's Context; the native/Gradle-file coupling rationale for `react-native`.
- **Test place:** `core/create-mono-stack/test/reference-profiles.test.js`, unit test.
- **Starting state:** Same starting state as `TEST-MERGE-009`.
- **Exact input or fixture:** `nativePackage()` with `"react-native": "^0.76.0"` in `dependencies`;
  `templatePackage()` with `"react-native": "0.87.0"` in `dependencies`; call with
  `nativeOwnedDependencies: ["react-native"]` (the name under test **is** in this list).
- **Interaction steps:** Call `mergeProfilePackageJson(native, template, "mobile", [], ["react-native"])`.
- **Main behavior:** A dependency present in both manifests and listed in `nativeOwnedDependencies`
  resolves to the native scaffold's version, unchanged from today's default behavior.
- **Expected result:** `merged.dependencies["react-native"] === "^0.76.0"`.
- **Must change:** Nothing beyond what `TEST-MERGE-009` already changes; this proves the exception path
  of that same change.
- **Must not happen:** The template's `0.87.0` value must not silently override the native scaffold's
  value for a listed name.
- **Planned command:** `pnpm --filter create-mono-stack test -- --test-name-pattern "TEST-MERGE-010"`
- **Expected result before the code change:** Fails for the same reason as `TEST-MERGE-009` (no 5th
  parameter exists yet).
- **First observed run:** Passed already at baseline — the extra argument is silently ignored, and
  today's unconditional "native wins" behavior already happens to produce the same result this case
  expects (native winning for `react-native`), since there is no non-owned-dependency distinction yet.
  This case still adds value once the implementation lands, as a regression guard proving the owned
  exception continues to work under the new parameter rather than only by accident.
- **Passing rerun:** `pnpm --filter create-mono-stack test -- --test-name-pattern "TEST-MERGE-010"`
  passes; full suite rerun shows 230/230 passing.

### TEST-OVERLAY-011 (updated): React Native overlay keeps the framework version and prefers the template for other dependencies

- **Small task:** Wire the new parameter through `"react-native/default"`.
- **Source:** Existing `TEST-OVERLAY-011` in `native-scaffold-overlays.test.js`
  (`native-scaffold-overlays.test.js:364-402`), extended rather than replaced.
- **Test place:** `core/create-mono-stack/test/native-scaffold-overlays.test.js`, integration test
  through `scaffoldSingle`/`scaffoldNativeApps`/`applyReferenceProfile`.
- **Starting state:** `native-scaffold.helpers.js`'s `renderedMobilePackage` (template fixture) and
  `reactNativeNativeTree`'s `package.json` (native fixture) do not yet include an overlapping
  `react-native-safe-area-context`-style entry.
- **Exact input or fixture:** Add `"react-native-safe-area-context": "5.9.1"` to
  `renderedMobilePackage.dependencies` (`native-scaffold.helpers.js:179-200`) and
  `"react-native-safe-area-context": "^5.5.2"` to `reactNativeNativeTree`'s `package.json.dependencies`
  (`native-scaffold.helpers.js:240-253`).
- **Interaction steps:** Run `scaffoldSingle` for the `mobile-react-native` feature, as the existing
  test already does; read the generated `package.json`.
- **Main behavior:** The framework package (`react-native`) keeps the native scaffold's version; the
  new overlapping non-framework dependency resolves to the template's version.
- **Expected result:** `packageJson.dependencies["react-native"] === "^0.76.0"` (existing assertion,
  unchanged) and `packageJson.dependencies["react-native-safe-area-context"] === "5.9.1"` (new
  assertion).
- **Must change:** `native-scaffold.helpers.js` fixtures; the new assertion in
  `native-scaffold-overlays.test.js`.
- **Must not happen:** `react-native`'s existing assertion must not change value; the new dependency
  must not resolve to the native fixture's `^5.5.2`.
- **Planned command:** `pnpm --filter create-mono-stack test -- --test-name-pattern "TEST-OVERLAY-011"`
- **Expected result before the code change:** The added assertion fails (resolves to `^5.5.2`, not
  `5.9.1`); the pre-existing `react-native` assertion still passes on its own before this task's
  fixture/profile changes are added, since it is unrelated to the new field until wired up.
- **First observed run:** Failed as expected: `AssertionError: '^5.5.2' !== '5.9.1'` for the new
  `react-native-safe-area-context` assertion; the pre-existing `react-native` assertion passed
  throughout, confirming it was unaffected before the profile was wired up.
- **Passing rerun:** `pnpm --filter create-mono-stack test -- --test-name-pattern "TEST-OVERLAY-011"`
  passes, both the pre-existing `react-native` assertion and the new
  `react-native-safe-area-context` assertion; full suite rerun shows 230/230 passing.

### TEST-OVERLAY-012: Expo overlay keeps the framework versions and prefers the template for other dependencies

- **Small task:** Wire the new parameter through `"expo/default"`.
- **Source:** Existing `TEST-OVERLAY-010` in `native-scaffold-overlays.test.js`, and this checklist's
  Context (Expo SDK/React Native version coupling).
- **Test place:** `core/create-mono-stack/test/native-scaffold-overlays.test.js`, integration test.
- **Starting state:** `renderedExpoPackage`-equivalent template fixture and `expoNativeTree`'s
  `package.json` (`native-scaffold.helpers.js:221-238`) do not yet include an overlapping
  non-framework dependency.
- **Exact input or fixture:** Add an overlapping dependency (for example
  `"react-native-safe-area-context"`) with distinct template vs. native fixture version strings to
  both manifests, mirroring `TEST-OVERLAY-011`'s fixture shape.
- **Interaction steps:** Run `scaffoldSingle` for the `mobile-expo` feature; read the generated
  `package.json`.
- **Main behavior:** `expo` and `react-native` keep the native scaffold's versions; the new overlapping
  dependency resolves to the template's version.
- **Expected result:** `packageJson.dependencies.expo` and `packageJson.dependencies["react-native"]`
  keep their existing native-fixture values (matching `TEST-OVERLAY-010`'s existing assertions); the
  new dependency resolves to the template fixture's version.
- **Must change:** `native-scaffold.helpers.js` fixtures; a new assertion in
  `native-scaffold-overlays.test.js`.
- **Must not happen:** `expo`/`react-native` assertions must not change value.
- **Planned command:** `pnpm --filter create-mono-stack test -- --test-name-pattern "TEST-OVERLAY-010"`
- **Expected result before the code change:** The added assertion fails.
- **First observed run:** Failed as expected: `AssertionError: '^5.5.2' !== '5.9.1'` for the new
  `react-native-safe-area-context` assertion; the pre-existing `expo` assertion passed throughout.
- **Passing rerun:** `pnpm --filter create-mono-stack test -- --test-name-pattern "TEST-OVERLAY-010"`
  passes, both the pre-existing `expo` assertion and the new `react-native-safe-area-context`
  assertion; full suite rerun shows 230/230 passing.

### TEST-MERGE-001 through TEST-MERGE-008: Regression guard

- **Small task:** Prove the default (no-parameter) path is unchanged.
- **Source:** `reference-profiles.test.js:362-` (existing, unmodified cases).
- **Test place:** `core/create-mono-stack/test/reference-profiles.test.js`.
- **Starting state:** Existing passing test suite.
- **Exact input or fixture:** Unchanged existing fixtures.
- **Interaction steps:** Run the full `reference-profiles.test.js` suite.
- **Main behavior:** Every profile/call site that does not pass `nativeOwnedDependencies` keeps today's
  exact "native wins on overlap" behavior.
- **Expected result:** All pre-existing assertions in these cases keep passing, unmodified.
- **Must change:** Nothing in these specific test bodies.
- **Must not happen:** Any change to these tests' expected values.
- **Planned command:** `pnpm --filter create-mono-stack test`
- **Expected result before the code change:** Passing (this is a regression guard, not a reproduction
  of the bug).
- **First observed run:** `TEST-MERGE-001` through `TEST-MERGE-007` passed throughout. `TEST-MERGE-008`
  was passing before the implementation began, then broke during a first implementation attempt (the
  per-field refactor lost the original cross-field placement exclusion — see the note under Small Task
  1), then was fixed and reconfirmed passing before finalizing.
- **Passing rerun:** Full suite: 230/230 passing (`pnpm --filter create-mono-stack test`). Lint clean
  (`pnpm --filter create-mono-stack lint`).

## Implementation Steps

- [x] Extend `mergeProfilePackageJson` in `core/create-mono-stack/src/reference-profiles.js` with the
      optional `nativeOwnedDependencies` parameter and the new merge computation, keeping the existing
      computation as the default path.
- [x] Add `nativeOwnedDependencies: ["react-native"]` to `"react-native/default"`.
- [x] Add `nativeOwnedDependencies: ["expo", "react-native"]` to `"expo/default"`.
- [x] Pass `profile.nativeOwnedDependencies` through in `applyReferenceProfile`
      (`core/create-mono-stack/src/native-scaffold.js:236-241`).
- [x] Add the overlapping-dependency fixtures to `native-scaffold.helpers.js` for both the
      `react-native` and `expo` native/template package fixtures.
- [x] Add/update the test assertions described above.

## Verification Order

1. [x] Write `TEST-MERGE-009`/`TEST-MERGE-010` and the `TEST-OVERLAY-011`/`TEST-OVERLAY-012` fixture
       and assertion changes; run them and record the failing baseline.
2. [x] Implement the `mergeProfilePackageJson` extension.
3. [x] Rerun `TEST-MERGE-009`/`TEST-MERGE-010`; record passing results.
4. [x] Wire `nativeOwnedDependencies` into both profile definitions and `applyReferenceProfile`.
5. [x] Rerun `TEST-OVERLAY-011`/`TEST-OVERLAY-012`; record passing results.
6. [x] Run the full `core/create-mono-stack` test suite (`pnpm --filter create-mono-stack test`) and
       confirm `TEST-MERGE-001` through `TEST-MERGE-008` remain passing (`TEST-MERGE-008` required a fix
       during this step; see the note under Small Task 1 — it is unmodified in its own test body, but the
       shared merge helper needed a correction to keep it passing).
7. [x] Run `pnpm --filter create-mono-stack lint` — clean.
8. [x] Re-scan this checklist for incomplete or stale items before finalizing.

## Risks And Non-Goals

- `nestjs/default` is intentionally left with today's "native wins" behavior — no demonstrated bug and
  no baked-native-file coupling; out of scope here since the field is opt-in per profile.
- This checklist does not change `my-project` (the already-generated test project) directly, per
  explicit user choice — only `create-mono-stack` itself, so future scaffolds/regenerations pick up the
  fix.
- Does not address the separate, lower-severity observation that `@react-native-community/cli@latest`
  itself is unpinned (native `android`/`ios` project files it generates are tied to whatever "latest"
  produces that day, independent of this merge fix). Flagged during investigation but out of scope for
  this checklist; no bug was demonstrated from it beyond the dependency-version drift this checklist
  fixes.
