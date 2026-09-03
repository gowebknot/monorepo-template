# Project Package Scope Rename

- Checklist ID: CHECKLIST-20260824-project-package-scope
- Created: 2026-08-24
- Planning completed: 2026-08-24
- Source request: Rename `@repo/<package>` to `@<project-name>/<package>` in the source workspace and generated projects.
- Related checklist: [create-mono-stack 0.1.39 release](./2026-08-24-create-mono-stack-0.1.39-release.md)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Acceptance Criteria

- [x] The source workspace uses `@monorepo-template/<package>` consistently.
- [/] A generated project named `Acme Platform` uses `@acme-platform/<package>` consistently. The implementation and direct renderer test pass; the Docker-backed integration test is blocked by the unavailable local Docker socket.
- [/] A package created inside that generated project is named `@acme-platform/billing`. The scaffold unit case passes; generated-project integration remains blocked by Docker.
- [/] No generated project file contains the old `@repo/` scope. The direct scope renderer test passes; full generated-project verification remains blocked by Docker.
- [x] Existing unrelated worktree changes remain untouched.

## Exact Test Cases

### TEST-SCOPE-001: Source package scope

- **Small task:** Rename source workspace package identities.
- **Source:** User request to rename the source workspace scope.
- **Test place:** `core/create-mono-stack/test/copier-template.test.js`.
- **Starting state:** Source package manifests and references use `@repo/`.
- **Exact input or fixture:** Repository package scope `@monorepo-template/`.
- **Interaction steps:** Read source manifests and scan tracked source files.
- **Main behavior:** Source package identities and references share one scope.
- **Expected result:** Every source package uses `@monorepo-template/<package>` and no non-template source file uses `@repo/`.
- **Must change:** Source manifests, imports, dependency keys, task references, and tests.
- **Must not happen:** The launcher package name `create-mono-stack` changes.
- **Planned command:** `node --test --test-name-pattern='SCOPE|scope' core/create-mono-stack/test/copier-template.test.js`
- **Expected result before the code change:** The current scope assertion fails because source packages use `@repo/`.
- **First observed run:** The initial pnpm command rejected `--test-name-pattern` as an unknown pnpm option; the direct Node command then failed because source manifests still used `@repo/` and scaffolding still produced `@repo/billing`.
- **Passing rerun:** `node --test --test-name-pattern='SCOPE|scope' core/create-mono-stack/test/copier-template.test.js` passed `TEST-SCOPE-001` and `TEST-SCOPE-003`.

### TEST-SCOPE-002: Generated project scope

- **Small task:** Render generated projects with a scope derived from their normalized project name.
- **Source:** User request to use `@<project-name>/<package>`.
- **Test place:** `core/create-mono-stack/test/copier-template.integration.helpers.js` and integration test.
- **Starting state:** Copier renders package names and dependencies with `@repo/`.
- **Exact input or fixture:** Project name `Acme Platform`, normalized slug `acme-platform`.
- **Interaction steps:** Generate the fixture project, inspect package manifests and references, then scan generated files.
- **Main behavior:** Generated package identities use the project scope.
- **Expected result:** Generated packages and workspace references use `@acme-platform/`; no generated file contains `@repo/`.
- **Must change:** Copier-rendered package metadata and references.
- **Must not happen:** The generated root package name changes from `acme-platform`.
- **Planned command:** `pnpm --filter create-mono-stack test:integration`
- **Expected result before the code change:** The generated-project scope assertions fail because output uses `@repo/`.
- **First observed run:** The full launcher suite reached the scope test, but an intermediate bulk replacement corrupted its expected regular expression; the unrelated interactive-wizard test also had a timing-sensitive one-second timeout. The integration suite was later blocked before fixture creation because the configured Colima Docker socket was unavailable.
- **Passing rerun:** Pending; requires the Docker integration environment.

### TEST-SCOPE-003: Managed package creation

- **Small task:** Create new managed packages using the generated project scope.
- **Source:** `scaffold-package.mjs` package-creation behavior and user request.
- **Test place:** `core/create-mono-stack/test/copier-template.test.js` and integration test.
- **Starting state:** A project root has package name `acme-platform`; the scaffold hard-codes `@repo/`.
- **Exact input or fixture:** Package `billing` under a root manifest named `acme-platform`.
- **Interaction steps:** Run the package scaffold and read `packages/billing/package.json`.
- **Main behavior:** The scaffold derives the package scope from the root project package name.
- **Expected result:** The generated package name is `@acme-platform/billing`.
- **Must change:** Scaffolded package manifest, README, and AGENTS instructions.
- **Must not happen:** The scaffold must not fall back to `@repo/`.
- **Planned command:** `pnpm --test core/create-mono-stack/test/copier-template.test.js`
- **Expected result before the code change:** The assertion fails because the scaffold produces `@repo/billing`.
- **First observed run:** The direct Node scope test failed because scaffolding still produced `@repo/billing`.
- **Passing rerun:** `node --test --test-name-pattern='SCOPE|scope' core/create-mono-stack/test/copier-template.test.js` passed `TEST-SCOPE-003`.

### TEST-SCOPE-004: Formatting and residual scan

- **Small task:** Keep the scope rename formatted and complete.
- **Source:** Repository formatting policy and acceptance criterion forbidding the old scope.
- **Test place:** Repository files and generated-template scan.
- **Starting state:** Scope changes are unformatted or may leave stale references.
- **Exact input or fixture:** All tracked files excluding historical checklists and provider skill mirrors where appropriate.
- **Interaction steps:** Run formatting verification and search for `@repo/`.
- **Main behavior:** The implementation is formatted and has no unintended stale scope.
- **Expected result:** Formatting passes and only explicitly historical/non-runtime references remain, if any.
- **Must change:** Any affected documentation or mirrored skill roots.
- **Must not happen:** The unrelated release checklist is modified.
- **Planned command:** `pnpm format:check && git diff --check`
- **Expected result before the code change:** Existing source assertions and scope references still report the old scope.
- **First observed run:** `pnpm format:check` initially reported eight files needing formatting after the bulk scope replacement.
- **Passing rerun:** `pnpm skills:check && pnpm format:check && git diff --check` passed after formatting those files.

## Implementation Plan

- [x] Update source package manifests, workspace references, imports, task graphs, tests, and package metadata from `@repo/` to `@monorepo-template/`.
- [x] Add project-scope rendering for generated package manifests and all generated references, based on the normalized root package name.
- [x] Make `scaffold-package.mjs` read and validate the root package name before generating package files.
- [x] Update `create-minimal-package` documentation and synchronized skill roots.
- [/] Record first observed failures and passing reruns for every test case. Generated-project cases remain blocked by Docker integration availability.

## Risks

- Scope changes affect package-manager resolution, Turbo filters, imports, and generated lockfiles together.
- Copier update behavior must preserve the generated project scope rather than reverting it to the source scope.
- The existing release checklist is a user change and must remain untouched.

## Validation Notes

- Initial observations: Source packages and generated fixtures currently use `@repo/`; the root generated project name is normalized to `acme-platform`.
- First observed run: The full launcher suite initially reported the stale scope assertion and one unrelated timing-sensitive wizard failure; the stale assertion was corrected before rerunning focused scope tests. The integration suite remains blocked by the unavailable Docker socket. The first commit hook run reproduced the wizard timeout under full pre-commit load.
- Passing rerun: The isolated interactive-wizard suite passed after increasing its polling budget to three seconds. The hook-backed commit validation is pending rerun. `pnpm --filter create-mono-stack lint`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm skills:check`, `pnpm format:check`, `git diff --check`, the focused scope tests, and the direct dynamic-scope renderer test passed. The Docker integration remains blocked by the unavailable local Docker socket.

## Updates

### 2026-09-03: Package guidance bridge correction

- **Reason and evidence:** The package scaffold created `AGENTS.md` but omitted the sibling `CLAUDE.md`; the Vite React app profile likewise lacked its guidance pair.
- **Impact:** New package and supported Vite React app users could not rely on Claude discovering their local agent guidance.
- **Corrective action:** [Scaffold Claude Guidance Files](./2026-09-03-scaffold-claude-guidance.md) adds behavior tests and the missing scaffold outputs.
- **Validation:** 43 focused scaffold tests, `pnpm skills:check`, `pnpm format:check`, and `git diff --check` passed.
