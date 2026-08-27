# Fix addApp Managed Reference Template Package Scope

- Checklist ID: CHECKLIST-20260827-addapp-managed-template-package-scope-bug
- Discovered during: `docs/checklists/2026-08-27-create-mono-stack-0.1.46-release.md` (TEST-RELEASE-005)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

Not started. This checklist records a bug discovered while validating `create-mono-stack` 0.1.46 and
reserves its scope for a dedicated follow-up task. No implementation has been planned or attempted yet.

## Problem Statement

`addApp` (`core/create-mono-stack/src/project-management.js`) copies a "managed reference template"
into a live generated project (for example `core/create-mono-stack/reference-templates/managed/web/package.json`)
when a user adds a manageable app such as `web-vite` after initial project generation. Those reference
template files hardcode `@monorepo-template/...` workspace dependency names.

Copier's `_tasks` entry `node scripts/render-package-scope.mjs` rewrites every `@monorepo-template/`
reference to the generated project's own scope (for example `@acme-platform/...`), but it only runs
once, during the initial `copier copy`/`copier update` flow. When `addApp` copies a managed reference
template into an already-generated, already-rescoped project afterward, the copied `package.json` still
declares dependencies such as `@monorepo-template/api-client`, which does not match any package name in
that project's workspace (`@acme-platform/api-client`). `pnpm install` then fails with
`ERR_PNPM_WORKSPACE_PKG_NOT_FOUND`.

## Evidence

- `core/create-mono-stack/test/copier-template.integration.test.js`, `creates and updates a customized
project with Copier`, running `addApp(cwd, { feature: "web-vite", name: "admin" }, ...)` against a
  project generated from `copier.yml` defaults (`project_name=Acme Platform`).
- Observed failure: `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND In apps/admin: "@monorepo-template/api-client@workspace:^"
is in the dependencies but no package named "@monorepo-template/api-client" is present in the
workspace ... Packages found in the workspace: 1`.
- Confirmed unrelated to the concurrent `create-mono-stack` 0.1.46 release diff: that release only
  touches `.opencode/plugins/implementation-contract-gate.js`, `core/create-mono-stack/package.json`,
  `core/create-mono-stack/test/cli.test.js`, root `package.json`, and
  `scripts/implementation-contract.test.mjs` — none of which touch `project-management.js`,
  `reference-templates/`, or `copier.yml`.
- The 0.1.45 release checklist (`docs/checklists/2026-08-27-create-mono-stack-0.1.45-release.md`) did
  not run the package integration test at all, so this defect predates 0.1.46 and was not previously
  caught by the release gate.

## Non-Goals For This Record

- This checklist does not itself contain an approved implementation plan, test matrix, or acceptance
  criteria — those must be authored under `test-first-workflow` before any code changes are made.
- Do not treat this checklist as authorization to modify `project-management.js` or the reference
  templates; it exists only to preserve the finding until that work is planned and authorized.

## Suggested Direction (Not Yet Planned Or Authorized)

- Likely fix location: rescope managed reference template package manifests (dependency names and,
  if present, any other `@monorepo-template/` references) to the target project's package scope when
  `addApp`/`applyReferenceProfile` copies them, mirroring what `scripts/render-package-scope.mjs` does
  during initial generation.
- Any fix must add a regression test that adds a managed app to a rescoped project fixture (scope other
  than `@monorepo-template`) and asserts the resulting `package.json` and successful `pnpm install`.

## Implementation Plan

- [ ] Plan the fix under `test-first-workflow`: exact test cases, affected files, and acceptance
      criteria.
- [ ] Implement the rescoping fix for managed reference template copies.
- [ ] Add regression coverage reproducing this exact failure mode.
- [ ] Re-run `pnpm --filter create-mono-stack test:integration` to confirm the fix.

## Risks And Non-Goals

- Out of scope for `create-mono-stack` 0.1.46, which is limited to the OpenCode plugin repair.
- Any fix must not change the initial Copier generation output for the default feature set.
