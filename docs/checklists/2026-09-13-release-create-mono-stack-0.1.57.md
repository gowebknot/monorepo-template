# Release `create-mono-stack` 0.1.57

- Checklist ID: REL-CREATE-MONO-STACK-010
- Created: 2026-09-13
- Planning completed: 2026-09-13
- Type: Patch release (bug fixes)
- Source request: user asked to publish to npm right after the orphaned-E2E-suite and
  rename-fragile-import fix (commit `ee935a8`) was committed. This mirrors the 0.1.56 release earlier
  in the same session: full commit/push/tag/publish sequence, not re-confirmed via `AskUserQuestion`
  again since the user already walked that exact flow once this session.
- Related checklists:
  - [Orphaned E2E suites and rename-fragile imports (parent)](2026-09-13-orphaned-e2e-suites-and-rename-fragile-imports.md)
  - [Conditional Maestro/Playwright inclusion](2026-09-13-conditional-maestro-playwright-inclusion.md)
  - [Rename-safe root-script imports](2026-09-13-rename-safe-workspace-script-imports.md)
  - [Release create-mono-stack 0.1.56](2026-09-13-release-create-mono-stack-0.1.56.md)
- Affected paths: `core/create-mono-stack/package.json`, `core/create-mono-stack/test/cli.test.js`,
  this checklist.
- Status legend: `[ ]` pending, `[/]` partial or blocked, `[x]` complete

## Change Tier

- Tier: standard
- Disqualifiers: the release publishes a public npm artifact and changes generated-project behavior
  (apps/maestro and apps/playwright are no longer copied unconditionally; their workspace dependency
  now survives project renaming).

## Implementation Description

Release `create-mono-stack` 0.1.57, shipping one already-implemented, already-tested commit
(`ee935a8`) covering two independent fixes:

1. The interactive wizard now asks whether to include Maestro mobile E2E tests only when a mobile
   feature was selected, and Playwright web E2E tests only when a web feature was selected;
   `copier.yml` excludes each natively via a Jinja-conditional `_exclude` entry when declined or
   irrelevant, so a generated project no longer ships an orphaned E2E suite testing an app that
   doesn't exist.
2. `apps/maestro`/`apps/playwright`'s workspace dependency on the root package (previously hardcoded
   to the literal string `monorepo-template`) is now rewritten to the generated project's own name by
   `scripts/render-package-scope.mjs` and its `native-scaffold.js` mirror, fixing the
   `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND` a renamed generated project would otherwise hit.

The fix is already implemented, tested, and committed; this release only bumps the version markers,
re-validates the full repository gate, inspects the artifact, and publishes.

## Implementation Contract

### Feature Boundaries

- Included: package/fixture version markers, this release checklist, full repository validation,
  dry-run artifact inspection, pushed release commit and annotated tag, wrapper-based npm
  publication.
- Excluded: any further functional change beyond the already-committed fix.
- Ownership: `core/create-mono-stack` owns the published CLI artifact.

### Route-Group Ownership

| Route group      | Entry point                                       | Owner                     | Result                              |
| ---------------- | ------------------------------------------------- | ------------------------- | ----------------------------------- |
| Release artifact | `npm pack --dry-run`                              | create-mono-stack package | Inspectable 0.1.57 tarball          |
| Release publish  | `pnpm --filter create-mono-stack publish:package` | package-local wrapper     | Public npm package after remote tag |

### User Journey

1. A user runs the interactive wizard, selecting only `web-vite` + `api-nest` (no mobile feature),
   with create-mono-stack 0.1.56 and gets a full `apps/maestro` testing a nonexistent Expo app; or
   selects a mobile feature, renames their project, and hits `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND`.
2. The package version and CLI fixture move to 0.1.57; both fixes and their regression tests are
   already committed and validated.
3. The release commit is pushed, annotated as `v0.1.57`, and the tag is pushed.
4. The wrapper publishes the verified artifact; npm latest and the remote tag identify 0.1.57.
5. A user generating a project with 0.1.57 is asked about each E2E suite only when relevant, and any
   suite they keep survives project renaming without a broken workspace dependency.

### Complete Test Matrix

| Test ID          | Intent                | Path               | Expected result                                             | Test place      | Limitation                      |
| ---------------- | --------------------- | ------------------ | ----------------------------------------------------------- | --------------- | ------------------------------- |
| TEST-RELEASE-072 | Version marker        | valid              | Manifest and fixture both use 0.1.57; launcher suite passes | package test    | Does not prove registry state   |
| TEST-RELEASE-073 | Repository validation | valid/failure gate | `just check` exits 0; failures stop release                 | repository gate | Does not inspect artifact       |
| TEST-RELEASE-074 | Artifact inspection   | valid              | Dry-run tarball is 0.1.57 and excludes credentials/tests    | npm pack        | Does not publish                |
| TEST-RELEASE-075 | Publish verification  | valid/failure gate | Pushed tag peels to release commit and npm latest is 0.1.57 | Git/npm         | Requires network and local auth |

### Unresolved Conflicts

None found. The user authorized the full commit/push/tag/publish sequence for this release by saying
"publish to npm" a second time in the same session, immediately after seeing and confirming the exact
same sequence for 0.1.56.

## Acceptance Criteria

- [x] `core/create-mono-stack/package.json` and the CLI fixture state `0.1.57` / `v0.1.57`.
- [x] Package suite, full repository gate, and dry-run artifact validation pass.
- [ ] The release commit and annotated `v0.1.57` tag are pushed to `origin` before publication.
- [ ] The package-local wrapper publishes `create-mono-stack@0.1.57`; npm latest and remote tag
      confirm it.

## Exact Test Cases

### TEST-RELEASE-072 version metadata

- Small task: align the package version and CLI template-revision fixture.
- Source: `core/create-mono-stack/package.json`, `core/create-mono-stack/test/cli.test.js`, and
  `release-flow`.
- Test place: `pnpm --filter create-mono-stack test`.
- Starting state: package and fixture use 0.1.56; npm latest is 0.1.56.
- Exact input or fixture: `0.1.57` and `_commit: v0.1.57\n`.
- Interaction steps: update the two version markers and run the package suite.
- Main behavior: the launcher test fixture tracks the released package version.
- Expected result: suite passes with both markers at 0.1.57.
- Must change: exactly the manifest and fixture version strings.
- Must not happen: no launcher behavior or unrelated fixture changes (the `v0.1.19` stale-revision
  fixture in `cli.test.js` must not change).
- Planned command: `pnpm --filter create-mono-stack test`.
- Expected result before the code change: suite passes at 0.1.56; no fixture expects v0.1.57.
- First observed run: 2026-09-13, updated both markers to 0.1.57 and ran the suite.
- Passing rerun: 2026-09-13, `pnpm --filter create-mono-stack test` passed: 305/305, both markers at
  0.1.57.

### TEST-RELEASE-073 release validation

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
- Expected result before the code change: prior committed state (0.1.56) passes; candidate version is
  absent.
- First observed run: 2026-09-13, `just check` failed `format:check` on the new unformatted release
  checklist file.
- Passing rerun: 2026-09-13, after `prettier --write` on the checklist, `just check` exited 0;
  `pnpm --filter create-mono-stack lint`/`typecheck` also passed cleanly at 0.1.57.

### TEST-RELEASE-074 artifact inspection

- Small task: inspect the exact npm artifact before publishing.
- Source: `core/create-mono-stack/AGENTS.md` and `release-flow`.
- Test place: `npm pack --dry-run` within the package.
- Starting state: validated 0.1.57 package source.
- Exact input or fixture: `pnpm --filter create-mono-stack exec npm pack --dry-run`.
- Interaction steps: run the dry pack and inspect version and file list.
- Main behavior: public artifact contains only declared package files and no auth material.
- Expected result: 0.1.57 tarball; no `.npmrc*`, package test directory, or `node_modules`.
- Must change: no generated tarball (dry run only).
- Must not happen: publishing an uninspected or credential-containing artifact.
- Planned command: `pnpm --filter create-mono-stack exec npm pack --dry-run`.
- Expected result before the code change: reports 0.1.56.
- First observed run: 2026-09-13, dry run reported `create-mono-stack-0.1.57.tgz`, 300 files, 619.2 kB
  packed, 1.0 MB unpacked; no `.npmrc*` or `node_modules` present.
- Passing rerun: 2026-09-13, same as first observed run — no code change was needed after inspection.

### TEST-RELEASE-075 remote and registry verification

- Small task: verify the immutable release tag and npm publication.
- Source: `release-flow`, package publish wrapper, and user authorization.
- Test place: `git ls-remote` and `npm view`.
- Starting state: clean release commit and annotated `v0.1.57` pushed to origin.
- Exact input or fixture: `v0.1.57`, expected release commit SHA, package
  `create-mono-stack@0.1.57`.
- Interaction steps: push commit, create/push tag, publish with wrapper, query tag and registry.
- Main behavior: Git and npm identify the same release version.
- Expected result: remote peeled tag matches the release commit; npm latest version is 0.1.57.
- Must change: origin branch/tag and npm registry metadata.
- Must not happen: direct npm publish, credentials in Git, or publish before the pushed tag.
- Planned command: `git ls-remote --tags origin v0.1.57 && npm view create-mono-stack@latest version`.
- Expected result before the code change: tag does not exist and npm latest is 0.1.56.
- First observed run: Pending.
- Passing rerun: Pending.

## Missing-Case Review

1. Version marker maps to TEST-RELEASE-072; release gate to 073; artifact to 074; push/tag/publish to 075. The functional fixes themselves are covered by `TEST-E2EFLAG-*` and `TEST-RENDERSCOPE-*`
   (already validated in their own checklists), not re-derived here.
2. This is a bug-fix release; no new acceptance criteria beyond confirming both fixes ship and the
   registry reflects it.
3. Invalid form/API/auth/data boundary cases do not apply: fixed version strings only, no runtime
   endpoint, contract, or authorization change beyond the already-covered fixes.
4. The only retry/duplicate outcome is registry rejection of a duplicate version; not exercised
   intentionally because npm publications are irreversible.

## Implementation Plan

- [x] Set `core/create-mono-stack/package.json` version to 0.1.57.
- [x] Set the CLI fixture to `_commit: v0.1.57`.
- [x] Record TEST-RELEASE-072 and 074 validation results in this checklist.
- [x] Run `just check` and record TEST-RELEASE-073.
- [ ] Commit release metadata with hooks, push `master`, create/push annotated `v0.1.57`.
- [ ] Publish with the package wrapper and record TEST-RELEASE-075 evidence.

## Validation Notes

- Registry baseline: `npm view create-mono-stack version` (before this release) is `0.1.56`.
