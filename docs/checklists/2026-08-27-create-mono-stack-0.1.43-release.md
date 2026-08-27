# create-mono-stack 0.1.43 Release

- Checklist ID: CHECKLIST-20260827-create-mono-stack-0.1.43-release
- Related implementation checklist: `docs/checklists/2026-08-27-frontend-lazy-loading-default.md`
- Release type: Patch
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

Release the synchronized frontend lazy-loading skill guidance in `create-mono-stack` 0.1.43.
The package behavior, API, database, environment, dependency, and security contracts are unchanged.

## Acceptance Criteria

- Package metadata is version `0.1.43`.
- Required repository validation passes without bypasses.
- The npm artifact is `create-mono-stack-0.1.43.tgz` and contains no credentials.
- Release commit, `master`, annotated tag `v0.1.43`, and npm `latest` identify the same release.
- Release documentation records the user-visible skill guidance and validation.

## Exact Validation Cases

### TEST-RELEASE-001: Candidate metadata is patch version 0.1.43

- **Small task:** Bump the launcher package version for release.
- **Source:** Published npm metadata reports `0.1.42`; repository release policy requires a patch increment.
- **Test place:** `core/create-mono-stack/package.json` and package metadata parser.
- **Starting state:** Package metadata is `0.1.42`.
- **Exact input or fixture:** Version `0.1.43`.
- **Interaction steps:** Read package metadata and compare its version.
- **Main behavior:** The candidate is the next patch release.
- **Expected result:** Package version equals `0.1.43`.
- **Must change:** `core/create-mono-stack/package.json`.
- **Must not happen:** Major or minor version changes.
- **Planned command:** `node -e 'const p=require("./core/create-mono-stack/package.json"); if(p.version!=="0.1.43") process.exit(1)'`.
- **Expected result before the code change:** Fails because metadata is `0.1.42`.
- **First observed run:** The metadata check failed because the package was still `0.1.42`.
- **Passing rerun:** The metadata check passed with package version `0.1.43`.

### TEST-RELEASE-002: Repository release gate passes

- **Small task:** Validate the complete repository before publication.
- **Source:** `core/create-mono-stack/AGENTS.md` and root release workflow.
- **Test place:** Root `just check` and package validation commands.
- **Starting state:** Candidate version and skill changes are present in the working tree.
- **Exact input or fixture:** The complete release candidate.
- **Interaction steps:** Run the repository gate and package-specific checks without bypass flags.
- **Main behavior:** The release candidate passes required validation.
- **Expected result:** All required checks exit successfully.
- **Must change:** No source files as a side effect.
- **Must not happen:** No skipped hooks, disabled checks, or credential changes.
- **Planned command:** `just check`.
- **Expected result before the code change:** The release candidate has not yet been validated.
- **First observed run:** The first full gate failed in `TEST-MANAGE-001` because its fixture still used template revision `v0.1.42`; after that fix, a second run hit a known Ink timing timeout in the multiselect test.
- **Passing rerun:** `just check` passed all repository checks, including 275/275 launcher tests, 104/104 skill tests, builds, typechecks, lint, formatting, and server unit/API E2E tests.

### TEST-RELEASE-003: Published artifact is safe and complete

- **Small task:** Inspect the npm artifact before publication.
- **Source:** Package `files` allowlist and release workflow.
- **Test place:** npm pack dry run.
- **Starting state:** Versioned release candidate.
- **Exact input or fixture:** `create-mono-stack@0.1.43`.
- **Interaction steps:** Render the pack manifest and inspect file paths and package version.
- **Main behavior:** The artifact is reproducible and excludes credentials.
- **Expected result:** Artifact is named `create-mono-stack-0.1.43.tgz` and contains no auth or credential files.
- **Must change:** No source files.
- **Must not happen:** Secrets enter the artifact.
- **Planned command:** `pnpm --filter create-mono-stack exec npm pack --dry-run --json`.
- **Expected result before the code change:** The artifact reports `0.1.42`.
- **First observed run:** `npm pack --dry-run --json` reported the expected `create-mono-stack-0.1.43.tgz` artifact with no auth files.
- **Passing rerun:** The dry run reported `create-mono-stack-0.1.43.tgz` and no auth or credential files.

### TEST-RELEASE-004: Git and npm release references agree

- **Small task:** Commit, tag, publish, and verify the release.
- **Source:** Explicit user authorization and repository release workflow.
- **Test place:** Git remote refs and npm registry metadata.
- **Starting state:** Validated release commit and available publish auth configuration.
- **Exact input or fixture:** `master`, annotated tag `v0.1.43`, and npm package `0.1.43`.
- **Interaction steps:** Commit, push `master`, create and push the annotated tag, publish through `publish:package`, then query refs and npm metadata.
- **Main behavior:** Source control and npm identify the same release.
- **Expected result:** `origin/master`, `v0.1.43`, and npm `latest` resolve to the release commit and version `0.1.43`.
- **Must change:** Git history, remote refs, and npm registry.
- **Must not happen:** No force push, skipped hooks, direct `npm publish`, or unrelated files in the release commit.
- **Planned command:** `git push origin master`, `git tag -a v0.1.43 -m "Release v0.1.43"`, `git push origin v0.1.43`, `pnpm --filter create-mono-stack publish:package`.
- **Expected result before the code change:** `v0.1.43` and npm `0.1.43` do not exist.
- **First observed run:** Pending release commit and publication.
- **Passing rerun:** Pending remote and registry verification.

## Implementation Plan

- [x] Update `core/create-mono-stack/package.json` from `0.1.42` to `0.1.43`.
- [x] Run `just check`, package artifact inspection, and focused metadata checks. The first full gate hit a known unrelated Ink timing timeout; the rerun passed.
- [ ] Inspect the complete diff and stage only the intended skill, checklist, manifest, and sync metadata files.
- [ ] Commit with a detailed Conventional Commit message and normal hooks.
- [ ] Push `master`, create and push annotated tag `v0.1.43`.
- [ ] Publish using `pnpm --filter create-mono-stack publish:package`.
- [ ] Verify remote refs, npm metadata, artifact contents, and final worktree state.
- [ ] Record observed failures, passing reruns, and release completion.

## Risks And Non-Goals

- This is a patch release containing documentation and portable-skill guidance only.
- No generated application code is changed.
- Publication requires the repository's ignored `.npmrc.auth` or explicit `NPM_CONFIG_USERCONFIG`.

## Validation Notes

- The first full gate exposed and then allowed correction of the release-coupled `v0.1.42` fixture.
- The next full gate passed all checks except one known Ink timing test, which timed out after 274/275 launcher tests.
- The final `just check` passed all checks with 275/275 launcher tests passing; existing TanStack Table React Compiler warnings remained non-fatal.
