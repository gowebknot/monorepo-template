# create-mono-stack 0.1.17 Release

- Checklist ID: CHECKLIST-20260821-create-mono-stack-0.1.17-release
- Created: 2026-08-21
- Planning completed: 2026-08-21
- Type: Package release
- Source request: Release the locally verified persisted-port correction.
- Previous release: `v0.1.16` / `2034256`
- Related implementation: [Revalidate Persisted Development Ports](./2026-08-21-revalidate-persisted-dev-ports.md)
- Status legend: `[ ]` incomplete, `[x]` complete, `[/]` partial

## Implementation Description

- Release `create-mono-stack` version `0.1.17`.
- Recheck saved ports before preserving them.
- Detect ports bound on the wildcard address used by app servers.
- Reassign occupied saved ports in generated projects and project management.

## Acceptance Criteria

- [ ] Only intended source, test, checklist, and package-version files are included; unrelated `apps/expo/tsconfig.json` remains unstaged.
- [ ] Package version is `0.1.17` and the release artifact contains the intended package files.
- [ ] Launcher tests, lint, integration, typecheck, focused formatting, skills validation, and whitespace checks pass.
- [ ] The root formatting blocker is documented as unrelated.
- [ ] Release commit uses the repository's conventional commit format.
- [ ] Release commit is pushed to `origin/master`.
- [ ] New tag `v0.1.17` is created and pushed.
- [ ] `create-mono-stack@0.1.17` is published through `publish:package`.
- [ ] `/Users/mr_adventurous/my-adventures/experiments/abcd` is updated only after publication.

## Exact Test Cases

### TEST-RELEASE-007: Validate the release artifact

- **Small task:** Validate version and package contents.
- **Source:** `core/create-mono-stack/AGENTS.md` release workflow.
- **Test place:** Package manifest and npm dry-run.
- **Starting state:** Package version `0.1.16` with the port correction verified locally.
- **Exact input or fixture:** `core/create-mono-stack/package.json` and package files.
- **Interaction steps:** Bump to `0.1.17`, run `npm pack --dry-run`, and inspect the file list.
- **Main behavior:** The artifact identifies the corrected release.
- **Expected result:** Dry-run reports `create-mono-stack@0.1.17` and includes `src/port-allocation.js`.
- **Must change:** Package version metadata only.
- **Must not happen:** Credentials, generated projects, or the unrelated Expo file enter the artifact.
- **Planned command:** `npm pack --dry-run`
- **Expected result before the code change:** Dry-run reports `0.1.16`.
- **First observed run:** `npm pack --dry-run` reported `create-mono-stack@0.1.16` before the version bump.
- **Passing rerun:** `npm pack --dry-run` reported `create-mono-stack@0.1.17`, 30 files, and included `src/port-allocation.js`.

### TEST-RELEASE-008: Run release validation

- **Small task:** Verify the release before Git or npm operations.
- **Source:** Repository checks and the local port correction checklist.
- **Test place:** Package tests, integration, lint, typecheck, formatting, skills, and diff checks.
- **Starting state:** Version `0.1.17` and intended release files only.
- **Exact input or fixture:** Current repository source and staged release set.
- **Interaction steps:** Run the required checks and inspect the worktree.
- **Main behavior:** The release candidate is locally valid.
- **Expected result:** All applicable checks pass; only the unrelated Expo formatting issue remains documented.
- **Must change:** No source behavior during validation.
- **Must not happen:** No check bypasses or release operations before validation passes.
- **Planned command:** `pnpm --filter create-mono-stack test && pnpm --filter create-mono-stack lint && pnpm --filter create-mono-stack test:integration && pnpm lint && pnpm typecheck && pnpm skills:check && pnpm skills:test && git diff --check`
- **Expected result before the code change:** The new tests do not exist and the old allocator preserves occupied saved ports.
- **First observed run:** The combined validation command reached the formatting check; all tests, lint,
  integration, typecheck, skills checks, and whitespace checks passed. The new release checklist
  itself needed Prettier formatting.
- **Passing rerun:** The launcher suite passed `253/253`, integration passed `1/1`, lint and typecheck
  passed, skills checks passed, and all intended changed files pass formatting and `git diff --check`.

### TEST-RELEASE-009: Publish and update the generated project

- **Small task:** Publish the verified package and update `abcd`.
- **Source:** Explicit user request and package-local release workflow.
- **Test place:** npm package metadata and generated project manifest.
- **Starting state:** Verified pushed commit and tag `v0.1.17`; `abcd` still uses the older template.
- **Exact input or fixture:** Package `0.1.17` and `/Users/mr_adventurous/my-adventures/experiments/abcd`.
- **Interaction steps:** Publish with the wrapper, then run `pnpm template:update` in `abcd` and inspect its generated scripts and manifest.
- **Main behavior:** The generated project receives the corrected template.
- **Expected result:** Package `0.1.17` is available and `abcd` contains the corrected port preflight.
- **Must change:** Registry state and generated project template files.
- **Must not happen:** The real project must not be updated before publication succeeds.
- **Planned command:** `pnpm --filter create-mono-stack publish:package`
- **Expected result before the code change:** Package `0.1.17` is not published.
- **First observed run:**
- **Passing rerun:**

## Test-To-Task Map

| Small task         | Test IDs           |
| ------------------ | ------------------ |
| Validate artifact  | `TEST-RELEASE-007` |
| Validate release   | `TEST-RELEASE-008` |
| Publish and update | `TEST-RELEASE-009` |

## Risks And Non-Goals

- The unrelated `apps/expo/tsconfig.json` change is not part of this release.
- A port can become occupied after preflight and before an app binds.
- Publishing requires valid npm authentication and network access.
