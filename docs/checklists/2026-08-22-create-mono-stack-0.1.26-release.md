# create-mono-stack 0.1.26 Release

- Checklist ID: CHECKLIST-20260822-create-mono-stack-0.1.26-release
- Created: 2026-08-22
- Planning completed: 2026-08-22
- Type: Patch release
- Source request: User explicitly requested version bump, commit, push, tag, and publish.
- Related checklist: [Inject Tailwind Vite Plugin Into Generated React Apps](./2026-08-22-inject-tailwind-vite-plugin.md)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Release the React app Tailwind Vite plugin injection fix in `create-mono-stack@0.1.26`.
- Bump `core/create-mono-stack/package.json` from `0.1.25` to `0.1.26`.
- Verify the artifact and repository checks, commit and push the release, create and push `v0.1.26`, then publish through the package-local wrapper.

## Impact Review

- Change type: Corrective patch release.
- Public API: No launcher API changes; generated React Vite apps now activate their installed Tailwind plugin.
- Generated projects: React TypeScript Vite apps receive Tailwind plugin configuration; other profiles are unchanged.
- Database, migrations, environment, security, observability, and dependency changes: None beyond the existing generated-app Tailwind dependency/configuration behavior.
- Rollback: Use the prior package/tag; do not overwrite remote history.

## Acceptance Criteria

- [x] `core/create-mono-stack/package.json` reports `0.1.26`.
- [x] Package tests, lint, required checks, artifact dry-run, and whitespace validation pass.
- [ ] A Conventional Commit containing only intended release changes is pushed to `origin/master`.
- [ ] Annotated tag `v0.1.26` is created and pushed at the release commit.
- [ ] `create-mono-stack@0.1.26` is published through `pnpm --filter create-mono-stack publish:package`.
- [ ] Remote refs, npm metadata, artifact contents, and final worktree state are verified.

## Exact Test Cases

### TEST-RELEASE-001: Version and artifact

- **Small task:** Bump the CLI package version and verify its npm artifact.
- **Source:** `core/create-mono-stack/package.json` and its `files` allowlist.
- **Test place:** Package manifest and npm pack dry-run.
- **Starting state:** Package version is `0.1.25`; Tailwind fix changes are uncommitted.
- **Exact input or fixture:** Version `0.1.26`.
- **Interaction steps:** Update the manifest, run the package artifact dry-run, and inspect its reported version and files.
- **Main behavior:** The release artifact reports the intended version without credentials.
- **Expected result:** Artifact reports `create-mono-stack@0.1.26` and contains no `.npmrc.auth` content.
- **Must change:** Package version only in the manifest.
- **Must not happen:** No credentials or unrelated files enter the artifact.
- **Planned command:** `pnpm --filter create-mono-stack exec npm pack --dry-run`
- **Expected result before the code change:** The artifact reports `0.1.25`.
- **First observed run:** `pnpm --filter create-mono-stack exec npm pack --dry-run` was blocked by the earlier `just check` failures before the command ran.
- **Passing rerun:** The dry-run reported `create-mono-stack@0.1.26`, 274 files, and no credentials.

### TEST-RELEASE-002: Repository validation

- **Small task:** Verify the release candidate before committing.
- **Source:** Root and package `AGENTS.md` validation instructions plus the Tailwind regression checklist.
- **Test place:** Package tests, lint, repository gate, artifact dry-run, and Git whitespace check.
- **Starting state:** Intended Tailwind changes and version `0.1.26` are implemented.
- **Exact input or fixture:** Current worktree with the generated React Tailwind regression test.
- **Interaction steps:** Run required checks and inspect their exit statuses.
- **Main behavior:** The release candidate is tested, formatted, and publishable.
- **Expected result:** All commands pass without bypass flags.
- **Must change:** No source files during validation.
- **Must not happen:** No skipped hooks or disabled checks.
- **Planned command:** `just check && pnpm --filter create-mono-stack exec npm pack --dry-run && git diff --check`
- **Expected result before the code change:** The version remains `0.1.25` and the release candidate is not ready.
- **First observed run:** `just check` first failed on this checklist's formatting, then the next run reached one stale `_commit: v0.1.25` fixture failure.
- **Passing rerun:** After formatting and updating the current-template fixture, `just check` passed: lint, typecheck, format, 17 portable skill checks, 97 skill tests, core checks, and 258 launcher/template tests; `git diff --check` passed.

### TEST-RELEASE-003: Commit, push, and tag

- **Small task:** Publish the release commit and immutable version tag to GitHub.
- **Source:** User's explicit release sequence and repository Git safety rules.
- **Test place:** Local Git state and `origin` remote refs.
- **Starting state:** Validation passes and intended changes are unstaged; `v0.1.26` does not exist remotely.
- **Exact input or fixture:** Conventional commit `chore(release): prepare create-mono-stack 0.1.26`; annotated tag `v0.1.26`.
- **Interaction steps:** Inspect status, diff, and log; stage intended files; commit with hooks; push `master`; create and push the tag.
- **Main behavior:** Remote branch and tag identify the exact release commit.
- **Expected result:** `origin/master` and `refs/tags/v0.1.26` point to the release commit.
- **Must change:** Local and remote Git history and the version tag.
- **Must not happen:** No amend, force-push, skipped hooks, or unrelated staged files.
- **Planned command:** `git push origin master && git tag -a v0.1.26 -m "Release v0.1.26" && git push origin v0.1.26`
- **Expected result before the code change:** No release commit or `v0.1.26` tag exists remotely.
- **First observed run:** Pending.
- **Passing rerun:** Pending.

### TEST-RELEASE-004: Publish npm package

- **Small task:** Publish the CLI package through the authenticated repository wrapper.
- **Source:** `core/create-mono-stack/scripts/publish.mjs` and explicit user authorization.
- **Test place:** npm registry through the package-local wrapper.
- **Starting state:** Release commit and tag are pushed; worktree is clean; repository auth config exists.
- **Exact input or fixture:** `create-mono-stack@0.1.26` and `.npmrc.auth` or explicit `NPM_CONFIG_USERCONFIG`.
- **Interaction steps:** Run the package-local wrapper, then query npm metadata.
- **Main behavior:** The intended CLI version is published.
- **Expected result:** Publish succeeds and npm reports version `0.1.26` as `latest`.
- **Must change:** npm registry metadata only.
- **Must not happen:** No direct `npm publish` or credentials in Git.
- **Planned command:** `pnpm --filter create-mono-stack publish:package && npm view create-mono-stack@0.1.26 version dist-tags --json`
- **Expected result before the code change:** `0.1.26` is not published.
- **First observed run:** Pending.
- **Passing rerun:** Pending.

## Test-To-Task Map

| Small task            | Test IDs           |
| --------------------- | ------------------ |
| Version and artifact  | `TEST-RELEASE-001` |
| Repository validation | `TEST-RELEASE-002` |
| Commit, push, and tag | `TEST-RELEASE-003` |
| npm publication       | `TEST-RELEASE-004` |

## Release Steps

- [x] Inspect status, diff, log, remote, package version, existing tag, and auth-file presence.
- [x] Bump `core/create-mono-stack/package.json` to `0.1.26`.
- [x] Run and record release validation.
- [ ] Inspect the final diff and stage only intended files.
- [ ] Commit with a Conventional Commit message and passing hooks.
- [ ] Push `master`.
- [ ] Create and push `v0.1.26`.
- [ ] Publish with `pnpm --filter create-mono-stack publish:package`.
- [ ] Verify remote refs, npm metadata, package artifact, and final status.

## Risks And Follow-Up

- npm publication is irreversible for this version; any correction requires a new patch version.
- Do not publish if authentication is missing or package validation fails.

## Validation Notes

- Baseline inspection found `create-mono-stack@0.1.25`, current branch `master`, existing remote tag `v0.1.25`, no remote `v0.1.26`, and publish authentication present.
- First `just check` run passed lint, builds, and typechecks but failed `format:check` because this new checklist needed Prettier formatting; no source or test failures occurred.
- The second gate run passed formatting, skills checks, and all but one template test; `TEST-MANAGE-001` still referenced `_commit: v0.1.25` after the version bump and failed before package artifact checks ran.
- Final validation passed with `just check`, package dry-run, and `git diff --check`; standard lint output retained two existing React Compiler compatibility warnings and no errors.
