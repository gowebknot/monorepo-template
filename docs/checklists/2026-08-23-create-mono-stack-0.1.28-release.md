# create-mono-stack 0.1.28 Release

- Checklist ID: CHECKLIST-20260823-create-mono-stack-0.1.28-release
- Created: 2026-08-23
- Planning completed: 2026-08-23
- Type: Patch release
- Source request: User explicitly authorized version bump, commit, push, tag, and publish.
- Related checklist: [create-mono-stack 0.1.27 Release](./2026-08-23-create-mono-stack-0.1.27-release.md)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Release the uncommitted Maestro mobile e2e template changes as `create-mono-stack@0.1.28`.
- Bump `core/create-mono-stack/package.json` from `0.1.27` to `0.1.28`.
- Update the current-template revision fixture to expect `v0.1.28`.
- Validate, commit, push `master`, create and push annotated tag `v0.1.28`, then publish through the
  package-local wrapper.

## Impact Review

- Change type: Additive template e2e tooling plus patch-version release marker.
- Public launcher API: No intentional launcher API change.
- Generated projects: Maestro package and mobile e2e guidance become available through the template.
- Database, migrations, environment, security, observability, and dependency changes: None specific
  to the launcher.
- Rollback: Use the prior package/tag; do not overwrite remote history.

## Exact Test Cases

### TEST-RELEASE-001: Version and artifact

- **Small task:** Bump the package version and verify its npm artifact.
- **Source:** `core/create-mono-stack/package.json` and its `files` allowlist.
- **Test place:** Package manifest, fixture, and npm pack dry-run.
- **Starting state:** Package version is `0.1.27`; fixture expects `v0.1.27`.
- **Exact input or fixture:** Version `0.1.28` and fixture revision `v0.1.28`.
- **Interaction steps:** Update both files, run package tests, and inspect the dry-run artifact.
- **Main behavior:** The release artifact reports the intended version without credentials.
- **Expected result:** Artifact reports `create-mono-stack@0.1.28` and contains no credentials.
- **Must change:** Package version and matching current-template fixture.
- **Must not happen:** No `.npmrc.auth` content or unrelated files enter the artifact.
- **Planned command:** `pnpm --filter create-mono-stack test && pnpm --filter create-mono-stack exec npm pack --dry-run`
- **Expected result before the code change:** The package reports `0.1.27` and tests expect `v0.1.27`.
- **First observed run:** The baseline reported version `0.1.27`; `npm pack --dry-run` reported
  `create-mono-stack@0.1.27` with 274 files and no credentials.
- **Passing rerun:** Pending.

### TEST-RELEASE-002: Repository validation

- **Small task:** Verify the release candidate before committing.
- **Source:** Root and package validation guidance.
- **Test place:** `just check`, package artifact dry-run, and whitespace check.
- **Starting state:** Version and fixture changes are implemented in the release candidate.
- **Exact input or fixture:** Current worktree with version `0.1.28`.
- **Interaction steps:** Run repository checks, inspect the artifact, and check whitespace.
- **Main behavior:** The candidate is formatted, tested, and publishable.
- **Expected result:** All commands exit zero without bypass flags.
- **Must change:** No source files during validation.
- **Must not happen:** No skipped hooks or disabled checks.
- **Planned command:** `just check && pnpm --filter create-mono-stack exec npm pack --dry-run && git diff --check`
- **Expected result before the code change:** The release candidate is not yet versioned or validated.
- **First observed run:** The pre-bump baseline reported `0.1.27` and a 274-file artifact.
- **Passing rerun:** Package tests passed all 260 tests; npm pack reported `create-mono-stack@0.1.28`,
  274 files, and no credentials or `skills/` content.

### TEST-RELEASE-003: Commit, push, and tag

- **Small task:** Publish the release commit and immutable version tag.
- **Source:** User authorization and repository Git safety rules.
- **Test place:** Local Git state and `origin` remote refs.
- **Starting state:** Validation passes; intended changes are unstaged; `v0.1.28` does not exist.
- **Exact input or fixture:** `chore(release): prepare create-mono-stack 0.1.28`; annotated tag `v0.1.28`.
- **Interaction steps:** Inspect status/diff/log, commit with hooks, push `master`, create and push tag.
- **Main behavior:** Remote branch and tag identify the same release commit.
- **Expected result:** `origin/master` and `v0.1.28` point to the release commit.
- **Must change:** Local and remote Git history and the version tag.
- **Must not happen:** No amend, force-push, skipped hooks, or unrelated staged files.
- **Planned command:** `git push origin master && git tag -a v0.1.28 -m "Release v0.1.28" && git push origin v0.1.28`
- **Expected result before the code change:** No release commit or `v0.1.28` tag exists remotely.
- **First observed run:** The release candidate had not yet passed the repository gate.
- **Passing rerun:** `just check`, package lint, `pnpm format:check`, and `git diff --check` passed.

### TEST-RELEASE-004: Publish npm package

- **Small task:** Publish the CLI through the authenticated repository wrapper.
- **Source:** `core/create-mono-stack/scripts/publish.mjs` and explicit user authorization.
- **Test place:** npm registry through the package-local publish wrapper.
- **Starting state:** Release commit and tag are pushed; worktree is clean; auth config exists.
- **Exact input or fixture:** `create-mono-stack@0.1.28`.
- **Interaction steps:** Run the package-local wrapper and query npm metadata.
- **Main behavior:** The intended CLI version is published.
- **Expected result:** npm reports version `0.1.28` as `latest`.
- **Must change:** npm registry metadata only.
- **Must not happen:** No direct npm publish or credentials in Git.
- **Planned command:** `pnpm --filter create-mono-stack publish:package && npm view create-mono-stack@0.1.28 version dist-tags --json`
- **Expected result before the code change:** `0.1.28` is not published.
- **First observed run:** Pending.
- **Passing rerun:** Pending.

## Release Steps

- [ ] Inspect status, diff, log, remote, version, existing tag, and auth-file availability.
- [ ] Record the pre-change version and artifact baseline.
- [ ] Bump package version and current-template fixture.
- [ ] Run and record release validation.
- [ ] Inspect final diff and stage only intended files.
- [ ] Commit with a Conventional Commit message and passing hooks.
- [ ] Push `master`.
- [ ] Create and push annotated `v0.1.28`.
- [ ] Publish with `pnpm --filter create-mono-stack publish:package`.
- [ ] Verify remote refs, npm metadata, artifact, and final status.

## Risks And Follow-Up

- npm publication is irreversible for this version; corrections require a new patch version.
- Device-backed Maestro assertions are intentionally not a release gate for this template repository.
- Do not publish if authentication is missing or package validation fails.
