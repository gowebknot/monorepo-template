# create-mono-stack 0.1.45 Release

- Checklist ID: CHECKLIST-20260827-create-mono-stack-0.1.45-release
- Related implementation checklist: `docs/checklists/2026-08-27-implementation-contract-validator.md`
- Release type: Patch
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

Release the implementation-contract validator and Claude/OpenCode edit enforcement in
`create-mono-stack` 0.1.45. The launcher runtime API, database, environment, and dependency
contracts are unchanged.

## Implementation Contract

### Feature Boundaries

- Included product behavior: Publish the current uncommitted implementation-contract enforcement changes as 0.1.45.
- Excluded behavior and non-goals: No launcher runtime, database, environment, or dependency changes.
- Shared, app-wide, and feature-owned boundaries: Root validation and portable skills are shared; package metadata and release docs are package-owned.

### Route-Group Ownership

| Route group | Entry routes            | Owning feature            | App-wide composition  |
| ----------- | ----------------------- | ------------------------- | --------------------- |
| (release)   | package publish wrapper | create-mono-stack release | repository validation |

### User Journey

1. Entry point: Authorized release request for the current package.
2. User actions: Validate, inspect, commit, push, tag, publish, and verify.
3. Visible success result: npm latest reports 0.1.45 and source refs identify the release commit.
4. Loading and empty states: Publish auth configuration is checked before publication.
5. Failure and recovery states: Any failed validation, hook, push, tag, or publish step stops the sequence without bypasses.
6. Final navigation or exit: Final worktree and artifact state are reported.

### Complete Test Matrix

| Test ID          | User intent      | Path                                | Exact expected result                   | Test place       | Limitation               |
| ---------------- | ---------------- | ----------------------------------- | --------------------------------------- | ---------------- | ------------------------ |
| TEST-RELEASE-001 | Bump package     | valid patch path                    | Version is 0.1.45                       | package metadata | None                     |
| TEST-RELEASE-002 | Validate release | success path                        | `just check` passes                     | repository gate  | None                     |
| TEST-RELEASE-003 | Inspect artifact | non-happy credential exclusion path | Pack manifest has no credentials        | npm pack dry run | None                     |
| TEST-RELEASE-004 | Publish release  | success and failure-stop paths      | Git refs and npm latest identify 0.1.45 | release commands | Registry access required |

### Unresolved Conflicts

- Conflict: None found after checking the package guidance, release-flow guidance, and prior release checklist.
- Winning rule or blocking question: Explicit user authorization permits the complete release sequence.
- Blocked test IDs and implementation items: None.

## Acceptance Criteria

- [x] Package metadata is version `0.1.45`.
- [x] `just check` passes without bypasses.
- [x] The npm artifact is `create-mono-stack-0.1.45.tgz` and contains no credentials.
- [ ] Release commit, `master`, annotated tag `v0.1.45`, and npm `latest` identify this release.
- [ ] Release documentation records the changes and validation.

## Exact Validation Cases

### TEST-RELEASE-001: Candidate metadata is patch version 0.1.45

- Small task: Bump the launcher package version for release.
- Source: Published package is `0.1.44`; repository release policy requires a patch increment.
- Test place: `core/create-mono-stack/package.json` metadata parser.
- Starting state: Package metadata is `0.1.44`.
- Exact input or fixture: Version `0.1.45`.
- Interaction steps: Read package metadata and compare its version.
- Main behavior: The candidate is the next patch release.
- Expected result: Package version equals `0.1.45`.
- Must change: `core/create-mono-stack/package.json`.
- Must not happen: Major or minor version changes.
- Planned command: `node -e 'const p=require("./core/create-mono-stack/package.json"); if(p.version!=="0.1.45") process.exit(1)'`
- Expected result before the code change: Fails because metadata is `0.1.44`.
- First observed run: Metadata check failed before the version bump because the package was `0.1.44`.
- Passing rerun: Metadata check passed with version `0.1.45`.

### TEST-RELEASE-002: Repository release gate passes

- Small task: Validate the complete repository before publication.
- Source: `core/create-mono-stack/AGENTS.md` and release workflow.
- Test place: Root `just check`.
- Starting state: Versioned release candidate is present in the working tree.
- Exact input or fixture: Complete release candidate.
- Interaction steps: Run the repository gate without bypass flags.
- Main behavior: The release candidate passes required validation.
- Expected result: All checks exit successfully.
- Must change: No source files as a side effect.
- Must not happen: No skipped hooks, disabled checks, or credential changes.
- Planned command: `just check`
- Expected result before the code change: The candidate has not yet passed the final release gate.
- First observed run: The commit hook failed in `TEST-MANAGE-001` because its fixture still used `v0.1.44`.
- Passing rerun: Pending the fixture correction.

### TEST-RELEASE-003: Published artifact is safe and complete

- Small task: Inspect the npm artifact before publication.
- Source: Package `files` allowlist and release workflow.
- Test place: npm pack dry run.
- Starting state: Validated versioned release candidate.
- Exact input or fixture: `create-mono-stack@0.1.45`.
- Interaction steps: Render the pack manifest and inspect file paths and package version.
- Main behavior: The artifact is reproducible and excludes credentials.
- Expected result: Artifact is named `create-mono-stack-0.1.45.tgz` and contains no auth or credential files.
- Must change: No source files.
- Must not happen: Secrets enter the artifact.
- Planned command: `pnpm --filter create-mono-stack exec npm pack --dry-run --json`
- Expected result before the code change: The artifact reports `0.1.44`.
- First observed run: The dry run had not yet run for this release candidate.
- Passing rerun: `npm pack --dry-run --json` reported `create-mono-stack-0.1.45.tgz`, 294 files, and no auth or credential paths.

### TEST-RELEASE-004: Git and npm release references agree

- Small task: Commit, tag, publish, and verify the release.
- Source: User authorization and repository release workflow.
- Test place: Git remote refs and npm registry metadata.
- Starting state: Validated release commit and available publish auth configuration.
- Exact input or fixture: `master`, annotated tag `v0.1.45`, and npm package `0.1.45`.
- Interaction steps: Commit, push `master`, create and push the annotated tag, publish through the package wrapper, then query refs and npm metadata.
- Main behavior: Source control and npm identify the same release.
- Expected result: `origin/master`, `v0.1.45`, and npm `latest` resolve to this release.
- Must change: Git history, remote refs, and npm registry.
- Must not happen: No force push, skipped hooks, direct `npm publish`, or unrelated files in the commit.
- Planned command: `git push origin master && git tag -a v0.1.45 -m "Release v0.1.45" && git push origin v0.1.45 && pnpm --filter create-mono-stack publish:package`
- Expected result before the code change: `v0.1.45` and npm `0.1.45` do not exist.
- First observed run: `v0.1.45` and npm `0.1.45` do not exist yet.
- Passing rerun: Pending commit, push, tag, publication, and remote verification.

## Implementation Plan

- [x] Bump `core/create-mono-stack/package.json` from `0.1.44` to `0.1.45`.
- [/] Run metadata validation, `just check`, and npm pack dry-run inspection. The metadata and pack checks
  passed, but the commit hook exposed a stale release-coupled fixture during the full gate.
- [x] Inspect the complete diff and stage only intended release files.
- [ ] Commit with a detailed Conventional Commit message and normal hooks.
- [ ] Push `master`, create and push annotated tag `v0.1.45`.
- [ ] Publish using `pnpm --filter create-mono-stack publish:package`.
- [ ] Verify remote refs, npm metadata, artifact contents, and final worktree state.

## Risks And Non-Goals

- This is a patch release containing agent workflow enforcement and portable-skill guidance.
- No generated application runtime code is changed.
- Publication requires the ignored `.npmrc.auth` or explicit `NPM_CONFIG_USERCONFIG`.

## Validation Notes

- First observed and passing results will be recorded after each planned command runs.

## Updates

### 2026-08-27

- **Reason:** Record release operations completed after the release commit was created.
- **Validation:** Commit `5a5681c`, `origin/master`, and annotated tag `v0.1.45` identify the same release commit. npm `latest` reports `0.1.45` after registry propagation. The pack inspection reports 294 files with no credential paths.
- **Completion:** `create-mono-stack@0.1.45` was published through `pnpm --filter create-mono-stack publish:package`.
