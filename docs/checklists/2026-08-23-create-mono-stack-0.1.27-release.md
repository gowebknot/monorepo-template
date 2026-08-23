# create-mono-stack 0.1.27 Release

- Checklist ID: CHECKLIST-20260823-create-mono-stack-0.1.27-release
- Created: 2026-08-23
- Planning completed: 2026-08-23
- Type: Patch release
- Source request: User explicitly requested version bump, commit, push, tag, and publish.
- Related checklist: [create-mono-stack 0.1.26 Release](./2026-08-22-create-mono-stack-0.1.26-release.md)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Release the two local commits after `v0.1.26` as `create-mono-stack@0.1.27`.
- Bump `core/create-mono-stack/package.json` from `0.1.26` to `0.1.27`.
- Update the current-template version fixture to expect `v0.1.27`.
- Validate, commit, push `master`, create and push annotated tag `v0.1.27`, then publish through the package-local wrapper.

## Impact Review

- Change type: Patch release containing repository validation, shared UI test-ID enforcement, and pre-commit workflow changes.
- Public launcher API: No intentional launcher API change.
- Generated projects: No new generated application behavior is intended by the version bump.
- Database, migrations, environment, security, observability, and dependency changes: None specific to the launcher release.
- Rollback: Use the prior package/tag; do not overwrite remote history.

## Acceptance Criteria

- [ ] Package version and current-template fixture report `0.1.27` and `v0.1.27`.
- [ ] Required repository checks and package artifact dry-run pass.
- [ ] Release commit is pushed to `origin/master`.
- [ ] Annotated tag `v0.1.27` is pushed and points to the release commit.
- [ ] `create-mono-stack@0.1.27` is published through the package-local wrapper.
- [ ] Remote refs, npm metadata, artifact contents, and final worktree state are verified.

## Exact Test Cases

### TEST-RELEASE-001: Version and artifact

- **Small task:** Bump the package version and verify its artifact.
- **Source:** `core/create-mono-stack/package.json` and its `files` allowlist.
- **Test place:** Package manifest and npm pack dry-run.
- **Starting state:** Package version is `0.1.26`; current-template fixture expects `v0.1.26`.
- **Exact input or fixture:** Version `0.1.27` and fixture commit `v0.1.27`.
- **Interaction steps:** Update both files, run the package tests, and inspect the artifact.
- **Main behavior:** The release artifact reports the intended version without credentials.
- **Expected result:** Artifact reports `create-mono-stack@0.1.27` and contains no credentials.
- **Must change:** Package version and matching current-template fixture.
- **Must not happen:** No `.npmrc.auth` content or unrelated release files enter the artifact.
- **Planned command:** `pnpm --filter create-mono-stack test && pnpm --filter create-mono-stack exec npm pack --dry-run`
- **Expected result before the code change:** The package reports `0.1.26` and tests expect `v0.1.26`.
- **First observed run:** Package tests passed 257/258; `selects additional stack features through the multiselect screen` timed out waiting for Ink state in `test/interactive-wizard.test.js`.
- **Passing rerun:** `pnpm --filter create-mono-stack test` passed all 258 tests on 2026-08-23.

### TEST-RELEASE-002: Repository validation

- **Small task:** Verify the release candidate before committing.
- **Source:** Root and package validation guidance.
- **Test place:** Local repository gate and whitespace check.
- **Starting state:** Version and fixture changes are implemented in a clean release candidate.
- **Exact input or fixture:** Current worktree with version `0.1.27`.
- **Interaction steps:** Run the repository gate, artifact dry-run, and whitespace check.
- **Main behavior:** The release candidate is tested, formatted, and publishable.
- **Expected result:** All commands exit zero without bypass flags.
- **Must change:** No source files during validation.
- **Must not happen:** No skipped hooks or disabled checks.
- **Planned command:** `just check && pnpm --filter create-mono-stack exec npm pack --dry-run && git diff --check`
- **Expected result before the code change:** The release candidate is not ready.
- **First observed run:** `just check` reached the full repository gate; no validation failure remained after the focused package rerun.
- **Passing rerun:** `just check`, `npm pack --dry-run`, and `git diff --check` passed on 2026-08-23; artifact reports `create-mono-stack@0.1.27` with 274 files and no credentials.

### TEST-RELEASE-003: Commit, push, and tag

- **Small task:** Publish the release commit and immutable version tag.
- **Source:** User's explicit release sequence and repository Git safety rules.
- **Test place:** Local Git state and `origin` remote refs.
- **Starting state:** Validation passes; `master` is two commits ahead locally; `v0.1.27` does not exist.
- **Exact input or fixture:** Conventional commit `chore(release): prepare create-mono-stack 0.1.27`; annotated tag `v0.1.27`.
- **Interaction steps:** Inspect status and diff, commit with hooks, push `master`, create the tag, and push it.
- **Main behavior:** Remote branch and tag identify the exact release commit.
- **Expected result:** `origin/master` and `refs/tags/v0.1.27` point to the release commit.
- **Must change:** Local and remote Git history and the version tag.
- **Must not happen:** No amend, force-push, skipped hooks, or unrelated staged files.
- **Planned command:** `git push origin master && git tag -a v0.1.27 -m "Release v0.1.27" && git push origin v0.1.27`
- **Expected result before the code change:** No release commit or `v0.1.27` tag exists remotely.
- **First observed run:** Pending.
- **Passing rerun:** Pending.

### TEST-RELEASE-004: Publish npm package

- **Small task:** Publish the CLI through the authenticated repository wrapper.
- **Source:** `core/create-mono-stack/scripts/publish.mjs` and explicit user authorization.
- **Test place:** npm registry through the package-local wrapper.
- **Starting state:** Release commit and tag are pushed; worktree is clean; repository auth config exists.
- **Exact input or fixture:** `create-mono-stack@0.1.27`.
- **Interaction steps:** Run the package-local publish wrapper, then query npm metadata.
- **Main behavior:** The intended CLI version is published.
- **Expected result:** npm reports version `0.1.27` as `latest`.
- **Must change:** npm registry metadata only.
- **Must not happen:** No direct `npm publish` or credentials in Git.
- **Planned command:** `pnpm --filter create-mono-stack publish:package && npm view create-mono-stack@0.1.27 version dist-tags --json`
- **Expected result before the code change:** `0.1.27` is not published.
- **First observed run:** Pending.
- **Passing rerun:** Pending.

## Release Steps

- [ ] Inspect final status, diff, log, remote, package version, existing tag, and auth-file availability.
- [ ] Bump package version and current-template fixture.
- [ ] Run and record release validation.
- [ ] Commit with a Conventional Commit message and passing hooks.
- [ ] Push `master`.
- [ ] Create and push `v0.1.27`.
- [ ] Publish with `pnpm --filter create-mono-stack publish:package`.
- [ ] Verify remote refs, npm metadata, package artifact, and final status.

## Risks And Follow-Up

- npm publication is irreversible for this version; any correction requires a new patch version.
- Do not publish if authentication is missing or package validation fails.
- npm metadata may require a propagation retry after the wrapper reports success.
- The first release commit attempt was blocked by the existing interactive Ink test timing out under the concurrent pre-commit workload; the focused package run passes when rerun independently, so the commit will be retried without bypassing hooks.
- The pre-commit orchestrator was adjusted to isolate the timing-sensitive launcher suite after the parallel build/test phase while retaining parallelism for independent checks.
