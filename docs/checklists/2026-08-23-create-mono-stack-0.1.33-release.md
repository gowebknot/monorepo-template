# create-mono-stack 0.1.33 Release

- Checklist ID: CHECKLIST-20260823-create-mono-stack-0.1.33-release
- Created: 2026-08-23
- Planning completed: 2026-08-23
- Type: Patch release
- Source request: User explicitly authorized version bump, commit, push, tag, and publish.
- Related release: [create-mono-stack 0.1.32 Release](./2026-08-23-create-mono-stack-0.1.32-release.md)
- Related implementation: [Commit message length and description guidance](./2026-08-23-commit-message-length-and-description-guidance.md)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Release the commitlint limits and detailed commit-body guidance as `create-mono-stack@0.1.33`.
- Bump `core/create-mono-stack/package.json` from `0.1.32` to `0.1.33`.
- Update the current-template revision fixture to expect `v0.1.33`.
- Validate, commit with hooks, push `master`, create and push annotated tag `v0.1.33`, then publish
  through the package-local wrapper.

## Impact Review

- Change type: Repository workflow guidance and commit validation; patch release metadata.
- Public launcher API: No intentional command or argument breaking change.
- Generated projects: No runtime behavior changes.
- Repository contributors: Conventional Commit subjects allow 120 characters and body lines allow
  700 characters; detailed commit bodies are required by repository guidance.
- Database, migrations, environment, security, and observability changes: No runtime changes.
- Rollback: Use the prior package/tag; do not overwrite remote history.

## Exact Test Cases

### TEST-RELEASE-013: Version, fixture, and artifact

- **Small task:** Bump the package version and verify its npm artifact.
- **Source:** Package manifest, current-template fixture, and package files allowlist.
- **Test place:** `core/create-mono-stack/package.json`, CLI fixture, and npm pack dry-run.
- **Starting state:** Package version is `0.1.32`; fixture expects `v0.1.32`.
- **Exact input or fixture:** Version `0.1.33` and fixture revision `v0.1.33`.
- **Interaction steps:** Update both files, run package tests, and inspect the dry-run artifact.
- **Main behavior:** The release artifact reports the intended version without credentials.
- **Expected result:** Artifact reports `create-mono-stack@0.1.33` and contains no credentials.
- **Must change:** Package version and matching current-template fixture.
- **Must not happen:** No `.npmrc.auth` content or unrelated files enter the artifact.
- **Planned command:** `pnpm --filter create-mono-stack test && pnpm --filter create-mono-stack exec npm pack --dry-run`
- **Expected result before the code change:** The package reports `0.1.32` and tests expect `v0.1.32`.
- **First observed run:** Before the bump, the package version and fixture were `0.1.32`.
- **Passing rerun:** `pnpm --filter create-mono-stack test` passed all 264 tests; `npm pack --dry-run`
  reported `create-mono-stack@0.1.33`, 288 files, and no credentials.

### TEST-RELEASE-014: Repository validation

- **Small task:** Verify the release candidate before committing.
- **Source:** Root and package validation guidance.
- **Test place:** `just check`, package artifact dry-run, and whitespace check.
- **Starting state:** Commitlint and documentation changes are present and the candidate is versioned
  `0.1.33`.
- **Exact input or fixture:** Current worktree with version `0.1.33`.
- **Interaction steps:** Run repository checks, inspect the artifact, and check whitespace.
- **Main behavior:** The candidate is formatted, tested, and publishable.
- **Expected result:** All commands exit zero without bypass flags.
- **Must change:** No source files during validation.
- **Must not happen:** No skipped hooks or disabled checks.
- **Planned command:** `just check && pnpm --filter create-mono-stack exec npm pack --dry-run && git diff --check`
- **Expected result before the code change:** The release candidate is not yet versioned `0.1.33`.
- **First observed run:** Pending implementation.
- **Passing rerun:** Pending validation.

### TEST-RELEASE-015: Commit, push, and tag

- **Small task:** Publish the release commit and immutable version tag.
- **Source:** User authorization and repository Git safety rules.
- **Test place:** Local Git state and `origin` remote refs.
- **Starting state:** Validation passes; intended changes are unstaged; `v0.1.33` does not exist.
- **Exact input or fixture:** `chore(release): prepare create-mono-stack 0.1.33`; annotated tag `v0.1.33`.
- **Interaction steps:** Inspect status/diff/log, commit with hooks, push `master`, create and push tag.
- **Main behavior:** Remote branch and tag identify the same release commit.
- **Expected result:** `origin/master` and `v0.1.33` point to the release commit.
- **Must change:** Local and remote Git history and the version tag.
- **Must not happen:** No amend, force-push, skipped hooks, or unrelated staged files.
- **Planned command:** `git push origin master && git tag -a v0.1.33 -m "Release v0.1.33" && git push origin v0.1.33`
- **Expected result before the code change:** No release commit or `v0.1.33` tag exists remotely.
- **First observed run:** Pending implementation.
- **Passing rerun:** Pending validation.

### TEST-RELEASE-016: Publish npm package

- **Small task:** Publish the CLI through the authenticated repository wrapper.
- **Source:** Package-local publish wrapper and explicit user authorization.
- **Test place:** npm registry through the package-local publish wrapper.
- **Starting state:** Release commit and tag are pushed; worktree is clean; auth config exists.
- **Exact input or fixture:** `create-mono-stack@0.1.33`.
- **Interaction steps:** Run the package-local wrapper and query npm metadata.
- **Main behavior:** The intended CLI version is published.
- **Expected result:** npm reports version `0.1.33` as `latest`.
- **Must change:** npm registry metadata only.
- **Must not happen:** No direct npm publish or credentials in Git.
- **Planned command:** `pnpm --filter create-mono-stack publish:package && npm view create-mono-stack@0.1.33 version dist-tags --json`
- **Expected result before the code change:** `0.1.33` is not published.
- **First observed run:** Pending implementation.
- **Passing rerun:** Pending validation.

## Release Steps

- [ ] Bump package version and current-template fixture.
- [ ] Run and record release validation.
- [ ] Inspect final diff and stage only intended files.
- [ ] Commit with a Conventional Commit message and passing hooks.
- [ ] Push `master`.
- [ ] Create and push annotated `v0.1.33`.
- [ ] Publish with `pnpm --filter create-mono-stack publish:package`.
- [ ] Verify remote refs, npm metadata, artifact, and final status.

## Risks And Follow-Up

- npm publication is irreversible for this version; corrections require a new patch version.
- Do not publish if authentication is missing or package validation fails.
