# Scope Release Flow To Template Repository

- Checklist ID: CHECKLIST-20260824-release-flow-template-scope
- Created: 2026-08-24
- Planning completed: 2026-08-24
- Source request: Restrict the release-flow skill to this template repository and document the ordered release workflow.
- Related implementation: [Commit message length and description guidance](./2026-08-23-commit-message-length-and-description-guidance.md)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Update the canonical `release-flow` skill description and instructions to state that it applies only to this template repository.
- Explicitly exclude generated application projects and unrelated repositories from the skill's scope.
- Add the ordered release workflow: bump version, commit, push, create and push a new annotated tag, then publish.
- Synchronize the canonical skill to `.agents/skills/`, `.claude/skills/`, and `.opencode/skills/`.

## Small Task Breakdown

- [x] Restrict the skill scope.
  - [x] State the template-repository-only boundary in frontmatter and body guidance.
  - [x] State that generated projects and unrelated repositories must not use this skill.
- [x] Document the ordered release workflow.
  - [x] Place version bump before commit.
  - [x] Place branch push after commit.
  - [x] Place creation and push of a new annotated tag after the branch push.
  - [x] Place package publication after the tag operation.
- [x] Synchronize and validate all skill roots.

## Exact Test Cases

### TEST-SKILL-001: Template-only scope

- **Small task:** Restrict `release-flow` to this template repository.
- **Source:** User request and existing generated-project skill scope conventions.
- **Test place:** Canonical and synchronized `release-flow/SKILL.md` files; exact text scan.
- **Starting state:** All four copies describe release preparation without a template-only boundary.
- **Exact input or fixture:** Scope wording naming this template repository and excluding generated projects and unrelated repositories.
- **Interaction steps:** Scan all four skill roots after synchronization for matching scope guidance and byte equality.
- **Main behavior:** The skill explicitly limits where it applies.
- **Expected result:** Every copy states that it is only for this template repository and must not be used in generated projects or unrelated repositories.
- **Must change:** Four synchronized `release-flow/SKILL.md` copies.
- **Must not happen:** No provider-specific metadata or divergence between roots.
- **Planned command:** `pnpm skills:sync && pnpm skills:check && pnpm skills:test`
- **Expected result before the code change:** The exact scope scan fails because the boundary is absent.
- **First observed run:** `pnpm skills:check` validated 19 skills, `pnpm skills:test` passed all 104 tests, and the focused Prettier plus `git diff --check` command passed. The requested scope wording was still absent.
- **Passing rerun:** The scope wording appears in the canonical copy and all synchronized copies; `cmp` confirmed byte equality across all four roots, `pnpm skills:check` validated 19 skills, and `pnpm skills:test` passed all 104 tests.

### TEST-SKILL-002: Ordered release workflow

- **Small task:** Document the required release operation order.
- **Source:** User request and repository release checklists.
- **Test place:** All four synchronized `release-flow/SKILL.md` files; exact ordered-text scan.
- **Starting state:** The skill warns against unauthorized operations but does not prescribe their order.
- **Exact input or fixture:** Bump version -> commit -> push -> create and push a new annotated tag -> publish.
- **Interaction steps:** Scan the skill content for each operation in the required sequence.
- **Main behavior:** Release preparation gives an unambiguous execution order.
- **Expected result:** The sequence appears as explicit numbered instructions, with publication last.
- **Must change:** Canonical and synchronized skill instructions.
- **Must not happen:** The guidance must not authorize bypassing hooks, force-pushing, or publishing before the tag.
- **Planned command:** `pnpm exec prettier --check skills/release-flow/SKILL.md .agents/skills/release-flow/SKILL.md .claude/skills/release-flow/SKILL.md .opencode/skills/release-flow/SKILL.md && git diff --check`
- **Expected result before the code change:** The ordered workflow scan fails because no ordered sequence exists.
- **First observed run:** The existing skill had no ordered release workflow, so the requested sequence was absent before implementation.
- **Passing rerun:** The ordered instructions appear in the synchronized skill, with version bump, commit, branch push, annotated tag creation and push, then publication; focused Prettier and `git diff --check` passed.

## Implementation Plan

- [x] Edit `skills/release-flow/SKILL.md` only as the canonical source.
  - [x] Extend frontmatter description with the template-repository-only boundary.
  - [x] Add a scope section excluding generated projects and unrelated repositories.
  - [x] Add an ordered release execution section with explicit authorization and no-bypass constraints.
- [x] Run `pnpm skills:sync` to update all provider roots.
- [x] Run focused exact scans, formatting, synchronization, skills checks, and skills tests.
- [x] Update this checklist with observed failures, passing reruns, and completed statuses.

## Validation Notes

- Baseline observations: The four skill copies are currently synchronized. The requested scope and ordered workflow are absent from `release-flow`.
- Final validation: `pnpm skills:sync`, `pnpm skills:check`, `pnpm skills:test` (104/104), focused Prettier, `git diff --check`, exact scope/order scan, and byte-equality checks all passed.

## Risks And Non-Goals

- This changes agent guidance only; it does not change release scripts or execute Git, tag, or publish operations.
- The skill remains portable and uses no provider-specific trigger metadata.
