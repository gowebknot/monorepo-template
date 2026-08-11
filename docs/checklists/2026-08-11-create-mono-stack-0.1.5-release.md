# create-mono-stack 0.1.5 Release

- Checklist ID: CHECKLIST-20260811-create-mono-stack-0.1.5-release
- Created: 2026-08-11
- Planning completed: 2026-08-11
- Type: npm package release
- Source request: Bump, commit, push, and publish the current create-mono-stack changes.
- Related checklists:
  - [Previous 0.1.4 release](./2026-08-11-create-mono-stack-0.1.4-release.md)
  - [Selectable TUI presets](./2026-08-11-tui-selectable-presets.md)
- Affected package: `core/create-mono-stack`
- Target version: `0.1.5`
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Release Assessment

- [x] Confirm the current package version and release history.
- [x] Classify the changes as additive and backward-compatible.
- [x] Confirm no database, API contract, migration, environment, or generated-project migration is required.
- [x] Confirm commit, push, and npm publication are explicitly authorized by the user.

## Release Notes

- Improve the Ink TUI with practical selectable presets, Back navigation, and Custom fallbacks.
- Discover device-specific destinations, Python runtimes, SSH aliases, local templates, and revisions.
- Show source paths and provenance for detected choices.
- Preserve explicit CLI arguments and non-TTY behavior.

## Implementation Plan

- [x] Bump `core/create-mono-stack/package.json` from `0.1.4` to `0.1.5`.
- [x] Run focused package tests, lint, formatting, and repository checks.
- [x] Pack and inspect the npm artifact.
- [ ] Inspect the complete diff and stage intended release changes.
- [ ] Commit with the repository's Conventional Commit release convention.
- [ ] Push `master` to `origin` and verify the remote commit.
- [ ] Publish `create-mono-stack@0.1.5` with `pnpm --filter create-mono-stack publish:package`.
- [ ] Verify npm metadata and the published package version.

## Validation Cases

- [ ] TEST-RELEASE-001: Package manifest reports exactly `0.1.5`.
- [ ] TEST-RELEASE-002: Launcher test suite passes.
- [ ] TEST-RELEASE-003: Lint, format, and repository checks pass.
- [ ] TEST-RELEASE-004: Packed artifact contains the executable, source, README, license, and requirements.
- [ ] TEST-RELEASE-005: Remote contains the release commit before publication.
- [ ] TEST-RELEASE-006: npm `latest` resolves to `0.1.5` after publication.

## Verification Notes

Record failures before correction and passing reruns afterward.

- 2026-08-11: `just check` passed; the existing web React Compiler warning remains non-failing.
- 2026-08-11: `npm pack --dry-run` produced the expected `create-mono-stack-0.1.5.tgz` contents.
- 2026-08-11: `npm whoami` failed with `E401 Unauthorized`; publication is blocked until npm authentication is restored.
- 2026-08-11: `just check` initially failed because the extracted `wizard-discovery.js` needed Prettier formatting; no functional check failed.

## Risks and Follow-Up

- [ ] npm authentication or registry access may block publication.
