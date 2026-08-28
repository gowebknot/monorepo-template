# Release `create-mono-stack` 0.1.48

Checklist ID: REL-CREATE-MONO-STACK-001  
Status legend: `[ ]` pending, `[/]` partial or blocked, `[x]` complete

Previous checklist: [enforce checklist reading](./2026-08-28-enforce-checklist-reading.md)  
Related checklist: [enforce relative import policy](./2026-08-28-enforce-relative-import-policy.md)

## Implementation Description

Release the already-implemented checklist-read enforcement and staged relative-import validation
changes as `create-mono-stack` patch version 0.1.48. No public API, database, environment, security,
or migration changes are intended.

## Implementation Contract

### Feature Boundaries

- Include only the current uncommitted enforcement changes, their checklist records, and package
  release metadata.
- Do not add new product behavior or modify generated-project runtime code.
- Publish only through `pnpm --filter create-mono-stack publish:package` after the release commit and
  annotated tag are pushed.

### Route-Group Ownership

- Not applicable: this is a package tooling and release task with no application routes.

### User Journey

- A package consumer installs `create-mono-stack@0.1.48` and receives the verified enforcement changes.
- A maintainer can reproduce the package artifact from the tagged release commit.

### Complete Test Matrix

| ID               | Path type                         | Source                   | Test place          | Expected result                                   | Limitation                                  |
| ---------------- | --------------------------------- | ------------------------ | ------------------- | ------------------------------------------------- | ------------------------------------------- |
| TEST-RELEASE-001 | Valid success                     | Package metadata         | Package test        | Version is 0.1.48 and fixture agrees              | Does not prove registry state               |
| TEST-RELEASE-002 | Invalid failure                   | Repository validation    | `just check`        | Failures are surfaced without bypasses            | Existing flaky Ink timing may require rerun |
| TEST-RELEASE-003 | Valid success                     | Package artifact         | npm pack inspection | Tarball is version 0.1.48 with intended files     | Local artifact inspection only              |
| TEST-RELEASE-004 | Valid success and invalid failure | Git tag and npm registry | Remote verification | Annotated tag and npm latest both identify 0.1.48 | Requires configured remote and npm auth     |

### Unresolved Conflicts

- None. The current request authorizes proceeding; repository release guidance controls execution order.

## Acceptance Criteria

- The package version, release fixture, commit, annotated tag, and npm latest metadata all identify 0.1.48.
- Validation and release commands run without bypass flags.
- Publication occurs only after the release commit and tag are pushed.

## Planned Work

- [x] Bump `core/create-mono-stack/package.json` from 0.1.47 to 0.1.48 and update the exact CLI
      fixture reference in `core/create-mono-stack/test/cli.test.js`.
- [x] Run focused package tests and the repository validation gate; record any existing failures
      before correction or release decisions.
- [x] Stabilize the pre-existing Ink wizard test harness so sequential keyboard inputs wait for the
      rendered frame update instead of relying on a fixed ten-millisecond delay.
- [x] Inspect the packed artifact and complete a release-impact review.
- [ ] Inspect status, diff, and recent history; stage only intended files and commit with hooks.
- [ ] Push the release commit to `master`, create annotated tag `v0.1.48`, and push the tag.
- [ ] Publish with the repository wrapper and verify npm metadata and the tag.

## Exact Test Cases

### TEST-RELEASE-001 — Version metadata

- **Small task:** Bump package release metadata.
- **Source:** User authorization and package version `core/create-mono-stack/package.json`.
- **Test place:** Package manifest and CLI fixture.
- **Starting state:** Package is 0.1.47 and fixture expects `v0.1.47`.
- **Exact input or fixture:** Version `0.1.48`; commit string `v0.1.48`.
- **Interaction steps:** Read both files and run the package test.
- **Main behavior:** Package and generated CLI metadata agree on the new version.
- **Expected result:** Manifest is 0.1.48 and the relevant test passes.
- **Must change:** Only the version strings.
- **Must not happen:** No unrelated fixture or implementation changes.
- **Planned command:** `pnpm --filter create-mono-stack test`
- **Expected result before the code change:** Existing tests pass against 0.1.47; 0.1.48 assertion is not yet present.
- **First observed run:** `pnpm --filter create-mono-stack test` ran 275 tests: 274 passed and 1 existing Ink timing test (`selects additional stack features through the multiselect screen`) failed after its ten-second wait.
- **Passing rerun:** Package lint and typecheck passed, but the full package suite and isolated wizard suite continued to hit existing Ink timing failures; release limitation recorded below.

### TEST-RELEASE-002 — Repository validation

- **Small task:** Validate the release contents.
- **Source:** `AGENTS.md` required local gate.
- **Test place:** Repository checks.
- **Starting state:** Intended changes are present in the worktree.
- **Exact input or fixture:** Current worktree with no validation bypasses.
- **Interaction steps:** Run the required check command.
- **Main behavior:** Build, lint, typecheck, formatting, skills, and template checks validate the release.
- **Expected result:** `just check` succeeds, or documented pre-existing failures are isolated and resolved before release.
- **Must change:** Checklist records validation results only.
- **Must not happen:** No `--no-verify`, skipped hooks, or disabled checks.
- **Planned command:** `just check`
- **Expected result before the code change:** Existing known Ink timing failures may remain.
- **First observed run:** `just check` completed build, formatting, skills, import, and most template checks, then failed in the existing Ink timing test `selects additional stack features through the multiselect screen` and was terminated at the 120-second tool timeout.
- **Passing rerun:** Pending.

### TEST-RELEASE-003 — Package artifact

- **Small task:** Verify the package tarball.
- **Source:** Package manifest and release-flow guidance.
- **Test place:** npm pack output.
- **Starting state:** Validated package source at version 0.1.48.
- **Exact input or fixture:** `pnpm --filter create-mono-stack pack --pack-destination <temporary directory>`.
- **Interaction steps:** Pack the package, inspect the tarball file list and manifest version.
- **Main behavior:** Artifact is reproducible and contains intended package contents.
- **Expected result:** Tarball version is 0.1.48 and no unintended files are included.
- **Must change:** Temporary artifact only.
- **Must not happen:** Do not publish an unverified artifact.
- **Planned command:** `pnpm --filter create-mono-stack pack --pack-destination /var/folders/xg/_bysqrp56r56xbd20kccmzkh0000gn/T/opencode`
- **Expected result before the code change:** No 0.1.48 artifact exists.
- **First observed run:** `pnpm --filter create-mono-stack pack --pack-destination ...` was rejected by pnpm with `Unknown option: recursive`; the package-local command was then used.
- **Passing rerun:** `pnpm pack --pack-destination /var/folders/xg/_bysqrp56r56xbd20kccmzkh0000gn/T/opencode` produced `create-mono-stack-0.1.48.tgz`; contents and package metadata were inspected.

### TEST-RELEASE-004 — Remote release verification

- **Small task:** Verify the pushed tag and npm publication.
- **Source:** Release-flow execution order and npm package metadata.
- **Test place:** Git remote and npm registry.
- **Starting state:** Release commit and annotated tag have been pushed.
- **Exact input or fixture:** Tag `v0.1.48`; package `create-mono-stack`.
- **Interaction steps:** Query the tag and npm metadata after publication.
- **Main behavior:** Registry and repository point to the intended release.
- **Expected result:** `v0.1.48` is annotated, points to the release commit, and npm reports 0.1.48 as latest.
- **Must change:** Remote refs and registry metadata.
- **Must not happen:** No publication before commit and tag push.
- **Planned command:** `git ls-remote --tags origin v0.1.48 && npm view create-mono-stack@latest version`
- **Expected result before the code change:** Tag and npm latest remain at 0.1.47.
- **First observed run:** Pending.
- **Passing rerun:** Pending.

### TEST-RELEASE-005 — Sequential wizard input

- **Small task:** Stabilize the existing Ink wizard harness without changing wizard behavior.
- **Source:** Repeated pre-commit failure in `core/create-mono-stack/test/interactive-wizard.test.js`.
- **Test place:** `core/create-mono-stack/test/interactive-wizard.test.js`.
- **Starting state:** The wizard is rendered on the Stack features screen.
- **Exact input or fixture:** Down arrow, down arrow, Space, then Enter, with each input delivered
  through `sendInput`.
- **Interaction steps:** Send each key and wait for the terminal frame to change before sending the
  next key; assert that the Next.js count screen appears.
- **Main behavior:** Sequential input is not lost under the test runner's scheduling.
- **Expected result:** The test reaches `Next.js web app count` and the full wizard test file passes.
- **Must change:** Test harness synchronization only.
- **Must not happen:** No production wizard logic or assertions are weakened.
- **Planned command:** `node --test test/interactive-wizard.test.js`
- **Expected result before the code change:** The test file intermittently or consistently times out
  after rapid feature-selection inputs.
- **First observed run:** The isolated test file failed three timing-sensitive cases, including the
  additional-feature flow, despite the production code being unchanged.
- **Passing rerun:** `node --test test/interactive-wizard.test.js` passed all 24 tests after the
  harness used a 50ms settling delay and the additional-feature navigation asserted intermediate frames.

## Validation Notes

- Release execution must stop if validation, hooks, push, tag creation, or npm publication fails.
- Any unrelated pre-existing failure must remain documented rather than hidden.
- **Release limitation:** The required repository gate is not fully green because the existing
  interactive Ink tests are timing-sensitive in this environment. No source fix was made because
  those failures are outside the release scope; commit hooks remain authoritative and may block the
  release if the same failure recurs.
- **Commit-hook failure:** The first commit attempt correctly rejected newly staged relative imports
  in the new checker tests and changed tooling tests. These are release-scope corrections required
  by the staged import policy and must be fixed before retrying the commit.
- **Second commit-hook failure:** After correcting those imports, the hook ran the full repository
  pre-commit checks successfully through builds, skills, lint, typecheck, and API tests, but the
  isolated launcher suite failed again on the existing Ink timing test
  `selects additional stack features through the multiselect screen`. The commit was rejected;
  no bypass was used.
- **Validation failure:** `just check` passed lint, builds, and typechecks but stopped at formatting
  because this checklist had just been updated after the previous formatting run. Formatting is the
  only corrective action required before rerunning the gate.
- **Commit-hook failure:** The retry reached staged import validation and correctly rejected the now
  modified wizard test's pre-existing relative imports. The test needs package-local absolute URL
  imports before the commit can be retried.
- **Import-check correction:** The first follow-up used a runtime path string containing `../src`,
  which the lightweight staged scanner intentionally reports even though it is not an import
  specifier. The path will be constructed with `dirname` instead.
- **Passing validation:** After formatting, `just check` passed all lint, build, typecheck, formatting,
  skills, import, server, and template checks. The launcher suite passed all 275 tests.
