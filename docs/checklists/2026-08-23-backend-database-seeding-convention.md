# Backend Database Seeding Convention

## Checklist ID

`CHECKLIST-BACKEND-SEEDING-2026-08-23`

## Scope

Add portable guidance to `backend-standards` for creating, maintaining, using, and safely handling
database seeders in generated applications. The template itself must not gain a Faker dependency.

## Acceptance Criteria

- [x] The canonical backend skill gives strong, conditional guidance to prefer `@faker-js/faker` in a
      generated project when no suitable data generator already exists.
- [x] The guidance requires deterministic, repeatable, idempotent, relationship-aware, and safe seed
      behavior.
- [x] The guidance requires generated JSON records to include stable identifiers and preserve
      references between related records.
- [x] The guidance describes a git-ignored JSON output area containing records created by the seeder,
      including stable IDs that users and agents can inspect or reuse.
- [x] The guidance separates seeds from migrations and application startup and prohibits implicit or
      destructive production seeding.
- [x] All four skill roots contain the same updated backend skill.
- [x] No package manifest or lockfile changes are made.

## Small Task Breakdown

### 1. Add the seeding policy to the canonical skill

- [x] Add a focused `Database Seeding` section to `skills/backend-standards/SKILL.md`.
- [x] State that existing project tooling should be reused before introducing a generator.
- [x] Strongly recommend `@faker-js/faker` for generated applications without a suitable generator,
      without adding it to this template.
- [x] Cover deterministic generation, explicit fixtures, dependency ordering, idempotency,
      transactions, environment safety, secrets, lifecycle separation, and cleanup.
- [x] Describe a git-ignored JSON output folder/file populated from records successfully written by the
      seeder, including stable IDs, references, and regeneration guidance.

### 2. Synchronize and validate the skill roots

- [x] Run `pnpm skills:sync`.
- [x] Confirm `skills/`, `.agents/skills/`, `.claude/skills/`, and `.opencode/skills/` are identical.
- [x] Run the skill checks and formatting checks.
- [x] Confirm dependency manifests and lockfiles are unchanged.

## Test Cases

### TEST-SKILL-001: Seeding policy is present in the canonical skill

- **Small task:** Add the database seeding policy to the canonical skill.
- **Source:** User requirement and `create-portable-skill` guidance.
- **Test place:** Exact text scan of `skills/backend-standards/SKILL.md`.
- **Starting state:** The canonical skill has no database seeding section.
- **Exact input or fixture:** The updated skill text contains `Database Seeding`, `@faker-js/faker`,
  deterministic generation, idempotency, migration separation, and production safety guidance.
- **Interaction steps:** Read the canonical skill and scan for each required policy phrase.
- **Main behavior:** The skill instructs agents how to safely implement and maintain seeders.
- **Expected result:** Every required policy is present and the template dependency-free constraint is
  explicit.
- **Must change:** Only the canonical backend skill content.
- **Must not happen:** No package manifest or lockfile is changed.
- **Planned command:** `pnpm skills:check`
- **Expected result before the code change:** The new policy is absent from the canonical skill.
- **First observed run:** The first exact text scan after implementation confirmed the general seeding
  policy content; the later scan confirmed the corrected post-write JSON direction.
- **Passing rerun:** Exact text scan confirmed the database seeding section, Faker recommendation,
  deterministic generation, idempotency, migration separation, production safety, and no-template-
  dependency guidance.

### TEST-SKILL-002: Skill roots are synchronized

- **Small task:** Synchronize the updated portable skill.
- **Source:** Repository skill synchronization rule in `AGENTS.md`.
- **Test place:** `pnpm skills:check`.
- **Starting state:** The four roots may differ before synchronization.
- **Exact input or fixture:** The four `backend-standards/SKILL.md` files.
- **Interaction steps:** Run `pnpm skills:sync`, then run `pnpm skills:check`.
- **Main behavior:** Synchronization propagates the canonical skill without divergent copies.
- **Expected result:** The skill check passes.
- **Must change:** The four synchronized skill copies and sync metadata if the tool updates it.
- **Must not happen:** Provider-specific frontmatter or unrelated skill changes are introduced.
- **Planned command:** `pnpm skills:sync && pnpm skills:check`
- **Expected result before the code change:** The updated text is not yet synchronized.
- **First observed run:** `pnpm skills:check` failed because `backend-standards` differed between synchronized roots after the canonical edit.
- **Passing rerun:** `pnpm skills:sync` followed by `pnpm skills:check` passed; all 17 portable skills
  validated.

### TEST-SKILL-003: Repository formatting and dependency boundaries remain valid

- **Small task:** Verify the documentation change does not alter dependencies or violate formatting.
- **Source:** User constraint and repository validation commands.
- **Test place:** `pnpm format:check` plus repository status/diff inspection.
- **Starting state:** No Faker dependency is present in the template.
- **Exact input or fixture:** Root and workspace package manifests and lockfiles remain unchanged.
- **Interaction steps:** Run formatting validation and inspect the final diff/status.
- **Main behavior:** The change remains documentation-only apart from synchronized skill copies.
- **Expected result:** Formatting passes and no dependency metadata changes are present.
- **Must change:** Skill documentation only.
- **Must not happen:** No `package.json`, lockfile, or runtime source changes.
- **Planned command:** `pnpm format:check`
- **Expected result before the code change:** No new formatting result exists for the change.
- **First observed run:** Pending validation before the change; no new formatting or dependency scan
  had been run.
- **Passing rerun:** `pnpm format:check` passed, `git diff --check` passed, and the dependency manifest
  path scan returned no files.

### TEST-SKILL-004: Generated JSON guidance includes stable IDs and references

- **Small task:** Document how generated JSON data should be stored and reused.
- **Source:** User requirement for git-ignored generated JSON data with IDs.
- **Test place:** Exact text scan of `skills/backend-standards/SKILL.md`.
- **Starting state:** The existing policy does not mention a JSON data area or generated record IDs.
- **Exact input or fixture:** The updated skill text mentions a git-ignored JSON path populated from
  successfully seeded database records, stable IDs, relationship references, and regeneration/reference
  use.
- **Interaction steps:** Read the database seeding section and scan for each required rule.
- **Main behavior:** Agents know where generated data can be inspected and how it remains safe to use.
- **Expected result:** The policy requires the seeder to export created records and IDs to JSON for safe
  local reference/reuse without treating the generated file as committed authoritative data.
- **Must change:** The canonical and synchronized backend skill copies.
- **Must not happen:** JSON is generated independently of successful database writes, committed, or
  allowed to contain secrets or real personal data.
- **Planned command:** `pnpm skills:check`
- **Expected result before the code change:** The required JSON and ID guidance is absent.
- **First observed run:** `pnpm skills:check` failed because the new JSON and ID guidance was only in
  the canonical skill and had not yet been synchronized.
- **Passing rerun:** Exact text scan confirmed the git-ignored `data/generated/` output path, stable
  IDs, relationship references, post-write export behavior, and regeneration guidance.

## Implementation Plan

1. [x] Edit only `skills/backend-standards/SKILL.md` with concise imperative guidance.
2. [x] Synchronize the four skill roots using the repository command.
3. [x] Run `pnpm skills:check`, `pnpm skills:test`, and `pnpm format:check`.
4. [x] Inspect status and diff to verify only the intended skill and checklist files changed.

## Risks

- Overly prescriptive Faker wording could prevent use of an existing project-specific generator; the
  policy must prefer existing tooling first and recommend Faker only when needed.
- Seed guidance could be mistaken for migration guidance; the section must explicitly separate them.

## Validation Notes

- `pnpm skills:check` initially failed after the canonical edit because the synchronized skill roots
  had not yet been updated. The planned corrective action is `pnpm skills:sync` followed by the same
  check.
- The second policy edit produced the same expected synchronization failure; it will be corrected by
  the same synchronization step before the passing rerun.
- The JSON direction was corrected to make the git-ignored artifact a post-seed export of records
  successfully written to the database, rather than an unchecked seeder input.
- After correcting that direction, `pnpm skills:check` again correctly reported unsynchronized skill
  roots; synchronization is the recorded corrective action.
