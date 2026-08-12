# Selectable Stack Install And Dependency Refresh

- Checklist ID: CHECKLIST-20260812-selectable-stack-install-and-dependency-refresh
- Created: 2026-08-12
- Type: Feature implementation and repository delivery
- Source request: Commit and push the current selectable-stack installation changes.
- Related checklists:
  - Feature implementation: [Configuration-Based Stack Install](./2026-08-11-config-based-stack-install.md)
  - Dependency refresh: [Latest Generated Dependencies](./2026-08-11-latest-generated-dependencies.md)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Scope

- [x] Add selectable web, API, and mobile stack features to interactive and CLI project setup.
- [x] Persist selected features in `.mono-stack.json` and reuse them during template updates.
- [x] Refresh generated npm dependencies and the lockfile after project generation.
- [x] Preserve setup cleanup, Git alias, Python environment, and generated-project exclusions.
- [ ] Deliver the complete change as a commit pushed to `origin`.

## Acceptance Criteria

- [ ] All current tracked and untracked implementation, test, and documentation work is included in one commit.
- [x] Repository validation passes, with the known environment-independent generated `AGENTS.md` exclusion assertion documented.
- [ ] The commit uses the repository's Conventional Commit format.
- [ ] The resulting commit is pushed to `origin` and verified on the remote branch.

## Validation

- [x] `just check` - passes after correcting caught-error causes and the wizard test flow.
- [x] `pnpm --filter create-mono-stack test` - 76/76 tests pass.
- [x] `pnpm --filter create-mono-stack lint`
- [/] `pnpm --filter create-mono-stack test:integration` - reaches generated manifest assertions, then hits the existing `AGENTS.md` exclusion assertion documented in the related checklist.
- [x] `git diff --check`

## Validation Notes

- 2026-08-12: `just check` reported two `preserve-caught-error` findings for replacement errors without causes; the errors were corrected to preserve their causes.
- 2026-08-12: Package tests reported one timeout in the custom project-name wizard path; the test was corrected to account for the text-input state transition.
- 2026-08-12: Focused wizard rerun passed, followed by the complete package suite at 76/76 passing.
- 2026-08-12: `just check`, package lint, and `git diff --check` passed.
- 2026-08-12: Copier integration reproduced the documented generated `AGENTS.md` exclusion failure after successfully reaching manifest validation.
