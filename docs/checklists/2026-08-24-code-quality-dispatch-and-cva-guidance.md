# Code Quality Dispatch And CVA Guidance

- Checklist ID: CHECKLIST-20260824-code-quality-dispatch-and-cva-guidance
- Created: 2026-08-24
- Planning completed: 2026-08-24
- Type: Portable skill documentation update
- Source request: Add hash-map dispatch guidance and require CVA for CSS styling variants.
- Related implementation: [`code-quality`](../../skills/code-quality/SKILL.md)
- Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Implementation Description

- Extend the canonical `code-quality` skill with guidance to prefer hash maps over `switch` cases or long `if/else` ladders for keyed behavior.
- Extend the skill with guidance to create and use `cva` variants instead of local hash maps for CSS styling variants.
- Synchronize the canonical skill to `.agents/skills/`, `.claude/skills/`, and `.opencode/skills/`.

## Acceptance Criteria

- Keyed dispatch guidance explicitly prefers hash maps over `switch` statements and long `if/else` ladders.
- CSS styling guidance explicitly prefers `cva` variants over local styling hash maps.
- All four skill roots remain byte-for-byte synchronized.
- Skill validation and formatting checks pass without bypasses.

## Exact Test Cases

### TEST-SKILL-001: Dispatch guidance

- **Small task:** Add guidance for keyed behavior dispatch.
- **Source:** User request to use hash maps instead of switch cases or if/else ladders.
- **Test place:** `skills/code-quality/SKILL.md` exact text scan.
- **Starting state:** The skill has no dispatch-specific rule.
- **Exact input or fixture:** The new rule names hash maps, `switch` statements, and long `if/else` ladders.
- **Interaction steps:** Read the canonical skill after editing and search for the required terms.
- **Main behavior:** The skill directs agents toward map-based keyed dispatch.
- **Expected result:** The rule is present, imperative, and scoped to keyed behavior rather than unconditional replacement of all branching.
- **Must change:** The canonical skill content.
- **Must not happen:** Existing SOLID, DRY, modularity, import, minimality, and validation rules are not removed.
- **Planned command:** `pnpm skills:check` and an exact text scan of `skills/code-quality/SKILL.md`.
- **Expected result before the code change:** The required dispatch wording is absent.
- **First observed run:** The exact text scan found the new keyed-dispatch rule with `hash maps`, `switch`, and `if/else` terminology.
- **Passing rerun:** `pnpm skills:check` passed after synchronization; the dispatch rule remains present in the canonical skill.

### TEST-SKILL-002: CVA styling guidance

- **Small task:** Add guidance for CSS styling variants.
- **Source:** User request to create and use CVA variants instead of local hash maps for CSS styling variants.
- **Test place:** `skills/code-quality/SKILL.md` exact text scan.
- **Starting state:** The skill has no CVA-specific rule.
- **Exact input or fixture:** The new rule names `cva`, variants, CSS styling, and local hash maps.
- **Interaction steps:** Read the canonical skill after editing and search for the required terms.
- **Main behavior:** The skill directs agents to model CSS variants with CVA.
- **Expected result:** The rule prefers creating and using `cva` variants and excludes local styling hash maps for that purpose.
- **Must change:** The canonical skill content.
- **Must not happen:** The guidance must not require CVA for non-CSS data mappings.
- **Planned command:** `pnpm skills:check` and an exact text scan of `skills/code-quality/SKILL.md`.
- **Expected result before the code change:** The required CVA wording is absent.
- **First observed run:** The exact text scan found the new CSS guidance with `cva`, CSS styling variants, and local hash-map terminology.
- **Passing rerun:** `pnpm skills:check` passed after synchronization; the CVA rule remains present in the canonical skill.

### TEST-SKILL-003: Portable synchronization

- **Small task:** Synchronize the updated skill across supported roots.
- **Source:** Repository skill synchronization rules.
- **Test place:** `skills/code-quality/SKILL.md`, `.agents/skills/code-quality/SKILL.md`, `.claude/skills/code-quality/SKILL.md`, and `.opencode/skills/code-quality/SKILL.md`.
- **Starting state:** All four copies contain the previous guidance.
- **Exact input or fixture:** The updated canonical `code-quality` skill.
- **Interaction steps:** Run `pnpm skills:sync`, then compare all four files through `pnpm skills:check`.
- **Main behavior:** Every supported agent root receives identical portable guidance.
- **Expected result:** Synchronization and skill validation exit successfully with no divergent roots.
- **Must change:** The three generated copies and synchronization metadata if the tool updates it.
- **Must not happen:** Provider-specific frontmatter or syntax is introduced.
- **Planned command:** `pnpm skills:sync && pnpm skills:check && pnpm format:check`.
- **Expected result before the code change:** Synchronization would restore the old canonical content because the new guidance is absent.
- **First observed run:** `pnpm skills:sync` synchronized 19 portable skills.
- **Passing rerun:** `pnpm skills:check`, `pnpm skills:test` (101 passing tests), and `pnpm format:check` all passed.

## Implementation Plan

- [x] Update `skills/code-quality/SKILL.md` with one keyed-dispatch rule that prefers hash maps over `switch` statements and long `if/else` ladders while preserving ordinary conditional logic where it is clearer.
- [x] Update `skills/code-quality/SKILL.md` with one CSS-variant rule that creates and uses `cva` variants instead of local hash maps for class selection.
- [x] Run `pnpm skills:sync` to propagate the canonical skill.
- [x] Verify the four roots and required metadata with `pnpm skills:check`.
- [x] Run `pnpm skills:test` and `pnpm format:check`.

## Validation Notes

- `pnpm skills:sync` synchronized 19 portable skills.
- `pnpm skills:check` validated all 19 portable skills.
- `pnpm skills:test` passed all 101 tests.
- `pnpm format:check` passed for the repository.

## Updates

- 2026-09-11: The user reported mixed responsibilities and nested code despite the broad quality
  guidance. Inspection found no general shallow-code policy and an explicit same-file preference in
  JSX extraction. [Shallow Code and Cohesive Modules](2026-09-11-shallow-code-and-cohesive-modules.md)
  extends dispatch guidance with lazy handlers and unknown-key handling, adds cross-cutting nesting
  and ownership rules, and aligns JSX extraction and review. Existing keyed-dispatch and CVA choices
  remain intact. Semantic fixture review passed; synchronization, skills tests, and formatting
  results are tracked in the new checklist.
