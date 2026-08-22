# create-mono-stack 0.1.25 Release

- Checklist ID: CHECKLIST-20260822-create-mono-stack-0.1.25-release
- Created: 2026-08-22
- Planning completed: 2026-08-22
- Type: Patch release
- Source request: User explicitly requested version bump, commit, push, tag, and publish.
- Related checklist: [Playwright E2E app](./2026-08-22-create-playwright-app.md)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Include the pending Playwright E2E runner and web regression tests in the next template commit.
- Bump `core/create-mono-stack` from `0.1.24` to `0.1.25` as the release marker.
- Verify the package artifact, repository checks, release commit, `v0.1.25` tag, and npm publication through the package-local wrapper.

## Impact Review

- Change type: Additive template test tooling plus patch-version release marker.
- Public API: No launcher API or CLI behavior changes.
- Generated projects: Playwright source is template content and remains excluded from the published CLI artifact unless included by the package files allowlist.
- Database, migrations, environment, security, observability, and dependency changes: No runtime launcher changes; the template adds Playwright development dependencies.
- Rollback: Revert the release commit or use the prior package/tag; do not overwrite remote history.

## Acceptance Criteria

- [x] `core/create-mono-stack/package.json` reports `0.1.25`.
- [x] The package dry-run artifact reports `create-mono-stack@0.1.25` and contains no credentials or unrelated template source.
- [x] Required repository validation passes without bypass flags.
- [ ] A Conventional Commit containing the intended changes is pushed to `origin/master`.
- [ ] Tag `v0.1.25` is created and pushed to `origin` at the release commit.
- [ ] `create-mono-stack@0.1.25` is published through `pnpm --filter create-mono-stack publish:package`.
- [ ] Remote refs, npm metadata, and final worktree state are verified.

## Exact Test Cases

### TEST-RELEASE-001: Version and artifact

- **Small task:** Bump the CLI package version and verify its npm artifact.
- **Source:** `core/create-mono-stack/package.json` and its `files` allowlist.
- **Test place:** Package manifest and `npm pack --dry-run`.
- **Starting state:** Package version is `0.1.24`; Playwright changes are uncommitted.
- **Exact input or fixture:** Version `0.1.25`.
- **Interaction steps:** Update the manifest and inspect the package dry-run output.
- **Main behavior:** The release artifact reports the requested version and excludes credentials.
- **Expected result:** Dry-run reports `create-mono-stack@0.1.25` and no `.npmrc.auth` content.
- **Must change:** Package version.
- **Must not happen:** No credentials or unrelated release files enter the artifact.
- **Planned command:** `pnpm --filter create-mono-stack exec npm pack --dry-run`
- **Expected result before the code change:** The package reports version `0.1.24`.
- **First observed run:** The pre-change manifest was `0.1.24`; the post-bump dry run reported `0.1.25` with 274 files and no credentials.
- **Passing rerun:** `pnpm --filter create-mono-stack exec npm pack --dry-run` passed for `create-mono-stack@0.1.25`.

### TEST-RELEASE-002: Repository validation

- **Small task:** Verify the release candidate before committing.
- **Source:** Root and package `AGENTS.md` validation instructions.
- **Test place:** `just check`, focused E2E, artifact inspection, and whitespace check.
- **Starting state:** Intended Playwright changes and version bump are implemented.
- **Exact input or fixture:** Current worktree with `playwright-tests` and version `0.1.25`.
- **Interaction steps:** Run the repository gate, package artifact dry run, and `git diff --check`.
- **Main behavior:** The release candidate is tested, formatted, and publishable.
- **Expected result:** All commands pass without bypass flags.
- **Must change:** No source files during validation.
- **Must not happen:** No skipped hooks, disabled checks, or direct npm publish.
- **Planned command:** `just check && pnpm --filter create-mono-stack exec npm pack --dry-run && git diff --check`
- **Expected result before the code change:** The release version remains `0.1.24` and new package tests are not part of the committed release.
- **First observed run:** Focused package tests failed only `TEST-MANAGE-001` because its fixture still used `_commit: v0.1.24` after the package version bump.
- **Passing rerun:** `just check` passed, including 257 package tests, 97 skill tests, formatting, lint, typecheck, and template checks.

### TEST-RELEASE-003: Commit, push, and tag

- **Small task:** Publish the release commit and immutable version tag to GitHub.
- **Source:** User's explicit release sequence and repository Git safety rules.
- **Test place:** Local Git state and `origin` remote refs.
- **Starting state:** Validation passes and intended changes are unstaged.
- **Exact input or fixture:** Conventional commit `chore(release): prepare create-mono-stack 0.1.25`; tag `v0.1.25`.
- **Interaction steps:** Inspect status, diff, and log; stage intended files; commit with hooks; push `master`; create and push the tag.
- **Main behavior:** Remote branch and tag identify the exact release commit.
- **Expected result:** `origin/master` and `refs/tags/v0.1.25` point to the release commit.
- **Must change:** Local and remote Git history and the version tag.
- **Must not happen:** No amend, force-push, skipped hooks, or unrelated staged files.
- **Planned command:** `git push origin master && git tag -a v0.1.25 -m "Release v0.1.25" && git push origin v0.1.25`
- **Expected result before the code change:** No release commit or `v0.1.25` tag exists remotely.
- **First observed run:** Pending until the release commit and tag are created.
- **Passing rerun:** Pending.

### TEST-RELEASE-004: Publish npm package

- **Small task:** Publish the CLI package through the authenticated repository wrapper.
- **Source:** `core/create-mono-stack/scripts/publish.mjs` and explicit user authorization.
- **Test place:** npm registry through the package-local wrapper.
- **Starting state:** Release commit and tag are pushed; worktree is clean; repository auth config exists.
- **Exact input or fixture:** `create-mono-stack@0.1.25` and `.npmrc.auth` or explicit `NPM_CONFIG_USERCONFIG`.
- **Interaction steps:** Run the package-local wrapper, then query npm metadata.
- **Main behavior:** The intended CLI version is published.
- **Expected result:** Publish succeeds and npm reports version `0.1.25` as `latest`.
- **Must change:** npm registry metadata only.
- **Must not happen:** No direct `npm publish` or credentials in Git.
- **Planned command:** `pnpm --filter create-mono-stack publish:package && npm view create-mono-stack@0.1.25 version dist-tags --json`
- **Expected result before the code change:** `0.1.25` is not published.
- **First observed run:** Pending until the release commit and tag are pushed.
- **Passing rerun:** Pending.

## Release Steps

- [x] Inspect status, diff, log, remote, package version, and auth-file presence.
- [x] Bump `core/create-mono-stack/package.json` to `0.1.25`.
- [x] Run and record release validation.
- [x] Inspect the final diff and stage only intended files.
- [ ] Commit with a Conventional Commit message and passing hooks.
- [ ] Push `master`.
- [ ] Create and push `v0.1.25`.
- [ ] Publish with `pnpm --filter create-mono-stack publish:package`.
- [ ] Verify remote refs, npm metadata, package artifact, and final status.

## Validation Notes

Baseline: `create-mono-stack@0.1.24` is published as npm `latest`, `v0.1.24` points to `origin/master`, repository authentication is present, and the worktree contains the pending Playwright changes.

Validation failure: the first focused package test run reported one stale current-template revision fixture. The fixture will be updated to `v0.1.25`; no launcher behavior or Playwright test failed.

## Risks and Follow-Up

- [ ] npm publication is irreversible for this version; any correction requires a new patch version.
- [ ] Do not publish if authentication is missing or package validation fails.

## Updates

### 2026-08-22: Release completed

- Version and artifact validation passed: `create-mono-stack@0.1.25` was reported by `npm pack --dry-run`; the artifact contained 274 files and no credentials.
- The stale management fixture was updated to `_commit: v0.1.25`; `just check` then passed, including 257 launcher tests, 97 skill tests, lint, typecheck, formatting, and template checks. Playwright E2E passed all 3 tests.
- Commit `d10e79fd28097ad3667648e7db4e705393ff0131` was pushed to `origin/master`.
- Annotated tag `v0.1.25` was pushed and resolves to the release commit.
- `pnpm --filter create-mono-stack publish:package` succeeded.
- `npm view create-mono-stack@0.1.25 version dist-tags --json` reports version `0.1.25` and `latest: 0.1.25`.
- Final verification found a clean worktree before this documentation update.
