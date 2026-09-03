# Production Swagger Contract and Commit Guard

Related checklists:

- [PostgreSQL Better Auth Email/Password](./2026-08-25-postgres-better-auth-email-password.md)
- [Propagate Auth Generated Server Contract](./2026-08-25-propagate-auth-generated-server-contract.md)

## Change Tier

Tier: standard

## Implementation Contract

### Feature Boundaries

- Add OpenAPI 3.0 and Swagger UI only to the production Nest server at `/api/docs`, with the generated JSON at `/api/docs-json`.
- Make `GET /health` return and document the entity-owned `{ status: "ok" }` response through a Nest transport DTO that derives its runtime shape from `healthResponseSchema`.
- Describe the Better Auth wildcard boundary in Swagger with its canonical external documentation link; do not recreate Better Auth request DTOs or endpoint schemas.
- Log the resolved local Swagger UI URL after the server starts.
- Reject commits when a production controller route lacks the repository Swagger convention; keep reference/demo controllers outside this first production-only scope.

### Route-Group Ownership

| Route group   | Owner                                               | Documentation rule                                                                                                               |
| ------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `/health`     | Server controller and `@monorepo-template/entities` | Entity schema is authoritative; response DTO is a transport adapter with operation, response, example, and description metadata. |
| `/api/auth/*` | Better Auth native handler                          | Swagger describes the delegated boundary and links to Better Auth documentation; no duplicate request DTOs.                      |
| `/api/docs`   | Bootstrap configuration                             | Swagger UI is public server metadata, not an application controller.                                                             |

### User Journey

1. A developer starts the server and sees the exact Swagger UI URL in the Nest bootstrap logs.
2. They open `/api/docs` and inspect a named health operation, its detailed response description, and an `ok` response example.
3. They can see that `/api/auth/*` is delegated to Better Auth and follow the linked canonical documentation.
4. A contributor adds a new decorated production controller route; a commit fails until the route has the required Swagger operation and response documentation.

### Complete Test Matrix

| ID               | Path      | Situation                                                     | Input/fixture                                                                | Expected result                                                                                                                  | Command                                                     |
| ---------------- | --------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| TEST-SWAGGER-001 | happy     | Swagger JSON is exposed                                       | Boot production app with mocked auth handler                                 | `/api/docs-json` is OpenAPI 3.0 and contains the health operation, entity-derived response schema, description, and `ok` example | `pnpm --filter server test:api:e2e`                         |
| TEST-SWAGGER-002 | happy     | Swagger URL is stable and logged                              | Port `4310`                                                                  | Helper resolves `http://localhost:4310/api/docs`; bootstrap calls Nest logger with that value                                    | `pnpm --filter server test:unit`                            |
| TEST-SWAGGER-003 | non-happy | Undocumented server route is rejected                         | Temporary controller with `@Get()` and no Swagger decorators                 | Documentation checker exits nonzero and names the route                                                                          | `node --test scripts/swagger-documentation-check.test.mjs`  |
| TEST-SWAGGER-004 | happy     | Fully documented route is accepted                            | Temporary controller with HTTP, `ApiOperation`, and `ApiResponse` decorators | Documentation checker exits zero                                                                                                 | `node --test scripts/swagger-documentation-check.test.mjs`  |
| TEST-SWAGGER-005 | non-happy | Auth boundary cannot silently omit its external documentation | Production auth controller source                                            | Checker rejects a wildcard handler without the required operation and response documentation                                     | `node --test scripts/swagger-documentation-check.test.mjs`  |
| TEST-SWAGGER-006 | happy     | Commit pipeline runs the convention checker                   | `selectChecks` with server present                                           | Pre-commit checks include the Swagger checker before build/test success                                                          | `node --test scripts/pre-commit-checks.test.mjs`            |
| TEST-SWAGGER-007 | happy     | Generated Nest template remains aligned                       | Canonical and managed server Swagger files and dependencies                  | Template contract test confirms Swagger bootstrap, DTO, package dependencies, and guard behavior exist in both profiles          | `pnpm --filter create-mono-stack test -- template-contract` |

### Unresolved Conflicts

Resolved: the user selected production-only documentation and Better Auth link-out. The winning decision is to document the native auth delegation boundary without duplicating Better Auth-owned DTOs.

## Acceptance Criteria

- Swagger UI and OpenAPI JSON are available for the production API, with detailed health response documentation sourced from the entities contract and a proper transport DTO.
- Startup logs show the exact Swagger UI URL.
- The staged commit workflow mechanically rejects undocumented production controller routes and has focused automated coverage.
- The managed Nest template carries the same server capability.

## Exact Test Cases

### TEST-SWAGGER-001

- **Small task:** Publish a detailed OpenAPI health operation.
- **Source:** User request; `healthResponseSchema` is the shared contract.
- **Test place:** `apps/server/test/app.e2e-spec.ts`.
- **Starting state:** Production app has no Swagger endpoints and health returns a plain greeting.
- **Exact input or fixture:** Nest test app with the Better Auth provider mocked; `GET /api/docs-json`.
- **Interaction steps:** Configure Swagger before app initialization, initialize the app, request its OpenAPI JSON, and inspect `/health`.
- **Main behavior:** Swagger exposes an accurate health operation.
- **Expected result:** OpenAPI version begins `3.0`; health is tagged, summarized, has a 200 response whose object property `status` is `ok`, and includes the documented example.
- **Must change:** OpenAPI bootstrap, health controller/service, entity schema metadata, and DTO.
- **Must not happen:** Swagger must not advertise the obsolete string health response.
- **Planned command:** `pnpm --filter server test:api:e2e`.
- **Expected result before the code change:** Fails because `/api/docs-json` is absent and health returns `Hello World!`.
- **First observed run:** `pnpm --filter server test:unit` failed because the existing health unit assertion still expected `Hello World!` rather than the entity response.
- **Passing rerun:** `pnpm --filter server test:unit` passed 4 files and 5 tests after the health assertion was aligned.

### TEST-SWAGGER-002

- **Small task:** Produce and log the stable Swagger URL.
- **Source:** User request.
- **Test place:** New focused unit test beside Swagger bootstrap helpers.
- **Starting state:** Bootstrap does not configure Swagger or log its URL.
- **Exact input or fixture:** Port `4310` and `api/docs` route.
- **Interaction steps:** Invoke the pure URL helper and the bootstrap configuration with a mocked Nest logger.
- **Main behavior:** Startup reporting is predictable.
- **Expected result:** URL is `http://localhost:4310/api/docs` and the logger receives it after `app.listen`.
- **Must change:** Bootstrap and Swagger helper.
- **Must not happen:** Do not log a hard-coded port or read environment variables directly.
- **Planned command:** `pnpm --filter server test:unit`.
- **Expected result before the code change:** Fails because the helper and log call do not exist.
- **First observed run:** The sandboxed run could not bind the existing in-process HTTP listener. Its approved rerun reached Swagger and failed because the E2E file did not import Vitest's `expect` assertion.
- **Passing rerun:** `pnpm --filter server test:api:e2e` passed all 3 tests; `pnpm --filter server test:api:smoke` also passed and verified the startup log URL.

### TEST-SWAGGER-003

- **Small task:** Reject an undocumented HTTP route.
- **Source:** User request for commit-time mechanical enforcement.
- **Test place:** `scripts/swagger-documentation-check.test.mjs`.
- **Starting state:** No Swagger convention checker exists.
- **Exact input or fixture:** Temporary `example.controller.ts` containing `@Controller()` and `@Get()` only.
- **Interaction steps:** Run the checker against the fixture directory.
- **Main behavior:** Missing operation and response metadata is a hard failure.
- **Expected result:** Nonzero result identifies the controller method and missing decorator categories.
- **Must change:** Checker and pre-commit integration.
- **Must not happen:** A new route must not pass due to file name, controller tag, or a comment alone.
- **Planned command:** `node --test scripts/swagger-documentation-check.test.mjs`.
- **Expected result before the code change:** Fails because the checker test/module does not exist.
- **First observed run:** `node --test scripts/swagger-documentation-check.test.mjs scripts/pre-commit-checks.test.mjs` failed with `ERR_MODULE_NOT_FOUND` for `scripts/swagger-documentation-check.mjs`.
- **Passing rerun:** `node --test scripts/swagger-documentation-check.test.mjs scripts/pre-commit-checks.test.mjs` passed the rejected-route test.

### TEST-SWAGGER-004

- **Small task:** Accept a documented HTTP route.
- **Source:** User request for a usable convention.
- **Test place:** `scripts/swagger-documentation-check.test.mjs`.
- **Starting state:** No checker exists.
- **Exact input or fixture:** Temporary controller method with `@Get`, `@ApiOperation`, and `@ApiResponse`.
- **Interaction steps:** Run the checker against the fixture directory.
- **Main behavior:** Valid documentation is not falsely rejected.
- **Expected result:** Zero result.
- **Must change:** Checker parsing rules.
- **Must not happen:** Decorator order and aliases supported by the repository must not create false failures.
- **Planned command:** `node --test scripts/swagger-documentation-check.test.mjs`.
- **Expected result before the code change:** Fails because the checker test/module does not exist.
- **First observed run:** `node --test scripts/swagger-documentation-check.test.mjs scripts/pre-commit-checks.test.mjs` failed because the checker module is absent.
- **Passing rerun:** `node --test scripts/swagger-documentation-check.test.mjs scripts/pre-commit-checks.test.mjs` passed the documented-route test.

### TEST-SWAGGER-005

- **Small task:** Keep the Better Auth delegation boundary visible.
- **Source:** User-selected link-out policy and prior Better Auth checklist.
- **Test place:** `scripts/swagger-documentation-check.test.mjs`.
- **Starting state:** Auth handler has no Swagger operation or response metadata.
- **Exact input or fixture:** Current `apps/server/src/http/auth/auth.controller.ts`.
- **Interaction steps:** Run the checker on production controllers.
- **Main behavior:** A wildcard route obeys the same documentation convention.
- **Expected result:** The current documented handler passes; a fixture missing operation/response metadata fails.
- **Must change:** Auth controller documentation only.
- **Must not happen:** Better Auth request parsing or handler delegation must not change.
- **Planned command:** `node --test scripts/swagger-documentation-check.test.mjs`.
- **Expected result before the code change:** Fails because the handler has no Swagger decorators and the checker does not exist.
- **First observed run:** `node --test scripts/swagger-documentation-check.test.mjs scripts/pre-commit-checks.test.mjs` failed because the checker module is absent; the current auth controller also has no Swagger metadata.
- **Passing rerun:** `node --test scripts/swagger-documentation-check.test.mjs scripts/pre-commit-checks.test.mjs` passed the Better Auth controller regression scan.

### TEST-SWAGGER-006

- **Small task:** Wire the checker into commit-time validation.
- **Source:** User request and `.husky/pre-commit` calling `precommit:checks`.
- **Test place:** New `scripts/pre-commit-checks.test.mjs`.
- **Starting state:** `selectChecks` has no Swagger checker.
- **Exact input or fixture:** `hasServer: true`.
- **Interaction steps:** Inspect selected check commands.
- **Main behavior:** A staged commit runs the checker.
- **Expected result:** The selected checks contain `swagger:check` before server unit tests.
- **Must change:** Root script and pre-commit check selection.
- **Must not happen:** Generated projects without a server must not run a nonexistent server checker.
- **Planned command:** `node --test scripts/pre-commit-checks.test.mjs`.
- **Expected result before the code change:** Fails because no test/exported checker selection exists.
- **First observed run:** `node --test scripts/swagger-documentation-check.test.mjs scripts/pre-commit-checks.test.mjs` failed because `selectChecks({ hasServer: true })` selected server tests where the Swagger checker was expected.
- **Passing rerun:** `node --test scripts/swagger-documentation-check.test.mjs scripts/pre-commit-checks.test.mjs` passed both pre-commit selection cases.

### TEST-SWAGGER-007

- **Small task:** Propagate the server capability to generated projects.
- **Source:** Managed template contract and user request.
- **Test place:** `core/create-mono-stack/test/template-contract.test.js`.
- **Starting state:** Neither server profile has Swagger files or dependencies.
- **Exact input or fixture:** Canonical and managed Nest server trees.
- **Interaction steps:** Inspect required Swagger bootstrap, DTO, dependency, and controller metadata paths in both roots.
- **Main behavior:** Generated profiles cannot drift from the canonical server capability.
- **Expected result:** Both source roots satisfy the same Swagger artifact contract.
- **Must change:** Canonical and managed server files plus template structural test.
- **Must not happen:** The reference CRUD app remains out of scope.
- **Planned command:** `pnpm --filter create-mono-stack test -- template-contract`.
- **Expected result before the code change:** Fails because the expected Swagger artifacts do not exist.
- **First observed run:** The full launcher suite reached the new template test, which passed; five unrelated existing launcher tests failed from port allocation and its prior hook expectation.
- **Passing rerun:** `node --test core/create-mono-stack/test/template-contract.test.js` passed both template contract tests.

## Implementation Plan

- [x] Add the production Swagger capability.
  - [x] Add Nest Swagger dependencies to canonical and managed server manifests.
  - [x] Add a Swagger bootstrap helper that builds an OpenAPI 3.0 document, registers `/api/docs`, and creates the port-aware URL.
  - [x] Configure the helper in each production bootstrap and log the URL only after successful listening.
- [x] Align health transport with its authoritative entity contract.
  - [x] Enrich the health Zod schema with response description/example metadata.
  - [x] Add an entity-derived response DTO for Nest Swagger.
  - [x] Return `{ status: "ok" }` and attach operation, response, and example decorators.
- [x] Document the Better Auth boundary without duplicating its contracts.
  - [x] Tag the wildcard handler and add a detailed operation/response description with canonical Better Auth docs.
  - [x] Preserve request/response pass-through unchanged.
- [x] Add and enforce the Swagger documentation convention.
  - [x] Implement an AST-based checker for production Nest controllers that requires route, operation, and response metadata.
  - [x] Add rejected and accepted fixture coverage, plus a current-controller regression scan.
  - [x] Add the checker to pre-commit checks only when a server package exists.
- [x] Synchronize and verify the managed template.
  - [x] Mirror applicable production-server files and dependencies in the managed Nest template.
  - [x] Extend template contract coverage for Swagger capability artifacts.
  - [x] Record focused failures and passing reruns, then run affected package and workspace validation.

## Risks

- Better Auth owns the concrete endpoint contracts, so the Swagger description must remain a delegation boundary rather than a second incompatible API specification.
- The checker must recognize only standard Nest route decorators and Swagger metadata, avoiding false confidence from comments or controller-level tags alone.
- Canonical and managed server source styles differ; each must retain its local formatting convention.

## Validation Notes

- Commit-hook update: staging the Swagger files exposed pre-existing relative imports in the production and managed server paths. The hook rejected the commit before creating it. The imports now use the existing `@/` aliases; `pnpm imports:check`, the launcher/template tests, and server unit tests pass.
