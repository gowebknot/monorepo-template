# Render Project Scope Into Managed-Template Content

Checklist ID: CHECKLIST-20260912-render-managed-template-scope
Tier: standard
Created: 2026-09-12
Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Related checklists

- [Use the Managed Template for Fresh Native Scaffolding](2026-09-11-native-scaffold-managed-template.md)
- [Release create-mono-stack 0.1.53](2026-09-11-release-create-mono-stack-0.1.53.md)

## Implementation Contract

### Feature Boundaries

`scripts/render-package-scope.mjs` runs once, as a Copier `_tasks` entry, immediately after
`copier copy` finishes writing the destination project: it reads the destination's own root
`package.json` `name` (the project slug) and rewrites every `@monorepo-template/` occurrence in
every text file under the destination to `@{slug}/`. `applyReferenceProfile()` in
`core/create-mono-stack/src/native-scaffold.js` copies additional files (package.json fields,
`AGENTS.md`, `CLAUDE.md`, source overlays) into each native app **after** that task has already
run — and, since the 0.1.53 fix, copies them from `core/create-mono-stack/reference-templates/
managed/{name}/`, a location entirely outside the destination project that the scope-rendering task
never touches. That managed-template content still carries its own literal `@monorepo-template/`
references (47 files across all five managed templates, including `package.json` dependencies and
TypeScript source imports), so every project whose name is not literally `monorepo-template` ends
up with a native app whose `package.json` depends on `@monorepo-template/{pkg}` — a workspace
package that does not exist in the generated project, since its own `packages/*` were already
correctly renamed to `@{slug}/{pkg}` by the task. `pnpm install` in the generated project then fails
with `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND`, confirmed live by a user's real `jump-cloud-clone` project
immediately after the 0.1.53 fix let native scaffolding complete for the first time. The same gap
has always existed for `project-management.js`'s `addApp()` (the `create-mono-stack manage` flow,
which has used `useManagedTemplate: true` from the start) — it was simply never exercised by a
project whose scope actually needed rewriting in an existing test. Fix scope: after
`applyReferenceProfile()` copies managed-template content into a native app directory, rewrite
`@monorepo-template/` to the destination project's actual scope across that app directory's text
files, mirroring `render-package-scope.mjs`'s own substitution rule exactly. No change to
`render-package-scope.mjs` itself, `copier.yml`, or any profile definition.

### Route-Group Ownership

No HTTP routes. `applyReferenceProfile()` in `native-scaffold.js` owns copying and merging
reference-profile content into one native app directory, for both `scaffoldNativeApps()` (fresh
project creation) and `project-management.js`'s `addApp()` (adding an app to an existing project).

### User Journey

A user creates a project (or adds an app to an existing one) named anything other than
`monorepo-template`. Every native app that uses a managed reference profile ends up depending on
its own project's workspace packages (`@{slug}/env`, `@{slug}/db`, ...), not the template
repository's own `@monorepo-template/*` packages, so `pnpm install` succeeds.

### Complete Test Matrix

| ID             | Kind      | Input                                                                                   | Action           | Expected result                                                                                                                 | Validation                                 |
| -------------- | --------- | --------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| TEST-SCOPE-001 | valid     | Destination project named `jump-cloud-clone`, Vite React+TS profile                     | Scaffold the app | `package.json` depends on `@jump-cloud-clone/env`, not `@monorepo-template/env`; a copied source file's import is rewritten too | unit test, real filesystem                 |
| TEST-SCOPE-002 | valid     | Destination project literally named `monorepo-template`                                 | Scaffold the app | `@monorepo-template/` references are left unchanged (scope equals itself; rewrite is a no-op, not a corruption)                 | unit test                                  |
| TEST-SCOPE-003 | rejection | Delegated/code-only profile (e.g. `react-router-v7`), no `managedTemplateRoot` involved | Scaffold the app | No scope rewrite is attempted; existing delegated-profile tests keep passing unmodified                                         | existing suite (`TEST-PROFILE-101`..`104`) |

### Unresolved Conflicts

None found. Mirroring `render-package-scope.mjs`'s exact substitution rule (whole-string
`@monorepo-template/` becoming `@{scope}/`, same ignored directories, same text-extension allowlist) is
the narrowest fix that keeps the two rendering passes (Copier's project-wide one, and this
per-app one for managed-template content copied afterward) behaviorally identical.

## Acceptance Criteria

- [x] After `applyReferenceProfile()` copies content from a profile's `managedTemplateRoot`, every
      `@monorepo-template/` reference in the affected native app directory is rewritten to the
      destination project's actual scope.
- [x] The rewrite covers the merged `package.json` (both dependency keys and script/config string
      values) and copied reference/overlay source files, not package.json alone.
- [x] A project actually named `monorepo-template` is unaffected (no accidental corruption from a
      self-referential rewrite).
- [x] `scaffoldNativeApps()` and `project-management.js`'s `addApp()` both apply the fix, since both
      call the shared `applyReferenceProfile()`.

## Exact Test Cases

### TEST-SCOPE-001

- **Small task:** Rewrite `@monorepo-template/` to the real project scope after managed-template
  scaffolding.
- **Source:** Live failure report (`ERR_PNPM_WORKSPACE_PKG_NOT_FOUND` for
  `@monorepo-template/api-client` in a project named `jump-cloud-clone`);
  `scripts/render-package-scope.mjs` as the authoritative existing substitution rule.
- **Test place:** `core/create-mono-stack/test/native-scaffold-managed-template.test.js` (extends
  the real-filesystem fixture already added for the prior managed-template fix).
- **Starting state:** A temp destination directory with a root `package.json` named
  `jump-cloud-clone` (matching the live failure) and no `apps/web/` yet; a temp `temporaryRoot`
  pre-populated with a native Vite-scaffolded app tree.
- **Exact input or fixture:** `appNames: { "web-vite": ["dashboard"] }`, `features: ["web-vite"]`,
  a React + TypeScript + ESLint selection.
- **Interaction steps:** Call `scaffoldNativeApps()` with real filesystem dependencies.
- **Main behavior:** The resulting `apps/dashboard/package.json`'s dependencies contain
  `@jump-cloud-clone/env`, not `@monorepo-template/env`; a copied reference source file
  (`reference/src/lib/env.ts`) has its import rewritten the same way.
- **Expected result:** No `@monorepo-template/` substring remains anywhere under `apps/dashboard/`.
- **Must change:** Only the isolated temp destination/temporary directories.
- **Must not happen:** Any change outside the scaffolded app directory; corrupting unrelated text.
- **Planned command:** `pnpm --filter create-mono-stack test`.
- **Expected result before the code change:** Fails — `package.json` still depends on
  `@monorepo-template/env`.
- **First observed run:** 2026-09-12, ran the new assertions against the unpatched code; failed as
  expected (`@monorepo-template/env` present instead of `@jump-cloud-clone/env`).
- **Passing rerun:** 2026-09-12, `pnpm --filter create-mono-stack test` passed after the fix.
  Additionally confirmed end to end against the real CLI (not a mocked unit test): ran
  `node bin/create-mono-stack.js /tmp/create-mono-stack-scope-smoke --features api-nest
--git-host-alias github-webknot` from the fixed local source; the generated
  `apps/server-app-1/package.json` depended on `@create-mono-stack-scope-smoke/{auth,db,entities,env}`
  with zero remaining `@monorepo-template/` references anywhere under `apps/server-app-1/`, and a
  full `pnpm install` in that generated project completed successfully with no
  `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND` — the exact live failure, now resolved. Scratch directory
  removed afterward.

### TEST-SCOPE-002

- **Small task:** Do not corrupt a project that is itself named `monorepo-template`.
- **Source:** Edge case implied by using the project name as the literal search/replace target.
- **Test place:** Same test file as TEST-SCOPE-001.
- **Starting state:** A temp destination directory whose root `package.json` name is literally
  `monorepo-template`.
- **Exact input or fixture:** Same Vite React+TS scaffold as TEST-SCOPE-001.
- **Interaction steps:** Call `scaffoldNativeApps()`.
- **Main behavior:** The rewrite is a no-op (`@monorepo-template/` maps to itself).
- **Expected result:** `package.json` still contains `@monorepo-template/env` (unchanged, not
  duplicated or malformed).
- **Must change:** Nothing beyond the normal scaffold output.
- **Must not happen:** Any corruption from a self-mapping substitution (e.g. double-prefixing).
- **Planned command:** `pnpm --filter create-mono-stack test`.
- **Expected result before the code change:** Already passes trivially (no rewrite ever happens);
  meaningful only once TEST-SCOPE-001's fix exists.
- **First observed run:** 2026-09-12, added alongside the fix; passed immediately.
- **Passing rerun:** 2026-09-12, `pnpm --filter create-mono-stack test` passed (no-op rewrite left
  the merged `@monorepo-template/env` dependency exactly as the profile's own package.json states).

## Missing-Case Review

`project-management.js`'s `addApp()` shares `applyReferenceProfile()`, so the same fix and its new
`projectRoot` parameter apply there too. `project-management.test.js`'s `project()` fixture had no
root `package.json` at all (not merely one named `monorepo-template`) — `addApp()` never needed one
before this fix, so `projectRoot`'s `readFile` would have thrown `ENOENT`. Added one, named
`acme-platform` (matching this test file's existing naming convention), so `addApp()`'s existing
tests (including `TEST-MANAGE-007`, which merges a managed reference profile) exercise the real
rewrite rather than skip it; no dedicated new `TEST-SCOPE-*` case was added there since the existing
assertions (e.g. `nativewind` version) are unaffected by the scope rewrite and already pass.

## Validation Notes

- Also updated `native-scaffold.helpers.js`'s shared `createNativeScaffoldFixture()` (used across
  `native-scaffold.test.js`, `native-scaffold-overlays.test.js`, `native-scaffold-selection.test.js`)
  to write a root `package.json` named literally `monorepo-template` — that keeps the scope rewrite
  a genuine no-op for those fixtures, so the exact-content-equality assertions already rewritten
  against real managed-template files (see the prior "Use the Managed Template" checklist) keep
  passing unmodified rather than needing a second round of edits.
- `pnpm --filter create-mono-stack test` (282/282, +2 from the prior 280), lint, typecheck, and
  `just check` (full repository gate) all pass after the fix.
