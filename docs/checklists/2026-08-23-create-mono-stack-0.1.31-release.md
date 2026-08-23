# create-mono-stack 0.1.31 Release

- Checklist ID: CHECKLIST-20260823-create-mono-stack-0.1.31-release
- Created: 2026-08-23
- Planning completed: 2026-08-23
- Type: Patch release
- Source request: User explicitly authorized version bump, commit, push, tag, and publish.
- Related release: [create-mono-stack 0.1.30 Release](./2026-08-23-create-mono-stack-0.1.30-release.md)
- Related implementation: [API test boundaries](./2026-08-23-api-test-boundaries.md), [API-chain skill-gate scope correction](./2026-08-23-api-chain-skill-gate-contract-scope.md)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Release the explicit unit, in-process API E2E, and running-server API smoke boundaries as `create-mono-stack@0.1.31`.
- Include the API-client skill-gate scope correction and its regression coverage.
- Bump `core/create-mono-stack/package.json` from `0.1.30` to `0.1.31`.
- Update the current-template revision fixture to expect `v0.1.31`.
- Validate, commit, push `master`, create and push annotated tag `v0.1.31`, then publish through the package-local wrapper.

## Impact Review

- Change type: Additive testing commands, deterministic server smoke coverage, and workflow-gate correction.
- Public launcher API: No intentional command or argument breaking change.
- Generated projects: The generated server now exposes explicit backend test commands and documentation for future CI orchestration.
- Database, migrations, environment, security, and observability changes: None.
- Runtime application behavior: No endpoint or response behavior changed.
- Rollback: Use the prior package/tag; do not overwrite remote history.

## Exact Test Cases

### TEST-RELEASE-009: Version and artifact

- **Small task:** Bump the package version and verify its npm artifact.
- **Source:** Package manifest, current-template fixture, and package files allowlist.
- **Test place:** `core/create-mono-stack/package.json`, CLI fixture, and npm pack dry-run.
- **Starting state:** Package version is `0.1.30`; fixture expects `v0.1.30`.
- **Exact input or fixture:** Version `0.1.31` and fixture revision `v0.1.31`.
- **Interaction steps:** Update both files, run package tests, and inspect the dry-run artifact.
- **Main behavior:** The release artifact reports the intended version without credentials.
- **Expected result:** Artifact reports `create-mono-stack@0.1.31` and contains no credentials.
- **Must change:** Package version and matching current-template fixture.
- **Must not happen:** No `.npmrc.auth` content or unrelated files enter the artifact.
- **Planned command:** `pnpm --filter create-mono-stack test && pnpm --filter create-mono-stack exec npm pack --dry-run`.
- **Expected result before the code change:** The package reports `0.1.30` and tests expect `v0.1.30`.
- **First observed run:** The package suite passed 263/264 tests; `interactive-wizard.test.js` had one timing failure waiting for Ink to render. The chained artifact and whitespace checks did not run after the test failure.
- **Passing rerun:** The focused wizard rerun passed 24/24, then the full package suite passed 264/264; `npm pack --dry-run` reported `create-mono-stack@0.1.31`, 288 files, and no credentials.

### TEST-RELEASE-010: Repository validation

- **Small task:** Verify the release candidate before committing.
- **Source:** Root and package validation guidance.
- **Test place:** `just check`, package artifact dry-run, and whitespace check.
- **Starting state:** API test-boundary changes and version `0.1.31` are present in the worktree.
- **Exact input or fixture:** Current worktree with the intended release changes.
- **Interaction steps:** Run repository checks, inspect the artifact, and check whitespace.
- **Main behavior:** The candidate is formatted, tested, and publishable.
- **Expected result:** All commands exit zero without bypass flags.
- **Must change:** No source files during validation.
- **Must not happen:** No skipped hooks or disabled checks.
- **Planned command:** `just check && pnpm --filter create-mono-stack exec npm pack --dry-run && git diff --check`.
- **Expected result before the code change:** The release candidate is not yet versioned `0.1.31`.
- **First observed run:** `just check` was pending after the package/artifact validation.
- **Passing rerun:** `just check` passed 20 tasks, including build, lint, typecheck, formatting, 101 skills tests, server unit/API E2E checks, template tests, and 264 launcher tests; existing React Compiler warnings remained non-fatal.

### TEST-RELEASE-011: Commit, push, and tag

- **Small task:** Publish the release commit and immutable version tag.
- **Source:** User authorization and repository Git safety rules.
- **Test place:** Local Git state and `origin` remote refs.
- **Starting state:** Validation passes; intended changes are unstaged; `v0.1.31` does not exist.
- **Exact input or fixture:** `chore(release): prepare create-mono-stack 0.1.31`; annotated tag `v0.1.31`.
- **Interaction steps:** Inspect status/diff/log, commit with hooks, push `master`, create and push the tag.
- **Main behavior:** Remote branch and tag identify the same release commit.
- **Expected result:** `origin/master` and `v0.1.31` point to the release commit.
- **Must change:** Local and remote Git history and the version tag.
- **Must not happen:** No amend, force-push, skipped hooks, or unrelated staged files.
- **Planned command:** `git push origin master && git tag -a v0.1.31 -m "Release v0.1.31" && git push origin v0.1.31`.
- **Expected result before the code change:** No release commit or `v0.1.31` tag exists remotely.
- **First observed run:** Pending.
- **Passing rerun:** Pending.

### TEST-RELEASE-012: Publish npm package

- **Small task:** Publish the CLI through the authenticated repository wrapper.
- **Source:** Package-local publish wrapper and explicit user authorization.
- **Test place:** npm registry through the package-local publish wrapper.
- **Starting state:** Release commit and tag are pushed; worktree is clean; auth config exists.
- **Exact input or fixture:** `create-mono-stack@0.1.31`.
- **Interaction steps:** Run the package-local wrapper and query npm metadata.
- **Main behavior:** The intended CLI version is published.
- **Expected result:** npm reports version `0.1.31` as `latest`.
- **Must change:** npm registry metadata only.
- **Must not happen:** No direct npm publish or credentials in Git.
- **Planned command:** `pnpm --filter create-mono-stack publish:package && npm view create-mono-stack@0.1.31 version dist-tags --json`.
- **Expected result before the code change:** `0.1.31` is not published.
- **First observed run:** Pending.
- **Passing rerun:** Pending.

## Release Steps

- [x] Inspect status, diff, log, remote, version, existing tag, and auth-file availability.
- [x] Bump package version and current-template fixture.
- [x] Run and record release validation.
- [x] Inspect final diff and stage only intended files.
- [ ] Commit with a Conventional Commit message and passing hooks.
- [ ] Push `master`.
- [ ] Create and push annotated `v0.1.31`.
- [ ] Publish with `pnpm --filter create-mono-stack publish:package`.
- [ ] Verify remote refs, npm metadata, artifact, and final status.

## Risks And Follow-Up

- npm publication is irreversible for this version; corrections require a new patch version.
- Device-backed Maestro assertions remain outside the release gate.
- Running-server smoke tests are explicit and remain outside `just check` by design.
- Do not publish if authentication is missing or package validation fails.
