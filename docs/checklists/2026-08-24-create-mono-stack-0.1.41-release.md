# create-mono-stack 0.1.41 Release

- Checklist ID: CHECKLIST-20260824-create-mono-stack-0.1.41-release
- Previous implementation checklist: `docs/checklists/2026-08-24-root-postgres-pgadmin-script.md`
- Release type: Patch
- Status: In progress

## Implementation Description

Release the template's new root `db:up` and `db:down` scripts. `db:up` starts only Postgres and
pgAdmin; `db:down` stops only those services while preserving volumes. No public API, database
migration, dependency, security, or environment contract changes are included.

## Acceptance Criteria

- [x] Package metadata is version `0.1.41`.
- [x] Repository validation passes, with known unrelated flaky Ink tests recorded if they recur.
- [x] The npm artifact contains the intended package files and no credentials.
- [ ] Release commit, branch, tag, and npm `latest` metadata all identify `0.1.41`.
- [ ] Release documentation records the user-visible behavior and validation.

## Exact Validation Cases

### TEST-RELEASE-001: Candidate metadata is patch version 0.1.41

- Small task: Bump the launcher package version for release.
- Source: Repository release workflow and current published version `0.1.40`.
- Test place: `core/create-mono-stack/package.json` and package metadata parser.
- Starting state: Package metadata is `0.1.40`.
- Exact input or fixture: Version `0.1.41`.
- Interaction steps: Read package metadata and compare the version.
- Main behavior: The candidate is a patch release.
- Expected result: Package version equals `0.1.41`.
- Must change: `core/create-mono-stack/package.json`.
- Must not happen: The major or minor version must not change.
- Planned command: `node -e 'const p=require("./core/create-mono-stack/package.json"); if(p.version!=="0.1.41") process.exit(1)'`.
- Expected result before the code change: Fails because metadata is `0.1.40`.
- First observed run: The pre-release metadata check failed because the package was still `0.1.40`.
- Passing rerun:

### TEST-RELEASE-002: Release quality gate passes

- Small task: Validate the complete repository before publishing.
- Source: Root `just check` release gate and package-local validation guidance.
- Test place: Repository checks.
- Starting state: Candidate changes and version metadata are prepared.
- Exact input or fixture: Working tree candidate.
- Interaction steps: Run the required checks without bypass flags.
- Main behavior: The release candidate passes repository validation.
- Expected result: `just check` exits successfully.
- Must change: No source files as a side effect.
- Must not happen: No skipped hooks, disabled checks, or credential changes.
- Planned command: `just check`.
- Expected result before the code change: Existing validation result is not yet recorded for `0.1.41`.
- First observed run: The initial focused suite failed because `TEST-MANAGE-001` still used the prior revision `v0.1.40`.
- Passing rerun: `node --test test/cli.test.js --test-name-pattern='TEST-MANAGE-001'` passed after updating the fixture to `v0.1.41`.

### TEST-RELEASE-003: Published artifact is safe and complete

- Small task: Inspect the package artifact before publication.
- Source: Package release workflow and package `files` allowlist.
- Test place: npm pack dry run.
- Starting state: Versioned candidate package.
- Exact input or fixture: `create-mono-stack@0.1.41`.
- Interaction steps: Render the npm pack manifest and inspect file paths and package version.
- Main behavior: The artifact is reproducible and excludes credentials.
- Expected result: Artifact is named `create-mono-stack-0.1.41.tgz` and contains no `.npmrc.auth` or credential files.
- Must change: No source files.
- Must not happen: Secrets must not enter the artifact.
- Planned command: `pnpm --filter create-mono-stack exec npm pack --dry-run --json`.
- Expected result before the code change: The artifact still reports `0.1.40`.
- First observed run: `just check` reached the full launcher suite but failed on a known flaky Ink timeout with `270/271` tests passing.
- Passing rerun: The second `just check` passed with `271/271` launcher tests, all builds, typechecks, lint, formatting, skills checks, and server unit/API E2E tests passing.

### TEST-RELEASE-004: Remote release references and npm metadata agree

- Small task: Publish and verify the release.
- Source: Explicit user authorization and repository release workflow.
- Test place: Git remote refs and npm registry metadata.
- Starting state: Release commit is validated and auth config is available.
- Exact input or fixture: Commit, annotated tag `v0.1.41`, and npm package `0.1.41`.
- Interaction steps: Commit, push branch, create and push tag, publish through the package wrapper, then query remote metadata.
- Main behavior: Source and registry identify the same release.
- Expected result: `origin/master`, `v0.1.41`, and npm `latest` resolve to `0.1.41`.
- Must change: Git history, remote refs, and npm registry.
- Must not happen: No force push, skipped hooks, direct `npm publish`, or unrelated files in the release commit.
- Planned command: `git push origin master`, `git tag -a v0.1.41 -m "Release v0.1.41"`, `git push origin v0.1.41`, `pnpm --filter create-mono-stack publish:package`.
- Expected result before the code change: `v0.1.41` and npm `0.1.41` do not exist.
- First observed run: `npm pack --dry-run --json` reported `create-mono-stack-0.1.41.tgz` with no credential files.
- Passing rerun: The artifact inspection remained valid after the final fixture update; package lint/typecheck and formatting also passed.

## Implementation Plan

- [x] Update `core/create-mono-stack/package.json` from `0.1.40` to `0.1.41`.
- [x] Run focused tests, package lint/typecheck, root release gate, formatting, and artifact inspection. The first gate run hit the known unrelated Ink timeout; the rerun passed.
- [ ] Review the final diff and status, then commit only the intended files with a detailed Conventional Commit body.
- [ ] Push `master`, create and push annotated `v0.1.41`, and publish through `publish:package`.
- [ ] Verify remote refs and npm metadata, then record completion.

## Validation Notes

- Planned before implementation.
- The rerun of `just check` passed all required checks with `271/271` launcher tests passing; expected TanStack React Compiler warnings remain non-fatal.
