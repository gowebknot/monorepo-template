# create-mono-stack 0.1.35 Release

- Checklist ID: CHECKLIST-20260824-create-mono-stack-0.1.35-release
- Created: 2026-08-24
- Planning completed: 2026-08-24
- Type: Patch release
- Source request: User explicitly authorized version bump, commit, push, tag, and publish.
- Related release: [create-mono-stack 0.1.34 Release](./2026-08-23-create-mono-stack-0.1.34-release.md)
- Related implementation: [Aspiron Source Architecture Skill](./2026-08-24-aspiron-source-architecture-skill.md)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Release the Aspiron source-architecture skill and generated-project trigger integration as `create-mono-stack@0.1.35`.
- Bump `core/create-mono-stack/package.json` from `0.1.34` to `0.1.35`.
- Update the current-template revision fixture to expect `v0.1.35`.
- Validate, commit with hooks, push `master`, create and push annotated tag `v0.1.35`, then publish through the package-local wrapper.

## Impact Review

- Change type: Portable agent guidance, generated-project skill discovery, and patch release metadata.
- Public launcher API: No intentional command or argument breaking change.
- Generated projects: Server, web, and mobile app paths require the new architecture skill in addition to existing standards.
- Database, migrations, environment, security, and observability changes: None.
- Rollback: Use the prior package/tag; do not overwrite remote history.

## Exact Test Cases

### TEST-RELEASE-001: Version, fixture, and artifact

- **Small task:** Bump the package version and verify its npm artifact.
- **Source:** Package manifest, current-template fixture, and package files allowlist.
- **Test place:** `core/create-mono-stack/package.json`, `test/cli.test.js`, and npm pack dry-run.
- **Starting state:** Package version and fixture revision are `0.1.34` and `v0.1.34`.
- **Exact input or fixture:** Version `0.1.35` and fixture revision `v0.1.35`.
- **Interaction steps:** Update both files, run package tests, and inspect the dry-run artifact.
- **Main behavior:** The release artifact reports the intended version without credentials.
- **Expected result:** Artifact reports `create-mono-stack@0.1.35` and contains no credentials.
- **Must change:** Package version and matching fixture revision.
- **Must not happen:** No `.npmrc.auth` content or unrelated files enter the artifact.
- **Planned command:** `pnpm --filter create-mono-stack test` and `pnpm --filter create-mono-stack exec npm pack --dry-run`
- **Expected result before the code change:** Package and fixture report `0.1.34`.
- **First observed run:** `pnpm --filter create-mono-stack test` passed all 264 tests; npm pack dry-run reported `create-mono-stack@0.1.35`, 288 files, and no credentials.
- **Passing rerun:** Complete for version, fixture, package tests, and artifact dry-run.

### TEST-RELEASE-002: Repository validation

- **Small task:** Verify the release candidate before committing.
- **Source:** Root and package validation guidance.
- **Test place:** `just check`, package lint/test, artifact dry-run, and whitespace check.
- **Starting state:** Release changes are versioned `0.1.35` and not committed.
- **Exact input or fixture:** Current worktree with only intended implementation, checklist, version, and fixture changes.
- **Interaction steps:** Run package checks, root checks, inspect the artifact, and check whitespace.
- **Main behavior:** The candidate is formatted, tested, and publishable.
- **Expected result:** All commands exit zero without bypass flags.
- **Must change:** No source files during validation.
- **Must not happen:** No skipped hooks or disabled checks.
- **Planned command:** `pnpm --filter create-mono-stack lint`, `just check`, and `git diff --check`
- **Expected result before the code change:** The candidate is not yet versioned `0.1.35`.
- **First observed run:** `pnpm --filter create-mono-stack lint`, `just check`, and `git diff --check` completed successfully. `just check` reported only existing React Compiler compatibility warnings and no errors.
- **Passing rerun:** Complete; package lint, repository gate, and whitespace validation passed without bypass flags. The later commit-hook rerun also passed all non-launcher checks.

### TEST-RELEASE-003: Commit, push, and tag

- **Small task:** Publish the release commit and immutable version tag.
- **Source:** User authorization and repository Git safety rules.
- **Test place:** Local Git state and `origin` remote refs.
- **Starting state:** Validation passes; intended changes are unstaged; `v0.1.35` does not exist.
- **Exact input or fixture:** `chore(release): prepare create-mono-stack 0.1.35`; annotated tag `v0.1.35`.
- **Interaction steps:** Inspect status/diff/log, commit with hooks, push `master`, create and push the tag.
- **Main behavior:** Remote branch and tag identify the same release commit.
- **Expected result:** `origin/master` and `v0.1.35` point to the release commit.
- **Must change:** Local and remote Git history and the version tag.
- **Must not happen:** No amend, force-push, skipped hooks, or unrelated staged files.
- **Planned command:** `git push origin master`, `git tag -a v0.1.35 -m "Release v0.1.35"`, and `git push origin v0.1.35`
- **Expected result before the code change:** No release commit or `v0.1.35` tag exists remotely.
- **First observed run:** Commit attempt was rejected by the required hook because one interactive wizard test timed out; no commit or tag was created.
- **Passing rerun:** Pending until the commands run.

### TEST-RELEASE-004: Publish npm package

- **Small task:** Publish the CLI through the authenticated repository wrapper.
- **Source:** Package-local publish wrapper and explicit user authorization.
- **Test place:** npm registry through `pnpm --filter create-mono-stack publish:package`.
- **Starting state:** Release commit and tag are pushed; worktree is clean; auth config exists.
- **Exact input or fixture:** `create-mono-stack@0.1.35`.
- **Interaction steps:** Run the package-local wrapper and query npm metadata.
- **Main behavior:** The intended CLI version is published.
- **Expected result:** npm reports version `0.1.35` as `latest`.
- **Must change:** npm registry metadata only.
- **Must not happen:** No direct npm publish or credentials in Git.
- **Planned command:** `pnpm --filter create-mono-stack publish:package` and `npm view create-mono-stack@0.1.35 version dist-tags --json`
- **Expected result before the code change:** `0.1.35` is not published.
- **First observed run:** Pending until the commands run.
- **Passing rerun:** Pending until the commands run.

## Release Steps

- [ ] Bump package version and current-template fixture.
- [ ] Run and record release validation.
- [ ] Inspect final diff and stage only intended files.
- [ ] Commit with a Conventional Commit message and passing hooks.
- [ ] Push `master`.
- [ ] Create and push annotated `v0.1.35`.
- [ ] Publish with `pnpm --filter create-mono-stack publish:package`.
- [ ] Verify remote refs, npm metadata, artifact, and final status.

## Risks And Follow-Up

- npm publication is irreversible for this version; corrections require a new patch version.
- Do not publish if authentication is missing or package validation fails.

## Validation Notes

- The first commit attempt ran the required hooks without bypasses; 263 of 264 launcher tests passed and `interactive-wizard.test.js` timed out once.
