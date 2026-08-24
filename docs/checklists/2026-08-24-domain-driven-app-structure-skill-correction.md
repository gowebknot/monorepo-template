# Domain-Driven App Structure Skill Correction

Related checklist: [Aspiron Source Architecture Skill](./2026-08-24-aspiron-source-architecture-skill.md)

## Checklist

- [x] Rename the skill and every generated trigger reference to `domain-driven-app-structure`.
  - [x] Rename the canonical skill directory and synchronized copies.
  - [x] Update skill metadata, trigger synchronizers, trigger configuration, and focused tests.
- [x] Clarify component placement rules.
  - [x] Keep reusable primitives, icons, and icon wrappers in `packages/ui`.
  - [x] Keep app-wide composition in app-level `components/` folders.
  - [x] Keep feature components limited to feature behavior and feature-specific composition.
- [x] Validate synchronization, metadata, references, and trigger behavior.

## Acceptance Criteria

- The canonical skill exists at `skills/domain-driven-app-structure/SKILL.md`.
- No active skill, trigger, or synchronization metadata references `aspiron-source-architecture`.
- The guidance explicitly classifies reusable icons as shared UI primitives, not feature components.
- All four skill roots remain byte-for-byte synchronized.
- Generated frontend and backend app paths still require the renamed skill.

## Test Cases

### TEST-ARCH-001: Component placement guidance

- **Small task:** Clarify placement of shared, app-wide, and feature-specific components.
- **Source:** User report that global icons are being placed as feature-specific components.
- **Test place:** Exact text scan of the canonical skill and reference.
- **Starting state:** Existing guidance mentions shared UI but does not explicitly classify icons or distinguish app-wide composition from feature composition.
- **Exact input or fixture:** Terms `icons`, `icon wrappers`, `packages/ui`, app-level `components/`, and `feature-specific composition`.
- **Interaction steps:** Search the canonical skill after editing for each required placement rule.
- **Main behavior:** Agents receive an unambiguous component placement decision.
- **Expected result:** Reusable icons and primitives point to `packages/ui`; app-wide composition points to app-level components; feature folders contain feature-specific code.
- **Must change:** The canonical skill guidance and source-layout reference.
- **Must not happen:** The guidance must not place reusable or global icons under `features/<feature>/components`.
- **Planned command:** `rg -n "icons|icon wrappers|packages/ui|app-level|feature-specific" skills/domain-driven-app-structure`
- **Expected result before the code change:** The renamed path and explicit icon terms are absent.
- **First observed run:** The exact scan failed because `skills/domain-driven-app-structure` does not exist yet.
- **Passing rerun:** The scan found all required placement terms in the renamed skill and reference.

### TEST-ARCH-002: Skill rename and synchronization

- **Small task:** Rename the portable skill without leaving divergent roots or stale active references.
- **Source:** User-selected name `domain-driven-app-structure` and repository skills system.
- **Test place:** Skill checker and synchronization test suite.
- **Starting state:** The skill is named `aspiron-source-architecture` in four roots and trigger metadata.
- **Exact input or fixture:** New skill name `domain-driven-app-structure`.
- **Interaction steps:** Synchronize roots, then run the checker and skills tests.
- **Main behavior:** The renamed skill is discoverable and consistent.
- **Expected result:** Synchronization succeeds, all roots match, and skill tests pass.
- **Must change:** Skill directories, metadata, and synchronization metadata.
- **Must not happen:** Any active skill or generated trigger retains the old name.
- **Planned command:** `pnpm skills:sync && pnpm skills:check && pnpm skills:test`
- **Expected result before the code change:** The old name remains active and the new skill is absent.
- **First observed run:** Not run before implementation because synchronization is the implementation step.
- **Validation note:** The first `pnpm skills:sync` run failed because the old canonical directory retained empty portable-skill subdirectories after its `SKILL.md` was moved. The stale directory was removed before rerunning synchronization.
- **Passing rerun:** `pnpm skills:sync` synchronized 20 portable skills; `pnpm skills:check` validated 19 portable skills; `pnpm skills:test` passed all 101 tests.

### TEST-ARCH-003: Generated trigger behavior

- **Small task:** Preserve architecture trigger behavior under the new skill name.
- **Source:** Existing generated-project trigger tests.
- **Test place:** `scripts/skill-gate.test.mjs` and `core/create-mono-stack/test/skill-triggers.test.js`.
- **Starting state:** Representative web, mobile, and backend paths require the old skill name.
- **Exact input or fixture:** `apps/admin-react/**`, `apps/student-expo/**`, and `apps/api/**` generated app rules.
- **Interaction steps:** Build trigger rules and collect required skills for representative paths.
- **Main behavior:** Applicable generated app paths require the renamed skill alongside framework standards.
- **Expected result:** Focused trigger tests pass and no framework or generic requirements are removed.
- **Must change:** Trigger implementation and assertions only where the skill name changes.
- **Must not happen:** Unrelated rules or required frontend/backend skills are removed.
- **Planned command:** `node --test scripts/skill-gate.test.mjs core/create-mono-stack/test/skill-triggers.test.js`
- **Expected result before the code change:** Assertions and trigger output use the old skill name.
- **First observed run:** The focused trigger suite passed all 26 tests against the old name.
- **Passing rerun:** The focused trigger suite passed all 26 tests with `domain-driven-app-structure`.

## Implementation Description

Rename the Aspiron-specific skill to `domain-driven-app-structure`, update all trigger and synchronization references, and make shared icon, app-wide composition, and feature-specific component boundaries explicit.

## Validation Notes

- The renamed skill scan passed for all explicit icon and component placement terms.
- Prettier passed for all changed Markdown, JSON, and JavaScript files.
- A repository search found the old name only in historical checklist text and links; no active skill, trigger, or synchronization metadata retains it.
