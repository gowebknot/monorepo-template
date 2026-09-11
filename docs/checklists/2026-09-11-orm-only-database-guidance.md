# ORM-Only Database Guidance

Checklist ID: CHECKLIST-20260911-orm-only-database-guidance
Tier: standard
Created: 2026-09-11
Status legend: `[ ]` incomplete, `[/]` partial, `[x]` complete

## Related checklists

- [Backend Database Seeding Convention](2026-08-23-backend-database-seeding-convention.md)
- [Shallow Code and Cohesive Modules](2026-09-11-shallow-code-and-cohesive-modules.md)

## Implementation Contract

### Feature Boundaries

Make the user's prohibition on agent-authored raw SQL explicit in the existing backend skill, root
guidance, and database-package guidance. The follow-up request also replaces the reference server
bootstrap with a Drizzle migration helper and generated SQLite migrations. Preserve prior work.
Only isolated temporary/in-memory databases may be used for validation; no user database changes,
new dependencies, new skill, or automated lint rule. Update the managed server template too.

### Route-Group Ownership

No routes change. Backend standards owns the detailed persistence policy; root and database-package
instructions require it at entry points, including scripts and seeders outside server paths.

### User Journey

An agent inspects the installed ORM, schema, and repository helpers, expresses operations through
those APIs, and uses the migration workflow for schema changes. It reports unsupported operations
instead of silently adding raw SQL. Review checks handwritten queries separately from generated SQL.

### Complete Test Matrix

| ID               | Kind            | Input                                                       | Action                   | Expected result                                                           | Validation                              |
| ---------------- | --------------- | ----------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------- | --------------------------------------- |
| TEST-ORM-001     | valid/rejection | ORM CRUD, tagged SQL, driver execution, generated migration | Apply persistence policy | ORM required; handwritten SQL rejected; generated artifacts distinguished | Read backend skill                      |
| TEST-ORM-002     | valid           | Agent starts a root-level seed script                       | Read root guidance       | Backend policy applies outside server paths                               | Read root AGENTS                        |
| TEST-ORM-003     | valid           | Agent edits db helpers                                      | Read package guidance    | ORM and migration workflow required                                       | Read db AGENTS                          |
| TEST-ORM-004     | success         | Updated skill and guidance                                  | Sync and validate        | Matching roots, valid links and formatting, passing tests                 | skills:check; skills:test; format:check |
| TEST-MIGRATE-001 | valid           | Empty in-memory SQLite database                             | Run migration            | All five schema tables usable                                             | db test                                 |
| TEST-MIGRATE-002 | valid           | Migrated database with synthetic user                       | Run migration twice      | Existing data preserved                                                   | db test                                 |
| TEST-MIGRATE-003 | rejection       | Closed SQLite connection                                    | Run migration            | Error propagates                                                          | db test                                 |
| TEST-MIGRATE-004 | rejection       | Existing unmanaged tables from Drizzle push                 | Run migration            | Clear failure and existing data preserved                                 | db test                                 |
| TEST-MIGRATE-005 | valid           | Built reference module with isolated db                     | Initialize twice         | One demo user after schema creation                                       | server integration test                 |

### Unresolved Conflicts

Resolved: the user's no-raw-SQL preference wins over any demo or historical precedent. Generated
migration SQL is tool output, not permission to handwrite SQL or alter historical migrations.
The follow-up explicitly authorizes replacing reference bootstrap SQL. Existing unmanaged demo
databases may conflict with the initial migration: fail without deleting data and document using a
fresh demo database or an explicitly planned baseline. Never auto-reset or mark unapplied migrations
as complete.

## Acceptance Criteria

- Require the existing ORM across repositories, scripts, seeds, jobs, and test setup/cleanup.
- Prohibit hand-authored query strings, SQL fragments, tagged SQL, raw-query methods, and driver bypasses.
- Distinguish generated migrations and preserve schema/migration ownership; report ORM limitations.
- Root and db guidance route agents to the same authoritative policy.
- Synchronize four skill roots and pass focused documentation and skill validation.

## Small Task Breakdown and Implementation Plan

- [x] Define persistence rules in `skills/backend-standards/SKILL.md` (TEST-ORM-001).
  - [x] Require ORM APIs and existing schema/helper reuse across database-writing contexts.
  - [x] Define forbidden handwritten SQL, migration distinction, and unsupported-operation handling.
  - [x] Require review of raw-query paths without claiming blanket method-name checks prove violations.
- [x] Expose the policy in repository entry instructions.
  - [x] Add the requirement and skill link under root `AGENTS.md` Database (TEST-ORM-002).
  - [x] Add the requirement and skill link in `packages/db/AGENTS.md` (TEST-ORM-003).
- [x] Replace the reference bootstrap (TEST-MIGRATE-001 through TEST-MIGRATE-005).
  - [x] Add database integration tests before implementing the helper.
  - [x] Generate SQLite migrations from the existing example schema in `example/migrations/`.
  - [x] Export `migrateExampleDb` from the db example entry; externalize the ORM migrator.
  - [x] Replace `SCHEMA_SQL` and driver execution in both server module copies.
  - [x] Add package import mapping for the edited module's constants import in both server manifests.
  - [x] Document fresh/migrated/legacy database behavior in db README and server guidance.
  - [x] Verify db tests/build/lint and server reference build/typecheck/focused lint.
  - [x] Run launcher tests and the required create/update integration check.
- [x] Validate and synchronize policy artifacts (TEST-ORM-004).
  - [x] Format changed canonical files and synchronize skills.
  - [x] Check skills, existing tests, formatting, local links, contract, and complete diff.

## Missing-Case Review

Parameterized SQL is still handwritten SQL for this architectural rule. Read-only queries, seeds,
fixtures, resets, and maintenance scripts do not escape it. Typed ORM expressions are valid, but
wrapping handwritten SQL in a typed tag is not. Generated migration SQL remains valid through the
existing workflow. A method named query/execute alone does not establish a violation; inspect its
receiver and argument. Use isolated SQLite integration tests for startup migrations and seeding. Production auth and HTTP
authorization behavior remain unchanged; no browser or device E2E paths change.
The specific agent change mentioned by the user is unknown, so do not claim its cause was proved.

## Exact Test Cases

### TEST-ORM-001

- **Small task:** Establish the ORM-only persistence policy.
- **Source:** User request, backend guidance, db scripts and ORM CRUD examples.
- **Test place:** `skills/backend-standards/SKILL.md` semantic review.
- **Starting state:** Backend skill does not prohibit raw SQL.
- **Exact input or fixture:** ORM select/insert; a parameterized SQL tag; driver exec of CREATE TABLE; raw SQL in a seeder; ORM-generated migration; an operation unavailable in the installed ORM.
- **Interaction steps:** Read the new policy and classify each fixture.
- **Main behavior:** Use ORM APIs without silent raw SQL fallbacks.
- **Expected result:** ORM CRUD and generated migration artifacts allowed; handwritten SQL rejected; unsupported operations reported.
- **Must change:** Backend persistence and verification guidance.
- **Must not happen:** New SQL, driver bypasses, extra ORM, or blanket deletion of generated migrations.
- **Planned command:** `cat skills/backend-standards/SKILL.md` and semantic review.
- **Expected result before the code change:** Required rule is absent.
- **First observed run:** Read confirmed backend guidance does not prohibit handwritten SQL.
- **Passing rerun:** Semantic review passed for ORM CRUD, forbidden handwritten SQL, generated migrations, and unsupported operations.

### TEST-ORM-002

- **Small task:** Apply the policy from root instructions.
- **Source:** Root Database guidance and user preference.
- **Test place:** `AGENTS.md` Database section.
- **Starting state:** Root names Drizzle but does not prohibit raw SQL.
- **Exact input or fixture:** Agent writing a database seed script under scripts/.
- **Interaction steps:** Read Database instructions and resolve the backend-skill link.
- **Main behavior:** Discover the ORM requirement outside server directories.
- **Expected result:** ORM is required and the authoritative detailed policy is linked.
- **Must change:** Root Database guidance.
- **Must not happen:** Weaken existing env/schema rules or change unrelated guidance.
- **Planned command:** Read root Database section and check local link.
- **Expected result before the code change:** ORM-only requirement is absent.
- **First observed run:** Read confirmed root only names Drizzle.
- **Passing rerun:** Root Database scan passed; backend policy applies to scripts and seeders.

### TEST-ORM-003

- **Small task:** Apply the policy from db-package instructions.
- **Source:** Package ownership and user preference.
- **Test place:** `packages/db/AGENTS.md`.
- **Starting state:** Package documents Drizzle helpers but no raw SQL prohibition.
- **Exact input or fixture:** Agent adding database helpers or schema setup.
- **Interaction steps:** Read package guidance and resolve its backend-skill link.
- **Main behavior:** Keep package operations on the existing ORM/migration workflow.
- **Expected result:** ORM-only instruction leads to the same authoritative policy.
- **Must change:** Package guidance.
- **Must not happen:** Alter auth schema exceptions, import rules, or package exports.
- **Planned command:** Read db AGENTS and check local link.
- **Expected result before the code change:** ORM-only requirement is absent.
- **First observed run:** Read confirmed db instructions do not prohibit raw SQL.
- **Passing rerun:** Database instruction scan passed; existing schema and export rules are preserved.

### TEST-ORM-004

- **Small task:** Validate portable guidance and preserve previous changes.
- **Source:** Portable-skill workflow.
- **Test place:** Skill roots, instruction files, and active checklist.
- **Starting state:** Previous code-quality and Atomic Design changes are complete and uncommitted.
- **Exact input or fixture:** Backend skill, root/db instructions, discovery copies, metadata, and checklist.
- **Interaction steps:** Format, sync, validate skills, run existing skills tests, check links/contract, review diff.
- **Main behavior:** Deliver consistent and reviewable guidance.
- **Expected result:** Checks pass and no runtime files change.
- **Must change:** Only listed documentation and generated skill artifacts.
- **Must not happen:** User database execution, commits, or overwritten prior work.
- **Planned command:** `pnpm skills:sync`; `pnpm skills:check`; `pnpm skills:test`; `pnpm format:check`; `git diff --check`.
- **Expected result before the code change:** Existing artifacts lack the new policy.
- **First observed run:** Initial contract validator passed; prior changes are present.
- **Passing rerun:** `pnpm skills:sync` (re-synced `backend-standards` into all four roots, previously
  out of sync), `pnpm skills:check` (20 portable skills validated), `pnpm skills:test` (168 pass),
  `pnpm format` then `pnpm format:check` (clean), and `just check` (lint + typecheck + format-check +
  skills-check + skills-test + template-test + server unit/e2e, all pass) all succeeded on the full
  working tree ahead of the create-mono-stack 0.1.51 release commit.

## Validation Notes

- Discovery found `apps/server/reference/database/database.module.ts` calling
  `db.$client.exec(SCHEMA_SQL)` for demo-only table creation. Its comment directs real projects to
  migrations. This is evidence of an existing precedent, not proof of the unknown agent's reasoning.
- Existing database CRUD examples already use Drizzle's typed builders.
- This is a policy change. Semantic checks and existing tooling do not prove future agent compliance.
- Documented the fresh/already-migrated/unmanaged-legacy database behavior in `packages/db/README.md`
  and updated the `database.module.ts` source-layout comment in both `apps/server/AGENTS.md` and the
  managed server template's `AGENTS.md` (doc-only changes, no behavior change).
- Reran `pnpm --filter create-mono-stack test` (278 tests, including `TEST-TEMPLATE-003` and
  `TEST-SWAGGER-007`, which iterate both `apps/server` and the managed template server root) after
  mirroring the `tsconfig*.json` `rootDir` fixes into the template copy; all pass, confirming the two
  server roots stayed in sync.

### TEST-MIGRATE-001

- **Small task:** Verify reference migration behavior for case 001.
- **Source:** Follow-up request and existing demo startup behavior.
- **Test place:** `packages/db/test/example-migration.test.mjs`.
- **Starting state:** Empty in-memory SQLite database.
- **Exact input or fixture:** Empty in-memory SQLite database.
- **Interaction steps:** Migrate then select from users, todos, todoItems, authAccounts, authSessions.
- **Main behavior:** Each table is present and empty.
- **Expected result:** Each table is present and empty.
- **Must change:** Only the isolated database, as appropriate for this case.
- **Must not happen:** Writes to user databases, deleted data, or swallowed errors.
- **Planned command:** Database cases: `pnpm --filter @monorepo-template/db test`; server case: `pnpm --filter server build:reference` then `pnpm --filter server exec node --test test/reference-database.test.mjs`.
- **Expected result before the code change:** New helper is absent; server's old SQL bootstrap fails the new no-bypass check.
- **First observed run:** Database baseline failed because migrateExampleDb is not exported yet; temporary legacy fixture creation succeeded.
- **Passing rerun:** `pnpm --filter @monorepo-template/db test` — all 5 per-table TEST-MIGRATE-001 cases pass.

### TEST-MIGRATE-002

- **Small task:** Verify reference migration behavior for case 002.
- **Source:** Follow-up request and existing demo startup behavior.
- **Test place:** `packages/db/test/example-migration.test.mjs`.
- **Starting state:** Migrated SQLite with user id fixture-user and email fixture@example.test.
- **Exact input or fixture:** Migrated SQLite with user id fixture-user and email fixture@example.test.
- **Interaction steps:** Insert user through ORM, rerun migrate, read user.
- **Main behavior:** The same user remains exactly once.
- **Expected result:** The same user remains exactly once.
- **Must change:** Only the isolated database, as appropriate for this case.
- **Must not happen:** Writes to user databases, deleted data, or swallowed errors.
- **Planned command:** Database cases: `pnpm --filter @monorepo-template/db test`; server case: `pnpm --filter server build:reference` then `pnpm --filter server exec node --test test/reference-database.test.mjs`.
- **Expected result before the code change:** New helper is absent; server's old SQL bootstrap fails the new no-bypass check.
- **First observed run:** Database baseline failed because migrateExampleDb is not exported yet; temporary legacy fixture creation succeeded.
- **Passing rerun:** `pnpm --filter @monorepo-template/db test` — TEST-MIGRATE-002 passes.

### TEST-MIGRATE-003

- **Small task:** Verify reference migration behavior for case 003.
- **Source:** Follow-up request and existing demo startup behavior.
- **Test place:** `packages/db/test/example-migration.test.mjs`.
- **Starting state:** Closed in-memory SQLite connection.
- **Exact input or fixture:** Closed in-memory SQLite connection.
- **Interaction steps:** Close connection, call helper.
- **Main behavior:** Migration error propagates; no recovery reset.
- **Expected result:** Migration error propagates; no recovery reset.
- **Must change:** Only the isolated database, as appropriate for this case.
- **Must not happen:** Writes to user databases, deleted data, or swallowed errors.
- **Planned command:** Database cases: `pnpm --filter @monorepo-template/db test`; server case: `pnpm --filter server build:reference` then `pnpm --filter server exec node --test test/reference-database.test.mjs`.
- **Expected result before the code change:** New helper is absent; server's old SQL bootstrap fails the new no-bypass check.
- **First observed run:** Database baseline failed because migrateExampleDb is not exported yet; temporary legacy fixture creation succeeded. After the helper was exported, the case failed again: `error.cause.message` was the intermediate `DrizzleError` ("Failed to run the query '...'"), not the driver message, because drizzle-orm's SQLite migrator wraps the raw better-sqlite3 error in its own `DrizzleError` before `migrateExampleDb` catches it. Unwrapping `cause` to the driver error before rethrowing (`cause = cause.cause`) fixed the assertion but violated the repository's mandatory `preserve-caught-error` ESLint rule (`packages/db lint`), which requires the thrown error's `cause` to be the unmodified catch-parameter identifier; reassigning the catch parameter itself then also tripped `no-ex-assign`. Resolution: keep `migrateExampleDb` passing the caught error through unmodified (`{ cause }`) and correct the test to read the driver message one level deeper, `error.cause.cause.message`, which matches the real two-level `DrizzleError` wrapping and keeps the helper lint-clean. The original assertion was demonstrably incorrect about the wrapping depth, not merely inconvenient.
- **Passing rerun:** `pnpm --filter @monorepo-template/db test` and `pnpm --filter @monorepo-template/db lint` — TEST-MIGRATE-003 and lint both pass.

### TEST-MIGRATE-004

- **Small task:** Verify reference migration behavior for case 004.
- **Source:** Follow-up request and existing demo startup behavior.
- **Test place:** `packages/db/test/example-migration.test.mjs`.
- **Starting state:** Temporary database initialized by drizzle-kit push, with synthetic user.
- **Exact input or fixture:** Temporary database initialized by drizzle-kit push, with synthetic user.
- **Interaction steps:** Run helper, catch failure, query existing user.
- **Main behavior:** Actionable failure; user survives unchanged.
- **Expected result:** Actionable failure; user survives unchanged.
- **Must change:** Only the isolated database, as appropriate for this case.
- **Must not happen:** Writes to user databases, deleted data, or swallowed errors.
- **Planned command:** Database cases: `pnpm --filter @monorepo-template/db test`; server case: `pnpm --filter server build:reference` then `pnpm --filter server exec node --test test/reference-database.test.mjs`.
- **Expected result before the code change:** New helper is absent; server's old SQL bootstrap fails the new no-bypass check.
- **First observed run:** Database baseline failed because migrateExampleDb is not exported yet; temporary legacy fixture creation succeeded.
- **Passing rerun:** `pnpm --filter @monorepo-template/db test` — TEST-MIGRATE-004 passes; the pre-existing user survives the failed migration attempt.

### TEST-MIGRATE-005

- **Small task:** Verify reference migration behavior for case 005.
- **Source:** Follow-up request and existing demo startup behavior.
- **Test place:** `apps/server/test/reference-database.test.mjs`.
- **Starting state:** Built reference module with an injected in-memory db.
- **Exact input or fixture:** Built reference module with an injected in-memory db.
- **Interaction steps:** Call onModuleInit twice, query users and todos.
- **Main behavior:** All tables usable and exactly one demo user; no handwritten SQL.
- **Expected result:** All tables usable and exactly one demo user; no handwritten SQL.
- **Must change:** Only the isolated database, as appropriate for this case.
- **Must not happen:** Writes to user databases, deleted data, or swallowed errors.
- **Planned command:** Database cases: `pnpm --filter @monorepo-template/db test`; server case: `pnpm --filter server build:reference` then `pnpm --filter server exec node --test test/reference-database.test.mjs`.
- **Expected result before the code change:** New helper is absent; server's old SQL bootstrap fails the new no-bypass check.
- **First observed run:** Reference build passed; initial test failed on missing import mapping. After adding the mapping, rerun failed with Direct driver execution is forbidden, proving the old startup bypasses Drizzle. After `database.module.ts` was switched to `migrateExampleDb`, `pnpm --filter server build:reference` failed with `TS2210: The project root is ambiguous ... Supply the rootDir compiler option`, caused by the new `#reference/*` subpath import map entry in `apps/server/package.json` combined with no explicit `rootDir` in `tsconfig.reference.build.json`/`tsconfig.json`. Fixed by adding `rootDir: "./reference"` to `tsconfig.reference.build.json`, `rootDir: "./"` to the base `tsconfig.json`, and `rootDir: "./src"` to `tsconfig.build.json` (to keep the real server's `dist/main.js` output path unchanged); mirrored the same three edits into `core/create-mono-stack/reference-templates/managed/server` to keep the generated-project template in sync.
- **Passing rerun:** `pnpm --filter server build`, `pnpm --filter server build:reference`, `pnpm --filter server typecheck`, `pnpm --filter server lint`, `pnpm --filter server test:unit`, `pnpm --filter server test:api:e2e`, and `node --test test/reference-database.test.mjs` (from `apps/server`) all pass; `dist/main.js` and `dist/reference/main.js` output paths are unchanged.

- First helper build succeeded, but tests failed during import because Vite browser-shimmed `node:url`. Add it to the db build external list before rerunning; this matches the package’s documented Node builtin bundling concern.
