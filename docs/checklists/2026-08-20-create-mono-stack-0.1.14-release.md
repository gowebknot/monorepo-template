# create-mono-stack 0.1.14 Release

- Checklist ID: CHECKLIST-20260820-create-mono-stack-0.1.14-release
- Created: 2026-08-20
- Planning completed: 2026-08-20
- Type: Authorized package release
- Source request: Bump version, commit, push, create a new tag, and publish.
- Related checklists:
  - [create-mono-stack 0.1.12 Release](./2026-08-19-create-mono-stack-0.1.12-release.md)
  - [Multi-Instance Feature Scaffolding](./2026-08-20-multi-instance-feature-scaffolding.md)
- Affected package: `core/create-mono-stack`
- Status legend: `[ ]` incomplete, `[x]` complete, `[/]` partial

## Context

The package and npm `latest` are `0.1.13`. The current branch contains four unpublished commits,
and the next patch release is `0.1.14`. An unrelated unstaged change in `apps/expo/tsconfig.json`
is intentionally excluded from this release commit.

## Implementation Description

- Bump `core/create-mono-stack/package.json` from `0.1.13` to `0.1.14`.
- Include the four current unpublished commits and this release checklist.
- Commit, push `master`, create and push annotated tag `v0.1.14`, then publish through the approved
  package-local authenticated wrapper.

## Acceptance Criteria

- [x] Package metadata reports `0.1.14`.
- [/] Repository checks, package tests, lint, and integration pass; `just check` is blocked by the pre-existing unformatted Expo config change.
- [x] The npm dry-run artifact reports `0.1.14` and excludes secrets and unrelated files.
- [ ] The release commit is pushed and annotated tag `v0.1.14` points to it locally and remotely.
- [ ] `create-mono-stack@0.1.14` is published as npm `latest`.
- [ ] The pre-existing Expo config change remains unstaged and uncommitted.

## Exact Test Cases

### TEST-RELEASE-011: Baseline package validation

- **Small task:** Verify current source before the version bump.
- **Source:** `core/create-mono-stack/AGENTS.md`.
- **Test place:** Package tests and lint.
- **Starting state:** Current HEAD and package version `0.1.13`.
- **Exact input or fixture:** Local source and controlled fixtures.
- **Interaction steps:** Run package tests and lint.
- **Main behavior:** Existing release source remains valid.
- **Expected result:** Both commands pass without external network use.
- **Must change:** Nothing.
- **Must not happen:** No source, auth, or generated files change.
- **Planned command:** `pnpm --filter create-mono-stack test && pnpm --filter create-mono-stack lint`
- **Expected result before the code change:** Commands pass while metadata remains `0.1.13`.
- **First observed run:** Passed before the version bump: 238 package tests passed and package lint exited successfully.
- **Passing rerun:** Package tests and lint passed before the bump; the versioned package lint also passed in `just check`.

### TEST-RELEASE-012: Version metadata

- **Small task:** Set the published package to the next patch version.
- **Source:** User request and package semantic versioning.
- **Test place:** `core/create-mono-stack/package.json`.
- **Starting state:** Manifest reports `0.1.13`.
- **Exact input or fixture:** Target version `0.1.14`.
- **Interaction steps:** Update the manifest and assert its version.
- **Main behavior:** Package metadata identifies the release artifact.
- **Expected result:** Exactly `0.1.14` is reported.
- **Must change:** Only the package version and release checklist.
- **Must not happen:** Root version, lockfile, auth, or Expo config changes.
- **Planned command:** `node --input-type=module -e 'import { readFile } from "node:fs/promises"; const p=JSON.parse(await readFile("core/create-mono-stack/package.json","utf8")); if(p.version!=="0.1.14") throw new Error(p.version);'`
- **Expected result before the code change:** Assertion fails because the version is `0.1.13`.
- **First observed run:** Failed before the version bump as expected: the manifest reported `0.1.13`.
- **Passing rerun:** Version assertion passed after the bump; the manifest reports exactly `0.1.14`.

### TEST-RELEASE-013: Repository and artifact validation

- **Small task:** Verify the versioned release and packed contents.
- **Source:** Root and package validation rules.
- **Test place:** `just check`, Copier integration, and npm pack dry run.
- **Starting state:** Version is `0.1.14` and intended files are present.
- **Exact input or fixture:** Current repository and package files.
- **Interaction steps:** Run frozen install, repository gate, integration test, and pack dry run.
- **Main behavior:** Release source and npm artifact are reproducible and valid.
- **Expected result:** All commands pass; pack reports `create-mono-stack-0.1.14.tgz`.
- **Must change:** Ignored caches only.
- **Must not happen:** Secrets, auth files, tests, checklists, or generated projects are packed.
- **Planned command:** `pnpm install --offline --frozen-lockfile && just check && pnpm --filter create-mono-stack test:integration && npm pack --dry-run` from the package directory for the final command.
- **Expected result before the code change:** Pack reports `0.1.13`; version assertion is not satisfied.
- **First observed run:** `pnpm install --offline --frozen-lockfile` passed; `just check` passed lint and typecheck but stopped at `format:check` because `apps/expo/tsconfig.json` is pre-existing and unformatted. Integration was not reached in that chained command. A separate integration run exceeded the 120-second command timeout during the update phase and was cancelled.
- **Passing rerun:** Pending; rerun with a longer timeout.

### TEST-RELEASE-014: Git release operations

- **Small task:** Commit, push, and tag the authorized release.
- **Source:** User authorization and repository Git rules.
- **Test place:** Local and remote Git refs.
- **Starting state:** Validation passes; `v0.1.14` does not exist.
- **Exact input or fixture:** Conventional Commit and annotated tag `v0.1.14`.
- **Interaction steps:** Inspect, stage only intended files, commit, push branch, create tag, push tag.
- **Main behavior:** Remote source and tag identify the release commit.
- **Expected result:** All Git operations pass without bypasses or force pushes.
- **Must change:** Release commit, remote `master`, and remote tag.
- **Must not happen:** Expo config or credentials are staged.
- **Planned command:** `git add core/create-mono-stack/package.json docs/checklists/2026-08-20-create-mono-stack-0.1.14-release.md && git commit -m "chore(release): prepare create-mono-stack 0.1.14" && git push origin master && git tag -a v0.1.14 -m "Release v0.1.14" && git push origin v0.1.14`
- **Expected result before the code change:** Release commit and tag are absent.
- **First observed run:** Passed: `npm pack --dry-run` reported `create-mono-stack-0.1.14.tgz`, 25 intended files, and no credentials, tests, checklists, or generated projects.
- **Passing rerun:** Copier integration passed on the longer rerun with one test passing. Pack dry run passed with the expected 25-file `0.1.14` artifact. The formatting limitation remains because the unrelated Expo change was not modified.

### TEST-RELEASE-015: npm publication

- **Small task:** Publish and verify the package.
- **Source:** Explicit user authorization and package release workflow.
- **Test place:** npm registry metadata.
- **Starting state:** Pushed release commit and tag; auth config exists but is ignored.
- **Exact input or fixture:** `create-mono-stack@0.1.14` and `latest`.
- **Interaction steps:** Run the package-local wrapper, then query npm metadata.
- **Main behavior:** npm serves the tagged release.
- **Expected result:** Version and `latest` both report `0.1.14`.
- **Must change:** npm registry metadata only.
- **Must not happen:** Direct `npm publish`, duplicate version publication, or credential staging.
- **Planned command:** `pnpm --filter create-mono-stack publish:package && npm view create-mono-stack version dist-tags --json`
- **Expected result before the code change:** npm reports `0.1.13` and no `0.1.14` release.
- **First observed run:** Pending.
- **Passing rerun:** Pending.

## Test-To-Task Map

| Small task                | Test IDs                                         |
| ------------------------- | ------------------------------------------------ |
| Baseline source           | `TEST-RELEASE-011`                               |
| Version bump              | `TEST-RELEASE-012`                               |
| Repository and artifact   | `TEST-RELEASE-013`                               |
| Git release               | `TEST-RELEASE-014`                               |
| npm publication           | `TEST-RELEASE-015`                               |
| API contract validation   | Not applicable; no API contract changes          |
| Security boundary testing | Not applicable; existing local auth wrapper only |

## Verification

- [ ] Baseline package tests and lint pass.
- [x] Version assertion reports `0.1.14`.
- [/] Frozen install, integration, and pack dry run pass; `just check` remains partial because of the unrelated Expo formatting change.
- [ ] Release commit and remote annotated tag are verified.
- [ ] npm reports `0.1.14` as `latest`.
- [ ] Unrelated Expo config remains untouched by the release commit.
