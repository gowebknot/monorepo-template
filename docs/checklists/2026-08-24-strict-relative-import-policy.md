# Strict Relative Import Policy

Related checklist: [Code Quality Dispatch And CVA Guidance](./2026-08-24-code-quality-dispatch-and-cva-guidance.md)

## Checklist

- [x] Strengthen the `code-quality` skill's import rule.
  - [x] State that relative imports are prohibited in source files.
  - [x] State that only barrel files such as `index.ts` and nested `index.ts` files may use them.
  - [x] Require aliases or package-name imports everywhere else and require fixing resolution instead of adding exceptions.
- [x] Synchronize and validate the portable skill.

## Acceptance Criteria

- The canonical `code-quality` skill uses strict, imperative language for the relative-import rule.
- The rule permits relative imports only in barrel files.
- All synchronized skill roots contain the same rule.
- Formatting and skill validation pass.

## Test Cases

### TEST-QUALITY-001: Strict import guidance

- **Small task:** Make the relative-import rule explicit and mandatory.
- **Source:** User requirement that no relative imports exist except in barrel files.
- **Test place:** Exact text scan of `skills/code-quality/SKILL.md`.
- **Starting state:** The skill says to use relative imports only in barrel files but does not explicitly call the rule strict or prohibit exceptions.
- **Exact input or fixture:** Required concepts `strictly prohibit`, `relative imports`, `barrel files`, `aliases`, and `package-name imports`.
- **Interaction steps:** Search the canonical skill after editing for all required concepts.
- **Main behavior:** Agents receive an unambiguous import-boundary rule.
- **Expected result:** The skill prohibits relative imports outside barrel files and directs agents to repair module resolution rather than add exceptions.
- **Must change:** `skills/code-quality/SKILL.md`.
- **Must not happen:** The rule must not permit relative imports in implementation, route, test, config, or generated source files merely for convenience.
- **Planned command:** `rg -n "strictly prohibit|relative imports|barrel files|aliases|package-name imports|module resolution" skills/code-quality/SKILL.md`
- **Expected result before the code change:** The strict prohibition and module-resolution wording are absent.
- **First observed run:** The scan found the existing general relative-import rule, but not the required strict-prohibition or module-resolution wording.
- **Passing rerun:** The scan found all required strict-import and module-resolution terms in the updated canonical skill.

### TEST-QUALITY-002: Portable synchronization

- **Small task:** Propagate the strengthened rule to every supported agent root.
- **Source:** Repository portable-skill synchronization rules.
- **Test place:** Skill synchronization and checker.
- **Starting state:** Four roots contain the previous wording.
- **Exact input or fixture:** Updated canonical `code-quality` skill.
- **Interaction steps:** Synchronize the skill, validate metadata and root consistency, then format the changed files.
- **Main behavior:** Every agent follows the same strict rule.
- **Expected result:** Synchronization and validation pass with no divergent skill copies.
- **Must change:** Synchronized skill copies and synchronization metadata if required.
- **Must not happen:** Provider-specific metadata or unrelated skill changes.
- **Planned command:** `pnpm skills:sync && pnpm skills:check && pnpm exec prettier --check skills/code-quality/SKILL.md .agents/skills/code-quality/SKILL.md .claude/skills/code-quality/SKILL.md .opencode/skills/code-quality/SKILL.md`
- **Expected result before the code change:** The old wording remains synchronized.
- **First observed run:** `pnpm skills:check` validated the existing 19 portable skills before the wording change.
- **Passing rerun:** `pnpm skills:sync` synchronized 19 portable skills, `pnpm skills:check` passed, `pnpm skills:test` passed all 104 tests, and the targeted Prettier check passed.

## Implementation Description

Strengthen the `code-quality` portable skill so relative imports are strictly forbidden outside barrel files, with aliases or package-name imports required everywhere else and module resolution fixes required instead of convenience exceptions.

## Validation Notes

- The strict rule is synchronized across `skills/`, `.agents/skills/`, `.claude/skills/`, and `.opencode/skills/`.
- Existing relative imports were not mass-rewritten in this documentation-only policy update; the updated agent rule now requires aliases or package-name imports for all new and modified source files.
