# Atomic Design UI Guidance

Checklist ID: CHECKLIST-20260911-atomic-design-ui-guidance
Tier: standard
Created: 2026-09-11
Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Related checklists

- [Shallow Code and Cohesive Modules](2026-09-11-shallow-code-and-cohesive-modules.md)

## Implementation Contract

### Feature Boundaries

Extend `frontend-standards` with Atomic Design and link it from JSX extraction and domain structure.
Use the existing frontend skill because it already owns UI composition, shared primitives, and state
boundaries. No new skill, application refactor, folder migration, hook, dependency, or release.
Preserve the completed shallow-code changes in the working tree.

### Route-Group Ownership

No route changes. Atomic Design describes UI composition; existing domain ownership continues to
determine file paths. The frontend skill owns the five-stage definitions and repository adaptation.

### User Journey

An agent planning or reviewing UI identifies reusable parts and page composition, selects existing
primitives, separates data orchestration, and checks the assembled interface with realistic content
and relevant states. It retains feature ownership and creates only meaningful component boundaries.

### Complete Test Matrix

| ID              | Kind      | Input                                                        | Action                   | Expected result                                      | Validation                              |
| --------------- | --------- | ------------------------------------------------------------ | ------------------------ | ---------------------------------------------------- | --------------------------------------- |
| TEST-ATOMIC-001 | valid     | Search controls, header, layout, populated screen            | Apply five stages        | Clear responsibilities at each stage                 | Semantic review of frontend skill       |
| TEST-ATOMIC-002 | rejection | Feature API dependency in shared button; forced five folders | Apply ownership rules    | Keep API outside primitive and preserve domain paths | Semantic review of frontend skill       |
| TEST-ATOMIC-003 | valid     | JSX extraction task                                          | Follow skill link        | Reach authoritative Atomic Design guidance           | Read JSX skill and verify link          |
| TEST-ATOMIC-004 | valid     | Choose new UI file path                                      | Follow domain skill link | Composition and ownership coexist                    | Read domain skill and verify link       |
| TEST-ATOMIC-005 | success   | Updated skills                                               | Synchronize and validate | Matching roots, passing checks                       | skills:check, skills:test, format:check |

### Unresolved Conflicts

Resolved: Atomic Design supplements the existing domain structure, without replacing it with global
atomic-level directories. Atomic levels do not determine reuse eligibility or runtime chunking.
The original source describes a non-linear model; do not require every UI to create all five levels.

## Acceptance Criteria

- Define atoms, molecules, organisms, templates, and pages with concrete examples.
- Require composition and reuse while preserving feature ownership, state boundaries, and platform APIs.
- Cover realistic content and applicable responsive, accessibility, loading, empty, and error states.
- Both extraction and path-selection guidance discover the same authoritative policy.
- Preserve existing rules and synchronize all four skill roots.

## Small Task Breakdown and Implementation Plan

- [x] Extend `skills/frontend-standards/SKILL.md`.
  - [x] Add the five-stage table and composition guidance (TEST-ATOMIC-001).
  - [x] Add repository ownership, dependency, and verification constraints (TEST-ATOMIC-002).
- [x] Connect existing implementation entry points.
  - [x] Link the policy from `skills/jsx-component-extraction/SKILL.md` (TEST-ATOMIC-003).
  - [x] Link the policy from `skills/domain-driven-app-structure/SKILL.md` (TEST-ATOMIC-004).
- [x] Validate portable artifacts (TEST-ATOMIC-005).
  - [x] Format and synchronize the three canonical skills.
  - [x] Run skill validation, existing tests, formatting, link/contract checks, and diff review.

## Missing-Case Review

Check that a simple UI can omit unnecessary intermediate wrappers, organisms can compose atoms
directly, and local interaction state need not be lifted into pages. Generic primitives must not
import product features or API clients. Templates describe layout rather than duplicate page data
loading. Shared UI must respect platform capabilities. Existing lazy-loading, form, import, test-ID,
and shallow-code policies remain active. No runtime or E2E test is needed because no UI changes.
Semantic review validates instructions, not future agent compliance.

## Exact Test Cases

### TEST-ATOMIC-001

- **Small task:** Define five-stage composition.
- **Source:** User request and https://atomicdesign.bradfrost.com/chapter-2/.
- **Test place:** `skills/frontend-standards/SKILL.md` semantic review.
- **Starting state:** Existing frontend rules contain no Atomic Design stages.
- **Exact input or fixture:** Label/input/button, search control, site header, shell layout, populated search page.
- **Interaction steps:** Read the skill; assign each fixture to its stage and check assembly guidance.
- **Main behavior:** Guide reusable UI composition from parts through complete pages.
- **Expected result:** All five stages have clear roles; no compulsory intermediate wrappers.
- **Must change:** Frontend composition guidance.
- **Must not happen:** Claim Atomic Design is a linear construction sequence.
- **Planned command:** `cat skills/frontend-standards/SKILL.md` and semantic review.
- **Expected result before the code change:** Five-stage guidance is absent.
- **First observed run:** Read confirmed the five stages are absent.
- **Passing rerun:** Semantic review passed: search primitives, composite control, header, layout, and populated screen map to all five stages without requiring wrappers or a linear sequence.

### TEST-ATOMIC-002

- **Small task:** Reconcile Atomic Design with repository boundaries.
- **Source:** User request, frontend state rules, and source-layout ownership rules.
- **Test place:** `skills/frontend-standards/SKILL.md` semantic review.
- **Starting state:** Domain ownership exists without an Atomic Design mapping.
- **Exact input or fixture:** Shared button importing a product API; product panel placed in a global organisms folder; layout with duplicated fetching; mobile primitive replaced with a web-only component.
- **Interaction steps:** Read ownership and verification rules; assess each misplaced dependency.
- **Main behavior:** Preserve ownership and platform boundaries when composing atomic parts.
- **Expected result:** Feature data stays in its established layer, paths follow ownership, and shared primitives remain platform-compatible.
- **Must change:** Repository adaptation and realistic-content review guidance.
- **Must not happen:** Forced folder migration, lifted local interaction state, bypassed forms or duplicate contracts.
- **Planned command:** `cat skills/frontend-standards/SKILL.md` and semantic review.
- **Expected result before the code change:** Explicit Atomic Design adaptation is absent.
- **First observed run:** Read confirmed no explicit Atomic Design ownership mapping.
- **Passing rerun:** Semantic review passed: primitives exclude feature/API dependencies, templates do not duplicate fetching, paths retain ownership, and native compatibility plus existing state/form/lazy rules remain explicit.

### TEST-ATOMIC-003

- **Small task:** Route JSX extraction to the shared policy.
- **Source:** Existing JSX skill owns component decomposition.
- **Test place:** `skills/jsx-component-extraction/SKILL.md`.
- **Starting state:** Only code-quality is linked for shared decomposition rules.
- **Exact input or fixture:** An agent extracting a search panel reads the JSX skill.
- **Interaction steps:** Read the new link and resolve its destination and section.
- **Main behavior:** Make Atomic Design discoverable during extraction.
- **Expected result:** Link reaches the frontend Atomic Design section.
- **Must change:** JSX extraction guidance.
- **Must not happen:** Duplicate five-stage definitions or weaken existing extraction rules.
- **Planned command:** `cat skills/jsx-component-extraction/SKILL.md` and local link check.
- **Expected result before the code change:** Atomic Design link is absent.
- **First observed run:** Read confirmed no Atomic Design link in JSX extraction.
- **Passing rerun:** Read and heading scan passed: the JSX link targets the existing frontend Atomic Design section and preserves extraction rules.

### TEST-ATOMIC-004

- **Small task:** Route UI path selection to the shared policy.
- **Source:** Existing domain skill owns file placement.
- **Test place:** `skills/domain-driven-app-structure/SKILL.md`.
- **Starting state:** Domain ownership has no Atomic Design cross-reference.
- **Exact input or fixture:** An agent choosing a header component location reads the domain skill.
- **Interaction steps:** Read the new reference and resolve its destination and section.
- **Main behavior:** Keep Atomic Design compatible with source organization.
- **Expected result:** Link reaches the frontend policy and retains domain-based paths.
- **Must change:** Domain skill UI placement guidance.
- **Must not happen:** Apply UI taxonomy to server modules or introduce new directory requirements.
- **Planned command:** `cat skills/domain-driven-app-structure/SKILL.md` and local link check.
- **Expected result before the code change:** Atomic Design link is absent.
- **First observed run:** Read confirmed no Atomic Design link in domain structure.
- **Passing rerun:** Read and heading scan passed: the domain link resolves to Atomic Design and explicitly preserves UI ownership paths without applying the taxonomy to server layers.

### TEST-ATOMIC-005

- **Small task:** Validate and synchronize the policy.
- **Source:** Portable-skill workflow.
- **Test place:** Canonical/discovery skill roots and this checklist.
- **Starting state:** Previous shallow-code work is complete and uncommitted.
- **Exact input or fixture:** Updated frontend, JSX, and domain skills plus synchronization metadata.
- **Interaction steps:** Format, sync, check roots, run existing tests, inspect diff, check local links and contract.
- **Main behavior:** Deliver consistent instructions without disturbing prior work.
- **Expected result:** All checks pass; only intended files change.
- **Must change:** Canonical skills, generated copies, metadata, and checklist.
- **Must not happen:** Divergent roots, invalid metadata, unrelated application changes, or commits.
- **Planned command:** `pnpm skills:sync`; `pnpm skills:check`; `pnpm skills:test`; `pnpm format:check`; `git diff --check`.
- **Expected result before the code change:** Roots are synchronized but lack Atomic Design guidance.
- **First observed run:** Implementation contract validator passed; prior shallow-code changes remain present.
- **Passing rerun:** Synchronization and skills:check passed for 20 portable skills; all 168 skills tests passed with no failures or skips. Repository format:check, git diff --check, local link/anchor checks, and skill file-length checks passed. Diff review confirmed that the prior shallow-code changes remain intact and no application or enforcement code changed.

## Validation Notes

Use semantic fixtures and existing skill tooling for this policy-only change. No new scripts or
wording-matching tests are planned. The methodology source was read before writing; repository
placement and data-boundary rules are our adaptation, not claims about prescribed Atomic Design paths.

- All planned validation completed before the interruption; continuation verified the test log and
  working tree and recorded those results here. No unfinished skill edits or test processes remained.
