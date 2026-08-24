# create-mono-stack 0.1.39 Release

- Checklist ID: CHECKLIST-20260824-create-mono-stack-0.1.39-release
- Created: 2026-08-24
- Planning completed: 2026-08-24
- Type: Patch release
- Source request: User explicitly authorized version bump, commit, push, tag, and publish.
- Related release: [create-mono-stack 0.1.38 Release](./2026-08-24-create-mono-stack-0.1.38-release.md)
- Related implementation: [API Client Provider Options](./2026-08-24-api-client-provider-options.md)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Release the provider-level `ServiceOptions` configuration for TanStack API hooks and synchronized managed templates as `create-mono-stack` `0.1.39`.
- Bump `core/create-mono-stack/package.json` from `0.1.38` to `0.1.39`.
- Update the current-template revision fixture to expect `v0.1.39`.
- Validate the repository and npm artifact, commit with hooks, push `master`, create and push annotated tag `v0.1.39`, then publish through the package-local wrapper.

## Impact Review

- Change type: Additive shared query-client configuration, generated frontend template behavior, documentation, and patch release metadata.
- Public launcher API: No intentional command or argument breaking change.
- Generated projects: New projects inherit the generic API `ServiceOptions` from `ApiClientConfigProvider` and can still pass inline options for alternate API targets.
- Database, migrations, environment, security, and observability changes: None.
- Dependency impact: `@repo/query-client` adds `@types/react` as a development-only dependency for its JSX provider implementation.
- Rollback: Use the prior package/tag; do not overwrite remote history.

## Exact Test Cases

### TEST-RELEASE-001: Version fixture and artifact

- **Small task:** Bump the launcher version and verify its npm artifact.
- **Source:** Package manifest, current-template fixture, package files allowlist, and release request.
- **Test place:** `core/create-mono-stack/package.json`, `core/create-mono-stack/test/cli.test.js`, and npm pack dry-run.
- **Starting state:** Package version is `0.1.38`; the current-template fixture expects `v0.1.38`.
- **Exact input or fixture:** Version `0.1.39` and fixture revision `v0.1.39`.
- **Interaction steps:** Update both metadata values, run launcher tests, and inspect the package dry-run.
- **Main behavior:** The release artifact reports the intended version and excludes credentials.
- **Expected result:** Artifact reports `create-mono-stack@0.1.39` and contains no `.npmrc.auth` or registry credentials.
- **Must change:** Package version and matching fixture revision.
- **Must not happen:** No unrelated files or credentials enter the artifact.
- **Planned command:** `pnpm --filter create-mono-stack test` and `pnpm --filter create-mono-stack exec npm pack --dry-run`.
- **Expected result before the code change:** Package and fixture report `0.1.38`.
- **First observed run:** Pending metadata update.
- **Passing rerun:** Pending metadata update and validation.

### TEST-RELEASE-002: Full release validation

- **Small task:** Verify the release candidate before committing.
- **Source:** Repository `AGENTS.md`, package release workflow, and existing release checklists.
- **Test place:** `just check`, package lint/test, artifact dry-run, and whitespace check.
- **Starting state:** Intended implementation changes are uncommitted and package metadata is `0.1.38`.
- **Exact input or fixture:** Current worktree containing the API provider implementation, documentation, checklist, version, and fixture changes.
- **Interaction steps:** Run the package and repository gates, inspect the artifact, and check whitespace.
- **Main behavior:** The candidate is formatted, tested, and publishable.
- **Expected result:** All commands exit zero without bypass flags.
- **Must change:** No source files during validation.
- **Must not happen:** No skipped hooks or disabled checks.
- **Planned command:** `pnpm --filter create-mono-stack lint`, `just check`, and `git diff --check`.
- **Expected result before the code change:** The candidate is not yet versioned `0.1.39`.
- **First observed run:** Pending metadata update.
- **Passing rerun:** Pending release validation.

### TEST-RELEASE-003: Commit push and tag

- **Small task:** Publish the release commit and immutable version tag.
- **Source:** Explicit user authorization and repository Git safety rules.
- **Test place:** Local Git state and `origin` remote refs.
- **Starting state:** Validation passes; intended changes are unstaged; `v0.1.39` does not exist.
- **Exact input or fixture:** Conventional Commit `chore(release): prepare create-mono-stack 0.1.39`; annotated tag `v0.1.39`.
- **Interaction steps:** Inspect status/diff/log, stage only intended files, commit with hooks, push `master`, create the annotated tag, and push the tag.
- **Main behavior:** Remote branch and tag identify the release commit.
- **Expected result:** `origin/master` and `v0.1.39` point to the release commit.
- **Must change:** Local and remote Git history and the version tag.
- **Must not happen:** No amend, force-push, hook bypass, or unrelated staged files.
- **Planned command:** `git push origin master`, `git tag -a v0.1.39 -m "Release v0.1.39"`, and `git push origin v0.1.39`.
- **Expected result before the code change:** No release commit or `v0.1.39` tag exists remotely.
- **First observed run:** Pending release commit.
- **Passing rerun:** Pending authorized Git operations.

### TEST-RELEASE-004: Publish npm package

- **Small task:** Publish the CLI through the authenticated repository wrapper.
- **Source:** `core/create-mono-stack/scripts/publish.mjs`, package release workflow, and explicit user authorization.
- **Test place:** npm registry through `pnpm --filter create-mono-stack publish:package`.
- **Starting state:** Release commit and tag are pushed; worktree is clean; authenticated npm config exists.
- **Exact input or fixture:** `create-mono-stack@0.1.39`.
- **Interaction steps:** Run the package-local wrapper and query npm metadata.
- **Main behavior:** The intended CLI version is published as the latest release.
- **Expected result:** npm reports version `0.1.39` as `latest`.
- **Must change:** npm registry metadata only.
- **Must not happen:** No direct npm publish or credentials in Git.
- **Planned command:** `pnpm --filter create-mono-stack publish:package` and `npm view create-mono-stack dist-tags version --json`.
- **Expected result before the code change:** `0.1.39` is not published and `latest` remains `0.1.38`.
- **First observed run:** Pending Git release operations.
- **Passing rerun:** Pending authenticated publication and metadata verification.

## Release Steps

- [ ] Bump package version and current-template fixture.
- [ ] Run and record release validation.
- [ ] Inspect final diff and stage only intended files.
- [ ] Commit with a Conventional Commit message and passing hooks.
- [ ] Push `master`.
- [ ] Create and push annotated `v0.1.39`.
- [ ] Publish with `pnpm --filter create-mono-stack publish:package`.
- [ ] Verify remote refs, npm metadata, artifact, and final status.

## Risks And Follow-Up

- npm publication is irreversible for this version; corrections require a new patch version.
- The release includes an accumulated worktree diff; inspect the complete diff before staging.
- Do not publish if authentication is missing or package validation fails.

## Validation Notes

- Initial observations: Current package version and latest tag are `0.1.38`; the worktree contains the API provider implementation and no release metadata update.
- First observed run: The first commit hook run rejected the commit because `test/interactive-wizard.test.js` had one timing-sensitive timeout in `selects additional stack features through the multiselect screen`; the other staged build, skill, server, and validation checks completed.

## Updates

### 2026-08-24: Release verification

- Release commit `a1a56d5fb217502dafd96fc3a7008172d95d4d24` is on local and `origin/master`.
- Annotated tag `v0.1.39` is pushed to `origin` and resolves to the release commit.
- `npm view create-mono-stack dist-tags version --json` reports version `0.1.39` and `latest: 0.1.39`.
- `pnpm --filter create-mono-stack exec npm pack --dry-run --json` reports `create-mono-stack-0.1.39.tgz` with no credentials or `.npmrc.auth` entry.
- The release was published through `pnpm --filter create-mono-stack publish:package`; no direct publish command was used.
- All planned repository and package validation checks passed before publication.
