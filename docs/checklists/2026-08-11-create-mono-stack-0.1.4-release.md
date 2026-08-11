# create-mono-stack 0.1.4 Release

- Checklist ID: CHECKLIST-20260811-create-mono-stack-0.1.4-release
- Created: 2026-08-11
- Planning completed: 2026-08-11
- Type: npm package release
- Source request: Bump, commit, push, and publish the newest `create-mono-stack` changes.
- Related checklists:
  - [Project npm auth warning](./2026-08-11-project-npm-auth-warning.md)
  - [Checklist lifecycle policy](./2026-08-11-checklist-lifecycle.md)
- Affected package: `core/create-mono-stack`
- Target version: `0.1.4`
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Release Assessment

- [x] Confirm the current published version is `0.1.3` and `0.1.3` is the npm `latest` tag.
- [x] Classify the Ink TUI as additive and backward-compatible.
- [x] Confirm no database, API contract, migration, environment, or generated-project migration is required.
- [x] Follow the repository's established version-only release commit convention.
- [x] Confirm the release requires commit, push, and publish operations explicitly authorized by the user.

## Release Notes

- Add the Ink-powered zero-argument interactive project setup TUI.
- Preserve explicit CLI arguments and non-TTY behavior.
- Support keyboard navigation, cancellation, screen-reader interaction, and safe option handling.
- No breaking changes or consumer migration steps.

## Implementation Plan

- [x] Bump `core/create-mono-stack/package.json` from `0.1.3` to `0.1.4`.
- [x] Run focused package tests and lint.
- [x] Run repository format/type/lint/template checks.
- [x] Build and inspect the npm package artifact without publishing it.
- [ ] Commit the version change using the release commit convention.
- [ ] Push `master` to `origin` and verify the remote commit.
- [ ] Publish `create-mono-stack@0.1.4` to npm.
- [ ] Verify npm `latest` metadata and the published package version.

## Validation Cases

- [x] TEST-RELEASE-001: Package manifest reports exactly `0.1.4`.
- [x] TEST-RELEASE-002: Launcher test suite passes.
- [x] TEST-RELEASE-003: Launcher lint and repository checks pass.
- [x] TEST-RELEASE-004: Packed artifact contains the executable, Ink source, runtime dependencies, README, and requirements.
- [ ] TEST-RELEASE-005: Commit contains only the intended release metadata and checklist changes.
- [ ] TEST-RELEASE-006: `origin/master` contains the release commit before npm publish.
- [ ] TEST-RELEASE-007: npm `latest` resolves to `0.1.4` after publish.

## Verification Plan

- [x] Run `pnpm --filter create-mono-stack test`.
- [x] Run `pnpm --filter create-mono-stack lint`.
- [x] Run `just check`.
- [x] Run `pnpm pack --pack-destination <temporary-directory>` and inspect the tarball contents.
- [ ] Inspect status, diff, and recent history before committing.
- [ ] Run the commit hooks without bypasses.
- [ ] Verify clean status and remote tracking after the commit.
- [ ] Publish only after the remote commit is confirmed.
- [ ] Verify npm metadata after publishing.

## Validation Notes

Record failures before correction and passing reruns afterward.

- 2026-08-11: Package version assertion passed for `0.1.4`.
- 2026-08-11: `pnpm --filter create-mono-stack test` passed with 55/55 tests.
- 2026-08-11: `pnpm --filter create-mono-stack lint` passed.
- 2026-08-11: `just check` passed; the existing web React Compiler warning remains non-failing.
- 2026-08-11: Packed artifact `create-mono-stack-0.1.4.tgz` contains the executable, Ink source, package metadata, README, license, and Copier requirements.
