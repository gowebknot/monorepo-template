# create-mono-stack 0.1.38 Release

- Checklist ID: CHECKLIST-20260824-create-mono-stack-0.1.38-release
- Created: 2026-08-24
- Planning completed: 2026-08-24
- Type: Patch release
- Source request: User explicitly authorized version bump, commit, push, tag, and publish.
- Related release: [create-mono-stack 0.1.37 Release](./2026-08-24-create-mono-stack-0.1.37-release.md)
- Related implementation: [Optional Managed Policy Root](./2026-08-24-optional-managed-policy-root.md)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Release the optional managed policy-root collector fix and the corrected TanStack Form/Zod example as `create-mono-stack` `0.1.38`.
- Bump `core/create-mono-stack/package.json` from `0.1.37` to `0.1.38`.
- Update the current-template revision fixture to expect `v0.1.38`.
- Validate, commit with hooks, push `master`, create and push annotated tag `v0.1.38`, then publish through the package-local wrapper.

## Impact Review

- Change type: Corrective policy-test compatibility fix and patch release metadata.
- Public launcher API: No intentional command or argument breaking change.
- Generated projects: Consumer projects without template-only `core/` sources can run the form-management policy test; the portable form guidance now demonstrates shared Zod validation.
- Database, migrations, environment, security, and observability changes: None.
- Rollback: Use the prior package/tag; do not overwrite remote history.

## Exact Test Cases

### TEST-RELEASE-001: Version, fixture, and artifact

- **Small task:** Bump the package version and verify its npm artifact.
- **Source:** Package manifest, current-template fixture, and package files allowlist.
- **Test place:** `core/create-mono-stack/package.json`, `test/cli.test.js`, and npm pack dry-run.
- **Starting state:** Package version and fixture revision are `0.1.37` and `v0.1.37`.
- **Exact input or fixture:** Version `0.1.38` and fixture revision `v0.1.38`.
- **Interaction steps:** Update both files, run package tests, and inspect the dry-run artifact.
- **Main behavior:** The release artifact reports the intended version without credentials.
- **Expected result:** Artifact reports `create-mono-stack@0.1.38` and contains no credentials.
- **Must change:** Package version and matching fixture revision.
- **Must not happen:** No `.npmrc.auth` content or unrelated files enter the artifact.
- **Planned command:** `pnpm --filter create-mono-stack test` and `pnpm --filter create-mono-stack exec npm pack --dry-run`
- **Expected result before the code change:** Package and fixture report `0.1.37`.
- **First observed run:** Package tests, lint, and pack checks had not run before versioning.
- **Passing rerun:** Launcher tests passed all 264 tests; launcher lint passed; npm pack dry-run reported `create-mono-stack@0.1.38`, 288 files, and no credentials.

### TEST-RELEASE-002: Repository validation

- **Small task:** Verify the release candidate before committing.
- **Source:** Root and package validation guidance.
- **Test place:** `just check`, package lint/test, artifact dry-run, and whitespace check.
- **Starting state:** Release changes are versioned `0.1.38` and not committed.
- **Exact input or fixture:** Current worktree containing only the collector fix, checklists, version, and fixture changes.
- **Interaction steps:** Run package checks, root checks, inspect the artifact, and check whitespace.
- **Main behavior:** The candidate is formatted, tested, and publishable.
- **Expected result:** All commands exit zero without bypass flags.
- **Must change:** No source files during validation.
- **Must not happen:** No skipped hooks or disabled checks.
- **Planned command:** `pnpm --filter create-mono-stack lint`, `just check`, and `git diff --check`
- **Expected result before the code change:** The candidate is not yet versioned `0.1.38`.
- **First observed run:** The full release gate had not run before versioning.
- **Passing rerun:** `just check` passed build, lint, typecheck, format, skills, template, launcher, and server checks; existing React Compiler compatibility warnings remained non-fatal. `git diff --check` passed.

### TEST-RELEASE-003: Commit, push, and tag

- **Small task:** Publish the release commit and immutable version tag.
- **Source:** User authorization and repository Git safety rules.
- **Test place:** Local Git state and `origin` remote refs.
- **Starting state:** Validation passes; intended changes are unstaged; `v0.1.38` does not exist.
- **Exact input or fixture:** `chore(release): prepare create-mono-stack 0.1.38`; annotated tag `v0.1.38`.
- **Interaction steps:** Inspect status/diff/log, commit with hooks, push `master`, create and push the tag.
- **Main behavior:** Remote branch and tag identify the release commit.
- **Expected result:** `origin/master` and `v0.1.38` point to the release commit.
- **Must change:** Local and remote Git history and the version tag.
- **Must not happen:** No amend, force-push, skipped hooks, or unrelated staged files.
- **Planned command:** `git push origin master`, `git tag -a v0.1.38 -m "Release v0.1.38"`, and `git push origin v0.1.38`
- **Expected result before the code change:** No release commit or `v0.1.38` tag exists remotely.
- **First observed run:** Commit and remote operations had not run.
- **Passing rerun:** Pending until the authorized commit, push, and tag operations complete.

### TEST-RELEASE-004: Publish npm package

- **Small task:** Publish the CLI through the authenticated repository wrapper.
- **Source:** Package-local publish wrapper and explicit user authorization.
- **Test place:** npm registry through `pnpm --filter create-mono-stack publish:package`.
- **Starting state:** Release commit and tag are pushed; worktree is clean; auth config exists.
- **Exact input or fixture:** `create-mono-stack@0.1.38`.
- **Interaction steps:** Run the package-local wrapper and query npm metadata.
- **Main behavior:** The intended CLI version is published.
- **Expected result:** npm reports version `0.1.38` as `latest`.
- **Must change:** npm registry metadata only.
- **Must not happen:** No direct npm publish or credentials in Git.
- **Planned command:** `pnpm --filter create-mono-stack publish:package` and `npm view create-mono-stack dist-tags version --json`
- **Expected result before the code change:** `0.1.38` is not published and `latest` remains `0.1.37`.
- **First observed run:** Publication had not run.
- **Passing rerun:** Pending until the authenticated package wrapper completes and npm metadata is verified.

## Release Steps

- [x] Bump package version and current-template fixture.
- [x] Run and record release validation.
- [x] Inspect final diff and stage only intended files.
- [ ] Commit with a Conventional Commit message and passing hooks.
- [ ] Push `master`.
- [ ] Create and push annotated `v0.1.38`.
- [ ] Publish with `pnpm --filter create-mono-stack publish:package`.
- [ ] Verify remote refs, npm metadata, artifact, and final status.

## Risks And Follow-Up

- npm publication is irreversible for this version; corrections require a new patch version.
- Do not publish if authentication is missing or package validation fails.

## Validation Notes

- `pnpm --filter create-mono-stack test` passed all 264 tests.
- `pnpm --filter create-mono-stack lint` passed.
- `pnpm --filter create-mono-stack exec npm pack --dry-run` reported `create-mono-stack@0.1.38` with 288 files and no credentials.
- `node --test scripts/form-management-policy.test.mjs` passed all 3 tests.
- `just check` passed all configured checks; existing React Compiler compatibility warnings were non-fatal.
- `git diff --check` passed.
- The TanStack Form example now references the shared `createTodoInputSchema` for submit validation; all four skill roots and `.skills-sync.json` were synchronized and validated.

## Updates

### 2026-08-24 Release Completion

- `TEST-RELEASE-003` passing rerun: Commit `036715a` was pushed to `origin/master`; annotated tag `v0.1.38` was pushed and peels to the release commit. No force-push or hook bypass was used.
- `TEST-RELEASE-004` passing rerun: `pnpm --filter create-mono-stack publish:package` published successfully; npm metadata reports version `0.1.38` and `latest: 0.1.38`.
- Release steps completed: version and fixture bump, validation, intended-file staging, commit, push, tag push, npm publication, remote verification, and final metadata verification.
