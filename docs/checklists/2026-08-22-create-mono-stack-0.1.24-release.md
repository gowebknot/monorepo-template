# create-mono-stack 0.1.24 Release

- Checklist ID: CHECKLIST-20260822-create-mono-stack-0.1.24-release
- Created: 2026-08-22
- Planning completed: 2026-08-22
- Type: Patch release
- Source request: User explicitly requested version bump, commit, push, tag, and publish after adding the portable E2E regression skill.
- Related checklist: [E2E regression test writer skill](./2026-08-22-e2e-regression-test-writer-skill.md)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Bump `core/create-mono-stack` from `0.1.23` to `0.1.24` as the release marker for the new portable skill.
- Update the management test fixture to the current template revision and add the missing `packages/ui/CLAUDE.md` import required by the template consistency test.
- Preserve the skill changes in the template repository; they are distributed through the pushed template branch and are not included in the npm package's `files` allowlist.
- Verify the package artifact, repository checks, release commit, `v0.1.24` tag, and npm publication through the package-local wrapper.

## Impact Review

- Change type: Additive template skill plus patch-version release marker.
- Public API: No launcher API or CLI behavior changes.
- Generated projects: The new skill is source-template content and remains excluded from the published CLI artifact.
- Database, migrations, environment, security, observability, and dependency changes: None.
- Rollback: Revert the release commit or use the prior package/tag; do not overwrite remote history.

## Acceptance Criteria

- [ ] `core/create-mono-stack/package.json` reports `0.1.24`.
- [ ] The package dry-run artifact reports `create-mono-stack@0.1.24` and contains no credentials or unrelated skill source.
- [ ] Required repository validation passes without bypass flags.
- [ ] The management revision fixture and package guidance imports match the current template.
- [ ] A Conventional Commit containing the release changes is pushed to `origin/master`.
- [ ] Tag `v0.1.24` is created and pushed to `origin` at the release commit.
- [ ] `create-mono-stack@0.1.24` is published through `pnpm --filter create-mono-stack publish:package`.
- [ ] Remote refs, npm metadata, and final worktree state are verified.

## Exact Test Cases

### TEST-RELEASE-001: Version and artifact

- **Small task:** Bump the CLI package version and verify its npm artifact.
- **Source:** `core/create-mono-stack/package.json` and its `files` allowlist.
- **Test place:** Package manifest and `npm pack --dry-run`.
- **Starting state:** Package version is `0.1.23`; the skill changes are uncommitted.
- **Exact input or fixture:** Version `0.1.24`.
- **Interaction steps:** Inspect the current version, update the package manifest, and inspect the dry-run artifact.
- **Main behavior:** The release artifact reports the requested version and excludes credentials and template-only skill source.
- **Expected result:** Dry-run reports `create-mono-stack@0.1.24` and no `.npmrc.auth` or `skills/` content.
- **Must change:** `core/create-mono-stack/package.json` version and the release-required current-revision fixture.
- **Must not happen:** No credentials, unrelated files, or package-lock version drift.
- **Planned command:** `pnpm --filter create-mono-stack exec node -p "require('./package.json').version" && pnpm --filter create-mono-stack exec npm pack --dry-run`
- **Expected result before the code change:** The version command reports `0.1.23`; the dry run reports `create-mono-stack@0.1.23`.
- **First observed run:** The version command reported `0.1.23`. The initial `pnpm --filter create-mono-stack pack --dry-run` attempt failed because pnpm does not support npm's `--dry-run` pack option; the package-local `npm pack --dry-run` command is the corrected check.
- **Passing rerun:** `npm pack --dry-run` reported `create-mono-stack@0.1.24`, 274 package files, and no `skills/` or `.npmrc.auth` content.

### TEST-RELEASE-002: Release validation

- **Small task:** Verify the implementation and release gates before committing.
- **Source:** Root `AGENTS.md`, `core/create-mono-stack/AGENTS.md`, and release-flow guidance.
- **Test place:** `just check`, package tests, package lint, artifact inspection, and whitespace check.
- **Starting state:** The release version is updated and all intended skill files are present.
- **Exact input or fixture:** Current worktree with `e2e-regression-test-writer` and version `0.1.24`.
- **Interaction steps:** Run the repository gate, package artifact dry run, and `git diff --check` without disabling hooks or checks.
- **Main behavior:** The release candidate is valid, formatted, tested, and publishable.
- **Expected result:** All commands pass; no credentials appear in tracked or packaged files.
- **Must change:** No source files during validation.
- **Must not happen:** No `--no-verify`, skipped hooks, disabled checks, or direct npm publish.
- **Planned command:** `just check && pnpm --filter create-mono-stack exec npm pack --dry-run && git diff --check`
- **Expected result before the code change:** The repository remains at version `0.1.23`; the new release artifact does not exist.
- **First observed run:** The initial `just check` failed on two release blockers and a later retry hit a transient Ink timing failure; focused reruns passed.
- **Passing rerun:** `just check` passed after the required fixture/import fixes and a retry; known React Compiler warnings remained warnings only.

### TEST-RELEASE-005: Template consistency blockers

- **Small task:** Keep current-template management fixtures and package guidance imports synchronized.
- **Source:** `core/create-mono-stack/src/create-project.js`, `core/create-mono-stack/test/cli.test.js`, and `core/create-mono-stack/test/copier-template.test.js`.
- **Test place:** `pnpm --filter create-mono-stack test` within `just check`.
- **Starting state:** Launcher requires `v0.1.24`; the management fixture still uses `v0.1.23`, and `packages/ui/CLAUDE.md` is missing.
- **Exact input or fixture:** `_commit: v0.1.24` and a one-line `@AGENTS.md` import at `packages/ui/CLAUDE.md`.
- **Interaction steps:** Update both required files, rerun the package suite, and rerun `just check`.
- **Main behavior:** Template tests accept the current revision and every package guidance file has its provider import.
- **Expected result:** All package tests pass.
- **Must change:** `core/create-mono-stack/test/cli.test.js` and `packages/ui/CLAUDE.md`.
- **Must not happen:** Do not weaken tests or alter the revision guard.
- **Planned command:** `just check`
- **Expected result before the code change:** Two tests fail: the stale revision fixture and the missing UI `CLAUDE.md` import.
- **First observed run:** `just check` reported those two failures.
- **Passing rerun:** The two listed failures were fixed; `pnpm --filter create-mono-stack test` then passed all 257 tests, including the revision and guidance-import checks.

### TEST-RELEASE-003: Commit, push, and tag

- **Small task:** Publish the release commit and immutable version tag to GitHub.
- **Source:** User's explicit release sequence and repository Git safety rules.
- **Test place:** Local Git state and `origin` remote refs.
- **Starting state:** Validation passes; intended changes are unstaged and `origin/master` lacks the release commit.
- **Exact input or fixture:** Conventional commit `chore(release): prepare create-mono-stack 0.1.24`; tag `v0.1.24`.
- **Interaction steps:** Inspect status, diff, and log; stage only intended files; commit with hooks; push `master`; create and push the tag.
- **Main behavior:** The remote branch and tag identify the exact release commit.
- **Expected result:** `origin/master` and `refs/tags/v0.1.24` point to the same release commit.
- **Must change:** Local and remote Git history and the version tag.
- **Must not happen:** No amend, force-push, skipped hooks, or unrelated staged files.
- **Planned command:** `git push origin master && git tag v0.1.24 && git push origin v0.1.24`
- **Expected result before the code change:** No release commit or `v0.1.24` tag exists remotely.
- **First observed run:** Pending until the release commit and tag are created.
- **Passing rerun:** Pending.

### TEST-RELEASE-004: Publish npm package

- **Small task:** Publish the CLI package through the authenticated repository wrapper.
- **Source:** `core/create-mono-stack/scripts/publish.mjs` and explicit user authorization.
- **Test place:** npm registry through `pnpm --filter create-mono-stack publish:package`.
- **Starting state:** Release commit and tag are pushed; worktree is clean; repository auth config exists locally.
- **Exact input or fixture:** `create-mono-stack@0.1.24` and `.npmrc.auth` or explicit `NPM_CONFIG_USERCONFIG`.
- **Interaction steps:** Run the package-local publish wrapper, then query npm metadata.
- **Main behavior:** The intended CLI version is published with repository authentication.
- **Expected result:** Publish exits successfully and npm reports version `0.1.24` as `latest`.
- **Must change:** npm registry metadata only.
- **Must not happen:** No direct `npm publish`, credentials in Git, or bypass flags.
- **Planned command:** `pnpm --filter create-mono-stack publish:package && npm view create-mono-stack@0.1.24 version dist-tags --json`
- **Expected result before the code change:** `0.1.24` is not published.
- **First observed run:** Pending.
- **Passing rerun:** Pending.

## Release Steps

- [ ] Inspect status, diff, log, remote, current package version, and auth-file presence.
- [ ] Run the pre-change version and artifact baseline.
- [ ] Bump `core/create-mono-stack/package.json` to `0.1.24`.
- [ ] Run and record all release validation.
- [ ] Inspect the final diff and stage only intended files.
- [ ] Commit with a Conventional Commit message and passing hooks.
- [ ] Push `master`.
- [ ] Create and push `v0.1.24`.
- [ ] Publish with `pnpm --filter create-mono-stack publish:package`.
- [ ] Verify remote refs, npm metadata, package artifact, and final status.

## Validation Notes

Baseline: the package version reported `0.1.23` and the repository publish auth config is present. The initial pnpm pack command failed with `Unknown options: 'dry-run', 'recursive'`; the checklist now uses `npm pack --dry-run` through the package filter.

Validation failure: the first and second post-fix `just check` runs failed the same timing-sensitive Ink test with `Ink did not render the expected state within one second`. No source assertion or release-specific check failed. The independent package rerun and focused wizard suite passed; the subsequent full `just check` passed all checks.

## Risks and Follow-Up

- [ ] The npm package does not contain `skills/` because of its `files` allowlist; the new skill reaches generated projects through the pushed template repository.
- [ ] Do not publish if `.npmrc.auth` or the configured auth file is missing; report the blocker without exposing credentials.

## Updates

### 2026-08-22: Release completed

- Version and artifact validation passed: `create-mono-stack@0.1.24` was reported by `npm pack --dry-run`; the artifact contained 274 files and no `skills/` or `.npmrc.auth` content.
- The release blockers were corrected: the management fixture now uses `v0.1.24`, and `packages/ui/CLAUDE.md` imports `@AGENTS.md`.
- `just check` passed after retrying the transient Ink timing failure; the focused package suite passed all 257 tests and the skill suite passed all 97 tests. Existing React Compiler warnings remained warnings only.
- Commit `135516e5de3ef7640adb44a4537323eb53c32a9b` was pushed to `origin/master`.
- Tag `v0.1.24` was pushed and points to the same commit.
- `pnpm --filter create-mono-stack publish:package` succeeded.
- `npm view create-mono-stack@0.1.24 version dist-tags --json` reports version `0.1.24` and `latest: 0.1.24`.
- Final verification found a clean worktree.
