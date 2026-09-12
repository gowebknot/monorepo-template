# Rename-safe root-script imports for apps/maestro and apps/playwright

Checklist ID: 2026-09-13-rename-safe-workspace-script-imports
Related checklists: [[2026-09-13-orphaned-e2e-suites-and-rename-fragile-imports]] (parent),
[[2026-09-12-vite-eslint-language-options-trailing-comma-fix]] (same-session precedent for the
identical `scripts/render-package-scope.mjs`/`native-scaffold.js` scope-rendering rule)

## Change Tier

Tier: standard

## Context

`apps/maestro/package.json` and `apps/playwright/package.json` depend on
`"monorepo-template": "workspace:*"` and import `monorepo-template/scripts/dev-ports.mjs` and
`monorepo-template/scripts/stack-app-lookup.mjs` by that literal bare name (added in commit `aaea985`
as a workaround for two confirmed constraints: Node's package `imports` field cannot target a path
outside its own package — reconfirmed here empirically via a scratch probe, `ERR_INVALID_PACKAGE_TARGET`
— and this repo's own `scripts/check-relative-imports.mjs` bans relative imports). `scripts/render-package-scope.mjs`
already rewrites `@monorepo-template/` to `@<projectScope>/` across the whole generated project as a
Copier `_tasks` step, and `core/create-mono-stack/src/native-scaffold.js`'s `renderTemplateScope`
mirrors that exact rule for managed-template content copied into a native app directory afterward
(documented in-code as an intentional mirror). Neither currently rewrites the **bare** (unscoped)
`"monorepo-template"` token, so the workspace dependency name and the bare import specifiers survive
project renaming unrewritten and break `pnpm install` the moment the root package's own name changes
(confirmed: root `package.json`'s name is rewritten separately, by `package.json.jinja`'s own
`replace("monorepo-template", project_slug)` filter, which only touches that one file).

## Implementation Contract

### Feature Boundaries

- Included: `scripts/render-package-scope.mjs` (refactored to export a testable `renderFileContents`
  pure function and a `renderPackageScope(root)` function, both gaining a bare-name rewrite rule),
  `core/create-mono-stack/src/native-scaffold.js`'s `renderTemplateScope` (same rule mirrored, per its
  existing documented invariant).
- Excluded: the conditional maestro/playwright inclusion feature (sibling child checklist); any change
  to the _content_ of `apps/maestro/package.json`/`apps/playwright/package.json` or their scripts in
  this repo's own tree (they correctly say `"monorepo-template"` here — this repo _is_ the template
  being dogfooded; only the per-generated-project _rendering_ step changes).
- Ownership: `create-mono-stack` owns both rendering-rule implementations.

### Route-Group Ownership

Not applicable — build-tooling/generation configuration, not an HTTP route.

### User Journey

1. A user selects a mobile and/or web feature, keeps Maestro/Playwright included, and renames the
   project away from `monorepo-template` (the common case — almost every real project does this).
2. After Copier copies the template and runs its `_tasks` (`render-package-scope.mjs`), the copied
   `apps/maestro/package.json`/`apps/playwright/package.json` depend on the project's own new name via
   `workspace:*`, and their scripts import from that same new name — not the literal string
   `"monorepo-template"`.
3. `pnpm install` (already run by `createProject`, and by a user's own subsequent `pnpm install`)
   resolves the workspace dependency successfully; no `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND`.
4. The same rewrite reapplies on every `copier update` (the `_tasks` step reruns), so this stays
   correct even if the project is renamed again later or the template's managed content changes.

### Complete Test Matrix

| Test ID              | Path type | Small task                                                                              | Trigger                                                                                                                             | Expected result                                                                     | Status |
| -------------------- | --------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------ |
| TEST-RENDERSCOPE-001 | happy     | `renderFileContents` rewrites the scoped-package pattern (unchanged behavior)           | `@monorepo-template/env` with scope `acme`                                                                                          | `@acme/env`                                                                         | Passed |
| TEST-RENDERSCOPE-002 | happy     | `renderFileContents` rewrites a bare workspace-dependency JSON key                      | `"monorepo-template": "workspace:*"` with scope `acme`                                                                              | `"acme": "workspace:*"`                                                             | Passed |
| TEST-RENDERSCOPE-003 | happy     | `renderFileContents` rewrites a bare import specifier                                   | `from "monorepo-template/scripts/dev-ports.mjs"` with scope `acme`                                                                  | `from "acme/scripts/dev-ports.mjs"`                                                 | Passed |
| TEST-RENDERSCOPE-004 | non-happy | `renderFileContents` leaves an unrelated prose mention untouched                        | `` SSH access to `gowebknot/monorepo-template` `` with scope `acme`                                                                 | String unchanged (no `"` immediately precedes the bare name there)                  | Passed |
| TEST-RENDERSCOPE-005 | happy     | `renderFileContents` is a no-op when the project is literally named `monorepo-template` | Same bare-name content, scope `monorepo-template`                                                                                   | Content byte-identical (mirrors the existing `TEST-SCOPE-002` no-op precedent)      | Passed |
| TEST-RENDERSCOPE-006 | happy     | `renderPackageScope(root)` walks a real directory tree and rewrites both patterns       | Real temp dir: root `package.json` named `acme`, nested `apps/maestro/package.json` + `apps/maestro/scripts/run-flows.mjs` fixtures | Both files rewritten on disk; `node_modules`/`.git` untouched                       | Passed |
| TEST-RENDERSCOPE-007 | happy     | `native-scaffold.js`'s `renderTemplateScope` mirrors the same bare-name rule            | Scaffold a native app with a synthetic file containing a bare-name reference                                                        | The synthetic file's bare reference is rewritten to the destination project's scope | Passed |

### Unresolved Conflicts

None found.

## Acceptance Criteria

- [x] `scripts/render-package-scope.mjs` exports `renderFileContents(contents, scope)` and
      `renderPackageScope(root)`; its CLI entry point behavior (error message, ignored directories,
      text extensions) is unchanged.
- [x] The bare-name rewrite is anchored precisely (`"monorepo-template` followed by `"` or `/`) so it
      never touches unrelated prose (verified by TEST-RENDERSCOPE-004).
- [x] `native-scaffold.js`'s `renderTemplateScope` gains the identical rule.
- [x] New `scripts/render-package-scope.test.mjs` covers all cases above (6/6 passing via
      `node --test scripts/render-package-scope.test.mjs`). Note: this repo's `scripts/*.test.mjs`
      files are not all wired into one automated command — `pnpm skills:test` runs a fixed, explicit
      file list (confirmed by reading `package.json` and the `Justfile`) that several existing sibling
      test files (`dev-ports.test.mjs`, `stack-app-lookup.test.mjs`,
      `swagger-documentation-check.test.mjs`) are also not part of; this new file follows that same
      existing convention (validated manually, matching how commit `aaea985` validated its own new
      script test files) rather than introducing a new one.
- [x] `pnpm --filter create-mono-stack test` passes in full (305/305, including `TEST-SCOPE-003`).
- [x] `just check` passes.

## Exact Test Cases

### TEST-RENDERSCOPE-001

- Small task: preserve the existing `@monorepo-template/` scoped rewrite behavior through the refactor.
- Source: existing `render-package-scope.mjs` behavior (regression guard for the refactor).
- Test place: `scripts/render-package-scope.test.mjs` (new file).
- Starting state: none (pure function).
- Exact input or fixture: `renderFileContents('import x from "@monorepo-template/env";', "acme")`.
- Interaction steps: call the function directly.
- Main behavior: the existing scoped-rewrite regex still applies first.
- Expected result: returns `'import x from "@acme/env";'`.
- Must change: nothing (pure).
- Must not happen: a regression in the pre-existing rule while adding the new one.
- Planned command: `node --test scripts/render-package-scope.test.mjs`.
- Expected result before the code change: fails — module has no such export yet (only a top-level
  script).
- First observed run: Failed — `renderFileContents is not a function`, as expected.
- Passing rerun: Passed.

### TEST-RENDERSCOPE-002

- Small task: rewrite a bare workspace-dependency key in a `package.json`-shaped string.
- Source: `apps/maestro/package.json`'s real `"monorepo-template": "workspace:*"` entry (the exact
  shape that broke `pnpm install` for the user).
- Test place: `scripts/render-package-scope.test.mjs`.
- Starting state: none.
- Exact input or fixture:
  `renderFileContents('{\n  "devDependencies": {\n    "monorepo-template": "workspace:*"\n  }\n}', "acme")`.
- Interaction steps: call the function directly.
- Main behavior: the new bare-name regex matches `"monorepo-template` followed by the closing `"`.
- Expected result: output contains `"acme": "workspace:*"` and no longer contains
  `"monorepo-template"`.
- Must change: nothing (pure).
- Must not happen: corrupting the JSON structure (the colon/value must survive untouched).
- Planned command: `node --test scripts/render-package-scope.test.mjs`.
- Expected result before the code change: fails — bare-name rule doesn't exist yet.
- First observed run: Failed — output still contained the literal `"monorepo-template"`, as expected.
- Passing rerun: Passed.

### TEST-RENDERSCOPE-003

- Small task: rewrite a bare import specifier.
- Source: `apps/maestro/scripts/run-flows.mjs`'s real
  `import { isPortAvailable } from "monorepo-template/scripts/dev-ports.mjs";`.
- Test place: `scripts/render-package-scope.test.mjs`.
- Starting state: none.
- Exact input or fixture:
  `renderFileContents('import { isPortAvailable } from "monorepo-template/scripts/dev-ports.mjs";', "acme")`.
- Interaction steps: call the function directly.
- Main behavior: the new regex matches `"monorepo-template` followed by `/`.
- Expected result: output is
  `'import { isPortAvailable } from "acme/scripts/dev-ports.mjs";'`.
- Must change: nothing (pure).
- Must not happen: touching the `.mjs` suffix or the `isPortAvailable` identifier.
- Planned command: `node --test scripts/render-package-scope.test.mjs`.
- Expected result before the code change: fails.
- First observed run: Failed — as expected.
- Passing rerun: Passed.

### TEST-RENDERSCOPE-004

- Small task: do not corrupt an unrelated prose mention of the template's own GitHub repo.
- Source: root `README.md`'s real line, ``SSH access to `gowebknot/monorepo-template` are required``
  — this is the template repository's own identity and must never be rewritten to the generated
  project's name.
- Test place: `scripts/render-package-scope.test.mjs`.
- Starting state: none.
- Exact input or fixture:
  ``renderFileContents("SSH access to `gowebknot/monorepo-template` are required.", "acme")``.
- Interaction steps: call the function directly.
- Main behavior: the regex requires a literal `"` immediately before `monorepo-template`; a backtick
  does not match.
- Expected result: output is byte-identical to the input.
- Must change: nothing.
- Must not happen: `gowebknot/acme` appearing anywhere in the output (this was the concrete false-positive
  risk identified while designing the regex — a naive whole-string `replaceAll` would have broken this
  exact line).
- Planned command: `node --test scripts/render-package-scope.test.mjs`.
- Expected result before the code change: passes trivially (no bare-name rule exists yet to risk this).
- First observed run: Passed — confirms the _design_, written before the rule existed, to lock in the
  constraint before implementation.
- Passing rerun: Passed (unchanged after implementing the rule — proves the anchor is precise).

### TEST-RENDERSCOPE-005

- Small task: stay a no-op when the destination project is literally named `monorepo-template`.
- Source: mirrors the existing `TEST-SCOPE-002` precedent in `native-scaffold-managed-template.test.js`
  for the scoped-rewrite rule; same principle applies to the bare-name rule.
- Test place: `scripts/render-package-scope.test.mjs`.
- Starting state: none.
- Exact input or fixture:
  `renderFileContents('"monorepo-template": "workspace:*"', "monorepo-template")`.
- Interaction steps: call the function directly.
- Main behavior: the substitution target equals the substitution value.
- Expected result: output is byte-identical to the input.
- Must change: nothing.
- Must not happen: any exception or unexpected mutation when scope equals the literal template name.
- Planned command: `node --test scripts/render-package-scope.test.mjs`.
- Expected result before the code change: passes trivially even pre-fix, for the same reason as
  TEST-RENDERSCOPE-004; recorded pre-implementation as a design constraint.
- First observed run: Passed.
- Passing rerun: Passed.

### TEST-RENDERSCOPE-006

- Small task: `renderPackageScope(root)` walks a real directory tree end-to-end.
- Source: the actual generated-project shape (`package.json` at root, `apps/maestro/package.json` +
  `apps/maestro/scripts/run-flows.mjs` nested).
- Test place: `scripts/render-package-scope.test.mjs`.
- Starting state: a real `mkdtemp` directory containing: root `package.json` with `"name": "acme"`;
  `apps/maestro/package.json` with a `"monorepo-template": "workspace:*"` devDependency;
  `apps/maestro/scripts/run-flows.mjs` importing from `"monorepo-template/scripts/dev-ports.mjs"`; a
  `node_modules/should-be-ignored/file.js` containing the bare name too.
- Exact input or fixture: `await renderPackageScope(tempRoot)`.
- Interaction steps: run the function, then read back all four files.
- Main behavior: both real files are rewritten to `"acme"`/`"acme/scripts/..."`; the ignored
  `node_modules` file is untouched (proves the existing `ignoredDirectories` set still applies).
- Expected result: `apps/maestro/package.json` contains `"acme": "workspace:*"`;
  `apps/maestro/scripts/run-flows.mjs` contains `"acme/scripts/dev-ports.mjs"`;
  `node_modules/should-be-ignored/file.js` still contains the literal `"monorepo-template"`.
- Must change: exactly the two non-ignored files.
- Must not happen: any write under `node_modules`.
- Planned command: `node --test scripts/render-package-scope.test.mjs`.
- Expected result before the code change: fails — `renderPackageScope` isn't exported yet.
- First observed run: Failed — as expected.
- Passing rerun: Passed.

### TEST-RENDERSCOPE-007

- Small task: `native-scaffold.js`'s `renderTemplateScope` mirrors the same bare-name rule.
- Source: the function's own in-code comment declaring it an intentional exact mirror of
  `render-package-scope.mjs`'s rule.
- Test place: `core/create-mono-stack/test/native-scaffold-managed-template.test.js` (alongside
  `TEST-SCOPE-001`/`002`).
- Starting state: `createDestinationWithoutWebApp` fixture, `projectName: "jump-cloud-clone"`, with the
  `reactTypeScriptNativeTree` fixture overridden to add one synthetic file containing a bare-name
  reference (e.g. `lib/root-ref.ts` exporting `export const ROOT_PACKAGE = "monorepo-template";`).
- Exact input or fixture: `scaffoldDashboard(fixture)` against the overridden tree.
- Interaction steps: run the scaffold, read the synthetic file back from `apps/dashboard`.
- Main behavior: `renderTemplateScope` applies the same regex to every text file it visits, including
  this synthetic one.
- Expected result: `apps/dashboard/lib/root-ref.ts` contains `"jump-cloud-clone"`, not
  `"monorepo-template"`.
- Must change: only the synthetic file's content.
- Must not happen: any change to unrelated fixture files (existing `TEST-SCOPE-001`/`002` assertions
  keep passing unmodified).
- Planned command: `node --test core/create-mono-stack/test/native-scaffold-managed-template.test.js`.
- Expected result before the code change: fails — no bare-name rule in `renderTemplateScope` yet.
- First observed run: Failed — as expected.
- Passing rerun: Passed.
