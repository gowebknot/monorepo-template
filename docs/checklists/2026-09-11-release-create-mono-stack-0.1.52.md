# Release `create-mono-stack` 0.1.52

- Checklist ID: REL-CREATE-MONO-STACK-005
- Created: 2026-09-11
- Planning completed: 2026-09-11
- Type: Patch release (hotfix)
- Source request: user reported a live failure from `pnpm create mono-stack@latest` (the
  just-published 0.1.51) immediately after the 0.1.51 release; explicitly authorized shipping the
  fix as an immediate 0.1.52 patch release once it was implemented and validated.
- Related checklists:
  - [Trust the Default Copier Template](2026-09-11-copier-trust-default-template.md)
  - [Release create-mono-stack 0.1.51](2026-09-11-release-create-mono-stack-0.1.51.md)
- Affected paths: `core/create-mono-stack/package.json`, `core/create-mono-stack/test/cli.test.js`,
  `core/create-mono-stack/src/create-project.js`,
  `core/create-mono-stack/test/git-host-alias.test.js`,
  `core/create-mono-stack/test/create-project-native.test.js`, this checklist.
- Status legend: `[ ]` pending, `[/]` partial or blocked, `[x]` complete

## Change Tier

- Tier: standard
- Disqualifiers: the release publishes a public npm artifact and changes launcher runtime behavior
  (adds a conditional CLI flag to the `copier copy` subprocess invocation).

## Implementation Description

Release `create-mono-stack` 0.1.52 as a hotfix for 0.1.51 (and every version back to v0.1.40, since
`copier.yml`'s `_tasks` directive was added). `copier copy` was invoked without `--trust`, so Copier
refused to run the template's `_tasks` post-generation script and aborted every project creation —
confirmed live by a user running `pnpm create mono-stack@latest` minutes after 0.1.51 published. The
fix (see the linked "Trust the Default Copier Template" checklist for full detail) adds `--trust` to
`copier copy`, but only when the resolved template source is the built-in default; a user-supplied
`--template` override still gets Copier's normal untrusted-template protection. No other behavior
changes.

## Implementation Contract

### Feature Boundaries

- Included: the `--trust` fix, its regression tests, package/fixture version markers, release
  record, release validation, pushed release commit and annotated tag, wrapper-based npm publication.
- Excluded: any other CLI behavior change, `copier.yml` changes, and the unrelated native-scaffolding
  `ENOENT` failure observed later in the integration test run (out of scope, not investigated here).
- Ownership: `core/create-mono-stack` owns the published CLI; the package-local wrapper owns
  authenticated publication.

### Route-Group Ownership

| Route group      | Entry point                                       | Owner                      | Result                                  |
| ---------------- | ------------------------------------------------- | -------------------------- | --------------------------------------- |
| Project creation | `createProject()` calling `copier copy`           | create-mono-stack launcher | Succeeds again for the default template |
| Release artifact | `npm pack --dry-run`                              | create-mono-stack package  | Inspectable 0.1.52 tarball              |
| Release publish  | `pnpm --filter create-mono-stack publish:package` | package-local wrapper      | Public npm package after remote tag     |

### User Journey

1. A user runs `pnpm create mono-stack@latest` (or any 0.1.51 install) and project creation fails
   with "Template uses potentially unsafe feature: tasks."
2. The package version and template fixture move to 0.1.52; the `--trust` fix and its regression
   tests are already committed and validated (see the linked Trust checklist).
3. The release commit is pushed, annotated as `v0.1.52`, and the tag is pushed.
4. The wrapper publishes the verified artifact; npm latest and the remote tag identify 0.1.52.
5. A user running `pnpm create mono-stack@latest` again completes project creation successfully.

### Complete Test Matrix

| Test ID          | Intent                | Path               | Expected result                                             | Test place      | Limitation                      |
| ---------------- | --------------------- | ------------------ | ----------------------------------------------------------- | --------------- | ------------------------------- |
| TEST-RELEASE-040 | Version marker        | valid              | Manifest and fixture both use 0.1.52; launcher suite passes | package test    | Does not prove registry state   |
| TEST-RELEASE-041 | Repository validation | valid/failure gate | `just check` exits 0; failures stop release                 | repository gate | Does not inspect artifact       |
| TEST-RELEASE-042 | Artifact inspection   | valid              | Dry-run tarball is 0.1.52 and excludes credentials/tests    | npm pack        | Does not publish                |
| TEST-RELEASE-043 | Publish verification  | valid/failure gate | Pushed tag peels to release commit and npm latest is 0.1.52 | Git/npm         | Requires network and local auth |

### Unresolved Conflicts

None found. The user explicitly authorized shipping this as an immediate patch release once the fix
was implemented and validated; package and repository instructions prescribe the commit, push, tag,
then publish order, which this release follows.

## Acceptance Criteria

- [x] `core/create-mono-stack/package.json` and the CLI fixture state `0.1.52` / `v0.1.52`.
- [x] Package suite, full repository gate, and dry-run artifact validation pass.
- [x] The release commit and annotated `v0.1.52` tag are pushed to `origin` before publication.
- [x] The package-local wrapper publishes `create-mono-stack@0.1.52`; npm latest and remote tag
      confirm it.

## Exact Test Cases

### TEST-RELEASE-040 version metadata

- Small task: align the package version and CLI template-revision fixture.
- Source: `core/create-mono-stack/package.json`, `core/create-mono-stack/test/cli.test.js`, and
  `release-flow`.
- Test place: `pnpm --filter create-mono-stack test`.
- Starting state: package and fixture use 0.1.51; npm latest is 0.1.51.
- Exact input or fixture: `0.1.52` and `_commit: v0.1.52\n`.
- Interaction steps: update the two version markers and run the package suite.
- Main behavior: the launcher test fixture tracks the released package version.
- Expected result: suite passes with both markers at 0.1.52.
- Must change: exactly the manifest and fixture version strings.
- Must not happen: no launcher behavior or unrelated fixture changes.
- Planned command: `pnpm --filter create-mono-stack test`.
- Expected result before the code change: suite passes at 0.1.51; no fixture expects v0.1.52.
- First observed run: 2026-09-11, updated both markers to 0.1.52 and ran the suite.
- Passing rerun: 2026-09-11, `pnpm --filter create-mono-stack test` passed: 279/279, both markers at
  0.1.52.

### TEST-RELEASE-041 release validation

- Small task: validate all shipped repository behavior before release.
- Source: root and package `AGENTS.md`, `release-flow`.
- Test place: `just check`, plus `pnpm --filter create-mono-stack lint`/`typecheck`.
- Starting state: versioned release candidate with the `--trust` fix and its regression tests applied.
- Exact input or fixture: repository HEAD with no bypass flags.
- Interaction steps: run `just check`, `pnpm --filter create-mono-stack lint`,
  `pnpm --filter create-mono-stack typecheck`.
- Main behavior: all required build, lint, type, skills, template, and test checks pass.
- Expected result: exit 0 on every command.
- Must change: no source file beyond recorded validation state.
- Must not happen: a hook/check bypass or publication after a failed gate.
- Planned command: `just check`.
- Expected result before the code change: prior committed state (0.1.51) passes; candidate version
  and the `--trust` fix are absent.
- First observed run: 2026-09-11, `just check` exited 0 with the `--trust` fix, its regression
  tests, and both version markers already applied.
- Passing rerun: 2026-09-11, same as first observed run; `pnpm --filter create-mono-stack lint` and
  `pnpm --filter create-mono-stack typecheck` also passed cleanly.

### TEST-RELEASE-042 artifact inspection

- Small task: inspect the exact npm artifact before publishing.
- Source: `core/create-mono-stack/AGENTS.md` and `release-flow`.
- Test place: `npm pack --dry-run` within the package.
- Starting state: validated 0.1.52 package source.
- Exact input or fixture: `pnpm --filter create-mono-stack exec npm pack --dry-run`.
- Interaction steps: run the dry pack and inspect version and file list.
- Main behavior: public artifact contains only declared package files and no auth material.
- Expected result: 0.1.52 tarball; no `.npmrc*`, package test directory, or node_modules.
- Must change: no generated tarball (dry run only).
- Must not happen: publishing an uninspected or credential-containing artifact.
- Planned command: `pnpm --filter create-mono-stack exec npm pack --dry-run`.
- Expected result before the code change: reports 0.1.51.
- First observed run: 2026-09-11, dry run reported `create-mono-stack-0.1.52.tgz`, 299 files, 617.0 kB
  packed, 1.0 MB unpacked; same file set as 0.1.51 aside from the fixed source and test files.
- Passing rerun: 2026-09-11, same as first observed run — no code change was needed after inspection.

### TEST-RELEASE-043 remote and registry verification

- Small task: verify the immutable release tag and npm publication.
- Source: `release-flow`, package publish wrapper, and user authorization.
- Test place: `git ls-remote` and `npm view`.
- Starting state: clean release commit and annotated `v0.1.52` pushed to origin.
- Exact input or fixture: `v0.1.52`, expected release commit SHA, package `create-mono-stack@0.1.52`.
- Interaction steps: push commit, create/push tag, publish with wrapper, query tag and registry.
- Main behavior: Git and npm identify the same release version.
- Expected result: remote peeled tag matches the release commit; npm latest version is 0.1.52.
- Must change: origin branch/tag and npm registry metadata.
- Must not happen: direct npm publish, credentials in Git, or publish before the pushed tag.
- Planned command: `git ls-remote --tags origin v0.1.52 && npm view create-mono-stack@latest version`.
- Expected result before the code change: tag does not exist and npm latest is 0.1.51.
- First observed run: 2026-09-11, before pushing, `npm view create-mono-stack@latest version`
  returned `0.1.51` and `origin` had no `v0.1.52` tag.
- Passing rerun: 2026-09-11, `git push origin master` (`40dc859..2907bde`), `git tag -a v0.1.52` then
  `git push origin v0.1.52` (`git ls-remote --tags origin v0.1.52` returned
  `0d9b1948615e20e836c7626edec63ee75fb36eeb`, peeling via `git rev-parse v0.1.52^{}` to
  `2907bde187730aa0486f458e9278cc8c4bbb8f73`, equal to `HEAD`), then
  `pnpm --filter create-mono-stack publish:package` succeeded. Registry propagation took roughly 15
  seconds: `npm view create-mono-stack@0.1.52 version` initially 404'd, then
  `npm view create-mono-stack@latest version` and `npm view create-mono-stack@0.1.52 version
dist-tags --json` both reported `0.1.52` as `latest`.
- End-to-end confirmation beyond the planned command: ran
  `npx --yes create-mono-stack@0.1.52 /tmp/create-mono-stack-smoke-test --features web-vite
--git-host-alias github-webknot` against the real published package (a first attempt without the
  host alias failed on an unrelated local SSH permission error against `git@github.com` directly, the
  same reason the user's own wizard run used `--git-host-alias github-webknot`). It completed with
  "Project setup complete." and no "Template uses potentially unsafe feature" warning. Verified the
  `_tasks` script actually ran (not just silently skipped): the generated
  `packages/*/package.json` files were rewritten to the project-specific scope
  `@create-mono-stack-smoke-test/*`, which is exactly what `scripts/render-package-scope.mjs`
  performs. Removed the scratch directory afterward.

## Missing-Case Review

1. Version marker maps to TEST-RELEASE-040; release gate to 041; artifact to 042; push/tag/publish
   to 043. The functional fix itself (the `--trust` conditional) is covered by TEST-TRUST-001/002 in
   the linked Trust checklist, not re-derived here.
2. This is a hotfix release; no new acceptance criteria beyond confirming the fix ships and the
   registry reflects it.
3. Invalid form/API/auth/data boundary cases do not apply: fixed version strings only, no runtime
   endpoint, contract, or authorization change beyond the already-covered `--trust` conditional.
4. The only retry/duplicate outcome is registry rejection of a duplicate version; not exercised
   intentionally because npm publications are irreversible.

## Implementation Plan

- [x] Set `core/create-mono-stack/package.json` version to 0.1.52.
- [x] Set the CLI fixture to `_commit: v0.1.52`.
- [x] Record TEST-RELEASE-040 and 042 validation results in this checklist.
- [x] Run `just check` and record TEST-RELEASE-041.
- [x] Commit release metadata with hooks, push `master`, create/push annotated `v0.1.52`.
- [x] Publish with the package wrapper and record TEST-RELEASE-043 evidence.

## Validation Notes

- Registry baseline: `npm view create-mono-stack version` (before this release) is `0.1.51`.
- TEST-RELEASE-040: `pnpm --filter create-mono-stack test` passed at 0.1.52 (279/279).
- TEST-RELEASE-042: dry run produced `create-mono-stack-0.1.52.tgz`, 299 files, 617.0 kB packed,
  1.0 MB unpacked; excludes the package `test/` directory, `node_modules`, and `.npmrc*`.
- TEST-RELEASE-043: `v0.1.52` was pushed as annotated tag `0d9b1948615e20e836c7626edec63ee75fb36eeb`,
  peeling to release commit `2907bde187730aa0486f458e9278cc8c4bbb8f73`. The package-local wrapper
  published `create-mono-stack@0.1.52`; npm reports that version as `latest`.
- Real end-to-end confirmation: `npx --yes create-mono-stack@0.1.52 ... --git-host-alias
github-webknot` against the actual published package completed successfully with no trust
  warning, and the generated project's `packages/*/package.json` scopes were rewritten by the
  `_tasks` script — direct proof the original failure is fixed, not just that the unit tests pass.

## Updates

### 2026-09-11 - Hotfix released

- Release commit: `2907bde187730aa0486f458e9278cc8c4bbb8f73`
  (`fix(create-mono-stack): trust the default Copier template so project creation succeeds`), pushed
  to `origin/master`.
- Tag: annotated `v0.1.52` (`0d9b1948615e20e836c7626edec63ee75fb36eeb`) pushed to origin; peeled ref
  `v0.1.52^{}` is `2907bde187730aa0486f458e9278cc8c4bbb8f73`.
- Publication: `pnpm --filter create-mono-stack publish:package` completed successfully with public
  latest access.
- Verification: `npm view create-mono-stack@latest version` reports `0.1.52`; a real
  `npx create-mono-stack@0.1.52` run reproduced and then confirmed the fix for the exact failure the
  user hit on 0.1.51.
