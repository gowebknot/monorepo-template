# create-mono-stack 0.1.44 Release

- Checklist ID: CHECKLIST-20260827-create-mono-stack-0.1.44-release
- Related implementation checklist: `docs/checklists/2026-08-27-agent-skill-enforcement.md`
- Release type: Patch
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

Release the OpenCode build-agent policy and synchronized planning, architecture, and E2E skill
guidance in `create-mono-stack` 0.1.44. The package runtime API, database, environment, and
dependency contracts are unchanged.

## Acceptance Criteria

- [ ] Package metadata is version `0.1.44`.
- [ ] `just check` passes without bypasses.
- [ ] The npm artifact is `create-mono-stack-0.1.44.tgz` and contains no credentials.
- [ ] Release commit, `master`, annotated tag `v0.1.44`, and npm `latest` identify this release.
- [ ] Release documentation records the changes and validation.

## Exact Validation Cases

### TEST-RELEASE-001: Candidate metadata is patch version 0.1.44

- Small task: Bump the launcher package version for release.
- Source: Published package is `0.1.43`; repository release policy requires a patch increment.
- Test place: `core/create-mono-stack/package.json` metadata parser.
- Starting state: Package metadata is `0.1.43`.
- Exact input or fixture: Version `0.1.44`.
- Interaction steps: Read package metadata and compare its version.
- Main behavior: The candidate is the next patch release.
- Expected result: Package version equals `0.1.44`.
- Must change: `core/create-mono-stack/package.json`.
- Must not happen: Major or minor version changes.
- Planned command: `node -e 'const p=require("./core/create-mono-stack/package.json"); if(p.version!=="0.1.44") process.exit(1)'`
- Expected result before the code change: Fails because metadata is `0.1.43`.
- First observed run: The metadata check failed because the package was still `0.1.43`.
- Passing rerun:

### TEST-RELEASE-002: Repository release gate passes

- Small task: Validate the complete repository before publication.
- Source: `core/create-mono-stack/AGENTS.md` and release workflow.
- Test place: Root `just check`.
- Starting state: Candidate version and skill changes are present in the working tree.
- Exact input or fixture: Complete release candidate.
- Interaction steps: Run the repository gate without bypass flags.
- Main behavior: The release candidate passes required validation.
- Expected result: All checks exit successfully.
- Must change: No source files as a side effect.
- Must not happen: No skipped hooks, disabled checks, or credential changes.
- Planned command: `just check`
- Expected result before the code change: The candidate has not yet passed the release gate.
- First observed run:
- Passing rerun:

### TEST-RELEASE-003: Published artifact is safe and complete

- Small task: Inspect the npm artifact before publication.
- Source: Package `files` allowlist and release workflow.
- Test place: npm pack dry run.
- Starting state: Validated versioned release candidate.
- Exact input or fixture: `create-mono-stack@0.1.44`.
- Interaction steps: Render the pack manifest and inspect file paths and package version.
- Main behavior: The artifact is reproducible and excludes credentials.
- Expected result: Artifact is named `create-mono-stack-0.1.44.tgz` and contains no auth or credential files.
- Must change: No source files.
- Must not happen: Secrets enter the artifact.
- Planned command: `pnpm --filter create-mono-stack exec npm pack --dry-run --json`
- Expected result before the code change: The artifact reports `0.1.43`.
- First observed run:
- Passing rerun:

### TEST-RELEASE-004: Git and npm release references agree

- Small task: Commit, tag, publish, and verify the release.
- Source: User authorization and repository release workflow.
- Test place: Git remote refs and npm registry metadata.
- Starting state: Validated release commit and available publish auth configuration.
- Exact input or fixture: `master`, annotated tag `v0.1.44`, and npm package `0.1.44`.
- Interaction steps: Commit, push `master`, create and push the annotated tag, publish through the
  package wrapper, then query refs and npm metadata.
- Main behavior: Source control and npm identify the same release.
- Expected result: `origin/master`, `v0.1.44`, and npm `latest` resolve to this release.
- Must change: Git history, remote refs, and npm registry.
- Must not happen: No force push, skipped hooks, direct `npm publish`, or unrelated files in the commit.
- Planned command: `git push origin master && git tag -a v0.1.44 -m "Release v0.1.44" && git push origin v0.1.44 && pnpm --filter create-mono-stack publish:package`
- Expected result before the code change: `v0.1.44` and npm `0.1.44` do not exist.
- First observed run:
- Passing rerun:

## Implementation Plan

- [x] Bump `core/create-mono-stack/package.json` from `0.1.43` to `0.1.44`.
- [x] Run `just check`, metadata validation, and artifact inspection. Metadata passed; the first full gate failed on the release-coupled `v0.1.43` fixture before correction.
- [x] Inspect the complete diff and stage only intended release files.
- [/] Commit with detailed Conventional Commit message and normal hooks. The first normal hook run rejected the commit after 274/275 launcher tests because the Ink multiselect test timed out; no bypass was used.
- [ ] Push `master`, create and push annotated tag `v0.1.44`.
- [ ] Publish using `pnpm --filter create-mono-stack publish:package`.
- [ ] Verify remote refs, npm metadata, artifact contents, and final worktree state.

## Risks And Non-Goals

- This is a patch release containing agent configuration and portable-skill guidance.
- No generated application runtime code is changed.
- Publication requires the ignored `.npmrc.auth` or explicit `NPM_CONFIG_USERCONFIG`.

## Validation Notes

- Metadata validation passed after the version bump.
- The first `just check` failed in `TEST-MANAGE-001` because its fixture still used `v0.1.43`; the fixture is now aligned to `v0.1.44` and the focused test is being rerun.
- The focused launcher suite passed all 275 tests after the fixture correction.
- The rerun of `just check` passed all repository checks, including 275 launcher tests and 104 skills tests.
- The npm dry run reported `create-mono-stack-0.1.44.tgz` with 294 files and no auth or credential files.
- The first commit hook run failed only on the known timing-sensitive Ink test `selects additional stack features through the multiselect screen`; the hook completed 274 launcher tests successfully before the timeout.
