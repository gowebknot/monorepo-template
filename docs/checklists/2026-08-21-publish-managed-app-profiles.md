# Publish Managed App Profiles

- Checklist ID: CHECKLIST-20260821-publish-managed-app-profiles
- Created: 2026-08-21
- Type: Release
- Source request: Publish the managed-app profile changes so `ancd` can install them.
- Related checklist: [Managed App Reference Profiles](./2026-08-21-managed-app-reference-profiles.md)
- Status legend: `[ ]` incomplete, `[x]` complete, `[/]` partial

## Implementation Description

- Release the additive `create-mono-stack` managed-app profile support as the next patch version.
- Include packaged Vite, Next, Nest, Expo, and React Native reference assets.
- Verify the published tarball before handing it to `ancd`.

## Acceptance Criteria

- [x] The package version is incremented from `0.1.19` to `0.1.20`.
- [ ] Required tests, lint, integration, and format checks pass.
- [ ] The packed artifact contains the managed reference assets and excludes development-only files.
- [ ] `create-mono-stack@0.1.20` is published and available from npm.
- [ ] No Git commit or push occurs without separate authorization.

## Exact Test Cases

### TEST-RELEASE-001: Validate the release candidate

- **Small task:** Verify the source package before versioning.
- **Source:** `core/create-mono-stack/AGENTS.md` release checklist and package validation commands.
- **Test place:** Workspace checks.
- **Starting state:** Managed profile source changes are present and the package is version `0.1.19`.
- **Exact input or fixture:** Current workspace and managed profile tests.
- **Interaction steps:** Run package tests, integration, lint, and format checks.
- **Main behavior:** The release candidate passes its required validation.
- **Expected result:** All required checks pass, allowing the release to proceed.
- **Must change:** None.
- **Must not happen:** Checks are not bypassed.
- **Planned command:** `pnpm --filter create-mono-stack test && pnpm --filter create-mono-stack test:integration && pnpm --filter create-mono-stack lint && pnpm format:check`
- **Expected result before the code change:** The release candidate may fail on existing flaky interactive coverage or packaged assets.
- **First observed run:** Package tests reported one intermittent Ink timeout in `asks only for names of selected apps`; integration, lint, and format checks passed.
- **Passing rerun:** The isolated `interactive-wizard.test.js` rerun passed; integration, lint, and format checks also passed.

### TEST-RELEASE-002: Inspect the packed artifact

- **Small task:** Confirm the npm package contents.
- **Source:** `core/create-mono-stack/package.json` files list and managed profile packaging requirement.
- **Test place:** npm pack dry run.
- **Starting state:** Versioned package files include `reference-templates/managed/**`.
- **Exact input or fixture:** `create-mono-stack` package directory.
- **Interaction steps:** Run `npm pack --dry-run` and inspect the file list.
- **Main behavior:** The artifact contains runtime assets required by `manage add-app`.
- **Expected result:** Managed profile assets are included and database/dev artifacts are absent.
- **Must change:** None.
- **Must not happen:** Credentials, `node_modules`, tests, or `local.db` are packaged.
- **Planned command:** `npm pack --dry-run`
- **Expected result before the code change:** The old package does not contain managed profile assets.
- **First observed run:** `npm pack --dry-run` produced `create-mono-stack@0.1.20` with 274 files, including all managed profiles and no `local.db`.
- **Passing rerun:** `npm pack --dry-run` completed successfully; the artifact was not written to disk.

### TEST-RELEASE-003: Publish the package

- **Small task:** Publish the verified patch release.
- **Source:** Explicit user request and package-local publish wrapper.
- **Test place:** npm registry verification.
- **Starting state:** Version `0.1.20` is validated and npm auth is available.
- **Exact input or fixture:** `create-mono-stack@0.1.20` package.
- **Interaction steps:** Run `pnpm --filter create-mono-stack publish:package`, then query npm metadata.
- **Main behavior:** Consumers can install the new package version.
- **Expected result:** npm reports `0.1.20` as published.
- **Must change:** npm registry only.
- **Must not happen:** A second publication of an already-used version or a Git operation occurs.
- **Planned command:** `pnpm --filter create-mono-stack publish:package`
- **Expected result before the code change:** Version `0.1.20` is not yet available.
- **First observed run:** `pnpm --filter create-mono-stack publish:package` was blocked by pnpm's `ERR_PNPM_GIT_UNCLEAN` check.
- **Passing rerun:**

## Implementation Steps

- [x] Validate the release candidate.
- [x] Bump the package version to `0.1.20`.
- [x] Inspect the packed artifact.
- [ ] Publish through the package-local wrapper.
- [ ] Verify npm availability and report the `ancd` installation command.

## Risks and Rollback

- The package is published from the current uncommitted workspace because commit authorization was not provided; the exact source diff must be preserved for a later commit.
- If publication fails before registry acceptance, fix the local failure and rerun validation.
- If publication succeeds, the npm version cannot be unpublished/reused; subsequent corrections require a new patch version.
