# Parent: stop shipping orphaned E2E suites and fix rename-fragile root-script imports

Checklist ID: 2026-09-13-orphaned-e2e-suites-and-rename-fragile-imports
Related checklists: [[2026-09-12-vite-eslint-language-options-trailing-comma-fix]] (unrelated bug,
found in the same session), [[2026-09-12-generator-app-rename-filter-fix]] (same generator, prior
bug class), [[2026-09-13-release-create-mono-stack-0.1.57]] (release once both children ship)

## Change Tier

Tier: large

## Context

User hit `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND` installing a generated project
(`jump-cloud-demo2/apps/maestro`): `"monorepo-template": "workspace:*"` no longer resolves once the
root package is renamed away from the template's own name. Root cause: commit `aaea985` (previous
session) discovered Node's package `imports` field cannot target paths outside its own package
(confirmed again here empirically — `ERR_INVALID_PACKAGE_TARGET`), and this repo's own
`scripts/check-relative-imports.mjs` bans relative imports, so it switched `apps/maestro` and
`apps/playwright` to depend on the workspace root **by its literal name** to reach
`scripts/dev-ports.mjs`/`scripts/stack-app-lookup.mjs`. That name is exactly what
`package.json.jinja`'s `replace("monorepo-template", project_slug)` filter rewrites per generated
project, so the dependency breaks on any renamed project.

Investigating this with the user surfaced a second, independent problem: `apps/maestro` (mobile E2E,
targets `apps/expo` only — confirmed via `apps/maestro/AGENTS.md`) and `apps/playwright` (web E2E) are
copied into **every** generated project unconditionally by Copier — there is no feature-conditional
exclusion at all. A project selecting only `web-vite` + `api-nest` (the user's `jump-cloud=clone`,
confirmed via its `.mono-stack.json`) still ships a full `apps/maestro` testing an Expo app that does
not exist. The user confirmed (via `AskUserQuestion`): the interactive wizard should ask whether to
include Maestro only when a mobile feature (Expo or React Native) was selected, ask about Playwright
only when a web feature (Vite or Next.js) was selected, and the rename-fragile dependency should also
be fixed.

These are two independently shippable behaviors with different mechanisms (Copier-native conditional
`_exclude` + new wizard questions, vs. a text-rewrite regex fix in the existing scope-rendering
pipeline), hence two child checklists.

## Child Checklists

- [x] [Conditional Maestro/Playwright inclusion via the interactive wizard](2026-09-13-conditional-maestro-playwright-inclusion.md)
- [x] [Rename-safe root-script imports for apps/maestro and apps/playwright](2026-09-13-rename-safe-workspace-script-imports.md)

## Verification (whole change)

- [x] `pnpm --filter create-mono-stack test` passes in full (305/305).
- [x] `just check` passes.
- [x] Manual empirical verification of Copier's Jinja-conditional `_exclude` support against a real
      `copier` 9.17.1 install in a scratch venv, run twice: once against a minimal fixture template,
      then end-to-end against the real `copier.yml`/`render-package-scope.mjs` (via an `rsync` +
      fresh-`git commit` snapshot of the current working tree — `copier copy` against a local Git
      repository path reads its last commit, not the dirty working tree, which was not obvious going
      in and cost several confusing false-negative runs before being identified). Confirmed both
      children work correctly together in the same invocation: `apps/maestro` absent when no mobile
      feature is selected; present with a correctly-renamed `"acme-platform"` workspace dependency
      when a mobile feature is selected and Maestro is kept. `copier update`'s own re-exclusion
      behavior specifically (as opposed to `copy`'s) was not separately exercised — reasoned about
      from the Copier source (`_exclude` is re-evaluated from `self.config_data`, not cached
      per-operation) rather than run, mirroring how the Docker-based
      `copier-template.integration.test.js` (the only place `copier update` is exercised at all) was
      not run in this session, per [[2026-09-12-generator-app-rename-filter-fix]]'s existing precedent.
