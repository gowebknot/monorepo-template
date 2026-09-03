# Release `create-mono-stack` 0.1.50

- Checklist ID: REL-CREATE-MONO-STACK-003
- Created: 2026-09-03
- Planning completed: 2026-09-03
- Type: Patch release
- Source request: "publish both the commit to npn" (interpreted as publishing the two committed,
  currently unreleased changes through npm).
- Related checklists:
  - [Scaffold Claude guidance](./2026-09-03-scaffold-claude-guidance.md)
  - [Release create-mono-stack 0.1.49](./2026-09-01-release-create-mono-stack-0.1.49.md)
- Affected paths: `core/create-mono-stack/package.json`,
  `core/create-mono-stack/test/cli.test.js`, this checklist.
- Status legend: `[ ]` pending, `[/]` partial or blocked, `[x]` complete

## Change Tier

- Tier: standard
- Disqualifiers: the release adds a behavior-locking version-fixture assertion and publishes a public
  npm artifact. The two shipped features were already implemented and validated in their own commits.

## Implementation Description

Release `create-mono-stack` 0.1.50, carrying the unreleased commits that add `CLAUDE.md` bridges to
new packages and managed Vite React apps, production Swagger documentation to the managed NestJS
template, and portable skill-trigger enforcement for contract changes. This is additive template
behavior: generated projects receive the new guidance and API documentation on their next creation
or template update. There are no API-breaking changes, migrations, database, environment, security,
or credential changes.

## Implementation Contract

### Feature Boundaries

- Included: package/fixture version marker, release record, release validation, pushed release commit
  and annotated tag, and wrapper-based npm publication.
- Excluded: new product implementation, direct npm publishing, credential changes, migrations, and
  modifying historical checklists.
- Ownership: `core/create-mono-stack` owns the published CLI; committed template source owns the
  shipped generated-project behavior; the package-local wrapper owns authenticated publication.

### Route-Group Ownership

| Route group      | Entry point                                       | Owner                     | Result                              |
| ---------------- | ------------------------------------------------- | ------------------------- | ----------------------------------- |
| Release artifact | `npm pack --dry-run`                              | create-mono-stack package | Inspectable 0.1.50 tarball          |
| Release publish  | `pnpm --filter create-mono-stack publish:package` | package-local wrapper     | Public npm package after remote tag |

### User Journey

1. A maintainer starts from the two committed changes and npm version 0.1.49.
2. The package version and template fixture move to 0.1.50 and all checks pass.
3. The release commit is pushed, annotated as `v0.1.50`, and the tag is pushed.
4. The wrapper publishes the verified artifact; npm latest and the remote tag identify 0.1.50.
5. Any validation, push, tag, or publish failure stops the release without bypassing checks.

### Complete Test Matrix

| Test ID          | Intent                | Path               | Expected result                                             | Test place      | Limitation                      |
| ---------------- | --------------------- | ------------------ | ----------------------------------------------------------- | --------------- | ------------------------------- |
| TEST-RELEASE-020 | Version marker        | valid              | Manifest and fixture both use 0.1.50; launcher suite passes | package test    | Does not prove registry state   |
| TEST-RELEASE-021 | Repository validation | valid/failure gate | `just check` exits 0; failures stop release                 | repository gate | Does not inspect artifact       |
| TEST-RELEASE-022 | Artifact inspection   | valid              | Dry-run tarball is 0.1.50 and excludes credentials/tests    | npm pack        | Does not publish                |
| TEST-RELEASE-023 | Publish verification  | valid/failure gate | Pushed tag peels to release commit and npm latest is 0.1.50 | Git/npm         | Requires network and local auth |

### Unresolved Conflicts

- None found. The user explicitly authorized npm publication; package and repository instructions prescribe
  the commit, push, tag, then publish order.

## Acceptance Criteria

- [x] `core/create-mono-stack/package.json` and the CLI fixture state `0.1.50` / `v0.1.50`.
- [x] Package suite, full repository gate, and dry-run artifact validation pass.
- [x] The release commit and annotated `v0.1.50` tag are pushed to `origin` before publication.
- [x] The package-local wrapper publishes `create-mono-stack@0.1.50`; npm latest and remote tag
      confirm it.

## Exact Test Cases

### TEST-RELEASE-020 version metadata

- Small task: align the package version and CLI template-revision fixture.
- Source: `core/create-mono-stack/package.json`, `core/create-mono-stack/test/cli.test.js`, and
  `release-flow`.
- Test place: `pnpm --filter create-mono-stack test`.
- Starting state: package and fixture use 0.1.49; npm latest is 0.1.49.
- Exact input or fixture: `0.1.50` and `_commit: v0.1.50\n`.
- Interaction steps: update the two version markers and run the package suite.
- Main behavior: the launcher test fixture tracks the released package version.
- Expected result: suite passes with both markers at 0.1.50.
- Must change: exactly the manifest and fixture version strings.
- Must not happen: no launcher behavior or unrelated fixture changes.
- Planned command: `pnpm --filter create-mono-stack test`.
- Expected result before the code change: suite passes at 0.1.49; no fixture expects v0.1.50.
- First observed run: 2026-09-03, `pnpm --filter create-mono-stack test` passed at 0.1.49 before
  the version-marker update.
- Passing rerun: 2026-09-03, `pnpm --filter create-mono-stack test` passed at 0.1.50.

### TEST-RELEASE-021 release validation

- Small task: validate all shipped repository behavior before release.
- Source: root and package `AGENTS.md`, `release-flow`.
- Test place: `just check`.
- Starting state: versioned release candidate in a clean worktree.
- Exact input or fixture: repository HEAD with no bypass flags.
- Interaction steps: run the local release gate.
- Main behavior: all required build, lint, type, skills, template, and test checks pass.
- Expected result: exit 0; existing React Compiler warnings may remain warnings only.
- Must change: no source file beyond recorded validation state.
- Must not happen: a hook/check bypass or publication after a failed gate.
- Planned command: `just check`.
- Expected result before the code change: prior committed state passes; candidate version is absent.
- First observed run: pending; this gate runs against the 0.1.50 candidate after the marker update.
- Passing rerun: 2026-09-03, dry run reported `create-mono-stack-0.1.50.tgz` with 299 files.

### TEST-RELEASE-022 artifact inspection

- Small task: inspect the exact npm artifact before publishing.
- Source: `core/create-mono-stack/AGENTS.md` and `release-flow`.
- Test place: `npm pack --dry-run` within the package.
- Starting state: validated 0.1.50 package source.
- Exact input or fixture: `pnpm --filter create-mono-stack exec npm pack --dry-run`.
- Interaction steps: run the dry pack and inspect version and file list.
- Main behavior: public artifact contains only declared package files and no auth material.
- Expected result: 0.1.50 tarball; no `.npmrc*`, package test directory, or node_modules.
- Must change: no generated tarball (dry run only).
- Must not happen: publishing an uninspected or credential-containing artifact.
- Planned command: `pnpm --filter create-mono-stack exec npm pack --dry-run`.
- Expected result before the code change: reports 0.1.49.
- First observed run: 2026-09-03, dry run reported `create-mono-stack-0.1.49.tgz` with 299 files
  before the version-marker update.
- Passing rerun: 2026-09-03, `just check` passed after formatting the release checklist.

### TEST-RELEASE-023 remote and registry verification

- Small task: verify the immutable release tag and npm publication.
- Source: `release-flow`, package publish wrapper, and user authorization.
- Test place: `git ls-remote` and `npm view`.
- Starting state: clean release commit and annotated `v0.1.50` pushed to origin.
- Exact input or fixture: `v0.1.50`, expected release commit SHA, package `create-mono-stack@0.1.50`.
- Interaction steps: push commit, create/push tag, publish with wrapper, query tag and registry.
- Main behavior: Git and npm identify the same release version.
- Expected result: remote peeled tag matches the release commit; npm latest version is 0.1.50.
- Must change: origin branch/tag and npm registry metadata.
- Must not happen: direct npm publish, credentials in Git, or publish before the pushed tag.
- Planned command: `git ls-remote --tags origin v0.1.50 && npm view create-mono-stack@latest version`.
- Expected result before the code change: tag does not exist and npm latest is 0.1.49.
- First observed run: pending.
- Passing rerun: pending.

## Missing-Case Review

1. Version marker maps to TEST-RELEASE-020; release gate to 021; artifact to 022; push/tag/publish
   to 023.
2. The release ordering and wrapper-only publish rule map to TEST-RELEASE-023; no-bypass rule maps
   to TEST-RELEASE-021.
3. Invalid form/API/auth/data boundary cases do not apply: this release accepts fixed version strings
   and has no runtime endpoint, interface, credentials, migration, or authorization behavior change.
4. The only retry/duplicate outcome is registry rejection of a duplicate version; it is not exercised
   intentionally because npm publications are irreversible.
5. Each case states exact versions, commands, expected results, and pending observed-result fields.

## Implementation Plan

- [x] Set `core/create-mono-stack/package.json` version to 0.1.50.
- [x] Set the CLI fixture to `_commit: v0.1.50`.
- [x] Record TEST-RELEASE-020 through 022 validation results in this checklist.
- [x] Commit release metadata with hooks, push `master`, create/push annotated `v0.1.50`.
- [x] Publish with the package wrapper and record TEST-RELEASE-023 evidence.

## Validation Notes

- Registry baseline: `npm view create-mono-stack version` returned `0.1.49` on 2026-09-03.
- TEST-RELEASE-020: `pnpm --filter create-mono-stack test` passed at 0.1.50.
- TEST-RELEASE-022: dry run produced `create-mono-stack-0.1.50.tgz`, 299 files, 617.3 kB packed,
  1.0 MB unpacked; it excludes the package `test/` directory, `node_modules`, and `.npmrc*`.
- TEST-RELEASE-021 first run: `just check` reached `pnpm format:check` and failed only because this
  checklist needed Prettier formatting. No build, lint, or typecheck error occurred before the gate
  stopped.
- TEST-RELEASE-021 passing rerun: `just check` passed after Prettier formatted this checklist. The
  only non-error output remains the existing React Compiler warnings in the web and Next table demos.
- TEST-RELEASE-023: `v0.1.50` was pushed as annotated tag `4a63dc8931f3d8d689fa1288e6760df647345ce2`,
  peeling to release commit `0c23736fa798246ee9db45a6ddb2ada32c5e46ef`. The package-local wrapper
  published `create-mono-stack@0.1.50`; npm reports that version as `latest`.

## Updates

### 2026-09-03 - Release completed

- Release commit: `0c23736fa798246ee9db45a6ddb2ada32c5e46ef`
  (`chore(release): prepare create-mono-stack 0.1.50`), pushed to `origin/master` with the two
  requested feature commits.
- Tag: annotated `v0.1.50` (`4a63dc8931f3d8d689fa1288e6760df647345ce2`) pushed to origin;
  peeled ref `v0.1.50^{}` is `0c23736fa798246ee9db45a6ddb2ada32c5e46ef`.
- Publication: `pnpm --filter create-mono-stack publish:package` completed successfully with public
  latest access.
- Verification: `npm view create-mono-stack@0.1.50 version dist-tags --json` reports version and
  `latest` as `0.1.50`; `npm view create-mono-stack@latest version` also reports `0.1.50`.
