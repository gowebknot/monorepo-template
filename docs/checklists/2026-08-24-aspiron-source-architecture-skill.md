# Aspiron Source Architecture Skill

## Checklist

- [x] Define the portable skill contract.
  - [x] Use the name `aspiron-source-architecture` and describe server backend (Express or NestJS) plus web/mobile organization triggers.
  - [x] Keep the rules generic while using Aspiron domains as concrete examples.
  - [x] Require `packages/entities` for shared contracts and entities.
  - [x] Require `packages/ui` for shared UI and form components; prohibit app-local duplicates.
- [x] Document nested source conventions.
  - [x] Describe server `http`, `application`, `domain`, `infra`, middleware, seeds, and constants nesting for Express or NestJS.
  - [x] Describe feature-level web/mobile nesting, colocated tests, route nesting, adapters, hooks, providers, and mocks.
  - [x] Include Aspiron backend domains and web-admin feature examples without making every domain mandatory.
- [x] Validate the portable skill.
  - [x] Synchronize all four skill roots.
  - [x] Pass skill metadata, synchronization, and repository skill tests.
  - [x] Pass formatting validation.
- [x] Register generated-project skill triggers.
  - [x] Require the architecture skill for generated Express, web, and mobile app paths.
  - [x] Preserve the architecture requirement when app paths are added or removed dynamically.
  - [x] Keep root and `create-mono-stack` trigger synchronizers behaviorally identical.

## Acceptance Criteria

- The canonical skill exists at `skills/aspiron-source-architecture/SKILL.md`.
- The skill has all required portable-skill directories and only `name` and `description` frontmatter keys.
- The skill clearly separates Express/NestJS transport, application, domain, infrastructure, shared contracts, and client UI boundaries.
- The skill documents nested conventions and does not place `components/ui` or `components/forms` under web/mobile apps.
- All synchronized skill roots are byte-for-byte consistent.

## Test Cases

### TEST-SKILL-001: Skill structure and metadata

- **Small task:** Create the required portable skill structure and metadata.
- **Source:** Portable skill standard and user request.
- **Test place:** Repository skill validator.
- **Starting state:** No `skills/aspiron-source-architecture/` directory exists.
- **Exact input or fixture:** Skill name `aspiron-source-architecture` and the planned description.
- **Interaction steps:** Run the skill check after scaffolding and synchronization.
- **Main behavior:** The skill is recognized as a valid portable skill.
- **Expected result:** Required files and directories exist; frontmatter contains only valid `name` and `description` keys.
- **Must change:** Four synchronized skill roots and synchronization metadata.
- **Must not happen:** Provider-specific frontmatter or missing required directories.
- **Planned command:** `pnpm skills:check`
- **Expected result before the code change:** The new skill is absent, so this case cannot pass for the new skill.
- **First observed run:** `pnpm skills:check` was not run before synchronization; the new skill was then synchronized successfully.
- **Passing rerun:** `pnpm skills:check` passed and validated 19 portable skills.

### TEST-SKILL-002: Architecture guidance content

- **Small task:** Document the Express/NestJS server and web/mobile nested conventions.
- **Source:** Aspiron repository structure and user clarifications.
- **Test place:** Exact reference scan of the canonical skill.
- **Starting state:** No architecture skill guidance exists.
- **Exact input or fixture:** Required terms `http/handlers`, `application/<domain>`, `domain/<domain>`, `infra/db/repositories`, `features/<feature>/components`, `packages/entities`, and `packages/ui`.
- **Interaction steps:** Search the canonical skill and its references for all required boundaries and prohibitions.
- **Main behavior:** The skill gives agents actionable nested placement rules.
- **Expected result:** Every required boundary, shared-package rule, and Aspiron example domain is documented.
- **Must change:** `SKILL.md` and its architecture reference.
- **Must not happen:** The guidance must not prescribe Rust-only structure or app-local shared UI/form components.
- **Planned command:** `rg -n "http/handlers|application/<domain>|domain/<domain>|infra/db/repositories|features/<feature>/components|packages/entities|packages/ui|components/ui|components/forms" skills/aspiron-source-architecture`
- **Expected result before the code change:** Required terms are missing because the skill does not exist.
- **First observed run:** `rg -n "http/handlers|application/<domain>|domain/<domain>|infra/db/repositories|features/<feature>/components|packages/entities|packages/ui|components/ui|components/forms" skills/aspiron-source-architecture` found all required guidance terms.
- **Passing rerun:** Complete; the exact reference scan passed.

### TEST-SKILL-003: Synchronization and repository regression checks

- **Small task:** Synchronize the skill and preserve repository skill invariants.
- **Source:** Repository skills system and user request.
- **Test place:** Synchronization and skills test suites.
- **Starting state:** Existing skill roots are synchronized before this change.
- **Exact input or fixture:** The completed canonical skill.
- **Interaction steps:** Run synchronization, then the skill checker and skills tests.
- **Main behavior:** The new skill is available consistently to all supported agents.
- **Expected result:** Synchronization, checks, and skills tests pass without changing unrelated skills.
- **Must change:** Only the new skill, synchronized roots, and generated synchronization metadata.
- **Must not happen:** Existing divergent skill content is overwritten silently or unrelated files are modified.
- **Planned command:** `pnpm skills:sync && pnpm skills:check && pnpm skills:test`
- **Expected result before the code change:** The new skill is not synchronized, so the full command cannot validate the requested addition.
- **First observed run:** `pnpm skills:sync && pnpm skills:check && pnpm skills:test` completed successfully; the checker validated 19 skills and all 101 skills tests passed.
- **Passing rerun:** Complete; the synchronization and skill test suite passed.

### TEST-SKILL-004: Generated app trigger registration

- **Small task:** Register the architecture skill in generated-project trigger rules.
- **Source:** User request to update `skill-triggers.json` and the scripts that generate it.
- **Test place:** `core/create-mono-stack/test/skill-triggers.test.js` and `scripts/skill-gate.test.mjs`.
- **Starting state:** App trigger rules currently require only frontend or backend standards.
- **Exact input or fixture:** Generated app definitions for `api-express`, `web-vite`, `mobile-expo`, and `mobile-react-native`.
- **Interaction steps:** Build trigger rules and synchronize a representative trigger table, then collect required skills for representative source paths.
- **Main behavior:** Generated Express, web, and mobile source paths require `aspiron-source-architecture` in addition to framework-specific standards.
- **Expected result:** Each applicable app rule contains the architecture skill; unrelated generic rules remain unchanged.
- **Must change:** Root and launcher trigger synchronizers, canonical trigger table, and focused tests.
- **Must not happen:** Existing framework standards or generic contract/test rules are removed.
- **Planned command:** `node --test scripts/skill-gate.test.mjs core/create-mono-stack/test/skill-triggers.test.js`
- **Expected result before the code change:** Generated app rules do not include the new architecture skill.
- **First observed run:** `node --test scripts/skill-gate.test.mjs core/create-mono-stack/test/skill-triggers.test.js` passed all 26 tests.
- **Passing rerun:** Complete; the synchronized skill checks and all 101 skills tests passed.

## Implementation Description

Create a portable `aspiron-source-architecture` skill with concise triggering instructions and a detailed reference describing Express/NestJS server layers, nested domain/use-case/repository conventions, web/mobile feature organization, Aspiron example domains, and shared `packages/entities` and `packages/ui` ownership.

## Validation Notes

- Focused trigger tests passed all 26 tests.
- Exact architecture reference scan passed.
- `pnpm skills:sync` synchronized 19 portable skills.
- `pnpm skills:check` validated 19 portable skills.
- `pnpm skills:test` passed all 101 tests.
- Initial broad Prettier check failed because the glob included required empty `.gitkeep` files with no parser.
- Corrected Prettier check passed for all changed Markdown, JSON, and JavaScript files.
- `pnpm --filter create-mono-stack test` passed all 264 launcher and generation tests.

## Updates

### 2026-08-24

- **Reason:** The original guidance did not explicitly distinguish reusable/global icons from feature-specific components, and its Aspiron-specific name was not generic enough.
- **Evidence:** The skill instructed agents to identify a feature before placing UI code and only generally referred to shared UI primitives.
- **Impact:** Reusable icons could be incorrectly colocated under `features/<feature>/components`.
- **Corrective action:** Rename the skill to `domain-driven-app-structure`, clarify component placement rules, and link the corrective checklist [here](./2026-08-24-domain-driven-app-structure-skill-correction.md).
- **Validation:** The linked corrective checklist completed synchronization, placement scans, focused trigger tests, the full skills test suite, and formatting validation.
