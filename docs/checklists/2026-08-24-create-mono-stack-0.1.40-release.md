# create-mono-stack 0.1.40 Release

- Checklist ID: CHECKLIST-20260824-create-mono-stack-0.1.40-release
- Created: 2026-08-24
- Planning completed: 2026-08-24
- Type: Patch release
- Source request: User requested release after setup automation and wizard timing fixes.
- Related release: [create-mono-stack 0.1.39 Release](./2026-08-24-create-mono-stack-0.1.39-release.md)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Release `create-mono-stack` `0.1.40` with the generated-project `just setup` bootstrap flow.
- Prompt interactive users to approve dependency installation, Docker Compose startup, and workspace build after generation.
- Preserve a manual `cd <project> && just setup` path for declined and non-interactive creation.
- Stabilize Ink wizard frame assertions after redraws.
- Include the containerized development services, environment defaults, Postgres helper, and related template updates already present in the worktree.

## Impact Review

- Change type: Additive setup automation and test reliability fix; patch release metadata.
- Public launcher behavior: Interactive creation adds an explicit opt-in setup prompt; non-interactive creation remains non-blocking.
- Generated projects: `Justfile` adds `setup`, which installs the frozen lockfile, starts Compose dependencies, and builds the workspace.
- Operational requirements: Approved setup requires `just`, `pnpm`, and a Docker-compatible runtime; QEMU may require Linux KVM support.
- Database and environment impact: Generated projects use the previously added Postgres/Redis Compose defaults; reference SQLite support remains unchanged.
- Security impact: Setup runs only after explicit interactive approval; no credentials are added to the artifact.
- Rollback: Use the prior package/tag; do not overwrite remote history.

## Exact Test Cases

### TEST-RELEASE-001: Version and fixture alignment

- Small task: Bump the launcher patch version and current-template fixture.
- Source: Package manifest, current-template fixture, and release request.
- Test place: `core/create-mono-stack/package.json`, `core/create-mono-stack/test/cli.test.js`.
- Starting state: Version `0.1.39`; fixture expects `v0.1.39`.
- Exact input or fixture: Version `0.1.40` and fixture revision `v0.1.40`.
- Interaction steps: Update metadata and run launcher tests.
- Main behavior: Package metadata and current-template expectations agree.
- Expected result: Tests pass and all current revision fixtures use `v0.1.40`.
- Must change: Version metadata and exact fixture references.
- Must not happen: No unrelated version or credential changes.
- Planned command: `pnpm --filter create-mono-stack test`.
- Expected result before the code change: Package and fixture remain at `0.1.39`.
- First observed run:
- Passing rerun:

### TEST-RELEASE-002: Release validation and artifact

- Small task: Verify the release candidate and npm artifact.
- Source: Repository `AGENTS.md`, package release workflow, and release checklist.
- Test place: `just check`, package tests/lint, npm pack dry-run, whitespace check.
- Starting state: Intended changes are uncommitted and package metadata is not yet `0.1.40`.
- Exact input or fixture: Current worktree and package `create-mono-stack@0.1.40`.
- Interaction steps: Run the full gate, inspect the package tarball listing, and check whitespace.
- Main behavior: The release is reproducible, validated, and credential-free.
- Expected result: All checks pass; artifact contains no `.npmrc.auth` or registry credentials.
- Must change: No source changes during validation.
- Must not happen: No bypassed hooks or skipped checks.
- Planned command: `just check && pnpm --filter create-mono-stack exec npm pack --dry-run --json && git diff --check`.
- Expected result before the code change: Candidate metadata is not yet `0.1.40`.
- First observed run:
- Passing rerun:

### TEST-RELEASE-003: Commit, push, and tag

- Small task: Publish the validated release commit and annotated tag.
- Source: Explicit user release request and repository Git safety rules.
- Test place: Local Git state and `origin` refs.
- Starting state: Validation passes; intended files are unstaged; `v0.1.40` does not exist.
- Exact input or fixture: Conventional Commit `chore(release): prepare create-mono-stack 0.1.40`; annotated tag `v0.1.40`.
- Interaction steps: Inspect status/diff/log, stage intended files, commit with hooks, push `master`, create and push the annotated tag.
- Main behavior: Remote branch and tag identify the release commit.
- Expected result: `origin/master` and `v0.1.40` point to the release commit.
- Must change: Local and remote Git history and tag.
- Must not happen: No amend, force-push, hook bypass, or unrelated files.
- Planned command: `git push origin master`, `git tag -a v0.1.40 -m "Release v0.1.40"`, `git push origin v0.1.40`.
- Expected result before the code change: No `v0.1.40` release refs exist.
- First observed run:
- Passing rerun:

### TEST-RELEASE-004: Publish npm package

- Small task: Publish the validated package through the repository wrapper.
- Source: `core/create-mono-stack/scripts/publish.mjs` and package release workflow.
- Test place: npm registry through `pnpm --filter create-mono-stack publish:package`.
- Starting state: Release commit and tag are pushed; worktree is clean; auth config exists.
- Exact input or fixture: `create-mono-stack@0.1.40`.
- Interaction steps: Run the package-local publish wrapper and query npm metadata.
- Main behavior: The intended release is published as `latest`.
- Expected result: npm reports version `0.1.40` as latest.
- Must change: npm registry metadata only.
- Must not happen: No direct `npm publish` or credentials in Git.
- Planned command: `pnpm --filter create-mono-stack publish:package` and `npm view create-mono-stack dist-tags version --json`.
- Expected result before the code change: `0.1.40` is not published.
- First observed run:
- Passing rerun:

## Release Steps

- [ ] Bump package version and matching current-template fixtures.
- [ ] Run and record the full release validation.
- [ ] Inspect final diff and stage only intended files.
- [ ] Commit with a Conventional Commit message and passing hooks.
- [ ] Push `master`.
- [ ] Create and push annotated `v0.1.40`.
- [ ] Publish with `pnpm --filter create-mono-stack publish:package`.
- [ ] Verify remote refs, npm metadata, artifact, and final status.

## Risks And Follow-Up

- npm publication is irreversible for this version; corrections require a new patch version.
- The release includes accumulated container and setup changes; inspect the complete diff before staging.
- Approved setup may fail on hosts without Docker or KVM support; manual rerun guidance remains available.

## Validation Notes

- Version metadata was updated to `0.1.40`; package lint, formatting, whitespace validation, and npm pack dry-run passed. The first full launcher validation reached 268/270 because two unrelated Ink interaction cases exceeded the test helper's three-second render wait under suite load. The wait budget correction is pending before rerunning the release gate.
