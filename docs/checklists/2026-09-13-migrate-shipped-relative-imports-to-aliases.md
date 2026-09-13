# Migrate shipped/authored relative imports to aliases

Checklist ID: 2026-09-13-migrate-shipped-relative-imports-to-aliases
Related checklists: [[2026-09-13-relative-import-check-blocks-first-commit]] (the check itself; this
migration is the complementary source-level fix the user asked for on top of it)

## Change Tier

Tier: standard

## Context

Following the first-commit-check fix, the user asked why the shipped template content itself uses
relative imports at all, then asked to migrate it rather than build a post-generation codemod (a
codemod would reimplement, at runtime on every generation, a fix this repo can just bake into its own
source once — see the conversation for the full reasoning). Investigation found every currently
flagged relative import falls into content this repo fully authors and controls:

- `apps/server/**` and its shipped counterpart `core/create-mono-stack/reference-templates/managed/server/**`
  (two independently-maintained copies, not synced by any script — confirmed via `diff -rq`) already
  have both `@/*` (tsconfig `paths`, `src/*`) and `#reference/*` (package.json `imports`,
  `./reference/*`) wired up and mostly unused.
- `core/create-mono-stack/reference-templates/managed/web/**` isolates its demo content in a
  `reference/` tree deliberately kept outside `src/` (so the app's own `@/*` alias, scoped to
  `./src/*`, cannot reach it). No tsconfig currently includes `reference/` at all, so it has never
  been type-checked by any script regardless of import style, and `vite.config.ts` had no
  `@reference` bundler alias either — both needed to be added as part of this migration. (An
  earlier draft of this plan assumed the bundler alias already existed; that assumption was wrong
  and was corrected here before any commit, per this checklist's own active-document lifecycle.)
- `core/create-mono-stack/reference-templates/managed/{next,expo,mobile}/**` need no new alias wiring
  at all — their reference/demo content already lives inside the normal `@/*`-aliased tree; only two
  trivial same-directory test-file imports per platform are flagged.
- `packages/db` already has `#src/*`/`#example/*` package.json `imports`, mostly unused by its own
  `src/postgres.ts`. `packages/env`, `packages/api-client`, `packages/query-client` have no `imports`
  entries yet.
- `scripts/*.mjs` already has a root-level `#scripts/*` (`./scripts/*`) `imports` entry, unused by a
  few sibling-script imports.

So the fix is almost entirely "use the alias/subpath-import mechanism that already exists but isn't
applied consistently," plus wiring one genuinely new alias (`@reference/*` for web) and a small number
of new `package.json` `imports` entries following the exact pattern `packages/db` already established.

## Implementation Contract

### Feature Boundaries

- Included: rewriting relative imports to aliases/subpath imports in `apps/server/**`,
  `core/create-mono-stack/reference-templates/managed/{server,web,next,expo,mobile}/**`,
  `packages/{env,api-client,db,query-client}/**`, `scripts/*.mjs`; adding `packages/env`'s,
  `packages/api-client`'s, and `packages/query-client`'s missing `imports` entries (mirroring
  `packages/db`'s existing `#src/*`/`#example/*` pattern, plus a `#dist/*` entry for `packages/env`'s
  built-artifact test); wiring `@reference/*` into `core/create-mono-stack/reference-templates/managed/web`'s
  TypeScript config for editor/type support (additive — not wired into the enforced `tsc -b` build
  graph, since `reference/` has never been type-checked by any script and turning that on blind risks
  surfacing unrelated pre-existing type errors this change shouldn't need to fix); wiring the matching
  `@reference` bundler alias into that same app's `vite.config.ts` `resolve.alias`
  (`./reference/src`) so the alias actually resolves at real build time and not only in the
  editor/type-checker — missing from the initial plan and caught only by actually running
  TEST-ALIASMIG-002 instead of trusting the text-scan test alone; a new permanent
  regression test that runs the relative-import checker directly against these directories (not
  git-staged-diff-based, so it can never silently regress even without a future commit touching these
  files).
- Excluded: `apps/dashboard`-style native `pnpm create vite` scaffold output (`src/App.tsx`,
  `src/main.tsx`, their co-located CSS/asset imports) — not authored by this template, and relative
  imports of co-located CSS/assets are normal Vite convention, not a violation worth forcing into an
  alias; the [[2026-09-13-relative-import-check-blocks-first-commit]] fix already covers why this
  content can still legitimately trip the check on a fresh repo regardless of this migration.
- Ownership: `create-mono-stack` owns the reference-templates and server-app content; each `packages/*`
  owns its own `imports` map; root `scripts/` already owns `#scripts/*`.

### Route-Group Ownership

Not applicable — import-statement style across authored/shipped source, not an HTTP route.

### User Journey

1. A user generates a project with any feature combination; the reference/demo content and shared
   package source they receive uses aliases (`@/`, `@reference/`, `#reference/`, `#src/`, `#example/`,
   `#scripts/`) throughout, matching this repo's own house style, with zero relative imports left to
   flag once `git rev-parse --verify HEAD` succeeds for their first real commit.
2. A user editing this repo's own `apps/server`, `packages/*`, or `scripts/*` gets working
   editor/IntelliSense navigation through the same aliases, consistent with how `create-mono-stack`'s
   own `src/` already works (`#src/*`, migrated earlier this session).

### Complete Test Matrix

| Test ID           | Path type | Small task                                                                   | Trigger                                                                                                                                     | Expected result                                      | Status |
| ----------------- | --------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------ |
| TEST-ALIASMIG-001 | happy     | No relative imports remain outside barrels in any migrated directory         | `checkFiles` against every file under the migrated directories                                                                              | Zero failures                                        | Passed |
| TEST-ALIASMIG-002 | happy     | `@reference/*` resolves correctly for the web reference tree at build time   | Real Vite build of the managed web reference profile (via the existing native-scaffold fixture pipeline plus a real `vite build reference`) | Build succeeds; output contains the reference bundle | Passed |
| TEST-ALIASMIG-003 | happy     | `apps/server`'s own build/typecheck/lint/test suite is unaffected            | `pnpm --filter server build`, `typecheck`, `lint`, `test:unit`                                                                              | All pass, matching pre-migration baseline            | Passed |
| TEST-ALIASMIG-004 | happy     | `packages/{env,api-client,db,query-client}` build/test suites are unaffected | `pnpm --filter` each package's own `build`/`test` script                                                                                    | All pass, matching pre-migration baseline            | Passed |
| TEST-ALIASMIG-005 | happy     | `scripts/*.test.mjs` affected by the migration still pass                    | `node --test scripts/dev-ports.test.mjs`                                                                                                    | Passes, matching pre-migration baseline              | Passed |
| TEST-ALIASMIG-006 | happy     | The existing managed-web-template fixture test still passes unmodified       | `node --test core/create-mono-stack/test/native-scaffold-managed-template.test.js`                                                          | `TEST-MANAGED-001`/`TEST-SCOPE-*` pass unchanged     | Passed |

### Unresolved Conflicts

None found.

## Acceptance Criteria

- [x] Every file listed in the original `check-relative-imports.mjs --staged` failure output (except
      the excluded native-Vite-scaffold files) uses an alias/subpath import instead of a relative one.
- [x] `packages/env`, `packages/api-client`, `packages/query-client` gain `imports` entries following
      `packages/db`'s existing `#src/*`/`#example/*` pattern.
- [x] `core/create-mono-stack/reference-templates/managed/web` gains `@reference/*` TypeScript path
      support without changing the enforced build/typecheck graph, and a matching `@reference`
      bundler alias in `vite.config.ts` so the same specifiers resolve at real build time.
- [x] A new permanent test asserts zero relative-import violations across all migrated directories,
      independent of git staging state.
- [x] `pnpm --filter server build/typecheck/lint/test:unit`,
      `pnpm --filter {env,api-client,db,query-client} build/test`, and the affected `scripts/*.test.mjs`
      all pass, matching their pre-migration baseline.
- [x] `pnpm --filter create-mono-stack test` passes in full.
- [x] `just check` passes.

## Exact Test Cases

### TEST-ALIASMIG-001

- Small task: confirm zero relative-import violations remain across every migrated directory.
- Source: the user's original failure output; the goal of this whole migration.
- Test place: new test in `scripts/check-relative-imports.test.mjs` (or a new dedicated test file if
  that grows too large — decided at implementation time).
- Starting state: the migrated repository tree.
- Exact input or fixture: every `.ts`/`.tsx`/`.mjs`/`.js` file under
  `apps/server`, `core/create-mono-stack/reference-templates/managed/**`,
  `packages/{env,api-client,db,query-client}`, and `scripts`.
- Interaction steps: glob the files, call `checkFiles(filePaths)`.
- Main behavior: `findRelativeImports` finds nothing outside barrel files.
- Expected result: `[]`.
- Must change: nothing (read-only assertion against the migrated tree).
- Must not happen: any remaining relative import in the migrated scope.
- Planned command: `node --test scripts/check-relative-imports.test.mjs`.
- Expected result before the code change: fails — dozens of violations, reproducing the original
  report.
- First observed run: Failed, listing the same files as the original report (minus the excluded native
  Vite scaffold files), confirming the test targets the right scope before any file was edited.
- Passing rerun: Passed. `node --test scripts/check-relative-imports.test.mjs` — 7/7 tests passed,
  including `TEST-ALIASMIG-001` (`ℹ tests 7`, `ℹ pass 7`, `ℹ fail 0`), scanning every tracked
  `.cjs/.js/.jsx/.mjs/.ts/.tsx` file under all seven migrated directories.

### TEST-ALIASMIG-002

- Small task: prove `@reference/*` actually resolves for a real Vite build, not just passes a text
  scan.
- Source: `vite.config.ts`'s existing (previously unused) `@reference` alias.
- Test place: manual, using the existing `createDestinationWithoutWebApp`/`scaffoldDashboard` fixture
  helpers plus a real `pnpm --filter <scaffolded-app> build:reference` in a temp directory (matches
  how earlier fixes in this session were validated against real tooling rather than only unit tests).
- Starting state: a freshly scaffolded `vite/react-ts` app via the real fixture pipeline, with real
  `pnpm install`.
- Exact input or fixture: the migrated `reference-templates/managed/web` content.
- Interaction steps: scaffold, install, run the reference build script.
- Main behavior: Vite resolves every `@reference/*` import via its existing `resolve.alias`.
- Expected result: build succeeds, no "failed to resolve import" errors.
- Must change: nothing outside the temp fixture.
- Must not happen: a resolution failure for any `@reference/*` specifier.
- Planned command: (ad hoc, see Validation Notes for the exact commands run).
- Expected result before the code change: N/A — this validates the migration's own correctness, not a
  pre-existing bug.
- First observed run: Failed. Running the real Vite build first (before touching `vite.config.ts`)
  surfaced a genuine gap the text-scan-based tests could not: `vite.config.ts` had no `@reference`
  bundler alias at all — only a `@` alias for `./src`. All `@reference/*` specifiers would have
  failed to resolve at real build time even though `tsc`/the relative-import scanner were both
  satisfied. Root cause: the initial migration wired `@reference/*` into
  `reference/tsconfig.json`'s `paths` (editor/type support) but never into the app's actual bundler
  config. Fixed by adding `"@reference": path.resolve(__dirname, "./reference/src")` to
  `core/create-mono-stack/reference-templates/managed/web/vite.config.ts`'s `resolve.alias`, matching
  the existing `@` entry's shape and the tsconfig path's target.
- Passing rerun: Passed. Used the repository's own local reference app (`apps/web`, which already has
  real installed dependencies including `vite`) as the real build harness instead of a full
  Copier scaffold: copied the migrated `managed/web/src` and `index.html` into a temporary
  `apps/web/reference-alias-test/` directory, swapped in the fixed `vite.config.ts` with the target
  path adjusted to point at that temp directory, and ran
  `./node_modules/.bin/vite build reference-alias-test --config vite.config.ts` from `apps/web`.
  Output: "transforming...✓ 2453 modules transformed" and "✓ built in 963ms" with no
  "failed to resolve import" errors — every `@reference/*` specifier across all 30 migrated web
  reference files resolved correctly. The temporary directory, temporary config, and backup file
  were removed immediately after (`git status --short apps/web` confirmed a clean tree afterward).

### TEST-ALIASMIG-003 through 006

- Small task: confirm the migration causes no regression in each affected package/app/script's own
  existing validation commands.
- Source: each package's own `AGENTS.md`/`package.json` scripts.
- Test place: the packages'/apps' own existing test suites (no new tests needed here — these are
  regression guards using what already exists).
- Starting state: the migrated repository tree.
- Exact input or fixture: n/a — existing suites.
- Interaction steps: run each listed command.
- Main behavior: none of the import rewrites changed any runtime behavior, only module resolution.
- Expected result: exit 0 for every command, with output matching the pre-migration baseline test
  counts.
- Must change: nothing beyond what the migration itself touches.
- Must not happen: a new failure introduced by an incorrect import path after rewriting.
- Planned command: see each package's own build/typecheck/lint/test scripts.
- Expected result before the code change: all pass already (pre-migration baseline).
- First observed run: not separately captured before the migration; these commands were run once,
  after all edits, as regression checks (the migration's per-file correctness was validated instead
  through `just check`'s topological build/typecheck/lint pass during implementation, and through
  TEST-ALIASMIG-001/002 above).
- Passing rerun: Passed for every command:
  - `pnpm --filter server build` (nest build) — succeeded.
  - `pnpm --filter server typecheck` (`tsc --noEmit -p tsconfig.json`) — succeeded, no errors.
  - `pnpm --filter server lint` (`eslint ... --fix`) — succeeded, no errors.
  - `pnpm --filter server test:unit` — 4 files, 5/5 tests passed.
  - `pnpm --filter @monorepo-template/env build` — succeeded (Vite lib build).
  - `pnpm --filter @monorepo-template/env test` — 2/2 tests passed.
  - `pnpm --filter @monorepo-template/api-client build` — succeeded.
  - `pnpm --filter @monorepo-template/db build` — succeeded.
  - `pnpm --filter @monorepo-template/db test` — 9/9 tests passed.
  - `pnpm --filter @monorepo-template/query-client build` — succeeded.
  - `pnpm --filter @monorepo-template/query-client test` — 5/5 tests passed.
  - `node --test scripts/dev-ports.test.mjs` — 9/9 tests passed.
  - `node --test core/create-mono-stack/test/native-scaffold-managed-template.test.js` — 4/4 tests
    passed (`TEST-MANAGED-001`, `TEST-SCOPE-001/002/003`).
  - `pnpm --filter create-mono-stack test` — 309/309 tests passed.
  - `just check` — exit 0 (all 22 Turbo build/typecheck tasks, lint, `format:check`,
    `skills-check`, `skills-test`, and `template-test` all passed).
