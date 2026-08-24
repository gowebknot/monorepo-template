# create-mono-stack 0.1.36 Release

- Checklist ID: CHECKLIST-20260824-create-mono-stack-0.1.36-release
- Created: 2026-08-24
- Planning completed: 2026-08-24
- Type: Patch release
- Source request: User explicitly authorized version bump, commit, push, tag, and publish.
- Related release: [create-mono-stack 0.1.35 Release](./2026-08-24-create-mono-stack-0.1.35-release.md)
- Related implementation: [Code Quality Dispatch And CVA Guidance](./2026-08-24-code-quality-dispatch-and-cva-guidance.md)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Release the code-quality guidance update and `create-mono-stack` patch metadata as `0.1.36`.
- Bump `core/create-mono-stack/package.json` from `0.1.35` to `0.1.36`.
- Update the current-template revision fixture to expect `v0.1.36`.
- Validate, commit with hooks, push `master`, create and push annotated tag `v0.1.36`, then publish through the package-local wrapper.

## Impact Review

- Change type: Portable agent guidance and patch release metadata.
- Public launcher API: No intentional command or argument breaking change.
- Generated projects: Code-quality guidance now prefers lookup maps for keyed dispatch and CVA for CSS styling variants.
- Database, migrations, environment, security, and observability changes: None.
- Rollback: Use the prior package/tag; do not overwrite remote history.

## Exact Test Cases

### TEST-RELEASE-001: Version, fixture, and artifact

- **Small task:** Bump the package version and verify its npm artifact.
- **Source:** Package manifest, current-template fixture, and package files allowlist.
- **Test place:** `core/create-mono-stack/package.json`, `test/cli.test.js`, and npm pack dry-run.
- **Starting state:** Package version and fixture revision are `0.1.35` and `v0.1.35`.
- **Exact input or fixture:** Version `0.1.36` and fixture revision `v0.1.36`.
- **Interaction steps:** Update both files, run package tests, and inspect the dry-run artifact.
- **Main behavior:** The release artifact reports the intended version without credentials.
- **Expected result:** Artifact reports `create-mono-stack@0.1.36` and contains no credentials.
- **Must change:** Package version and matching fixture revision.
- **Must not happen:** No `.npmrc.auth` content or unrelated files enter the artifact.
- **Planned command:** `pnpm --filter create-mono-stack test` and `pnpm --filter create-mono-stack exec npm pack --dry-run`
- **Expected result before the code change:** Package and fixture report `0.1.35`.
- **First observed run:** Package tests passed all 264 tests; npm pack dry-run reported `create-mono-stack@0.1.36`, 288 files, and no credentials.
- **Passing rerun:** Complete for version, fixture, package tests, and artifact dry-run.

### TEST-RELEASE-002: Repository validation

- **Small task:** Verify the release candidate before committing.
- **Source:** Root and package validation guidance.
- **Test place:** `just check`, package lint/test, artifact dry-run, and whitespace check.
- **Starting state:** Release changes are versioned `0.1.36` and not committed.
- **Exact input or fixture:** Current worktree with only intended implementation, checklist, version, and fixture changes.
- **Interaction steps:** Run package checks, root checks, inspect the artifact, and check whitespace.
- **Main behavior:** The candidate is formatted, tested, and publishable.
- **Expected result:** All commands exit zero without bypass flags.
- **Must change:** No source files during validation.
- **Must not happen:** No skipped hooks or disabled checks.
- **Planned command:** `pnpm --filter create-mono-stack lint`, `just check`, and `git diff --check`
- **Expected result before the code change:** The candidate is not yet versioned `0.1.36`.
- **First observed run:** Package lint, `just check`, `git diff --check`, `pnpm format:check`, and `pnpm skills:check` passed. `just check` reported only existing React Compiler compatibility warnings.
- **Passing rerun:** Complete; the validation suite also passed 101 skills tests, server unit/API tests, and all 264 launcher tests without bypass flags.

### TEST-RELEASE-003: Commit, push, and tag

- **Small task:** Publish the release commit and immutable version tag.
- **Source:** User authorization and repository Git safety rules.
- **Test place:** Local Git state and `origin` remote refs.
- **Starting state:** Validation passes; intended changes are unstaged; `v0.1.36` does not exist.
- **Exact input or fixture:** `chore(release): prepare create-mono-stack 0.1.36`; annotated tag `v0.1.36`.
- **Interaction steps:** Inspect status/diff/log, commit with hooks, push `master`, create and push the tag.
- **Main behavior:** Remote branch and tag identify the release commit.
- **Expected result:** `origin/master` and `v0.1.36` point to the release commit or its documented follow-up.
- **Must change:** Local and remote Git history and the version tag.
- **Must not happen:** No amend, force-push, skipped hooks, or unrelated staged files.
- **Planned command:** `git push origin master`, `git tag -a v0.1.36 -m "Release v0.1.36"`, and `git push origin v0.1.36`
- **Expected result before the code change:** No release commit or `v0.1.36` tag exists remotely.
- **First observed run:** Pending until the Git commands run.
- **Passing rerun:** Pending until the Git commands run.

### TEST-RELEASE-004: Publish npm package

- **Small task:** Publish the CLI through the authenticated repository wrapper.
- **Source:** Package-local publish wrapper and explicit user authorization.
- **Test place:** npm registry through `pnpm --filter create-mono-stack publish:package`.
- **Starting state:** Release commit and tag are pushed; worktree is clean; auth config exists.
- **Exact input or fixture:** `create-mono-stack@0.1.36`.
- **Interaction steps:** Run the package-local wrapper and query npm metadata.
- **Main behavior:** The intended CLI version is published.
- **Expected result:** npm reports version `0.1.36` as `latest`.
- **Must change:** npm registry metadata only.
- **Must not happen:** No direct npm publish or credentials in Git.
- **Planned command:** `pnpm --filter create-mono-stack publish:package` and `npm view create-mono-stack dist-tags version --json`
- **Expected result before the code change:** `0.1.36` is not published and `latest` remains `0.1.35`.
- **First observed run:** Pending until publication runs.
- **Passing rerun:** Pending until registry verification runs.

## Release Steps

- [x] Bump package version and current-template fixture.
- [x] Run and record release validation.
- [ ] Inspect final diff and stage only intended files.
- [ ] Commit with a Conventional Commit message and passing hooks.
- [ ] Push `master`.
- [ ] Create and push annotated `v0.1.36`.
- [ ] Publish with `pnpm --filter create-mono-stack publish:package`.
- [ ] Verify remote refs, npm metadata, artifact, and final status.

## Risks And Follow-Up

- npm publication is irreversible for this version; corrections require a new patch version.
- Do not publish if authentication is missing or package validation fails.

## Validation Notes

- Package tests passed all 264 tests.
- `just check` passed, including lint, typecheck, skills tests, template tests, and server tests.
- `pnpm --filter create-mono-stack exec npm pack --dry-run` reported `create-mono-stack@0.1.36` with 288 files and no credentials.
- `pnpm format:check`, `pnpm skills:check`, and `git diff --check` passed.
