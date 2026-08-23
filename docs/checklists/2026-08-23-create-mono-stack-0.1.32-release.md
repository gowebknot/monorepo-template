# create-mono-stack 0.1.32 Release

- Checklist ID: CHECKLIST-20260823-create-mono-stack-0.1.32-release
- Created: 2026-08-23
- Planning completed: 2026-08-23
- Type: Patch release
- Source request: User explicitly authorized version bump, commit, push, tag, and publish.
- Related release: [create-mono-stack 0.1.31 Release](./2026-08-23-create-mono-stack-0.1.31-release.md)
- Related implementation: [Backend database seeding convention](./2026-08-23-backend-database-seeding-convention.md)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Release the backend database seeding convention and synchronized portable skill updates as
  `create-mono-stack@0.1.32`.
- Bump `core/create-mono-stack/package.json` from `0.1.31` to `0.1.32`.
- Update the current-template revision fixture to expect `v0.1.32`.
- Validate, commit with hooks, push `master`, create and push annotated tag `v0.1.32`, then publish
  through the package-local wrapper.

## Impact Review

- Change type: Documentation and agent-workflow guidance; patch release metadata.
- Public launcher API: No intentional command or argument breaking change.
- Generated projects: Agents receive database seeding guidance, including deterministic Faker use,
  stable IDs, and git-ignored post-seed JSON exports.
- Database, migrations, environment, security, and observability changes: No runtime changes.
- Rollback: Use the prior package/tag; do not overwrite remote history.

## Exact Test Cases

### TEST-RELEASE-009: Version, fixture, and artifact

- **Small task:** Bump the package version and verify its npm artifact.
- **Source:** Package manifest, current-template fixture, and package files allowlist.
- **Test place:** `core/create-mono-stack/package.json`, CLI fixture, and npm pack dry-run.
- **Starting state:** Package version is `0.1.31`; fixture expects `v0.1.31`.
- **Exact input or fixture:** Version `0.1.32` and fixture revision `v0.1.32`.
- **Interaction steps:** Update both files, run package tests, and inspect the dry-run artifact.
- **Main behavior:** The release artifact reports the intended version without credentials.
- **Expected result:** Artifact reports `create-mono-stack@0.1.32` and contains no credentials.
- **Must change:** Package version and matching current-template fixture.
- **Must not happen:** No `.npmrc.auth` content or unrelated files enter the artifact.
- **Planned command:** `pnpm --filter create-mono-stack test && pnpm --filter create-mono-stack exec npm pack --dry-run`
- **Expected result before the code change:** The package reports `0.1.31` and tests expect `v0.1.31`.
- **First observed run:** Before the bump, the package version and fixture were `0.1.31`.
- **Passing rerun:** `pnpm --filter create-mono-stack test` passed all 264 tests; `npm pack --dry-run`
  reported `create-mono-stack@0.1.32`, 288 files, and no credentials.

### TEST-RELEASE-010: Repository validation

- **Small task:** Verify the release candidate before committing.
- **Source:** Root and package validation guidance.
- **Test place:** `just check`, package artifact dry-run, and whitespace check.
- **Starting state:** Implementation changes are present and the candidate is versioned `0.1.32`.
- **Exact input or fixture:** Current worktree with version `0.1.32`.
- **Interaction steps:** Run repository checks, inspect the artifact, and check whitespace.
- **Main behavior:** The candidate is formatted, tested, and publishable.
- **Expected result:** All commands exit zero without bypass flags.
- **Must change:** No source files during validation.
- **Must not happen:** No skipped hooks or disabled checks.
- **Planned command:** `just check && pnpm --filter create-mono-stack exec npm pack --dry-run && git diff --check`
- **Expected result before the code change:** The release candidate is not yet versioned `0.1.32`.
- **First observed run:** Before the bump, the release candidate was still `0.1.31`.
- **Passing rerun:** `just check`, the package dry-run, and `git diff --check` passed; the full gate
  completed successfully and the artifact reported `create-mono-stack@0.1.32` with 288 files and no
  credentials.

### TEST-RELEASE-011: Commit, push, and tag

- **Small task:** Publish the release commit and immutable version tag.
- **Source:** User authorization and repository Git safety rules.
- **Test place:** Local Git state and `origin` remote refs.
- **Starting state:** Validation passes; intended changes are unstaged; `v0.1.32` does not exist.
- **Exact input or fixture:** `chore(release): prepare create-mono-stack 0.1.32`; annotated tag `v0.1.32`.
- **Interaction steps:** Inspect status/diff/log, commit with hooks, push `master`, create and push tag.
- **Main behavior:** Remote branch and tag identify the same release commit.
- **Expected result:** `origin/master` and `v0.1.32` point to the release commit.
- **Must change:** Local and remote Git history and the version tag.
- **Must not happen:** No amend, force-push, skipped hooks, or unrelated staged files.
- **Planned command:** `git push origin master && git tag -a v0.1.32 -m "Release v0.1.32" && git push origin v0.1.32`
- **Expected result before the code change:** No release commit or `v0.1.32` tag exists remotely.
- **First observed run:** Commit `405e72c` was created after all validation passed; `v0.1.32` did not
  exist remotely.
- **Passing rerun:** `master` was pushed, annotated `v0.1.32` was created and pushed, and both
  `origin/master` and the peeled tag resolve to `405e72c`.

### TEST-RELEASE-012: Publish npm package

- **Small task:** Publish the CLI through the authenticated repository wrapper.
- **Source:** Package-local publish wrapper and explicit user authorization.
- **Test place:** npm registry through the package-local publish wrapper.
- **Starting state:** Release commit and tag are pushed; worktree is clean; auth config exists.
- **Exact input or fixture:** `create-mono-stack@0.1.32`.
- **Interaction steps:** Run the package-local wrapper and query npm metadata.
- **Main behavior:** The intended CLI version is published.
- **Expected result:** npm reports version `0.1.32` as `latest`.
- **Must change:** npm registry metadata only.
- **Must not happen:** No direct npm publish or credentials in Git.
- **Planned command:** `pnpm --filter create-mono-stack publish:package && npm view create-mono-stack@0.1.32 version dist-tags --json`
- **Expected result before the code change:** `0.1.32` is not published.
- **First observed run:** Before publication, npm did not report `create-mono-stack@0.1.32`.
- **Passing rerun:** The package wrapper published successfully; npm reports version `0.1.32` and
  `latest: 0.1.32`.

## Release Steps

- [x] Bump package version and current-template fixture.
- [x] Run and record release validation.
- [x] Inspect final diff and stage only intended files.
- [x] Commit with a Conventional Commit message and passing hooks.
- [x] Push `master`.
- [x] Create and push annotated `v0.1.32`.
- [x] Publish with `pnpm --filter create-mono-stack publish:package`.
- [x] Verify remote refs, npm metadata, artifact, and final status.

## Risks And Follow-Up

- npm publication is irreversible for this version; corrections require a new patch version.
- Do not publish if authentication is missing or package validation fails.

## Updates

### 2026-08-23: Release completed

- Release commit `405e72c` was created with passing commit hooks.
- `master` was pushed to `origin`.
- Annotated tag `v0.1.32` was created and pushed; its peeled commit is
  `405e72c553066513060d021316a2ce0bf9170615`.
- `create-mono-stack@0.1.32` was published through `pnpm --filter create-mono-stack publish:package`.
- npm reports `0.1.32` as the `latest` version.
- The package dry-run reported 288 files and no credentials; the post-release worktree was clean.
