# PostgreSQL Better Auth Email/Password

Related checklist: [Shared Better Auth Package in Aspiron](../../my-project/aspiron/docs/checklists/2026-08-24-shared-better-auth-package.md) (external read-only source)

## Scope

- Include PostgreSQL Drizzle persistence and Better Auth email/password authentication.
- Include the NestJS `/api/auth/*` transport adapter in nested HTTP and infrastructure folders.
- Include shared web and Expo client factories only where they do not add optional providers or email delivery.
- Defer OAuth providers, SES delivery, email verification delivery, password-reset delivery, and provider-specific configuration.
- Do not copy secrets, `.env` files, unrelated Aspiron changes, or uncommitted generated artifacts.

## Acceptance Criteria

- `@monorepo-template/auth` exposes server, web, and Expo entry points without OAuth or SES dependencies.
- Better Auth uses the PostgreSQL Drizzle adapter, the `auth` schema, email/password, and the configured trusted origins.
- Auth tables and a generated migration are available through `@monorepo-template/db` production exports.
- Auth secrets are validated only through `@monorepo-template/env/server`.
- The real server forwards `/api/auth/*` through `src/http/auth/` and obtains its handler from `src/infra/auth/`.
- `apps/server/AGENTS.md` and `packages/db/AGENTS.md` document the intentional production-auth structure.
- Optional OAuth providers and email delivery are absent from the initial implementation and dependency graph.

## Test Cases

### TEST-AUTH-001: Auth package boundary

- **Small task:** Expose the minimal auth package without deferred integrations.
- **Source:** User scope and the Aspiron auth package.
- **Test place:** `packages/auth/test/package-boundary.test.mjs`.
- **Starting state:** No auth package exists in the target workspace.
- **Exact input or fixture:** Import `@monorepo-template/auth`, `/server`, `/web`, and `/expo`; inspect package dependencies and built exports.
- **Interaction steps:** Build the package, import each public entry point, and scan dependencies for SES/OAuth modules.
- **Main behavior:** The package exposes the intended auth factories and excludes deferred integrations.
- **Expected result:** Public imports resolve; server factory and `toNodeHandler` are available; SES and OAuth dependencies are absent.
- **Must change:** Package source, exports, dependencies, and focused tests.
- **Must not happen:** No `@aws-sdk/client-ses`, social-provider configuration, or email sender is bundled.
- **Planned command:** `pnpm --filter @monorepo-template/auth test`
- **Expected result before the code change:** The package and test command are absent.
- **First observed run:** `pnpm --filter @monorepo-template/auth test` reported no matching project because `packages/auth` does not exist.
- **Passing rerun:** `pnpm --filter @monorepo-template/auth test` passed both package-boundary and server-factory tests.

### TEST-AUTH-002: Auth environment validation

- **Small task:** Validate Better Auth URL, secret, and trusted origins.
- **Source:** `packages/env` rules and the Aspiron auth environment contract.
- **Test place:** `packages/env/test/auth-env.test.mjs`.
- **Starting state:** `serverEnvSchema` has no Better Auth fields.
- **Exact input or fixture:** Valid URL `http://localhost:3000`, 32-character secret, comma-delimited origins; missing and short-secret variants.
- **Interaction steps:** Parse valid input, parse missing fields, and parse a secret shorter than 32 characters.
- **Main behavior:** Auth configuration is accepted only when required values meet their boundary rules.
- **Expected result:** Valid configuration parses; missing or short secret is rejected; no client environment exposes the secret.
- **Must change:** Global and server env schemas plus focused tests.
- **Must not happen:** Apps or packages must not read `process.env` directly.
- **Planned command:** `pnpm --filter @monorepo-template/env test`
- **Expected result before the code change:** Auth fields are not part of the server schema.
- **First observed run:** `pnpm --filter @monorepo-template/env test` produced no test script output; the package has no auth test or test script yet.
- **Passing rerun:** `pnpm --filter @monorepo-template/env lint && pnpm --filter @monorepo-template/env typecheck && pnpm --filter @monorepo-template/env test` passed lint, typecheck, and both auth environment tests.

### TEST-AUTH-003: Auth schema and migration

- **Small task:** Persist Better Auth users, sessions, accounts, and verification records in PostgreSQL.
- **Source:** Better Auth Drizzle adapter requirements and Aspiron `auth-schema.ts`.
- **Test place:** `packages/db/test/auth-migration.test.mjs`.
- **Starting state:** Production DB exports contain only connection helpers and example SQLite schema.
- **Exact input or fixture:** Auth schema tables `user`, `session`, `account`, and `verification` in PostgreSQL schema `auth`.
- **Interaction steps:** Build DB exports, inspect generated migration SQL, and assert required tables, indexes, foreign keys, and schema namespace.
- **Main behavior:** The production auth schema is available and migration-complete.
- **Expected result:** All four tables and required uniqueness/cascade relationships are represented in the migration and exports.
- **Must change:** DB schema, exports, Drizzle config, migration, package metadata, and focused tests.
- **Must not happen:** Existing example SQLite exports or schema behavior must not change.
- **Planned command:** `pnpm --filter @monorepo-template/db test`
- **Expected result before the code change:** No production auth schema or migration exists.
- **First observed run:** `pnpm --filter @monorepo-template/db test` produced no test script output; the package has no auth migration test or test script yet.
- **Passing rerun:** `pnpm --filter @monorepo-template/db lint && pnpm --filter @monorepo-template/db typecheck && pnpm --filter @monorepo-template/db test` passed lint, typecheck, build, and the auth migration test.

### TEST-AUTH-004: Email/password auth factory

- **Small task:** Construct Better Auth with PostgreSQL and email/password settings.
- **Source:** User scope and Better Auth server factory behavior.
- **Test place:** `packages/auth/test/server-factory.test.mjs`.
- **Starting state:** No Better Auth server factory exists.
- **Exact input or fixture:** Synthetic Drizzle database object, valid auth URL, 32-character secret, and trusted origins.
- **Interaction steps:** Create the auth server and inspect its configured base path and enabled email/password behavior without contacting a database or external service.
- **Main behavior:** The factory creates a PostgreSQL-backed Better Auth instance.
- **Expected result:** Base path is `/api/auth`; email/password is enabled; no social providers, email sender, SES, or external network calls are configured.
- **Must change:** Auth server factory and focused tests.
- **Must not happen:** Tests must not contact PostgreSQL, SES, OAuth providers, or any uncontrolled external service.
- **Planned command:** `pnpm --filter @monorepo-template/auth test -- server-factory`
- **Expected result before the code change:** The factory and test are absent.
- **First observed run:** `pnpm --filter server test:unit -- auth.controller.spec.ts` passed the existing 2 test files and 3 tests, but no auth controller test was selected because it did not exist.
- **Passing rerun:** `pnpm --filter server test:unit` passed 3 test files and 4 tests, including the nested auth controller test.

### TEST-AUTH-005: Nest auth transport

- **Small task:** Forward auth HTTP requests through nested Nest transport and infrastructure boundaries.
- **Source:** Domain-driven app structure skill and Aspiron controller behavior.
- **Test place:** `apps/server/src/http/auth/auth.controller.spec.ts`.
- **Starting state:** Real server exposes only health and has no auth module.
- **Exact input or fixture:** Synthetic Node handler, `GET /api/auth/get-session`, request/response objects, and handler token.
- **Interaction steps:** Instantiate the controller with the synthetic handler and invoke the wildcard route.
- **Main behavior:** The controller delegates unchanged request and response objects to the Better Auth handler.
- **Expected result:** Handler is called once with the original request and response; controller contains no database or Better Auth construction.
- **Must change:** Nested controller, module, provider, token, app module import, and focused test.
- **Must not happen:** Auth files must not remain at `apps/server/src/auth.*` or construct infrastructure in the controller/module.
- **Planned command:** `pnpm --filter server test:unit -- auth.controller.spec.ts`
- **Expected result before the code change:** The nested auth files and test are absent.
- **First observed run:** `pnpm --filter server test:unit -- auth.controller.spec.ts` passed the existing 2 test files and 3 tests, but no auth controller test was selected because it did not exist.
- **Passing rerun:** `pnpm --filter server test:unit` passed 3 test files and 4 tests, including the nested auth controller test.

### TEST-AUTH-006: Server boundary and behavior

- **Small task:** Verify the real Nest server exposes health and auth routes without changing the reference server.
- **Source:** Existing server E2E/smoke boundaries and user request.
- **Test place:** `apps/server/test/app.e2e-spec.ts` and `apps/server/test/server-smoke.test.mjs`.
- **Starting state:** Real server has health only; reference server owns example auth routes.
- **Exact input or fixture:** Local synthetic environment with valid auth URL and secret; unauthenticated session request.
- **Interaction steps:** Boot the real server harness, request `/health`, request `/api/auth/get-session`, and confirm the reference app remains unchanged.
- **Main behavior:** Auth is mounted at the real server boundary and unauthenticated access is handled safely.
- **Expected result:** Health succeeds; auth session lookup returns Better Auth's unauthenticated result; no secret is logged or returned.
- **Must change:** Real-server integration tests only where required.
- **Must not happen:** Tests must not require live OAuth, SES, or non-local services.
- **Planned command:** `pnpm --filter server test:api:e2e && pnpm --filter server build && pnpm --filter server test:api:smoke`
- **Expected result before the code change:** `/api/auth/get-session` is unavailable on the real server.
- **First observed run:** The real-server auth E2E and smoke commands were not run before implementation because the real auth module and route did not exist. The separate pre-change DB baseline failure is recorded under TEST-AUTH-003.
- **Passing rerun:** `pnpm --filter server test:api:e2e && pnpm --filter server build && pnpm --filter server test:api:smoke` passed the health and mounted-auth E2E cases, server build, and both smoke tests.

### TEST-AUTH-007: Architecture documentation and path validation

- **Small task:** Prevent future flat auth server layout regressions.
- **Source:** `domain-driven-app-structure` skill and updated app guidance.
- **Test place:** Exact path/text scans and server guidance.
- **Starting state:** `apps/server/AGENTS.md` documents only a health-only real server and no production auth boundary.
- **Exact input or fixture:** Required paths `src/http/auth`, `src/infra/auth`, and forbidden root `src/auth.controller.ts`.
- **Interaction steps:** Scan guidance and source paths after implementation.
- **Main behavior:** The documented and actual layout agree.
- **Expected result:** Nested transport/infrastructure paths are documented and present; root auth files and stale health-only claims are absent.
- **Must change:** Guidance and exact structural validation.
- **Must not happen:** Empty application/domain auth folders must not be invented without server-owned rules.
- **Planned command:** `rg -n "src/http/auth|src/infra/auth|health-only|src/auth\.controller" apps/server/AGENTS.md apps/server/src docs/checklists/2026-08-25-postgres-better-auth-email-password.md`
- **Expected result before the code change:** Required nested paths are absent and the guidance is stale.
- **First observed run:** The exact pre-change scan found only checklist references; the app guidance still described a health-only server and nested paths were absent.
- **Passing rerun:** `rg -n "src/http/auth|src/infra/auth|health-only|src/auth\.controller" apps/server/AGENTS.md apps/server/src` found the documented nested boundaries and no stale or forbidden root path.

## Implementation Plan

- [x] Scaffold `packages/auth` with the workspace package pattern and public entry points.
  - [x] Implement the Better Auth server factory with only PostgreSQL and email/password.
  - [x] Preserve web and Expo client factories without social or email integrations.
  - [x] Add package boundary and factory tests.
- [x] Add production PostgreSQL auth persistence.
  - [x] Add `packages/db/src/auth-schema.ts` and a production subpath export.
  - [x] Add auth Drizzle configuration and generated migration.
  - [x] Keep example SQLite schema and exports unchanged.
- [x] Add shared auth environment validation; shared auth contracts are not required because Better Auth owns the native request boundary.
  - [x] Add URL, secret, and trusted-origin fields through `globalEnv.pick`.
  - [x] Add focused accepted/rejected env tests.
- [x] Add nested Nest server integration.
  - [x] Add `src/http/auth/auth.controller.ts`, `auth.module.ts`, and colocated controller test.
  - [x] Add `src/infra/auth/auth-handler.provider.ts` and `auth.constants.ts`.
  - [x] Import the module from `src/app.module.ts`.
- [x] Update guidance and verify all package/server boundaries.
  - [x] Update `apps/server/AGENTS.md` and `packages/db/AGENTS.md`.
  - [x] Run focused tests before broad checks, record failures, and rerun after fixes.

## Risks

- Better Auth is ESM-built while the Nest server uses a CommonJS runtime; build and smoke tests must verify interop.
- The existing DB package deliberately keeps production `src/` connection-only; this task intentionally introduces the documented auth-schema exception.
- Auth database migration generation may require the installed Drizzle CLI and local PostgreSQL-independent SQL generation.
- Better Auth's native handler must remain the only request parser for `/api/auth/*`; duplicating DTO validation could break compatibility.

## Implementation Description

Port the Aspiron Better Auth foundation into this template as a minimal PostgreSQL email/password package, with nested Nest transport and infrastructure boundaries, production auth schema/migration, shared server environment validation, and deterministic focused tests. OAuth providers, SES, email delivery, and related environment variables are intentionally deferred.

## Validation Notes

- The initial formatting command failed only because it included extensionless `.env.example` and `.gitignore` files; the supported-file formatting check passed after narrowing the command.
- The first database migration test exposed that Drizzle did not create the PostgreSQL `auth` schema; the committed migration now creates it explicitly and the rerun passes.
- The first lint run exposed a regex escape warning in the migration test and unsafe inferred types in the E2E mock; both were corrected and the affected lint/typecheck checks pass.
- `pnpm build` passed all 11 Turbo build tasks.
