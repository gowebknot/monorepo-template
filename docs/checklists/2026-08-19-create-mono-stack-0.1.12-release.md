# create-mono-stack 0.1.12 Release

- Checklist ID: CHECKLIST-20260819-create-mono-stack-0.1.12-release
- Created: 2026-08-19
- Planning completed: 2026-08-19
- Type: Authorized package release
- Source request: Bump version, commit, push, create a new tag, and publish to npm.
- Related checklists:
  - [create-mono-stack 0.1.11 Release](./2026-08-18-create-mono-stack-0.1.11-release.md)
  - [create-mono-stack 0.1.11 Git Tag](./2026-08-18-create-mono-stack-0.1.11-git-tag.md)
  - [Fix Reference Profile Dependency Merge Precedence](./2026-08-19-fix-reference-profile-dependency-merge-precedence.md)
- Affected package: `core/create-mono-stack`
- Status legend: `[ ]` incomplete, `[x]` complete, `[/]` partial

## Context

The current worktree contains the completed reference-profile dependency precedence fix and the
Metro singleton-module resolution fix. The package is currently `0.1.11`, npm `latest` is `0.1.11`,
and no `v0.1.12` tag exists. This release packages the current source changes as patch version
`0.1.12`.

## Implementation Description

- Bump `core/create-mono-stack/package.json` from `0.1.11` to `0.1.12`.
- Include the current Metro resolver fix, native overlay dependency precedence fix, related tests, and
  the completed implementation checklist in the release commit.
- Commit with a Conventional Commit message, push the tracked branch, create and push annotated tag
  `v0.1.12`, then publish through the package-local authenticated wrapper.

## Acceptance Criteria

- [x] Package metadata reports version `0.1.12`.
- [x] Frozen installation, repository checks, package tests, lint, and Copier integration pass.
- [x] The npm dry-run artifact is version `0.1.12` and excludes secrets and unrelated files.
- [ ] All current intended worktree changes are included in the release commit.
- [ ] The release commit is pushed to the tracked branch.
- [ ] Annotated tag `v0.1.12` points to the pushed release commit and is present on the remote.
- [ ] `create-mono-stack@0.1.12` is published through `publish:package` and is npm `latest`.

## Exact Test Cases

### TEST-RELEASE-005: Baseline package validation

- **Small task:** Confirm the current implementation changes are valid before changing release metadata.
- **Source:** `core/create-mono-stack/AGENTS.md` validation commands and the linked implementation
  checklist.
- **Test place:** `core/create-mono-stack` package tests and lint.
- **Starting state:** The worktree has the six implementation/test files and the completed fix checklist
  unstaged; package version is `0.1.11`.
- **Exact input or fixture:** Current repository source and local test fixtures.
- **Interaction steps:** Run the package test suite, then package lint.
- **Main behavior:** The source intended for the release passes its focused checks before the version
  bump.
- **Expected result:** All package tests pass and lint exits successfully.
- **Must change:** No source or metadata changes are required by this case.
- **Must not happen:** Tests must not contact the template remote, PyPI, npm, or commit files.
- **Planned command:** `pnpm --filter create-mono-stack test && pnpm --filter create-mono-stack lint`
- **Expected result before the code change:** The current implementation should pass; the package
  version remains `0.1.11` until the release metadata edit.
- **First observed run:** Passed before the version bump: 230 package tests passed and package lint exited successfully.
- **Passing rerun:** Package tests and lint passed again as part of `just check`, with 230 launcher
  tests passing and the package lint task exiting successfully.

### TEST-RELEASE-006: Version metadata bump

- **Small task:** Change the published package version to the next patch version.
- **Source:** User request and semantic-versioned package metadata.
- **Test place:** `core/create-mono-stack/package.json` exact version assertion.
- **Starting state:** `core/create-mono-stack/package.json` reports `0.1.11`; no `v0.1.12` tag exists.
- **Exact input or fixture:** Target version `0.1.12`.
- **Interaction steps:** Update only the package version field, then read the manifest and inspect the
  diff.
- **Main behavior:** The package metadata identifies the release artifact as `0.1.12`.
- **Expected result:** The manifest reports exactly `0.1.12`, with no unrelated package metadata change.
- **Must change:** `core/create-mono-stack/package.json` version field.
- **Must not happen:** The root private workspace version, dependency versions, auth files, or source
  implementation must not be changed by the version bump.
- **Planned command:** `node --input-type=module -e 'import { readFile } from "node:fs/promises"; const packageJson = JSON.parse(await readFile("core/create-mono-stack/package.json", "utf8")); if (packageJson.version !== "0.1.12") throw new Error(`unexpected version: ${packageJson.version}`);'`
- **Expected result before the code change:** The command fails because the manifest reports `0.1.11`.
- **First observed run:** Failed before the version bump as expected: the manifest reported `0.1.11`.
- **Passing rerun:** Version assertion passed after the bump; the manifest reports exactly `0.1.12`.

### TEST-RELEASE-007: Repository release validation

- **Small task:** Verify the versioned release source and generated artifacts.
- **Source:** Root `AGENTS.md`, `core/AGENTS.md`, `core/create-mono-stack/AGENTS.md`, and the release
  workflow.
- **Test place:** Frozen dependency installation, `just check`, and Copier integration.
- **Starting state:** Package metadata reports `0.1.12`; intended source and checklist changes are
  present; no credentials are staged.
- **Exact input or fixture:** Current repository contents and the versioned package metadata.
- **Interaction steps:** Install from the lockfile offline, run the complete local check gate, then run
  the package's Copier integration test.
- **Main behavior:** The release commit is reproducible and the template remains valid end to end.
- **Expected result:** All commands exit successfully; no generated-project or secret files are added.
- **Must change:** Build and test caches may update ignored files only.
- **Must not happen:** No source files, lockfile, auth configuration, or generated project may be
  modified as a side effect of validation.
- **Planned command:** `pnpm install --offline --frozen-lockfile && just check && pnpm --filter create-mono-stack test:integration`
- **Expected result before the code change:** Before the version bump, the exact package-version
  assertion is not satisfied; the repository checks are expected to reflect the existing `0.1.11`
  source state.
- **First observed run:** Frozen install passed; `just check` passed lint and typecheck but failed at
  `format:check` because this new checklist was not Prettier-formatted, so Copier integration did not
  run.
- **Passing rerun:** Frozen install and `just check` passed, including 15 lint tasks, 15 typecheck
  tasks, formatting, 16 skills checks, 97 skills tests, the core test, and 230 launcher tests. Copier
  integration then passed with its Docker-backed create, update, build, preview, and development
  checks.

### TEST-RELEASE-008: Publish artifact contents

- **Small task:** Verify the exact npm package contents before publishing.
- **Source:** `core/create-mono-stack/package.json` `files` field and package release rules.
- **Test place:** `npm pack --dry-run` from `core/create-mono-stack`.
- **Starting state:** Versioned source passes repository validation and `.npmrc.auth` remains ignored.
- **Exact input or fixture:** `create-mono-stack@0.1.12` package directory.
- **Interaction steps:** Run the dry-run pack command and inspect the reported version and file list.
- **Main behavior:** The artifact contains only the launcher files intended for npm consumers.
- **Expected result:** Dry run succeeds and reports `create-mono-stack-0.1.12.tgz` without tests,
  checklists, environment files, credentials, or generated applications.
- **Must change:** No source files are changed by this case.
- **Must not happen:** `.npmrc.auth`, repository checklists, test fixtures, or mobile application files
  must not be packed.
- **Planned command:** `npm pack --dry-run` from `core/create-mono-stack`
- **Expected result before the code change:** The dry run would report `create-mono-stack-0.1.11.tgz`
  before the version bump.
- **First observed run:** Passed after the version bump: `npm pack --dry-run` reported
  `create-mono-stack-0.1.12.tgz` with 25 intended launcher files and no auth, test, checklist, or
  generated-project files.
- **Passing rerun:** The artifact command passed again with the same `0.1.12` version, 25-file
  launcher-only contents, and no credentials or unrelated repository files.

### TEST-RELEASE-009: Commit, push, and tag the release

- **Small task:** Make the authorized release commit available in the remote Git repository and attach
  the new tag.
- **Source:** User authorization, repository Conventional Commit rules, and the package release
  workflow.
- **Test place:** Local Git history, branch tracking, and local/remote tag refs.
- **Starting state:** Final validation and pack dry run pass; the worktree contains only intended
  release changes; `v0.1.12` is absent locally and remotely.
- **Exact input or fixture:** Release commit with message `fix(template): stabilize native reference dependencies`
  and annotated tag `v0.1.12`.
- **Interaction steps:** Inspect status/diff/log, stage only intended files, commit without hook bypasses,
  push the tracked branch, create the annotated tag at the release commit, and push that tag.
- **Main behavior:** Git records and publishes the exact source used for the npm artifact.
- **Expected result:** The commit succeeds with hooks, the branch push succeeds, and local and remote
  `v0.1.12` resolve to the release commit.
- **Must change:** Intended release files, the tracked remote branch, and the new `v0.1.12` tag.
- **Must not happen:** No force push, tag overwrite, skipped hook, credential staging, or unrelated
  file inclusion.
- **Planned command:** `git add apps/mobile/metro.config.js core/create-mono-stack/package.json core/create-mono-stack/src/native-scaffold.js core/create-mono-stack/src/reference-profiles.js core/create-mono-stack/test/native-scaffold-overlays.test.js core/create-mono-stack/test/native-scaffold.helpers.js core/create-mono-stack/test/reference-profiles.test.js docs/checklists/2026-08-19-fix-reference-profile-dependency-merge-precedence.md docs/checklists/2026-08-19-create-mono-stack-0.1.12-release.md && git commit -m "fix(template): stabilize native reference dependencies" && git push origin master && git tag -a v0.1.12 -m "Release v0.1.12" && git push origin v0.1.12`
- **Expected result before the code change:** The worktree is dirty, the release commit does not exist,
  and `git show-ref --verify refs/tags/v0.1.12` fails because the tag is absent.
- **First observed run:** Before staging, the worktree was dirty and local `v0.1.12` was absent as
  expected; the remote tag query also found no `v0.1.12` ref.
- **Passing rerun:** Pending until local and remote commit/tag verification runs.

### TEST-RELEASE-010: Publish and verify npm metadata

- **Small task:** Publish the tagged package through the approved authenticated wrapper.
- **Source:** User authorization and `core/create-mono-stack/AGENTS.md` release workflow.
- **Test place:** npm registry package metadata and local Git state.
- **Starting state:** The release commit and `v0.1.12` tag are pushed; `.npmrc.auth` is present but
  ignored; no `0.1.12` npm release exists.
- **Exact input or fixture:** `create-mono-stack@0.1.12` and the default `latest` dist-tag.
- **Interaction steps:** Run the package-local publish wrapper, then query npm version and dist-tags.
- **Main behavior:** npm serves the exact package version built from the tagged release commit.
- **Expected result:** The wrapper exits successfully; npm reports version `0.1.12` and `latest` as
  `0.1.12`; the working tree remains clean.
- **Must change:** npm registry metadata and package tarball availability.
- **Must not happen:** Direct `npm publish`, credentials in Git, republishing an existing version, or
  a release from an unpushed commit.
- **Planned command:** `pnpm --filter create-mono-stack publish:package && npm view create-mono-stack version dist-tags --json`
- **Expected result before the code change:** npm reports version and `latest` as `0.1.11`; the
  `0.1.12` package is not available.
- **First observed run:** Pending until the publish command runs.
- **Passing rerun:** Pending until npm metadata and the final Git state are verified.

## Test-To-Task Map

| Small task                      | Test IDs           | Reason                                                                                      |
| ------------------------------- | ------------------ | ------------------------------------------------------------------------------------------- |
| Validate current source         | `TEST-RELEASE-005` | Confirms the existing implementation is releasable before metadata changes.                 |
| Bump package metadata           | `TEST-RELEASE-006` | Proves the exact patch version and limits the metadata edit.                                |
| Validate the repository release | `TEST-RELEASE-007` | Covers frozen installation, build, lint, typecheck, format, skills, tests, and integration. |
| Validate npm artifact           | `TEST-RELEASE-008` | Confirms package version and files before registry publication.                             |
| Commit, push, and tag           | `TEST-RELEASE-009` | Proves the Git release source and tag target are the same commit.                           |
| Publish and verify              | `TEST-RELEASE-010` | Proves authenticated publication and npm `latest` metadata.                                 |
| API contract validation         | Not applicable     | No API schema, route, payload, or client contract changes are included.                     |
| Security boundary testing       | Not applicable     | The publish wrapper uses existing local credentials; no security behavior is changed.       |

## Implementation Steps

- [x] Run the baseline package test and lint checks.
- [x] Bump `core/create-mono-stack/package.json` to `0.1.12`.
- [x] Run the complete release validation and Copier integration.
- [x] Run `npm pack --dry-run` and inspect the artifact list.
- [ ] Inspect status, diff, and recent history; stage only intended release files.
- [ ] Commit with the planned Conventional Commit message and passing hooks.
- [ ] Push `master` without force.
- [ ] Create and push annotated tag `v0.1.12`.
- [ ] Publish through `pnpm --filter create-mono-stack publish:package`.
- [ ] Verify npm metadata, tag target, remote branch, clean worktree, and checklist status.

## Dependencies And Risks

- npm publication requires the ignored repository `.npmrc.auth` or an explicitly configured
  `NPM_CONFIG_USERCONFIG`; the wrapper must be used instead of direct `npm publish`.
- Network access and valid GitHub/npm credentials are required only for push, tag push, and publish.
- The release tag must point to the pushed commit before npm publication so the source and artifact are
  traceable.
- No database migration, environment change, dependency lockfile update, or public API contract change
  is expected.
- Do not include unrelated worktree changes if discovery shows any; stop and re-plan the checklist
  before staging them.

## Verification

- [ ] Baseline package tests and lint pass.
- [ ] Version assertion reports `0.1.12`.
- [ ] Frozen installation, `just check`, and Copier integration pass.
- [ ] `npm pack --dry-run` reports the intended artifact contents.
- [ ] Release commit passes hooks and contains only intended files.
- [ ] Remote branch and annotated tag point to the release commit.
- [ ] npm reports `0.1.12` as `latest`.
- [ ] Final worktree is clean and the checklist has no stale incomplete items.
