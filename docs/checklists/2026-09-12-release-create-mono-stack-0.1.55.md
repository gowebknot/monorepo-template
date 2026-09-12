# Release `create-mono-stack` 0.1.55

- Checklist ID: REL-CREATE-MONO-STACK-008
- Created: 2026-09-12
- Planning completed: 2026-09-12
- Type: Patch release (bug fixes)
- Source request: user asked to publish to npm after two bugs surfaced from a real generated project
  (`jump-cloud=clone`) were fixed in this repo: hardcoded `--filter <default-name>` references that
  break once an app is renamed, and a missing `react-refresh/only-export-components` ESLint override
  for the `vite/react-ts` profile's shipped reference content. Explicitly authorized bundling both
  fixes into one 0.1.55 patch release and running the full commit/push/tag/publish sequence.
- Related checklists:
  - [Generator app-rename filter fix (parent)](2026-09-12-generator-app-rename-filter-fix.md)
  - [Generation-time rewrite of per-app docs](2026-09-12-generator-app-rename-filter-fix-generation-rewrite.md)
  - [Runtime dynamic app-name resolution for shared scripts](2026-09-12-generator-app-rename-filter-fix-runtime-lookup.md)
  - [vite/react-ts eslint react-refresh override](2026-09-12-vite-react-ts-eslint-react-refresh-override.md)
  - [Release create-mono-stack 0.1.54](2026-09-12-release-create-mono-stack-0.1.54.md)
- Affected paths: `core/create-mono-stack/package.json`, `core/create-mono-stack/test/cli.test.js`,
  this checklist.
- Status legend: `[ ]` pending, `[/]` partial or blocked, `[x]` complete

## Change Tier

- Tier: standard
- Disqualifiers: the release publishes a public npm artifact and changes generated-project behavior
  (renamed apps' own docs and shared scripts now resolve real names; a freshly generated
  `vite/react-ts` app's `eslint.config.js` now ships with the react-refresh override).

## Implementation Description

Release `create-mono-stack` 0.1.55 bundling two already-implemented, already-tested fixes (commits
`aaea985` and `ef55331`):

1. `aaea985` — `syncAppNameReferences` (generation-time doc rewrite) and `findAppByFeature` (runtime
   dynamic resolution, wired into `apps/playwright/playwright.config.ts`,
   `apps/maestro/scripts/run-flows.mjs`, `scripts/pre-commit-checks.mjs`, and
   `scripts/swagger-documentation-check.mjs`), so a renamed app's own docs and the shared
   cross-app scripts stop hardcoding the feature's un-renamed default name.
2. `ef55331` — `disableReferenceReactRefreshRule`, a new post-processing step alongside the existing
   `injectTailwindVitePlugin`, so a freshly generated `vite/react-ts` app's `eslint.config.js` ships
   with `react-refresh/only-export-components` already disabled for the shipped `reference/src`
   content (matching this template's own `apps/web/eslint.config.js`).

Both fixes are already implemented, tested, and committed; this release only bumps the version
markers, re-validates the full repository gate, inspects the artifact, and publishes.

## Implementation Contract

### Feature Boundaries

- Included: package/fixture version markers, this release checklist, full repository validation,
  dry-run artifact inspection, pushed release commit and annotated tag, wrapper-based npm
  publication.
- Excluded: any further functional change beyond the two already-committed fixes.
- Ownership: `core/create-mono-stack` owns the published CLI artifact.

### Route-Group Ownership

| Route group      | Entry point                                       | Owner                     | Result                              |
| ---------------- | ------------------------------------------------- | ------------------------- | ----------------------------------- |
| Release artifact | `npm pack --dry-run`                              | create-mono-stack package | Inspectable 0.1.55 tarball          |
| Release publish  | `pnpm --filter create-mono-stack publish:package` | package-local wrapper     | Public npm package after remote tag |

### User Journey

1. A user generates a project with a renamed app (or the default `vite/react-ts` app) using
   create-mono-stack 0.1.54 and hits either bug (a broken `--filter` reference, or a failing lint).
2. The package version and template fixture move to 0.1.55; both fixes and their regression tests
   are already committed and validated.
3. The release commit is pushed, annotated as `v0.1.55`, and the tag is pushed.
4. The wrapper publishes the verified artifact; npm latest and the remote tag identify 0.1.55.
5. A user generating (or extending) a project with 0.1.55 gets correct `--filter` references for any
   renamed app and a clean `eslint.config.js` for the default `vite/react-ts` app.

### Complete Test Matrix

| Test ID          | Intent                | Path               | Expected result                                             | Test place      | Limitation                      |
| ---------------- | --------------------- | ------------------ | ----------------------------------------------------------- | --------------- | ------------------------------- |
| TEST-RELEASE-064 | Version marker        | valid              | Manifest and fixture both use 0.1.55; launcher suite passes | package test    | Does not prove registry state   |
| TEST-RELEASE-065 | Repository validation | valid/failure gate | `just check` exits 0; failures stop release                 | repository gate | Does not inspect artifact       |
| TEST-RELEASE-066 | Artifact inspection   | valid              | Dry-run tarball is 0.1.55 and excludes credentials/tests    | npm pack        | Does not publish                |
| TEST-RELEASE-067 | Publish verification  | valid/failure gate | Pushed tag peels to release commit and npm latest is 0.1.55 | Git/npm         | Requires network and local auth |

### Unresolved Conflicts

None found. The user explicitly authorized this as a bundled 0.1.55 patch release and confirmed the
full commit/push/tag/publish sequence, including pushing to `origin/master`, when asked directly.

## Acceptance Criteria

- [x] `core/create-mono-stack/package.json` and the CLI fixture state `0.1.55` / `v0.1.55`.
- [x] Package suite, full repository gate, and dry-run artifact validation pass.
- [ ] The release commit and annotated `v0.1.55` tag are pushed to `origin` before publication.
- [ ] The package-local wrapper publishes `create-mono-stack@0.1.55`; npm latest and remote tag
      confirm it.

## Exact Test Cases

### TEST-RELEASE-064 version metadata

- Small task: align the package version and CLI template-revision fixture.
- Source: `core/create-mono-stack/package.json`, `core/create-mono-stack/test/cli.test.js`, and
  `release-flow`.
- Test place: `pnpm --filter create-mono-stack test`.
- Starting state: package and fixture use 0.1.54; npm latest is 0.1.54.
- Exact input or fixture: `0.1.55` and `_commit: v0.1.55\n`.
- Interaction steps: update the two version markers and run the package suite.
- Main behavior: the launcher test fixture tracks the released package version.
- Expected result: suite passes with both markers at 0.1.55.
- Must change: exactly the manifest and fixture version strings.
- Must not happen: no launcher behavior or unrelated fixture changes.
- Planned command: `pnpm --filter create-mono-stack test`.
- Expected result before the code change: suite passes at 0.1.54; no fixture expects v0.1.55.
- First observed run: 2026-09-12, updated both markers to 0.1.55 and ran the suite.
- Passing rerun: 2026-09-12, `pnpm --filter create-mono-stack test` passed: 290/290, both markers at
  0.1.55.

### TEST-RELEASE-065 release validation

- Small task: validate all shipped repository behavior before release.
- Source: root and package `AGENTS.md`, `release-flow`.
- Test place: `just check`, plus `pnpm --filter create-mono-stack lint`/`typecheck`.
- Starting state: versioned release candidate with both fixes and their regression tests already
  committed.
- Exact input or fixture: repository HEAD with no bypass flags.
- Interaction steps: run `just check`, `pnpm --filter create-mono-stack lint`,
  `pnpm --filter create-mono-stack typecheck`.
- Main behavior: all required build, lint, type, skills, template, and test checks pass.
- Expected result: exit 0 on every command.
- Must change: no source file beyond recorded validation state.
- Must not happen: a hook/check bypass or publication after a failed gate.
- Planned command: `just check`.
- Expected result before the code change: prior committed state (0.1.54) passes; candidate version
  is absent.
- First observed run: 2026-09-12, `just check` failed format-check on the new unformatted release
  checklist file.
- Passing rerun: 2026-09-12, after `prettier --write` on the checklist, `just check` exited 0;
  `pnpm --filter create-mono-stack lint`/`typecheck` also passed cleanly at 0.1.55.

### TEST-RELEASE-066 artifact inspection

- Small task: inspect the exact npm artifact before publishing.
- Source: `core/create-mono-stack/AGENTS.md` and `release-flow`.
- Test place: `npm pack --dry-run` within the package.
- Starting state: validated 0.1.55 package source.
- Exact input or fixture: `pnpm --filter create-mono-stack exec npm pack --dry-run`.
- Interaction steps: run the dry pack and inspect version and file list.
- Main behavior: public artifact contains only declared package files and no auth material.
- Expected result: 0.1.55 tarball; no `.npmrc*`, package test directory, or node_modules.
- Must change: no generated tarball (dry run only).
- Must not happen: publishing an uninspected or credential-containing artifact.
- Planned command: `pnpm --filter create-mono-stack exec npm pack --dry-run`.
- Expected result before the code change: reports 0.1.54.
- First observed run: 2026-09-12, dry run reported `create-mono-stack-0.1.55.tgz`, 300 files, 618.2 kB
  packed, 1.0 MB unpacked; confirmed `src/app-name-references.js` included and no `.npmrc*` or
  `node_modules` present.
- Passing rerun: 2026-09-12, same as first observed run — no code change was needed after inspection.

### TEST-RELEASE-067 remote and registry verification

- Small task: verify the immutable release tag and npm publication.
- Source: `release-flow`, package publish wrapper, and user authorization.
- Test place: `git ls-remote` and `npm view`.
- Starting state: clean release commit and annotated `v0.1.55` pushed to origin.
- Exact input or fixture: `v0.1.55`, expected release commit SHA, package `create-mono-stack@0.1.55`.
- Interaction steps: push commit, create/push tag, publish with wrapper, query tag and registry.
- Main behavior: Git and npm identify the same release version.
- Expected result: remote peeled tag matches the release commit; npm latest version is 0.1.55.
- Must change: origin branch/tag and npm registry metadata.
- Must not happen: direct npm publish, credentials in Git, or publish before the pushed tag.
- Planned command: `git ls-remote --tags origin v0.1.55 && npm view create-mono-stack@latest version`.
- Expected result before the code change: tag does not exist and npm latest is 0.1.54.
- First observed run: Pending — not yet run.
- Passing rerun: Pending — not yet run.

## Missing-Case Review

1. Version marker maps to TEST-RELEASE-064; release gate to 065; artifact to 066; push/tag/publish
   to 067. The two functional fixes themselves are covered by TEST-APPNAME-_/TEST-APPLOOKUP-_/
   TEST-PRECOMMIT-007/TEST-SWAGGER-007 (app-rename checklists) and TEST-ESLINT-* (eslint checklist),
   not re-derived here.
2. This is a bug-fix release; no new acceptance criteria beyond confirming both fixes ship and the
   registry reflects it.
3. Invalid form/API/auth/data boundary cases do not apply: fixed version strings only, no runtime
   endpoint, contract, or authorization change beyond the already-covered fixes.
4. The only retry/duplicate outcome is registry rejection of a duplicate version; not exercised
   intentionally because npm publications are irreversible.

## Implementation Plan

- [x] Set `core/create-mono-stack/package.json` version to 0.1.55.
- [x] Set the CLI fixture to `_commit: v0.1.55`.
- [x] Record TEST-RELEASE-064 and 066 validation results in this checklist.
- [x] Run `just check` and record TEST-RELEASE-065.
- [ ] Commit release metadata with hooks, push `master`, create/push annotated `v0.1.55`.
- [ ] Publish with the package wrapper and record TEST-RELEASE-067 evidence.

## Validation Notes

- Registry baseline: `npm view create-mono-stack version` (before this release) is expected to be
  `0.1.54`.
