# Wire Next.js, Expo, and bare React Native targets into create-mono-stack

**Checklist ID:** 2026-08-17-wire-next-expo-react-native-targets
**Status legend:** `[ ]` not started · `[/]` partial (explain remainder) · `[x]` complete
**Related plan:** `/Users/mr_adventurous/.claude/plans/instead-of-targeting-vite-warm-cocoa.md`

## Context

`create-mono-stack` lists five app features but only wires two generators (`web-vite`, `api-nest`).
Selecting `web-next`, `mobile-expo`, or `mobile-react-native` sets a Copier flag and scaffolds nothing.
Goal: wire all three so they scaffold a real app with a full reference overlay mirroring `apps/web`.
Vite + Nest stay unchanged. Next uses Tailwind + shadcn parity; Expo uses expo-router; bare RN uses a
stack navigator.

The generator-specific logic is concentrated in `native-scaffold.js` + `reference-profiles.js`; the
rest already generalizes over `FEATURE_DEFINITIONS`. No test invokes a real generator — the unit
fixture and the Docker integration helper mock `runCommand` by pattern-matching args, so new generators
are cheap and deterministic to test.

## Non-goals

- Do not run real create-next-app / create-expo-app / RN CLI in tests or CI.
- Do not remove or change Vite or NestJS behavior.
- Do not rename generated native iOS/Android identifiers for bare RN (documented limitation).

## Task breakdown

### Slice 0 — Foundation (generator wiring + profiles + fixtures) — the shared backbone

- [x] 0.1 Generalize `native-scaffold.js`:
  - [x] 0.1.1 Extend `appDefinitions` with per-definition `interactive`, `defaultProfile`,
        `detectProfile` metadata and add `next`/`expo`/`react-native` entries (canonical names
        `next`/`expo`/`mobile`, `nameKey: null`).
  - [x] 0.1.2 `commandFor(definition, target)` returns non-interactive arg arrays for the new
        generators; add a `pascalCaseName` helper for RN's project name + `--directory`.
  - [x] 0.1.3 Generalize the `scaffoldNativeApps` loop: pick `runInteractiveCommand` only when
        `definition.interactive`; capture `selection` only when interactive; resolve profile via
        `definition.detectProfile?.(...) ?? definition.defaultProfile`; keep vite's
        `selectionSupportsViteProfile` gate. `selectedDefinitions` tolerant of `nameKey: null`.
- [x] 0.2 Add `next/default`, `expo/default`, `react-native/default` profiles (nestjs-style
      `overlayEntries`) to `reference-profiles.js`.
- [x] 0.3 Extend `native-scaffold.helpers.js`: canonical trees (`renderedNextTree`, `renderedExpoTree`,
      `renderedMobileTree`), generated native trees (`nextNativeTree`, `expoNativeTree`,
      `reactNativeNativeTree`), and three `runCommand` arg-branches.
- [x] 0.4 Wiring tests green. First observed run: 10 planned cases failed (50 pass / 10 fail across the
      four files). Passing rerun: all 60 pass; full unit suite `pnpm --filter create-mono-stack test`
      = 226 pass / 0 fail.

### Slice 1 — Next.js canonical app — COMPLETE

- [x] 1.1 `@repo/env/next` export (`createNextEnv`, clientPrefix `NEXT_PUBLIC_`, runtimeEnv
      `process.env`) + `NEXT_PUBLIC_APP_URL`/`NEXT_PUBLIC_API_BASE_URL` in `globalEnv` + `.env.example` + package export/vite entry/barrel. Validated: `@repo/env` build + typecheck + lint green (no unit
      harness exists in the package; validation is build/typecheck/lint per its AGENTS.md).
- [x] 1.2 `apps/next` canonical app: create-next-app base (Next 16, App Router, `src/`, `@/*`, Tailwind
      v4) + ported base-mira shadcn (button/input/label/table/card, globals.css theme, components.json),
      home route, `reference/todos` demo (form + user filter + table), Query provider (`providers.tsx`),
      `@repo/query-client|entities|api-client` wiring, env via `@repo/env/next` (`src/lib/env.ts`
      spells out the runtime map so Next inlines `NEXT_PUBLIC_*`).
- [x] 1.3 `apps/next` `AGENTS.md`, `CLAUDE.md` (`@AGENTS.md`), `README.md`.
- [x] 1.4 `next/default` overlayEntries finalized against the real tree
      (`.env.example`, `AGENTS.md`, `CLAUDE.md`, `README.md`, `components.json`, `src`). Verified:
      `pnpm --filter next typecheck` clean, `pnpm --filter next build` green (both routes prerender),
      `pnpm --filter next lint` clean, repo `format:check` clean, create-mono-stack unit suite 226/226
      (updated `.env.example` assertions in copier-template.test.js: TEST-ENV-001 + synchronized-adapter
      embedded copy).

### Slice 2 — Expo canonical app — COMPLETE

- [x] 2.1 `@repo/env/expo` export (`createExpoEnv`, clientPrefix `EXPO_PUBLIC_`) +
      `EXPO_PUBLIC_APP_URL`/`EXPO_PUBLIC_API_BASE_URL` in `globalEnv` + `.env.example` + package
      export/vite entry/barrel. `@repo/env` build + typecheck + lint green.
- [x] 2.2 `apps/expo` canonical app: create-expo-app `blank-typescript` base (Expo SDK 57) converted to
      **expo-router** — `app/_layout.tsx` stack + Providers + SafeAreaProvider, `app/index.tsx` home,
      `app/todos.tsx` demo (TextInput + FlatList via `components/todo-list.tsx`), `index.ts` →
      `expo-router/entry`, `lib/providers.tsx` Query provider, `lib/env.ts` via `@repo/env/expo`,
      `@repo/query-client|entities|api-client` wiring. Native UI primitives (no shadcn/DOM). Router
      ecosystem pinned to SDK-57 versions from Expo's bundledNativeModules (expo-router ~57.0.14,
      safe-area-context ~5.7, screens ~4.26, linking/constants, react-native-web, react-dom).
- [x] 2.3 Docs (`AGENTS.md`/`CLAUDE.md`/`README.md` incl. native-toolchain note). `expo/default`
      overlayEntries finalized: added `app.json` (scheme + expo-router plugin + metro web bundler) and
      `index.ts` (router entry) alongside `app`/`components`/`lib`/docs, so a scaffolded blank-typescript
      app boots the router. Fixture (`renderedExpoTree`) + TEST-OVERLAY-010 updated to assert the new
      overlaid entries. Verified: `pnpm --filter expo typecheck` clean; scaffolder suite 226/226; repo
      `format:check` clean. Native build not run in CI (needs Xcode/Android — documented risk).

### Slice 3 — bare React Native canonical app — COMPLETE

- [x] 3.1 `@repo/env/react-native` export (`createReactNativeEnv(runtimeEnv)`, `isServer: true` since RN
      is one trusted runtime with no browser client/server split) + `RN_PUBLIC_APP_URL`/
      `RN_PUBLIC_API_BASE_URL` in `globalEnv` + `.env.example` + package export/vite entry/barrel. The
      app seeds it from `src/config.ts` (documented: swap for a native loader like react-native-config).
- [x] 3.2 `apps/mobile` canonical app: @react-native-community/cli base (RN 0.87) with `App.tsx` +
      `@react-navigation/native` native-stack (`src/screens/home.tsx`, `src/screens/todos.tsx` demo,
      `src/components/todo-list.tsx` FlatList), `src/lib/providers.tsx` Query provider, `src/lib/env.ts`
      via `@repo/env/react-native`, `@repo/query-client|entities|api-client` wiring. Native primitives,
      relative imports. Slimmed to the JS project (dropped `ios`/`android`/Gemfile/`.bundle`/jest +
      RN's own eslint/prettier so repo tooling applies); `tsconfig` overrides `types: []`.
- [x] 3.3 Docs (`AGENTS.md`/`CLAUDE.md`/`README.md` with native-toolchain note). `react-native/default`
      overlayEntries confirmed (`App.tsx`, `AGENTS.md`, `CLAUDE.md`, `README.md`, `src`) — App.tsx +
      screens overlay onto the generated app; native `index.js`/`app.json`/`metro.config.js` stay.
      **Generator fix:** dropped `--pm pnpm` from the RN command (it fails a pnpm detection check inside
      `pnpm dlx` even with `--skip-install`); updated `commandFor` + TEST-COMMAND-007. Verified:
      `pnpm --filter mobile typecheck` clean; scaffolder suite 226/226; repo `format:check` clean.
      Native build not run in CI (needs Xcode/Android + user-generated native dirs — documented).

### Cross-cutting

- [x] X.1 `create-project.js`: documented generic `--app-name <feature>:<name>` in help and listed the
      new features. Completion notice reviewed and left as-is — the vite-only null-profile filter stays
      correct because the new generators always resolve a non-null default profile, so they never hit
      the "only Vite React TypeScript is supported" branch. cli tests 16/16 green.
- [x] X.2 Repo gate green: `pnpm --filter create-mono-stack test` 226/226; **`just check` EXIT 0**
      (15/15 turbo tasks — lint/typecheck/format/skills/template all pass; only a pre-existing
      `web:lint` warning, 0 errors); **`pnpm build` 9/9** including `next:build` and `web:build`. Each
      new app also verified standalone (next: typecheck+build+lint; expo: typecheck; mobile: typecheck).

## Exact test cases — Slice 0 (foundation)

> Test runner: `node:test` via `pnpm --filter create-mono-stack test`. Fixtures mock generators.

### TEST-COMMAND-005 — Next generator runs with non-interactive flags via runCommand

- **Small task:** 0.1.2 next branch of `commandFor`.
- **Source:** Plan §1; create-next-app documented flags.
- **Test place:** `core/create-mono-stack/test/native-scaffold.test.js`.
- **Starting state:** fixture with canonical `apps/next` + `nextNativeTree`; feature `["web-next"]`.
- **Exact input or fixture:** `appNames: { "web-next": "next" }`.
- **Interaction steps:** call `scaffoldNativeApps`.
- **Main behavior:** the recorded call for the Next generator.
- **Expected result:** exactly `["pnpm", ["dlx","create-next-app@latest","next-next","--ts","--app","--src-dir","--eslint","--tailwind","--import-alias","@/*","--use-pnpm","--skip-install","--yes"]]` with `options {cwd: temporaryRoot, stdio:"inherit"}`; issued via `runCommand` (not interactive).
- **Must change:** `fixture.calls` contains this entry.
- **Must not happen:** no `runInteractiveCommand`; no `selection` on the record.
- **Planned command:** `pnpm --filter create-mono-stack test`.
- **Expected result before the code change:** fails (generator not wired; no call recorded).
- **First observed run:** _pending_
- **Passing rerun:** _pending_

### TEST-COMMAND-006 — Expo generator runs with non-interactive flags

- **Small task:** 0.1.2 expo branch.
- **Source:** Plan §1; create-expo-app flags.
- **Test place:** `native-scaffold.test.js`.
- **Starting state:** feature `["mobile-expo"]`; canonical `apps/expo` + `expoNativeTree`.
- **Exact input or fixture:** `appNames: { "mobile-expo": "expo" }`.
- **Interaction steps:** call `scaffoldNativeApps`.
- **Main behavior:** recorded Expo call.
- **Expected result:** exactly `["pnpm", ["dlx","create-expo-app@latest","expo-expo","--template","blank-typescript","--no-install"]]`, via `runCommand`.
- **Must not happen:** no interactive call.
- **Planned command:** `pnpm --filter create-mono-stack test`.
- **Expected result before the code change:** fails.
- **First observed run:** _pending_
- **Passing rerun:** _pending_

### TEST-COMMAND-007 — bare RN generator uses PascalCase name + --directory

- **Small task:** 0.1.2 react-native branch + `pascalCaseName`.
- **Source:** Plan §1 + Risks; RN CLI rejects hyphens.
- **Test place:** `native-scaffold.test.js`.
- **Starting state:** feature `["mobile-react-native"]`; `appNames: { "mobile-react-native": "mobile-app" }`; canonical `apps/mobile` + `reactNativeNativeTree` written at the `--directory` value.
- **Interaction steps:** call `scaffoldNativeApps`.
- **Main behavior:** recorded RN call.
- **Expected result:** `["pnpm", ["dlx","@react-native-community/cli@latest","init","MobileApp","--directory","react-native-mobile-app","--pm","pnpm","--skip-install","--skip-git-init"]]`; project name PascalCase, `--directory` is the temporary name.
- **Must not happen:** hyphen in the RN project name arg.
- **Planned command:** `pnpm --filter create-mono-stack test`.
- **Expected result before the code change:** fails.
- **First observed run:** _pending_
- **Passing rerun:** _pending_

### TEST-OVERLAY-009 — Next overlay replaces generated source and merges deps

- **Small task:** 0.2 next profile + overlay.
- **Source:** Plan §2; nestjs overlay precedent (TEST-OVERLAY-005/007).
- **Test place:** `native-scaffold-overlays.test.js`.
- **Starting state:** scaffold `web-next` → `apps/next`.
- **Exact input or fixture:** canonical `renderedNextTree` (marker source + `@repo/*` deps); `nextNativeTree` (placeholder source + generated dep versions).
- **Interaction steps:** `scaffoldNativeApps`, read app root.
- **Main behavior:** overlay result + package merge + record.
- **Expected result:** canonical marker source present; generated placeholder gone; `AGENTS.md`/`CLAUDE.md` copied; generated dep versions preserved while `@repo/*` deps added; `apps[0].referenceProfile === "next/default"`; no `selection` key.
- **Must not happen:** generated-owned config (e.g. `next.config.ts`) not clobbered by overlay.
- **Planned command:** `pnpm --filter create-mono-stack test`.
- **Expected result before the code change:** fails.
- **First observed run:** _pending_
- **Passing rerun:** _pending_

### TEST-OVERLAY-010 — Expo overlay replaces generated source and merges deps

- **Small task:** 0.2 expo profile.
- **Source:** Plan §2.
- **Test place:** `native-scaffold-overlays.test.js`.
- **Starting state:** scaffold `mobile-expo` → `apps/expo`.
- **Exact input or fixture:** `renderedExpoTree` / `expoNativeTree`.
- **Main behavior/Expected result:** canonical `app/` source present; placeholder gone; docs copied; deps merged; `referenceProfile === "expo/default"`; no `selection`.
- **Planned command:** `pnpm --filter create-mono-stack test`.
- **Expected result before the code change:** fails.
- **First observed run:** _pending_
- **Passing rerun:** _pending_

### TEST-OVERLAY-011 — bare RN overlay replaces generated source and merges deps

- **Small task:** 0.2 react-native profile.
- **Source:** Plan §2.
- **Test place:** `native-scaffold-overlays.test.js`.
- **Starting state:** scaffold `mobile-react-native` → `apps/mobile`.
- **Exact input or fixture:** `renderedMobileTree` / `reactNativeNativeTree`.
- **Main behavior/Expected result:** canonical `App.tsx`/`src` present; placeholder gone; docs copied; deps merged; `referenceProfile === "react-native/default"`; no `selection`.
- **Planned command:** `pnpm --filter create-mono-stack test`.
- **Expected result before the code change:** fails.
- **First observed run:** _pending_
- **Passing rerun:** _pending_

### TEST-SELECTION-010 — mixed selection stages correct apps and removes unselected canonicals

- **Small task:** 0.1.3 loop + cleanup.
- **Source:** Plan §1 (cleanup loop) + existing selection tests.
- **Test place:** `native-scaffold-selection.test.js`.
- **Starting state:** features `["web-vite","web-next","mobile-expo"]`; all canonical trees written.
- **Interaction steps:** `scaffoldNativeApps`.
- **Main behavior:** staged app records + presence of app dirs.
- **Expected result:** apps for web/next/expo staged at their names; `apps/server` and `apps/mobile` canonical dirs removed; records carry correct `referenceProfile` per generator.
- **Planned command:** `pnpm --filter create-mono-stack test`.
- **Expected result before the code change:** fails.
- **First observed run:** _pending_
- **Passing rerun:** _pending_

### TEST-PROFILE-110 — new profiles exist with overlayEntries and correct generator/canonicalName

- **Small task:** 0.2.
- **Source:** Plan §2.
- **Test place:** `reference-profiles.test.js`.
- **Starting state:** import `REFERENCE_PROFILES`.
- **Main behavior:** shape of the three new entries.
- **Expected result:** each of `next/default`/`expo/default`/`react-native/default` has array `overlayEntries` and the expected `generator`/`canonicalName`.
- **Planned command:** `pnpm --filter create-mono-stack test`.
- **Expected result before the code change:** fails.
- **First observed run:** _pending_
- **Passing rerun:** _pending_

### TEST-PROFILE-111 — vite detection still ignores non-vite generators

- **Small task:** 0.2 (guard the `generator === "vite"` filter).
- **Source:** `detectViteReferenceProfile` filter.
- **Test place:** `reference-profiles.test.js`.
- **Starting state:** a Next-shaped package (has `next`, no vite signature).
- **Main behavior:** `detectViteReferenceProfile` return.
- **Expected result:** returns `null` (new profiles not vite-detected).
- **Planned command:** `pnpm --filter create-mono-stack test`.
- **Expected result before the code change:** _n/a — regression guard, expected to pass pre- and post-change; run to confirm._
- **First observed run:** _pending_
- **Passing rerun:** _pending_

### TEST-MANIFEST-002 — appNames derive next/expo/mobile defaults for the new features

- **Small task:** X.1 / verify existing derivation.
- **Source:** `create-project.js` appNames derivation + `DEFAULT_FEATURE_NAMES`.
- **Test place:** `create-project-native.test.js`.
- **Starting state:** features include the three new ones with no explicit names.
- **Main behavior:** derived `appNames` passed to scaffold.
- **Expected result:** `web-next`→`next`, `mobile-expo`→`expo`, `mobile-react-native`→`mobile`.
- **Planned command:** `pnpm --filter create-mono-stack test`.
- **Expected result before the code change:** likely passes (already generic) — confirm.
- **First observed run:** _pending_
- **Passing rerun:** _pending_

## Task-to-test map (Slice 0)

- 0.1.2 next arg array → TEST-COMMAND-005
- 0.1.2 expo arg array → TEST-COMMAND-006
- 0.1.2 RN arg array + `pascalCaseName` → TEST-COMMAND-007
- 0.1.3 loop/selection/cleanup → TEST-SELECTION-010 (+ existing vite/nest tests must stay green)
- 0.2 next overlay → TEST-OVERLAY-009; expo → TEST-OVERLAY-010; RN → TEST-OVERLAY-011
- 0.2 profile shape → TEST-PROFILE-110; vite-detection guard → TEST-PROFILE-111
- X.1 name derivation → TEST-MANIFEST-002

Common areas not applicable to Slice 0: interactive-observation tests (new generators are
non-interactive → no `selection`); detection tests for new profiles (reached only via `defaultProfile`).

## Verification commands

- `pnpm --filter create-mono-stack test` — all suites green incl. the new cases; existing vite/nest
  cases unchanged.
- Per canonical-app slice: `pnpm --filter @repo/env build && pnpm --filter @repo/env test`,
  `pnpm --filter <app> typecheck` (and build where practical).
- Final gate: `just check`.

## Risks

- RN native identifiers won't be renamed by the JS/TS overlay (documented).
- Committing three canonical apps grows the template dep tree (RN large); tests mock generators so CI
  needs no native toolchains.
- `applyReferenceProfile` `cp` throws on a missing overlay source → finalize each `overlayEntries`
  list against the real canonical tree.

## Follow-up slice — Next.js reference-app parity (dev:reference + matching form)

Found via the user's real scaffold test: the generated Next app lacked a `dev:reference` script and its
todo form was a plain `useState` form, not the Vite `useAppForm` system. Fix = reference-folder profile

- full demo port. Plan: see "Follow-up: Next.js reference-app parity" in the plan file.

* [x] P.0 De-risk: confirm `next build reference` runs a subdir as its own app. **POC result:**
      `next build reference` succeeded WITHOUT a `reference/package.json` (Next resolves the parent
      node_modules). → drop the `reference/package.json` entry from the profile.
* [x] P.1 `apps/next/package.json`: added `dev:reference`/`build:reference`/`start:reference`
      (`next <cmd> reference`) + demo deps (`@tanstack/react-form`, `@tanstack/react-table`,
      `lucide-react`, `sonner`, `next-themes`, `@hugeicons/*`).
* [x] P.2 Ported `apps/web/src/components` (full ui closure + forms `useAppForm` system) into
      `apps/next/src/components` verbatim; added `"use client"` to interactive components, removed it
      from `button.tsx` so `buttonVariants()` stays server-callable.
* [x] P.3 Ported the full demo as App Router pages (home, form-demo + bug-report-option, table-demo
      split page/payments-columns, reference layout/index/todos/[todoId]); providers `{ retry: false }`;
      layout `Toaster`; TanStack Router → `next/link` + `next/navigation`.
* [x] P.4 `reference-profiles.js` `next/default` → `referenceEntries` (demo→`reference/`,
      docs+`.env.example` at root, **root `tsconfig.json` overlaid** so the app build excludes
      `reference/`; no `reference/package.json` — POC confirmed Next resolves the parent).
* [x] P.5 Updated tests/fixtures (TEST-PROFILE-112 new; TEST-PROFILE-110 now expo/rn only;
      TEST-OVERLAY-009 rewritten; `renderedNextTree`/`renderedNextPackage` updated).
* [x] P.6 Verified: `apps/next` typecheck + `next build` + local `next build reference`; **end-to-end**
      scaffold `web-next` → generated app keeps its own `src`, `reference/` holds the demo (todos uses
      `useAppForm`), scripts merged; in the generated project both `pnpm build` (starter 7/7) **and**
      `pnpm --filter next build:reference` (demo) succeed. Scaffolder suite 226/226; **`just check`
      EXIT 0 (15/15)**; `format:check` clean.

### Exact test cases — parity slice

#### TEST-PROFILE-112 — next/default is a reference-folder profile

- **Small task:** P.4.
- **Source:** plan; mirrors `vite/react-ts` (referenceEntries, non-codeOnly).
- **Test place:** `reference-profiles.test.js`.
- **Starting state:** import `REFERENCE_PROFILES`.
- **Main behavior:** shape of `next/default`.
- **Expected result:** has `referenceEntries` (array incl. `{destination:"reference/src",source:"src"}`),
  `generator:"next"`, `canonicalName:"next"`, and NO `overlayEntries`.
- **Planned command:** `pnpm --filter create-mono-stack test`.
- **Expected result before the code change:** fails (currently `overlayEntries`).
- **First observed run:** _pending_
- **Passing rerun:** _pending_

#### TEST-OVERLAY-009 (rewrite) — Next reference overlay keeps native src, copies demo to reference/

- **Small task:** P.4/P.5.
- **Source:** plan; `applyReferenceProfile` referenceEntries branch + `mergeProfilePackageJson`.
- **Test place:** `native-scaffold-overlays.test.js`.
- **Starting state:** scaffold `web-next` with `renderedNextTree` (demo) + `nextNativeTree`
  (generated, own `src/app/page.tsx`).
- **Main behavior:** overlay result + merged package + record.
- **Expected result:** generated `src/app/page.tsx` (native marker) **preserved**; demo copied to
  `reference/src/app/page.tsx`; `AGENTS.md`/`CLAUDE.md`/`.env.example` at root; merged package keeps
  native `next` version, adds `@repo/*` deps and the `*:reference` scripts;
  `apps[0].referenceProfile === "next/default"`.
- **Planned command:** `pnpm --filter create-mono-stack test`.
- **Expected result before the code change:** fails (current overlay replaces src, no reference/).
- **First observed run:** _pending_
- **Passing rerun:** _pending_

#### TEST-NEXT-BUILD-001 (manual/e2e) — the reference demo builds and uses useAppForm

- **Small task:** P.6.
- **Source:** user report; parity requirement.
- **Test place:** manual e2e in a generated project + committed `apps/next`.
- **Starting state:** committed `apps/next` (demo src); generated `web-next` project.
- **Interaction steps:** `pnpm --filter next build`; in a generated project `pnpm --filter next
build:reference`; grep the todos page for `useAppForm`.
- **Main behavior:** both builds succeed; todos form uses `useAppForm`.
- **Expected result:** both `next build` and `next build reference` exit 0; todos page imports
  `useAppForm` (not a plain `useState` form).
- **Planned command:** `pnpm --filter next build` + e2e scaffold + `build:reference`.
- **Expected result before the code change:** n/a (new capability).
- **First observed run:** _pending_
- **Passing rerun:** _pending_

## Validation notes

### End-to-end integration validation (real CLI, local committed template)

Beyond the mocked unit suite, ran the actual `create-mono-stack` CLI against a committed local template
(working tree rsynced into a temp git repo) for each new feature. All three complete with
"Project setup complete" (EXIT 0) and produce correct output:

- `--features web-next` → `apps/next` overlay applied (demo route, shadcn components, docs, `.env.example`),
  `package.json` merged (native `next@16.3.1` + `@repo/*` + `@base-ui/react`), manifest `next/default`,
  generated `next.config.ts`/`postcss.config.mjs` preserved.
- `--features mobile-expo` → `apps/expo` overlay applied (`app/` routes, `index.ts` → `expo-router/entry`,
  `app.json`), manifest `expo/default`.
- `--features mobile-react-native` → `apps/mobile` overlay applied (`App.tsx` with NavigationContainer,
  `src/`), RN CLI generated `ios`/`android`, manifest `react-native/default`.

### BUG FIXED — `apps/next/.env.example` was gitignored (found via the user's real run)

The first real scaffold failed with `ENOENT ... apps/next/.env.example` at the overlay step. Root
cause: Copier copies only git-**tracked** files, and create-next-app's `.gitignore` has `.env*`, which
ignored `apps/next/.env.example` (an overlay entry) so it never reached the template. Fix: added
`!.env.example` to `apps/next/.gitignore`. Expo/mobile were unaffected (their `.gitignore` only ignores
`.env*.local`, and their overlays don't include `.env.example`). Re-verified: all three scaffold clean.

Note: the new targets only work once the template changes are **committed** (Copier reads a git ref,
not the dirty working tree). The user's initial failure was against the default remote template at
`master`, which does not yet contain these apps.

### Pre-existing flakiness

`interactive-wizard.test.js` (Ink TUI) is timing-flaky under machine load — different ~1.3s cases fail
across full-suite runs but it passes 23/23 in isolation and 226/226 under an unloaded `just check`.
Not caused by this change (no `interactive-wizard.*` files were touched).
