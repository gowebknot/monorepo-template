# Release `create-mono-stack` 0.1.61

- Checklist ID: REL-CREATE-MONO-STACK-014
- Created: 2026-09-13
- Planning completed: 2026-09-13
- Type: Patch release (bug fix)
- Source request: user pasted a real pre-commit failure from a freshly generated project
  (`gfjgbvj`) whose web app was renamed to `dashboard`: the mandatory `skills:test` step's
  `TEST-GATE-024` rejected the very first commit with an `AssertionError` on the hardcoded
  `apps/web/src/App.tsx` probe path. After the fix was committed (`4c60877`), the user was explicitly
  asked via `AskUserQuestion` whether to commit and whether to release, and answered "Commit now
  (Recommended)" and "Yes, release after commit (Recommended)".
- Related checklists:
  - [TEST-GATE-024 hardcodes canonical app paths](2026-09-13-skill-gate-test-hardcodes-canonical-app-paths.md)
  - [Release create-mono-stack 0.1.60](2026-09-13-release-create-mono-stack-0.1.60.md)
- Affected paths: `core/create-mono-stack/package.json`, `core/create-mono-stack/test/cli.test.js`,
  this checklist.
- Status legend: `[ ]` pending, `[/]` partial or blocked, `[x]` complete

## Change Tier

- Tier: standard
- Disqualifiers: the release publishes a public npm artifact.

## Implementation Description

Release `create-mono-stack` 0.1.61, shipping one already-implemented, already-tested commit
(`4c60877`): `scripts/skill-gate.test.mjs`'s `TEST-GATE-024` now resolves its five renameable-app
probe paths (`web-vite`, `web-next`, `mobile-expo`, `mobile-react-native`, `api-nest`) from the
project's own `.mono-stack.json` when it exists, instead of hardcoding canonical default paths like
`apps/web`. Without this fix, every generated project that renamed any one of those five apps
(a common customization) failed its very first commit because the mandatory `skills:test` step's own
regression test made an assumption the wizard itself does not enforce.

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
| Release artifact | `npm pack --dry-run`                              | create-mono-stack package | Inspectable 0.1.61 tarball          |
| Release publish  | `pnpm --filter create-mono-stack publish:package` | package-local wrapper     | Public npm package after remote tag |

### User Journey

1. A user renames their `web-vite` (or any other renameable) app during the interactive wizard,
   generates the project with create-mono-stack 0.1.60, and finds their very first
   `git commit -m "chore: initialize project"` rejected by the mandatory `skills:test` step.
2. The package version and CLI fixture move to 0.1.61; the fix and its regression tests are already
   committed and validated.
3. The release commit is pushed, annotated as `v0.1.61`, and the tag is pushed.
4. The wrapper publishes the verified artifact; npm latest and the remote tag identify 0.1.61.
5. A user generating a project with 0.1.61 completes their first commit without any false-positive
   `skills:test` failure, regardless of any renamed app.

### Complete Test Matrix

| Test ID          | Intent                | Path               | Expected result                                             | Test place      | Limitation                      |
| ---------------- | --------------------- | ------------------ | ----------------------------------------------------------- | --------------- | ------------------------------- |
| TEST-RELEASE-088 | Version marker        | valid              | Manifest and fixture both use 0.1.61; launcher suite passes | package test    | Does not prove registry state   |
| TEST-RELEASE-089 | Repository validation | valid/failure gate | `just check` exits 0; failures stop release                 | repository gate | Does not inspect artifact       |
| TEST-RELEASE-090 | Artifact inspection   | valid              | Dry-run tarball is 0.1.61 and excludes credentials/tests    | npm pack        | Does not publish                |
| TEST-RELEASE-091 | Publish verification  | valid/failure gate | Pushed tag peels to release commit and npm latest is 0.1.61 | Git/npm         | Requires network and local auth |

### Unresolved Conflicts

None found. The user authorized commit and release explicitly via `AskUserQuestion` for this specific
change, rather than relying on a prior confirmation from earlier in the session.

## Acceptance Criteria

- [x] `core/create-mono-stack/package.json` and the CLI fixture state `0.1.61` / `v0.1.61`.
- [x] Package suite, full repository gate, and dry-run artifact validation pass.
- [ ] The release commit and annotated `v0.1.61` tag are pushed to `origin` before publication.
- [ ] The package-local wrapper publishes `create-mono-stack@0.1.61`; npm latest and remote tag
      confirm it.

## Exact Test Cases

### TEST-RELEASE-088 version metadata

- Small task: align the package version and CLI template-revision fixture.
- Source: `core/create-mono-stack/package.json`, `core/create-mono-stack/test/cli.test.js`, and
  `release-flow`.
- Test place: `pnpm --filter create-mono-stack test`.
- Starting state: package and fixture use 0.1.60; npm latest is 0.1.60.
- Exact input or fixture: `0.1.61` and `_commit: v0.1.61\n`.
- Interaction steps: update the two version markers and run the package suite.
- Main behavior: the launcher test fixture tracks the released package version.
- Expected result: suite passes with both markers at 0.1.61.
- Must change: exactly the manifest and fixture version strings.
- Must not happen: no launcher behavior or unrelated fixture changes (the `v0.1.19` stale-revision
  fixture in `cli.test.js` must not change).
- Planned command: `pnpm --filter create-mono-stack test`.
- Expected result before the code change: suite passes at 0.1.60; no fixture expects v0.1.61.
- First observed run: 2026-09-13, updated both markers to 0.1.61 and ran the suite.
- Passing rerun: 2026-09-13, `pnpm --filter create-mono-stack test` passed: 309/309, both markers at
  0.1.61.

### TEST-RELEASE-089 release validation

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
- Expected result before the code change: prior committed state (0.1.60) passes; candidate version is
  absent.
- First observed run: 2026-09-13, `just check` exited 0 on the first run (checklist file was
  formatted before running `just check`).
- Passing rerun: same as first observed run; `pnpm --filter create-mono-stack lint`/`typecheck` also
  passed cleanly at 0.1.61.

### TEST-RELEASE-090 artifact inspection

- Small task: inspect the exact npm artifact before publishing.
- Source: `core/create-mono-stack/AGENTS.md` and `release-flow`.
- Test place: `npm pack --dry-run` within the package.
- Starting state: validated 0.1.61 package source.
- Exact input or fixture: `pnpm --filter create-mono-stack exec npm pack --dry-run`.
- Interaction steps: run the dry pack and inspect version and file list.
- Main behavior: public artifact contains only declared package files and no auth material.
- Expected result: 0.1.61 tarball; no `.npmrc*`, package test directory, or `node_modules`.
- Must change: no generated tarball (dry run only).
- Must not happen: publishing an uninspected or credential-containing artifact.
- Planned command: `pnpm --filter create-mono-stack exec npm pack --dry-run`.
- Expected result before the code change: reports 0.1.60.
- First observed run: 2026-09-13, dry run reported `create-mono-stack-0.1.61.tgz`, 301 files, 619.6 kB
  packed, 1.0 MB unpacked — identical file count and size to 0.1.60, since this fix touches only root
  `scripts/`, not the published `core/create-mono-stack` source or reference templates; no `.npmrc*`
  or `node_modules` present, and the only `test/`-path entry
  (`reference-templates/managed/server/test/app.e2e-spec.ts`) is shipped template content for
  generated projects, not this package's own `test/` directory.
- Passing rerun: 2026-09-13, same as first observed run — no code change was needed after inspection.

### TEST-RELEASE-091 remote and registry verification

- Small task: verify the immutable release tag and npm publication.
- Source: `release-flow`, package publish wrapper, and user authorization.
- Test place: `git ls-remote` and `npm view`.
- Starting state: clean release commit and annotated `v0.1.61` pushed to origin.
- Exact input or fixture: `v0.1.61`, expected release commit SHA, package
  `create-mono-stack@0.1.61`.
- Interaction steps: push commit, create/push tag, publish with wrapper, query tag and registry.
- Main behavior: Git and npm identify the same release version.
- Expected result: remote peeled tag matches the release commit; npm latest version is 0.1.61.
- Must change: origin branch/tag and npm registry metadata.
- Must not happen: direct npm publish, credentials in Git, or publish before the pushed tag.
- Planned command: `git ls-remote --tags origin v0.1.61 && npm view create-mono-stack@latest version`.
- Expected result before the code change: tag does not exist and npm latest is 0.1.60.
- First observed run: Pending.
- Passing rerun: Pending.

## Missing-Case Review

1. Version marker maps to TEST-RELEASE-088; release gate to 089; artifact to 090; push/tag/publish to 091. The functional fix itself is covered by `TEST-GATE-024/031/032` (already validated in its own
   checklist), not re-derived here.
2. This is a bug-fix release; no new acceptance criteria beyond confirming the fix ships and the
   registry reflects it.
3. Invalid form/API/auth/data boundary cases do not apply: fixed version strings only, no runtime
   endpoint, contract, or authorization change beyond the already-covered fix.
4. The only retry/duplicate outcome is registry rejection of a duplicate version; not exercised
   intentionally because npm publications are irreversible.

## Implementation Plan

- [x] Set `core/create-mono-stack/package.json` version to 0.1.61.
- [x] Set the CLI fixture to `_commit: v0.1.61`.
- [x] Record TEST-RELEASE-088 and 090 validation results in this checklist.
- [x] Run `just check` and record TEST-RELEASE-089.
- [ ] Commit release metadata with hooks, push `master`, create/push annotated `v0.1.61`.
- [ ] Publish with the package wrapper and record TEST-RELEASE-091 evidence.

## Validation Notes

- Registry baseline: `npm view create-mono-stack version` (before this release) was `0.1.60`.
- TEST-RELEASE-088: `pnpm --filter create-mono-stack test` passed at 0.1.61 (309/309).
- TEST-RELEASE-089: `just check` exited 0; `pnpm --filter create-mono-stack lint`/`typecheck` also
  passed.
- TEST-RELEASE-090: dry run produced `create-mono-stack-0.1.61.tgz`, 301 files, 619.6 kB packed,
  1.0 MB unpacked; excludes the package's own `test/` directory, `node_modules`, and `.npmrc*`.
- TEST-RELEASE-091: pending push/tag/publish.
