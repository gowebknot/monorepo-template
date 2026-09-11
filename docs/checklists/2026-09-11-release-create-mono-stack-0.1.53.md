# Release `create-mono-stack` 0.1.53

- Checklist ID: REL-CREATE-MONO-STACK-006
- Created: 2026-09-11
- Planning completed: 2026-09-11
- Type: Patch release (hotfix)
- Source request: user reported a second live failure from a real interactive
  `pnpm create mono-stack@0.1.52` run (past the fixed `--trust` step, now failing on a native
  Vite React+TS scaffold reading a missing `apps/web/AGENTS.md`); explicitly authorized shipping
  the fix as an immediate 0.1.53 patch release once it was implemented and validated.
- Related checklists:
  - [Use the Managed Template for Fresh Native Scaffolding](2026-09-11-native-scaffold-managed-template.md)
  - [Trust the Default Copier Template](2026-09-11-copier-trust-default-template.md)
  - [Release create-mono-stack 0.1.52](2026-09-11-release-create-mono-stack-0.1.52.md)
- Affected paths: `core/create-mono-stack/package.json`, `core/create-mono-stack/test/cli.test.js`,
  `core/create-mono-stack/src/native-scaffold.js`,
  `core/create-mono-stack/test/native-scaffold-managed-template.test.js` (new),
  `core/create-mono-stack/test/native-scaffold-overlays.test.js`,
  `core/create-mono-stack/test/native-scaffold.test.js`, this checklist.
- Status legend: `[ ]` pending, `[/]` partial or blocked, `[x]` complete

## Change Tier

- Tier: standard
- Disqualifiers: the release publishes a public npm artifact and changes fresh-project scaffolding
  behavior (reference files for every native profile now come from the curated managed template
  instead of this repo's own live `apps/*` directories).

## Implementation Description

Release `create-mono-stack` 0.1.53 as a second hotfix following 0.1.52. `scaffoldNativeApps()`
called `applyReferenceProfile()` without `useManagedTemplate: true`, so it read each reference
profile's files (`AGENTS.md`, `CLAUDE.md`, source overlays) from the copier-rendered
`apps/<canonical>/` in the destination project (this repo's own live `apps/web/`, `apps/server/`,
etc.) instead of the stable, curated `core/create-mono-stack/reference-templates/managed/<name>/`
copy that `project-management.js`'s `addApp()` (the `create-mono-stack manage` flow) already
correctly uses. `apps/web/` has never had an `AGENTS.md` or `CLAUDE.md` in this repo's history, so
every fresh project creation that resolves the Vite React+TypeScript reference profile fails with
`ENOENT ... apps/web/AGENTS.md` right after native Vite scaffolding completes — confirmed live by a
user's real interactive run immediately after the 0.1.52 release fixed the earlier `--trust` issue.
The fix (see the linked "Use the Managed Template" checklist for full detail) adds
`useManagedTemplate: true` to that one `applyReferenceProfile()` call site, matching `addApp()`'s
established pattern. This also corrects the same latent gap for the `server`/`next`/`expo`/`mobile`
profiles, which happened not to be visibly broken only because this repo's own `apps/server/`,
`apps/next/`, `apps/expo/`, and `apps/mobile/` currently have the files those profiles expect.

## Implementation Contract

### Feature Boundaries

- Included: the `useManagedTemplate: true` fix, a new real-filesystem regression test, updates to
  12 existing tests whose synthetic fixtures had masked this exact gap, package/fixture version
  markers, release record, release validation, pushed release commit and annotated tag,
  wrapper-based npm publication.
- Excluded: any other CLI behavior change, `reference-profiles.js` profile definitions, and
  `createNativeScaffoldFixture`'s now-partially-redundant synthetic `apps/*` fixture writes (left
  as-is; still used by native-file-preservation assertions in the same tests).
- Ownership: `core/create-mono-stack` owns the published CLI; `native-scaffold.js` owns fresh-project
  native scaffolding; `reference-profiles.js` owns `applyReferenceProfile()`, shared with
  `project-management.js`'s `addApp()`.

### Route-Group Ownership

| Route group           | Entry point                                              | Owner                      | Result                                         |
| --------------------- | -------------------------------------------------------- | -------------------------- | ---------------------------------------------- |
| Fresh native scaffold | `scaffoldNativeApps()` calling `applyReferenceProfile()` | create-mono-stack launcher | Reference files come from the managed template |
| Release artifact      | `npm pack --dry-run`                                     | create-mono-stack package  | Inspectable 0.1.53 tarball                     |
| Release publish       | `pnpm --filter create-mono-stack publish:package`        | package-local wrapper      | Public npm package after remote tag            |

### User Journey

1. A user creates a new project selecting a Vite React+TypeScript reference profile interactively
   (or non-interactively) and native scaffolding fails with `ENOENT ... apps/web/AGENTS.md`.
2. The package version and template fixture move to 0.1.53; the `useManagedTemplate` fix and its
   regression tests are already committed and validated (see the linked checklist).
3. The release commit is pushed, annotated as `v0.1.53`, and the tag is pushed.
4. The wrapper publishes the verified artifact; npm latest and the remote tag identify 0.1.53.
5. A user creating a project with any native reference profile completes scaffolding successfully,
   reading reference files from the maintained managed template.

### Complete Test Matrix

| Test ID          | Intent                | Path               | Expected result                                             | Test place      | Limitation                      |
| ---------------- | --------------------- | ------------------ | ----------------------------------------------------------- | --------------- | ------------------------------- |
| TEST-RELEASE-050 | Version marker        | valid              | Manifest and fixture both use 0.1.53; launcher suite passes | package test    | Does not prove registry state   |
| TEST-RELEASE-051 | Repository validation | valid/failure gate | `just check` exits 0; failures stop release                 | repository gate | Does not inspect artifact       |
| TEST-RELEASE-052 | Artifact inspection   | valid              | Dry-run tarball is 0.1.53 and excludes credentials/tests    | npm pack        | Does not publish                |
| TEST-RELEASE-053 | Publish verification  | valid/failure gate | Pushed tag peels to release commit and npm latest is 0.1.53 | Git/npm         | Requires network and local auth |

### Unresolved Conflicts

None found. The user explicitly authorized shipping this as an immediate patch release once the fix
was implemented and validated; package and repository instructions prescribe the commit, push, tag,
then publish order, which this release follows.

## Acceptance Criteria

- [x] `core/create-mono-stack/package.json` and the CLI fixture state `0.1.53` / `v0.1.53`.
- [x] Package suite, full repository gate, and dry-run artifact validation pass.
- [ ] The release commit and annotated `v0.1.53` tag are pushed to `origin` before publication.
- [ ] The package-local wrapper publishes `create-mono-stack@0.1.53`; npm latest and remote tag
      confirm it.

## Exact Test Cases

### TEST-RELEASE-050 version metadata

- Small task: align the package version and CLI template-revision fixture.
- Source: `core/create-mono-stack/package.json`, `core/create-mono-stack/test/cli.test.js`, and
  `release-flow`.
- Test place: `pnpm --filter create-mono-stack test`.
- Starting state: package and fixture use 0.1.52; npm latest is 0.1.52.
- Exact input or fixture: `0.1.53` and `_commit: v0.1.53\n`.
- Interaction steps: update the two version markers and run the package suite.
- Main behavior: the launcher test fixture tracks the released package version.
- Expected result: suite passes with both markers at 0.1.53.
- Must change: exactly the manifest and fixture version strings.
- Must not happen: no launcher behavior or unrelated fixture changes.
- Planned command: `pnpm --filter create-mono-stack test`.
- Expected result before the code change: suite passes at 0.1.52; no fixture expects v0.1.53.
- First observed run: 2026-09-11, updated both markers to 0.1.53 and ran the suite.
- Passing rerun: 2026-09-11, `pnpm --filter create-mono-stack test` passed: 280/280, both markers at
  0.1.53.

### TEST-RELEASE-051 release validation

- Small task: validate all shipped repository behavior before release.
- Source: root and package `AGENTS.md`, `release-flow`.
- Test place: `just check`, plus `pnpm --filter create-mono-stack lint`/`typecheck`.
- Starting state: versioned release candidate with the `useManagedTemplate` fix and its regression
  tests applied.
- Exact input or fixture: repository HEAD with no bypass flags.
- Interaction steps: run `just check`, `pnpm --filter create-mono-stack lint`,
  `pnpm --filter create-mono-stack typecheck`.
- Main behavior: all required build, lint, type, skills, template, and test checks pass.
- Expected result: exit 0 on every command.
- Must change: no source file beyond recorded validation state.
- Must not happen: a hook/check bypass or publication after a failed gate.
- Planned command: `just check`.
- Expected result before the code change: prior committed state (0.1.52) passes; candidate version
  and the `useManagedTemplate` fix are absent.
- First observed run: 2026-09-11, `just check` exited 0 with the fix, its regression tests, and
  both version markers already applied.
- Passing rerun: 2026-09-11, same as first observed run; `pnpm --filter create-mono-stack lint` and
  `pnpm --filter create-mono-stack typecheck` also passed cleanly.

### TEST-RELEASE-052 artifact inspection

- Small task: inspect the exact npm artifact before publishing.
- Source: `core/create-mono-stack/AGENTS.md` and `release-flow`.
- Test place: `npm pack --dry-run` within the package.
- Starting state: validated 0.1.53 package source.
- Exact input or fixture: `pnpm --filter create-mono-stack exec npm pack --dry-run`.
- Interaction steps: run the dry pack and inspect version and file list.
- Main behavior: public artifact contains only declared package files and no auth material.
- Expected result: 0.1.53 tarball; no `.npmrc*`, package test directory, or node_modules.
- Must change: no generated tarball (dry run only).
- Must not happen: publishing an uninspected or credential-containing artifact.
- Planned command: `pnpm --filter create-mono-stack exec npm pack --dry-run`.
- Expected result before the code change: reports 0.1.52.
- First observed run: 2026-09-11, dry run reported `create-mono-stack-0.1.53.tgz`, 299 files,
  617.0 kB packed, 1.0 MB unpacked; same file set as 0.1.52 aside from the fixed source/test files.
- Passing rerun: 2026-09-11, same as first observed run — no code change was needed after inspection.

### TEST-RELEASE-053 remote and registry verification

- Small task: verify the immutable release tag and npm publication.
- Source: `release-flow`, package publish wrapper, and user authorization.
- Test place: `git ls-remote` and `npm view`.
- Starting state: clean release commit and annotated `v0.1.53` pushed to origin.
- Exact input or fixture: `v0.1.53`, expected release commit SHA, package `create-mono-stack@0.1.53`.
- Interaction steps: push commit, create/push tag, publish with wrapper, query tag and registry.
- Main behavior: Git and npm identify the same release version.
- Expected result: remote peeled tag matches the release commit; npm latest version is 0.1.53.
- Must change: origin branch/tag and npm registry metadata.
- Must not happen: direct npm publish, credentials in Git, or publish before the pushed tag.
- Planned command: `git ls-remote --tags origin v0.1.53 && npm view create-mono-stack@latest version`.
- Expected result before the code change: tag does not exist and npm latest is 0.1.52.
- First observed run: pending.
- Passing rerun: pending.

## Missing-Case Review

1. Version marker maps to TEST-RELEASE-050; release gate to 051; artifact to 052; push/tag/publish
   to 053. The functional fix itself (`useManagedTemplate: true`) is covered by TEST-MANAGED-001
   and the 12 updated pre-existing tests in the linked "Use the Managed Template" checklist, not
   re-derived here.
2. This is a hotfix release; no new acceptance criteria beyond confirming the fix ships and the
   registry reflects it.
3. Invalid form/API/auth/data boundary cases do not apply: fixed version strings only, no runtime
   endpoint, contract, or authorization change beyond the already-covered scaffolding fix.
4. The only retry/duplicate outcome is registry rejection of a duplicate version; not exercised
   intentionally because npm publications are irreversible.
5. Known limitation: this release was not re-verified with a full, real, interactive
   `npx create-mono-stack@0.1.53` run driving the actual Vite CLI's framework/variant/linter
   prompts (the exact path that reproduced the live failure) — that requires answering an
   interactive PTY prompt, which was not practical to automate here. Confidence instead comes from
   TEST-MANAGED-001 (a real-filesystem unit test reproducing and fixing the identical `ENOENT` on
   `apps/web/AGENTS.md`) plus the full updated regression suite covering every native profile
   against real managed-template content.

## Implementation Plan

- [x] Set `core/create-mono-stack/package.json` version to 0.1.53.
- [x] Set the CLI fixture to `_commit: v0.1.53`.
- [x] Record TEST-RELEASE-050 through 052 validation results in this checklist.
- [ ] Commit release metadata with hooks, push `master`, create/push annotated `v0.1.53`.
- [ ] Publish with the package wrapper and record TEST-RELEASE-053 evidence.

## Validation Notes

- Registry baseline: `npm view create-mono-stack version` (before this release) is `0.1.52`.
- TEST-RELEASE-050: `pnpm --filter create-mono-stack test` passed at 0.1.53 (280/280).
- TEST-RELEASE-052: dry run produced `create-mono-stack-0.1.53.tgz`, 299 files, 617.0 kB packed,
  1.0 MB unpacked; excludes the package `test/` directory, `node_modules`, and `.npmrc*`.
