# Release `create-mono-stack` 0.1.58

- Checklist ID: REL-CREATE-MONO-STACK-011
- Created: 2026-09-13
- Planning completed: 2026-09-13
- Type: Patch release (bug fix)
- Source request: user asked to publish to npm right after the readline "unsettled top-level await"
  fix (commit `eb46f9f`) was committed. Mirrors the 0.1.56 and 0.1.57 releases earlier in the same
  session; not re-confirmed via `AskUserQuestion` again since the user has now walked this exact flow
  twice already this session.
- Related checklists:
  - [Setup prompt interrupt warning fix](2026-09-13-setup-prompt-interrupt-warning-fix.md)
  - [Release create-mono-stack 0.1.57](2026-09-13-release-create-mono-stack-0.1.57.md)
- Affected paths: `core/create-mono-stack/package.json`, `core/create-mono-stack/test/cli.test.js`,
  this checklist.
- Status legend: `[ ]` pending, `[/]` partial or blocked, `[x]` complete

## Change Tier

- Tier: standard
- Disqualifiers: the release publishes a public npm artifact.

## Implementation Description

Release `create-mono-stack` 0.1.58, shipping one already-implemented, already-tested commit
(`eb46f9f`): `promptForSetup` no longer leaves an unsettled promise (and prints Node's confusing
"Detected unsettled top-level await" warning) when a user presses Ctrl+C or Ctrl+D at the "Run
automated setup now? [y/N]" prompt instead of answering. Interruption now resolves the same as
declining, with no warning printed.

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
| Release artifact | `npm pack --dry-run`                              | create-mono-stack package | Inspectable 0.1.58 tarball          |
| Release publish  | `pnpm --filter create-mono-stack publish:package` | package-local wrapper     | Public npm package after remote tag |

### User Journey

1. A user runs the interactive wizard with create-mono-stack 0.1.57, completes generation, and
   presses Ctrl+C at "Run automated setup now?" instead of typing an answer; Node prints a confusing
   "Detected unsettled top-level await" warning right after generation had already succeeded.
2. The package version and CLI fixture move to 0.1.58; the fix and its regression tests are already
   committed and validated.
3. The release commit is pushed, annotated as `v0.1.58`, and the tag is pushed.
4. The wrapper publishes the verified artifact; npm latest and the remote tag identify 0.1.58.
5. A user interrupting the same prompt with 0.1.58 sees no warning; the CLI exits cleanly as if they
   had declined.

### Complete Test Matrix

| Test ID          | Intent                | Path               | Expected result                                             | Test place      | Limitation                      |
| ---------------- | --------------------- | ------------------ | ----------------------------------------------------------- | --------------- | ------------------------------- |
| TEST-RELEASE-076 | Version marker        | valid              | Manifest and fixture both use 0.1.58; launcher suite passes | package test    | Does not prove registry state   |
| TEST-RELEASE-077 | Repository validation | valid/failure gate | `just check` exits 0; failures stop release                 | repository gate | Does not inspect artifact       |
| TEST-RELEASE-078 | Artifact inspection   | valid              | Dry-run tarball is 0.1.58 and excludes credentials/tests    | npm pack        | Does not publish                |
| TEST-RELEASE-079 | Publish verification  | valid/failure gate | Pushed tag peels to release commit and npm latest is 0.1.58 | Git/npm         | Requires network and local auth |

### Unresolved Conflicts

None found. The user authorized the full commit/push/tag/publish sequence by saying "publish to npm" a
third time in the same session, having already confirmed and observed the exact same sequence for
0.1.56 and 0.1.57.

## Acceptance Criteria

- [x] `core/create-mono-stack/package.json` and the CLI fixture state `0.1.58` / `v0.1.58`.
- [x] Package suite, full repository gate, and dry-run artifact validation pass.
- [x] The release commit and annotated `v0.1.58` tag are pushed to `origin` before publication.
- [x] The package-local wrapper publishes `create-mono-stack@0.1.58`; npm latest and remote tag
      confirm it.

## Exact Test Cases

### TEST-RELEASE-076 version metadata

- Small task: align the package version and CLI template-revision fixture.
- Source: `core/create-mono-stack/package.json`, `core/create-mono-stack/test/cli.test.js`, and
  `release-flow`.
- Test place: `pnpm --filter create-mono-stack test`.
- Starting state: package and fixture use 0.1.57; npm latest is 0.1.57.
- Exact input or fixture: `0.1.58` and `_commit: v0.1.58\n`.
- Interaction steps: update the two version markers and run the package suite.
- Main behavior: the launcher test fixture tracks the released package version.
- Expected result: suite passes with both markers at 0.1.58.
- Must change: exactly the manifest and fixture version strings.
- Must not happen: no launcher behavior or unrelated fixture changes (the `v0.1.19` stale-revision
  fixture in `cli.test.js` must not change).
- Planned command: `pnpm --filter create-mono-stack test`.
- Expected result before the code change: suite passes at 0.1.57; no fixture expects v0.1.58.
- First observed run: 2026-09-13, updated both markers to 0.1.58 and ran the suite.
- Passing rerun: 2026-09-13, `pnpm --filter create-mono-stack test` passed: 308/308, both markers at
  0.1.58.

### TEST-RELEASE-077 release validation

- Small task: validate all shipped repository behavior before release.
- Source: root and package `AGENTS.md`, `release-flow`.
- Test place: `just check`, plus `pnpm --filter create-mono-stack lint`/`typecheck`.
- Starting state: versioned release candidate with the fix and its regression tests already
  committed.
- Exact input or fixture: repository HEAD with no bypass flags.
- Interaction steps: run `just check`, `pnpm --filter create-mono-stack lint`,
  `pnpm --filter create-mono-stack typecheck`.
- Main behavior: all required build, lint, type, skills, template, and test checks pass.
- Expected result: exit 0 on every command.
- Must change: no source file beyond recorded validation state.
- Must not happen: a hook/check bypass or publication after a failed gate.
- Planned command: `just check`.
- Expected result before the code change: prior committed state (0.1.57) passes; candidate version is
  absent.
- First observed run: 2026-09-13, `just check` failed `format:check` on the new unformatted release
  checklist file.
- Passing rerun: 2026-09-13, after `prettier --write` on the checklist, `just check` exited 0;
  `pnpm --filter create-mono-stack lint`/`typecheck` also passed cleanly at 0.1.58.

### TEST-RELEASE-078 artifact inspection

- Small task: inspect the exact npm artifact before publishing.
- Source: `core/create-mono-stack/AGENTS.md` and `release-flow`.
- Test place: `npm pack --dry-run` within the package.
- Starting state: validated 0.1.58 package source.
- Exact input or fixture: `pnpm --filter create-mono-stack exec npm pack --dry-run`.
- Interaction steps: run the dry pack and inspect version and file list.
- Main behavior: public artifact contains only declared package files and no auth material.
- Expected result: 0.1.58 tarball; no `.npmrc*`, package test directory, or `node_modules`.
- Must change: no generated tarball (dry run only).
- Must not happen: publishing an uninspected or credential-containing artifact.
- Planned command: `pnpm --filter create-mono-stack exec npm pack --dry-run`.
- Expected result before the code change: reports 0.1.57.
- First observed run: 2026-09-13, dry run reported `create-mono-stack-0.1.58.tgz`, 300 files, 619.5 kB
  packed, 1.0 MB unpacked; no `.npmrc*` or `node_modules` present.
- Passing rerun: 2026-09-13, same as first observed run — no code change was needed after inspection.

### TEST-RELEASE-079 remote and registry verification

- Small task: verify the immutable release tag and npm publication.
- Source: `release-flow`, package publish wrapper, and user authorization.
- Test place: `git ls-remote` and `npm view`.
- Starting state: clean release commit and annotated `v0.1.58` pushed to origin.
- Exact input or fixture: `v0.1.58`, expected release commit SHA, package
  `create-mono-stack@0.1.58`.
- Interaction steps: push commit, create/push tag, publish with wrapper, query tag and registry.
- Main behavior: Git and npm identify the same release version.
- Expected result: remote peeled tag matches the release commit; npm latest version is 0.1.58.
- Must change: origin branch/tag and npm registry metadata.
- Must not happen: direct npm publish, credentials in Git, or publish before the pushed tag.
- Planned command: `git ls-remote --tags origin v0.1.58 && npm view create-mono-stack@latest version`.
- Expected result before the code change: tag does not exist and npm latest is 0.1.57.
- First observed run: 2026-09-13, before pushing, `origin/master` had no `v0.1.58` tag and
  `npm view create-mono-stack@latest version` returned `0.1.57`.
- Passing rerun: 2026-09-13, `git push origin master` (`7607e3c..d1f1157`), `git tag -a v0.1.58` then
  `git push origin v0.1.58` (`git ls-remote --tags origin v0.1.58` returned
  `9e360f8f0f46f46bb5bde69095d268e509cced9c`, peeling via `git rev-parse v0.1.58^{}` to
  `d1f1157eeeb3a8bad09b97b5f232a42e5c162ce8`, equal to `HEAD`), then
  `pnpm --filter create-mono-stack publish:package` succeeded. `npm view create-mono-stack@latest
version` reported `0.1.58` after an ~8s poll.

## Missing-Case Review

1. Version marker maps to TEST-RELEASE-076; release gate to 077; artifact to 078; push/tag/publish to 079. The functional fix itself is covered by `TEST-SETUPINT-*` (already validated in its own
   checklist), not re-derived here.
2. This is a bug-fix release; no new acceptance criteria beyond confirming the fix ships and the
   registry reflects it.
3. Invalid form/API/auth/data boundary cases do not apply: fixed version strings only, no runtime
   endpoint, contract, or authorization change beyond the already-covered fix.
4. The only retry/duplicate outcome is registry rejection of a duplicate version; not exercised
   intentionally because npm publications are irreversible.

## Implementation Plan

- [x] Set `core/create-mono-stack/package.json` version to 0.1.58.
- [x] Set the CLI fixture to `_commit: v0.1.58`.
- [x] Record TEST-RELEASE-076 and 078 validation results in this checklist.
- [x] Run `just check` and record TEST-RELEASE-077.
- [x] Commit release metadata with hooks, push `master`, create/push annotated `v0.1.58`.
- [x] Publish with the package wrapper and record TEST-RELEASE-079 evidence.

## Validation Notes

- Registry baseline: `npm view create-mono-stack version` (before this release) was `0.1.57`.
- TEST-RELEASE-076: `pnpm --filter create-mono-stack test` passed at 0.1.58 (308/308).
- TEST-RELEASE-078: dry run produced `create-mono-stack-0.1.58.tgz`, 300 files, 619.5 kB packed,
  1.0 MB unpacked; excludes the package `test/` directory, `node_modules`, and `.npmrc*`.
- TEST-RELEASE-079: `v0.1.58` was pushed as annotated tag `9e360f8f0f46f46bb5bde69095d268e509cced9c`,
  peeling to release commit `d1f1157eeeb3a8bad09b97b5f232a42e5c162ce8`. The package-local wrapper
  published `create-mono-stack@0.1.58`; npm reports that version as `latest`.

## Updates

### 2026-09-13 - Release published

- Release commit: `d1f1157eeeb3a8bad09b97b5f232a42e5c162ce8`
  (`chore(release): prepare create-mono-stack 0.1.58`), pushed to `origin/master`, preceded by the fix
  commit `eb46f9f` (also pushed in the same `git push`).
- Tag: annotated `v0.1.58` (`9e360f8f0f46f46bb5bde69095d268e509cced9c`) pushed to origin; peeled ref
  `v0.1.58^{}` is `d1f1157eeeb3a8bad09b97b5f232a42e5c162ce8`.
- Publication: `pnpm --filter create-mono-stack publish:package` completed successfully with public
  latest access.
- Verification: `npm view create-mono-stack@latest version` reports `0.1.58`.
- GitHub's Dependabot notice on push (3 vulnerabilities, 2 high, 1 low) remains outstanding and
  unrelated; not addressed in this release.
