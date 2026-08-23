# create-mono-stack 0.1.30 Release

- Checklist ID: CHECKLIST-20260823-create-mono-stack-0.1.30-release
- Created: 2026-08-23
- Planning completed: 2026-08-23
- Type: Patch release
- Source request: User explicitly authorized version bump, commit, push, tag, and publish.
- Related release: [create-mono-stack 0.1.29 Release](./2026-08-23-create-mono-stack-0.1.29-release.md)
- Related implementation: [Dynamic generated skill triggers](./2026-08-23-dynamic-generated-skill-triggers.md) and [API-chain skill gate coverage](./2026-08-23-api-chain-skill-gate.md)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Release the generated-project trigger synchronization and API-chain skill-gate coverage as `create-mono-stack@0.1.30`.
- Bump `core/create-mono-stack/package.json` from `0.1.29` to `0.1.30`.
- Update the current-template revision fixture to expect `v0.1.30`.
- Validate, commit, push `master`, create and push annotated tag `v0.1.30`, then publish through the package-local wrapper.

## Impact Review

- Change type: Additive generated-project tooling and workflow enforcement.
- Public launcher API: No intentional command or argument breaking change.
- Generated projects: Trigger files synchronize after creation, manage add/remove, and successful template updates; API-client and query-client edits receive explicit workflow requirements.
- Database, migrations, environment, security, and observability changes: None.
- Rollback: Use the prior package/tag; do not overwrite remote history.

## Exact Test Cases

### TEST-RELEASE-005: Version and artifact

- **Small task:** Bump the package version and verify its npm artifact.
- **Source:** Package manifest, current-template fixture, and package files allowlist.
- **Test place:** `core/create-mono-stack/package.json`, CLI fixture, and npm pack dry-run.
- **Starting state:** Package version is `0.1.29`; fixture expects `v0.1.29`.
- **Exact input or fixture:** Version `0.1.30` and fixture revision `v0.1.30`.
- **Interaction steps:** Update both files, run package tests, and inspect the dry-run artifact.
- **Main behavior:** The release artifact reports the intended version without credentials.
- **Expected result:** Artifact reports `create-mono-stack@0.1.30` and contains no credentials.
- **Must change:** Package version and matching current-template fixture.
- **Must not happen:** No `.npmrc.auth` content or unrelated files enter the artifact.
- **Planned command:** `pnpm --filter create-mono-stack test && pnpm --filter create-mono-stack exec npm pack --dry-run`.
- **Expected result before the code change:** The package reports `0.1.29` and tests expect `v0.1.29`.
- **First observed run:** `pnpm --filter create-mono-stack test` passed all 264 tests; the package dry-run reported `create-mono-stack@0.1.30`, 288 files, and no credentials.
- **Passing rerun:** Same package test and artifact run passed.

### TEST-RELEASE-006: Repository validation

- **Small task:** Verify the release candidate before committing.
- **Source:** Root and package validation guidance.
- **Test place:** `just check`, package artifact dry-run, and whitespace check.
- **Starting state:** The implementation changes are present and the candidate is versioned `0.1.30`.
- **Exact input or fixture:** Current worktree with version `0.1.30`.
- **Interaction steps:** Run repository checks, inspect the artifact, and check whitespace.
- **Main behavior:** The candidate is formatted, tested, and publishable.
- **Expected result:** All commands exit zero without bypass flags.
- **Must change:** No source files during validation.
- **Must not happen:** No skipped hooks or disabled checks.
- **Planned command:** `just check && pnpm --filter create-mono-stack exec npm pack --dry-run && git diff --check`.
- **Expected result before the code change:** The release candidate is not yet versioned `0.1.30`.
- **First observed run:** `just check`, the package dry-run, and `git diff --check` all passed; the full gate reported 20 successful tasks, 101 skills tests, and 264 launcher tests.
- **Passing rerun:** Same validation commands passed with `create-mono-stack@0.1.30` and a 288-file artifact containing no credentials.

### TEST-RELEASE-007: Commit, push, and tag

- **Small task:** Publish the release commit and immutable version tag.
- **Source:** User authorization and repository Git safety rules.
- **Test place:** Local Git state and `origin` remote refs.
- **Starting state:** Validation passes; intended changes are unstaged; `v0.1.30` does not exist.
- **Exact input or fixture:** `chore(release): prepare create-mono-stack 0.1.30`; annotated tag `v0.1.30`.
- **Interaction steps:** Inspect status/diff/log, commit with hooks, push `master`, create and push tag.
- **Main behavior:** Remote branch and tag identify the same release commit.
- **Expected result:** `origin/master` and `v0.1.30` point to the release commit.
- **Must change:** Local and remote Git history and the version tag.
- **Must not happen:** No amend, force-push, skipped hooks, or unrelated staged files.
- **Planned command:** `git push origin master && git tag -a v0.1.30 -m "Release v0.1.30" && git push origin v0.1.30`.
- **Expected result before the code change:** No release commit or `v0.1.30` tag exists remotely.
- **First observed run:**
- **Passing rerun:**

### TEST-RELEASE-008: Publish npm package

- **Small task:** Publish the CLI through the authenticated repository wrapper.
- **Source:** Package-local publish wrapper and explicit user authorization.
- **Test place:** npm registry through the package-local publish wrapper.
- **Starting state:** Release commit and tag are pushed; worktree is clean; auth config exists.
- **Exact input or fixture:** `create-mono-stack@0.1.30`.
- **Interaction steps:** Run the package-local wrapper and query npm metadata.
- **Main behavior:** The intended CLI version is published.
- **Expected result:** npm reports version `0.1.30` as `latest`.
- **Must change:** npm registry metadata only.
- **Must not happen:** No direct npm publish or credentials in Git.
- **Planned command:** `pnpm --filter create-mono-stack publish:package && npm view create-mono-stack@0.1.30 version dist-tags --json`.
- **Expected result before the code change:** `0.1.30` is not published.
- **First observed run:**
- **Passing rerun:**

## Release Steps

- [x] Inspect status, diff, log, remote, version, existing tag, and auth-file availability.
- [x] Bump package version and current-template fixture.
- [x] Run and record release validation.
- [x] Inspect final diff and stage only intended files.
- [ ] Commit with a Conventional Commit message and passing hooks.
- [ ] Push `master`.
- [ ] Create and push annotated `v0.1.30`.
- [x] Publish with `pnpm --filter create-mono-stack publish:package`.
- [x] Verify remote refs, npm metadata, artifact, and final status.

## Risks And Follow-Up

- npm publication is irreversible for this version; corrections require a new patch version.
- Device-backed Maestro assertions remain outside the release gate.
- Do not publish if authentication is missing or package validation fails.

## Updates

### 2026-08-23: Release completed

- Release commit `bebe03c` was created with passing commit hooks.
- `master` was pushed to `origin`.
- Annotated tag `v0.1.30` was created and pushed.
- `create-mono-stack@0.1.30` was published through `pnpm --filter create-mono-stack publish:package`.
- npm reports `0.1.30` as the `latest` version.
- Remote `master` and the peeled `v0.1.30` tag both resolve to `bebe03cbe78c9b089fdb96cc2fc861e90fa960f0`.
- The package dry-run reported 288 files and no credentials; final worktree verification was clean before this checklist update.
