# create-mono-stack 0.1.23 Release

- Checklist ID: CHECKLIST-20260822-create-mono-stack-0.1.23-release
- Created: 2026-08-22
- Type: Patch release
- Source request: User asked to bump version, commit, push, tag, and publish the shared web UI template changes through `create-mono-stack`.
- Related checklist: `docs/checklists/2026-08-22-shared-web-ui-package.md`
- Status legend: `[ ]` incomplete, `[x]` complete, `[/]` partial

## Implementation Description

- Bump `core/create-mono-stack` from `0.1.22` to `0.1.23`.
- Synchronize the management-command test fixture with the launcher revision guard at `v0.1.23`.
- Release the shared `@repo/ui` package and web consumer wiring through the template repository revision.
- Publish `create-mono-stack@0.1.23` using the package-local authenticated publish wrapper.

## Acceptance Criteria

- [x] `core/create-mono-stack/package.json` reports `0.1.23`.
- [x] The package artifact contains the intended files and no credentials or unrelated files.
- [x] Shared UI package and both web consumers pass their focused checks.
- [x] `create-mono-stack` tests and lint pass without bypass flags.
- [ ] The release commit is pushed to `origin/master`.
- [ ] Tag `v0.1.23` is pushed to `origin`.
- [ ] `create-mono-stack@0.1.23` is published through `publish:package`.

## Exact Test Cases

### TEST-RELEASE-001: Version and artifact

- **Small task:** Bump the CLI package version and verify its npm artifact.
- **Source:** `core/create-mono-stack/package.json` and its `files` allowlist.
- **Test place:** Package manifest and `npm pack --dry-run`.
- **Starting state:** Package version is `0.1.22`; no release bump has been made.
- **Exact input or fixture:** Version `0.1.23`.
- **Interaction steps:** Update the version and inspect the dry-run artifact.
- **Main behavior:** The release artifact reports the requested version and contains no credentials.
- **Expected result:** Dry-run reports `create-mono-stack@0.1.23` and no `.npmrc.auth` or unrelated UI source.
- **Must change:** Only the CLI package version in release metadata.
- **Must not happen:** No secrets or unpublished workspace source enters the CLI artifact.
- **Planned command:** `cd core/create-mono-stack && npm pack --dry-run`
- **Expected result before the code change:** Dry-run reports `create-mono-stack@0.1.22`.
- **First observed run:** `npm pack --dry-run` reported `create-mono-stack@0.1.23`; the full launcher test suite failed at `TEST-MANAGE-001` because its fixture still used `_commit: v0.1.21` while the bumped launcher requires `v0.1.23`.
- **Passing rerun:** `pnpm --filter create-mono-stack exec node --test test/cli.test.js` passed all 20 tests after updating the fixture to `_commit: v0.1.23`.

### TEST-RELEASE-002: Release validation

- **Small task:** Verify the implementation and release gates before committing.
- **Source:** Repository `AGENTS.md`, package guidance, and release-flow requirements.
- **Test place:** Focused package/app checks, launcher tests, lint, formatting, and whitespace checks.
- **Starting state:** Current UI changes are uncommitted and the package remains at `0.1.22`.
- **Exact input or fixture:** Current worktree plus the version bump.
- **Interaction steps:** Run all focused checks without disabling hooks or validations.
- **Main behavior:** The release candidate is buildable and publishable.
- **Expected result:** All planned checks pass; known existing React Compiler warnings remain warnings only.
- **Must change:** No source files during validation.
- **Must not happen:** No `--no-verify`, skipped hooks, or disabled checks.
- **Planned command:** `pnpm --filter @repo/ui build && pnpm --filter @repo/ui typecheck && pnpm --filter @repo/ui lint && pnpm --filter web lint && pnpm --filter web build && pnpm --filter next typecheck && pnpm --filter next lint && pnpm --filter next build && pnpm --filter create-mono-stack test && pnpm --filter create-mono-stack lint && pnpm exec prettier --check . && git diff --check`
- **Expected result before the code change:** Existing UI-focused checks pass; the version remains `0.1.22`.
- **First observed run:** Focused release validation passed except `TEST-MANAGE-001`, which exposed the stale template revision fixture described above.
- **Passing rerun:** `just check` passed, including build, lint, typecheck, format, skills checks, and template tests; known React Compiler warnings remained warnings only.

### TEST-RELEASE-003: Commit, push, and tag

- **Small task:** Publish the release commit and immutable version tag to the git remote.
- **Source:** User's explicit release sequence and repository git safety rules.
- **Test place:** Local git state and `origin` remote refs.
- **Starting state:** Worktree contains the shared UI changes; `origin/master` does not contain them.
- **Exact input or fixture:** Conventional commit and tag `v0.1.23`.
- **Interaction steps:** Inspect status/diff/log, commit, push `master`, create the tag, and push the tag.
- **Main behavior:** The remote branch and tag identify the exact release commit.
- **Expected result:** `origin/master` and `refs/tags/v0.1.23` point to the release commit.
- **Must change:** Git history and remote refs.
- **Must not happen:** No amend, force-push, or skipped commit hook.
- **Planned command:** `git push origin master && git tag v0.1.23 && git push origin v0.1.23`
- **Expected result before the code change:** No release commit or `v0.1.23` tag exists remotely.
- **First observed run:** Pending validation and commit.
- **Passing rerun:** Pending remote verification.

### TEST-RELEASE-004: Publish npm package

- **Small task:** Publish the CLI package through the repository wrapper.
- **Source:** `core/create-mono-stack/scripts/publish.mjs` and user authorization.
- **Test place:** npm registry through `pnpm --filter create-mono-stack publish:package`.
- **Starting state:** Local release commit is pushed and the worktree is clean.
- **Exact input or fixture:** `create-mono-stack@0.1.23` and repository `.npmrc.auth`.
- **Interaction steps:** Run the package-local publish wrapper, then verify npm metadata.
- **Main behavior:** The intended CLI version is published with repository authentication.
- **Expected result:** Publish exits successfully and npm reports `0.1.23`.
- **Must change:** npm registry package metadata.
- **Must not happen:** No direct registry command, credentials in git, or bypass flags.
- **Planned command:** `pnpm --filter create-mono-stack publish:package`
- **Expected result before the code change:** `0.1.23` is not yet published.
- **First observed run:** Pending remote release.
- **Passing rerun:** Pending publish verification.

## Release Steps

- [x] Inspect status, diff, log, remote, and current package version.
- [x] Bump `core/create-mono-stack/package.json` to `0.1.23`.
- [x] Run and record all release validation.
- [ ] Commit with a Conventional Commit message and passing hooks.
- [ ] Push `master`.
- [ ] Create and push `v0.1.23`.
- [ ] Publish with `pnpm --filter create-mono-stack publish:package`.
- [ ] Verify remote refs, npm metadata, and final clean status.
