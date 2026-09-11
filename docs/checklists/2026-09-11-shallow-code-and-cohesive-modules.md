# Shallow Code and Cohesive Modules

Checklist ID: CHECKLIST-20260911-shallow-code-and-cohesive-modules
Tier: standard
Created: 2026-09-11
Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Related checklists

- [Dispatch and CVA guidance](2026-08-24-code-quality-dispatch-and-cva-guidance.md)

## Implementation Contract

### Feature Boundaries

Strengthen the canonical code-quality, JSX extraction, and code-review skills and synchronize their
three discovery copies. Cover cohesive modules, duplication, and shallow code across languages and
layers. Preserve existing import and CVA rules. No application refactor, lint configuration, hook
change, new dependency, commit, or release is included.

### Route-Group Ownership

No routes change. `skills/code-quality/SKILL.md` owns the general policy; JSX extraction specializes
it for render trees, and code-review checks compliance.

### User Journey

An agent loads the applicable skills, separates responsibilities, keeps code shallow, reviews the
result against the shared policy, and runs the existing focused checks. Skill wording improves the
instructions but cannot mechanically guarantee another agent's compliance.

### Complete Test Matrix

| ID               | Kind      | Input                                            | Action                       | Expected result                                               | Validation                                             |
| ---------------- | --------- | ------------------------------------------------ | ---------------------------- | ------------------------------------------------------------- | ------------------------------------------------------ |
| TEST-QUALITY-001 | valid     | Component, props, domain formatter in one file   | Review ownership guidance    | Keep props local; separate independent formatter              | Read code-quality                                      |
| TEST-QUALITY-002 | rejection | Nested ternary, nested guards, dense callbacks   | Review shallow-code guidance | Reject ternary nesting; flatten and name cohesive operations  | Read code-quality                                      |
| TEST-QUALITY-003 | valid     | Keyed handler choice and ordered range predicate | Review dispatch guidance     | Map keyed choice; preserve predicate order and lazy execution | Read code-quality                                      |
| TEST-QUALITY-004 | rejection | Single-consumer substantial row component        | Review JSX guidance          | Extract file; remove same-file preference                     | Read JSX extraction                                    |
| TEST-QUALITY-005 | rejection | Mixed responsibilities in a short passing file   | Review review guidance       | Flag structural issue despite passing tests                   | Read code-review                                       |
| TEST-QUALITY-006 | success   | Updated portable skills                          | Sync and validate            | Identical roots, passing tests and formatting                 | pnpm skills:check; pnpm skills:test; pnpm format:check |

### Unresolved Conflicts

Resolved: the user's separation preference supersedes the existing same-file private component
default. Tiny cohesive helpers and component-specific props may remain local. The existing CVA rule
continues to govern CSS variants; hash maps apply to keyed dispatch, not every conditional.

## Acceptance Criteria

- General guidance covers module ownership, SOLID, DRY, branches, expressions, callbacks, loops,
  asynchronous flow, render trees, and readable data transformations.
- JSX extraction no longer prefers same-file components solely because they have one consumer.
- Review guidance checks the shared policy and preserves behavior during structural refactors.
- Existing import, CVA, accessibility, and test-ID requirements remain intact; all roots validate.

## Small Task Breakdown and Implementation Plan

- [x] Strengthen the shared policy in `skills/code-quality/SKILL.md`.
  - [x] Define file ownership, component/type/helper placement, and duplication review (TEST-QUALITY-001).
  - [x] Define shallow expressions and control flow with behavior-preserving limits (TEST-QUALITY-002).
  - [x] Clarify keyed maps, lazy handlers, unknown keys, ordered predicates, and CVA (TEST-QUALITY-003).
- [x] Align specialized skills.
  - [x] Replace the JSX same-file default and define shallow render composition (TEST-QUALITY-004).
  - [x] Add structural review against the shared policy (TEST-QUALITY-005).
- [x] Validate and distribute the policy (TEST-QUALITY-006).
  - [x] Append the dated extension to the historical dispatch checklist.
  - [x] Format canonical files, run synchronization, and validate roots.
  - [x] Run existing skills tests, formatting, diff checks, and review the complete patch.

## Missing-Case Review

Valid local props and tiny helpers must remain possible. Map dispatch must not eagerly execute
unchosen branches, lose unknown-key behavior, or replace ordered predicates. Flattening must preserve
evaluation order, loop exits, errors, cleanup, transaction scope, and async sequencing. Required DOM
structure and readable inherent recursion or traversal must not be destroyed to meet a nesting
target. Existing imports, CVA, accessibility, and test-ID rules remain covered by semantic review.
Runtime boundaries, authorization, routes, and E2E tests do not apply to this policy-only change.
Validation uses document inspection and existing tooling; it does not claim to test agent compliance.

## Exact Test Cases

### TEST-QUALITY-001

- **Small task:** Define cohesive file ownership.
- **Source:** User reports mixed components, utilities, and types.
- **Test place:** `skills/code-quality/SKILL.md` semantic review.
- **Starting state:** Broad SOLID and DRY guidance without concrete placement rules.
- **Exact input or fixture:** A component with its props, an independent formatter, and duplicate business rules.
- **Interaction steps:** Read the skill and apply its placement criteria to this fixture.
- **Main behavior:** Separate independent responsibilities without scattering local props.
- **Expected result:** One substantial component per file by default; shared logic has an authoritative owner.
- **Must change:** General module guidance.
- **Must not happen:** Mandatory global utility/type buckets or speculative abstractions.
- **Planned command:** `cat skills/code-quality/SKILL.md` followed by semantic fixture review.
- **Expected result before the code change:** Placement criteria are missing.
- **First observed run:** Read confirmed missing concrete file-placement rules.
- **Passing rerun:** Semantic review passed: props stay local, independent formatting has a feature owner, and shared business rules have one implementation.

### TEST-QUALITY-002

- **Small task:** Define shallow expressions and control flow.
- **Source:** User requests coverage beyond nested JSX, ternaries, and if/else.
- **Test place:** `skills/code-quality/SKILL.md` semantic review.
- **Starting state:** No general nesting policy.
- **Exact input or fixture:** Nested ternary; nested validation guards; callbacks within loops; dense boolean and transformation chains; nested promise error handling.
- **Interaction steps:** Read the policy and check that each construct has actionable guidance.
- **Main behavior:** Reduce cognitive complexity while preserving behavior.
- **Expected result:** No nested ternaries; named predicates, guards, helpers, and readable sequencing cover the other constructs.
- **Must change:** General shallow-code guidance.
- **Must not happen:** Eager effects, changed evaluation order, lost cleanup, or artificial helpers that merely hide nesting.
- **Planned command:** `cat skills/code-quality/SKILL.md` followed by semantic fixture review.
- **Expected result before the code change:** No explicit cross-cutting coverage.
- **First observed run:** Read confirmed no general nesting policy.
- **Passing rerun:** Semantic review passed for all listed constructs, including guards, named stages, short-circuit preservation, cleanup, and meaningful extraction.

### TEST-QUALITY-003

- **Small task:** Clarify map dispatch boundaries.
- **Source:** User requests hash maps; prior checklist requires CVA for CSS variants.
- **Test place:** `skills/code-quality/SKILL.md` semantic review.
- **Starting state:** Basic keyed dispatch and CVA guidance exists.
- **Exact input or fixture:** Status-to-handler mapping; unknown status; overlapping range predicates; CSS class variants.
- **Interaction steps:** Read dispatch rules and check the appropriate representation for each input.
- **Main behavior:** Use maps for discrete keyed choices safely.
- **Expected result:** Lazy handlers, explicit missing-key behavior, direct ordered predicates, and CVA for CSS.
- **Must change:** Dispatch guidance gains concrete correctness boundaries.
- **Must not happen:** Universal conversion of conditionals to maps or class-map replacement of CVA.
- **Planned command:** `cat skills/code-quality/SKILL.md` followed by semantic fixture review.
- **Expected result before the code change:** Lazy and unknown-key behavior are unspecified.
- **First observed run:** Read confirmed keyed dispatch/CVA but no lazy-handler or unknown-key guidance.
- **Passing rerun:** Semantic review passed: lazy keyed handlers, explicit unknown-key behavior, ordered predicates, and the original CVA rule are covered.

### TEST-QUALITY-004

- **Small task:** Align JSX extraction and file placement.
- **Source:** User requests shallow JSX and separated components.
- **Test place:** `skills/jsx-component-extraction/SKILL.md` semantic review.
- **Starting state:** Single-consumer components explicitly prefer the same file.
- **Exact input or fixture:** A substantial row used once inside a mapped card with conditional subpanels.
- **Interaction steps:** Read the extraction policy and check placement and render-logic decisions.
- **Main behavior:** Extract meaningful components to files and keep the parent readable.
- **Expected result:** Separate row file, explicit props, simple JSX, preserved DOM semantics.
- **Must change:** Same-file preference and render-composition guidance.
- **Must not happen:** Nested component definitions, lost accessibility/test IDs, or global props buckets.
- **Planned command:** `cat skills/jsx-component-extraction/SKILL.md` followed by semantic fixture review.
- **Expected result before the code change:** Same-file default conflicts with the desired result.
- **First observed run:** Read confirmed the conflicting same-file private component preference.
- **Passing rerun:** Semantic review passed: the substantial row gets a feature-local file; props, DOM semantics, keys, hook order, accessibility, and test IDs are preserved.

### TEST-QUALITY-005

- **Small task:** Require structural review.
- **Source:** User reports that passing work still violates SOLID and DRY.
- **Test place:** `skills/code-review/SKILL.md` semantic review.
- **Starting state:** Review checks cohesion and length without explicit nesting criteria.
- **Exact input or fixture:** A short module that passes tests but repeats a business rule and mixes UI with data access.
- **Interaction steps:** Read the review policy and check whether structural findings are required.
- **Main behavior:** Review structure independently of functional correctness.
- **Expected result:** Apply the shared quality policy and report concrete structural defects.
- **Must change:** Review boundaries.
- **Must not happen:** Treat short files or green tests as proof of SOLID/DRY compliance.
- **Planned command:** `cat skills/code-review/SKILL.md` followed by semantic fixture review.
- **Expected result before the code change:** No explicit shared-policy review requirement.
- **First observed run:** Read confirmed no explicit shared-quality-policy review requirement.
- **Passing rerun:** Semantic review passed: mixed responsibilities and repeated rules must be flagged despite passing tests, using the shared policy.

### TEST-QUALITY-006

- **Small task:** Synchronize and validate policy artifacts.
- **Source:** Repository portable-skill and checklist workflow.
- **Test place:** Four skill roots, sync metadata, and the two related checklists.
- **Starting state:** Clean working tree; 20 portable skills validate.
- **Exact input or fixture:** Three revised skills and the active/historical checklist records.
- **Interaction steps:** Format edits; synchronize; run skill checks, existing skills tests, format check, and diff inspection.
- **Main behavior:** Deliver consistent portable instructions with accurate records.
- **Expected result:** Commands succeed and only intended files change.
- **Must change:** Canonical skills, discovery copies, sync metadata, and checklist records.
- **Must not happen:** Unrelated changes, divergent copies, or historical status rewrites.
- **Planned command:** `pnpm skills:sync`; `pnpm skills:check`; `pnpm skills:test`; `pnpm format:check`; `git diff --check`.
- **Expected result before the code change:** Existing roots validate but contain the old policy.
- **First observed run:** Baseline pnpm skills:check passed for 20 portable skills; implementation contract validator passed.
- **Passing rerun:** pnpm skills:sync and skills:check passed for 20 portable skills; all 168 skills tests passed; pnpm format:check and git diff --check passed. Complete canonical diff and sync metadata review found only intended changes.

## Validation Notes

No new runtime tests are planned for this reversible policy edit. Semantic fixtures above validate
the wording, and existing skills tooling validates portability. They do not prove future agent behavior.

- Canonical formatting passed. Initial `pnpm skills:sync` failed with sandbox EPERM in the protected `.agents/skills` root. The approved escalated rerun synchronized 20 portable skills.

- Final review confirmed the original import and CVA rules remain unchanged, JSX accessibility and test-ID requirements remain present, and the historical checklist has only an appended update. No runtime or enforcement code changed.
