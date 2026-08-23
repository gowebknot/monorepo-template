# create-mono-stack 0.1.34 Release

- Checklist ID: CHECKLIST-20260823-create-mono-stack-0.1.34-release
- Created: 2026-08-23
- Planning completed: 2026-08-23
- Type: Patch release
- Source request: User explicitly authorized version bump, commit, push, tag, and publish.
- Related release: [create-mono-stack 0.1.33 Release](./2026-08-23-create-mono-stack-0.1.33-release.md)
- Related implementation: [Expand E2E Negative Paths and Add Maestro Writing Skill](./2026-08-23-expand-e2e-negative-path-and-maestro-skill.md)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Release the E2E authoring guidance and synchronized Maestro skill as `create-mono-stack@0.1.34`.
- Bump `core/create-mono-stack/package.json` from `0.1.33` to `0.1.34`.
- Update the current-template revision fixture to expect `v0.1.34`.
- Validate, commit with hooks, push `master`, create and push annotated tag `v0.1.34`, then publish
  through the package-local wrapper.

## Impact Review

- Change type: Template/agent guidance addition and patch release metadata.
- Public launcher API: No intentional command or argument breaking change.
- Generated projects: New portable E2E guidance is available; no runtime application behavior changes.
- Database, migrations, environment, security, and observability changes: None.
- Rollback: Use the prior package/tag; do not overwrite remote history.

## Exact Test Cases

### TEST-RELEASE-001: Version, fixture, and artifact

- Small task: Bump the package version and verify its npm artifact.
- Source: Package manifest, current-template fixture, and package files allowlist.
- Test place: `core/create-mono-stack/package.json`, `test/cli.test.js`, and npm pack dry-run.
- Starting state: Package version and fixture revision are `0.1.33` and `v0.1.33`.
- Exact input or fixture: Version `0.1.34` and fixture revision `v0.1.34`.
- Interaction steps: Update both files, run package tests, and inspect the dry-run artifact.
- Main behavior: The release artifact reports the intended version without credentials.
- Expected result: Artifact reports `create-mono-stack@0.1.34` and contains no credentials.
- Must change: Package version and matching fixture revision.
- Must not happen: No `.npmrc.auth` content or unrelated files enter the artifact.
- Planned command: `pnpm --filter create-mono-stack test` and `pnpm --filter create-mono-stack exec npm pack --dry-run`
- Expected result before the code change: Package and fixture report `0.1.33`.
- First observed run: Before the bump, the package and fixture reported `0.1.33`.
- Passing rerun: Package tests passed all 264 tests; npm pack dry-run reported
  `create-mono-stack@0.1.34`, 288 files, and no credentials.

### TEST-RELEASE-002: Repository validation

- Small task: Verify the release candidate before committing.
- Source: Root and package validation guidance.
- Test place: `just check`, package lint/test, artifact dry-run, and whitespace check.
- Starting state: Release changes are versioned `0.1.34` and not committed.
- Exact input or fixture: Current worktree with only intended implementation, checklist, version, and
  fixture changes.
- Interaction steps: Run package checks, root checks, inspect the artifact, and check whitespace.
- Main behavior: The candidate is formatted, tested, and publishable.
- Expected result: All commands exit zero without bypass flags.
- Must change: No source files during validation.
- Must not happen: No skipped hooks or disabled checks.
- Planned command: `pnpm --filter create-mono-stack lint`, `just check`, and `git diff --check`
- Expected result before the code change: The candidate is not yet versioned `0.1.34`.
- First observed run: The release candidate was not yet versioned `0.1.34`.
- Passing rerun: Package lint, `just check`, and `git diff --check` passed. The repository gate passed
  build, lint, typecheck, format, skill checks/tests, template tests, unit tests, and API E2E tests.

### TEST-RELEASE-003: Commit, push, and tag

- Small task: Publish the release commit and immutable version tag.
- Source: User authorization and repository Git safety rules.
- Test place: Local Git state and `origin` remote refs.
- Starting state: Validation passes; intended changes are unstaged; `v0.1.34` does not exist.
- Exact input or fixture: `chore(release): prepare create-mono-stack 0.1.34`; annotated tag `v0.1.34`.
- Interaction steps: Inspect status/diff/log, commit with hooks, push `master`, create and push tag.
- Main behavior: Remote branch and tag identify the same release commit.
- Expected result: `origin/master` and `v0.1.34` point to the release commit.
- Must change: Local and remote Git history and the version tag.
- Must not happen: No amend, force-push, skipped hooks, or unrelated staged files.
- Planned command: `git push origin master`, `git tag -a v0.1.34 -m "Release v0.1.34"`, and `git push origin v0.1.34`
- Expected result before the code change: No release commit or `v0.1.34` tag exists remotely.
- First observed run:
- Passing rerun:

### TEST-RELEASE-004: Publish npm package

- Small task: Publish the CLI through the authenticated repository wrapper.
- Source: Package-local publish wrapper and explicit user authorization.
- Test place: npm registry through `pnpm --filter create-mono-stack publish:package`.
- Starting state: Release commit and tag are pushed; worktree is clean; auth config exists.
- Exact input or fixture: `create-mono-stack@0.1.34`.
- Interaction steps: Run the package-local wrapper and query npm metadata.
- Main behavior: The intended CLI version is published.
- Expected result: npm reports version `0.1.34` as `latest`.
- Must change: npm registry metadata only.
- Must not happen: No direct npm publish or credentials in Git.
- Planned command: `pnpm --filter create-mono-stack publish:package` and `npm view create-mono-stack@0.1.34 version dist-tags --json`
- Expected result before the code change: `0.1.34` is not published.
- First observed run:
- Passing rerun:

## Release Steps

- [x] Bump package version and current-template fixture.
- [x] Run and record release validation.
- [ ] Inspect final diff and stage only intended files.
- [ ] Commit with a Conventional Commit message and passing hooks.
- [ ] Push `master`.
- [ ] Create and push annotated `v0.1.34`.
- [ ] Publish with `pnpm --filter create-mono-stack publish:package`.
- [ ] Verify remote refs, npm metadata, artifact, and final status.

## Risks And Follow-Up

- npm publication is irreversible for this version; corrections require a new patch version.
- Do not publish if authentication is missing or package validation fails.
