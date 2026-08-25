# Propagate Auth Generated Server Contract

Related checklist: [PostgreSQL Better Auth Email/Password](./2026-08-25-postgres-better-auth-email-password.md)

## Scope

- Treat Better Auth and nested server structure as an opinionated template capability.
- Synchronize the canonical `apps/server` contract into `core/create-mono-stack/reference-templates/managed/server`.
- Ensure generated `api-nest` apps receive auth dependencies, files, documentation, and tests.
- Add focused source-template checks for nested transport and infrastructure paths and forbidden flat auth files.
- Do not change Copier remote ownership or pretend this checkout can update the upstream Git remote automatically.

## Source Location

This checkout has no concrete `.copier-answers.yml`; it has `.copier-answers.yml.jinja`, so it is the template-source checkout for this task. A generated project using `_src_path: git@github.com:gowebknot/monorepo-template.git` still requires these changes to be committed and published to that upstream template before `template:update` can consume them.

## Acceptance Criteria

- The managed NestJS server documents health plus production Better Auth and the nested server layout.
- The managed server contains `src/http/auth/` transport files and `src/infra/auth/` composition files.
- The managed server imports its auth module from `app.module.ts` and depends on `@monorepo-template/auth`.
- Managed server tests cover auth route mounting and transport delegation.
- Generated-project assertions verify the nested files, auth dependency, and absence of root `src/auth.*` files.
- The source and managed server contracts remain consistent enough for the profile overlay to produce a runnable generated server.

## Test Cases

### TEST-TEMPLATE-001: Managed server contract

- **Small task:** Synchronize the canonical production server contract into the managed Nest profile.
- **Source:** User correction and `domain-driven-app-structure` server layout.
- **Test place:** `core/create-mono-stack/test/copier-template.test.js` and `core/create-mono-stack/test/native-scaffold-overlays.test.js`.
- **Starting state:** Managed server is health-only; its package lacks auth dependency and its source has no nested auth boundaries.
- **Exact input or fixture:** `nestjs/default` managed profile and `api-nest` scaffold fixture.
- **Interaction steps:** Inspect managed package/source/docs, scaffold a Nest app fixture, and assert the overlay output.
- **Main behavior:** The managed profile carries the production auth contract.
- **Expected result:** Auth dependency, nested files, updated AGENTS guidance, and auth test are present; flat root auth files are absent.
- **Must change:** Managed server files and focused overlay assertions.
- **Must not happen:** Reference auth files must not be confused with production auth, and no empty application/domain folders should be added.
- **Planned command:** `pnpm --filter create-mono-stack test -- native-scaffold-overlays copier-template`
- **Expected result before the code change:** Managed profile has no auth dependency or nested production auth files, so the new assertions cannot pass.
- **First observed run:** The initial launcher suite failed the existing environment adapter expectations because `.env.example` had already gained the auth variables; the focused structure test was initially absent.
- **Passing rerun:** `pnpm --filter create-mono-stack test` passed all 272 launcher tests, including the managed auth contract and nested-path test.

### TEST-TEMPLATE-002: Generated auth dependency and source paths

- **Small task:** Verify a generated `api-nest` stack receives all auth files and dependencies through profile overlay.
- **Source:** User requirement that generated stacks receive dependencies, files, docs, and tests consistently.
- **Test place:** `core/create-mono-stack/test/copier-template.integration.helpers.js` or a focused generated-project assertion.
- **Starting state:** Generated server package is based on the managed profile and does not list `@acme-platform/auth`.
- **Exact input or fixture:** Generated project scope `@acme-platform`, server package, and `apps/server/src` tree.
- **Interaction steps:** Read generated package JSON and source paths after fixture generation; inspect the generated package scope rendering.
- **Main behavior:** Auth dependency and nested files survive generation and scope rewriting.
- **Expected result:** `@acme-platform/auth` is a workspace dependency; `src/http/auth` and `src/infra/auth` exist; no `src/auth.*` exists.
- **Must change:** Generated-project assertions only.
- **Must not happen:** Assertions must not require contacting the template remote or a live database.
- **Planned command:** `pnpm --filter create-mono-stack test`
- **Expected result before the code change:** Existing generated-project checks do not assert auth propagation.
- **First observed run:** The first generated integration run exposed the expected Turbo graph change (`@acme-platform/auth#build`), then the next run exposed that the managed profile was not copying `test:unit`/`test:api:e2e` scripts. After both fixes, the integration reached generated build and reference validation but failed later in the pre-existing add-app flow because the newly added app retained `@monorepo-template/api-client` instead of the generated `@acme-platform/api-client` scope.
- **Passing rerun:** The initial generated project build, server tests, and reference checks passed before the unrelated add-app scope failure; the complete integration suite remains blocked by that existing scope-rewrite issue.

### TEST-TEMPLATE-003: Source structure regression scan

- **Small task:** Prevent future template edits from recreating flat production auth files.
- **Source:** User correction and server AGENTS contract.
- **Test place:** Focused exact path scan in the template test suite.
- **Starting state:** Canonical and managed server structures can drift independently.
- **Exact input or fixture:** Canonical and managed server source trees; forbidden names `src/auth.controller.ts`, `src/auth.module.ts`, and `src/auth.constants.ts`.
- **Interaction steps:** Scan both trees for required nested paths and forbidden root files.
- **Main behavior:** Flat auth layout is rejected while nested layout is required.
- **Expected result:** Both trees have nested auth transport/infra paths and neither has root auth files.
- **Must change:** Structure assertions.
- **Must not happen:** The scan must not inspect only documentation; it must assert actual filesystem paths.
- **Planned command:** `node --test core/create-mono-stack/test/template-contract.test.js`
- **Expected result before the code change:** The focused test file does not exist and the managed tree lacks required paths.
- **First observed run:** `node --test core/create-mono-stack/test/template-contract.test.js` failed because the new focused test did not exist and the managed tree lacked the nested auth paths.
- **Passing rerun:** The focused structure test passed after synchronization; the full launcher suite also passed it.

## Implementation Plan

- [x] Copy the canonical production auth server contract into the managed Nest profile.
  - [x] Add managed `src/http/auth` transport files and test.
  - [x] Add managed `src/infra/auth` provider and token.
  - [x] Import the auth module from managed `src/app.module.ts`.
  - [x] Add `@monorepo-template/auth` to the managed server dependencies.
  - [x] Update managed `AGENTS.md` with nested structure and Better Auth capability.
- [x] Add generated-project contract assertions.
  - [x] Assert managed overlay files and dependencies.
  - [x] Assert generated scope rewriting produces the project-scoped auth dependency.
  - [x] Assert root flat auth files are absent from canonical and managed trees.
- [/] Run source server and launcher/generated-project checks and record results; the complete integration suite is blocked only in the pre-existing add-app package-scope path.

## Risks

- The managed server uses its own single-quote Prettier style and must not receive source-app formatting verbatim.
- Copier generated projects rename package scopes after copy; assertions must check the generated scope, not the template scope.
- The generated-project test suite may require its existing local fixture/tooling but must not contact the remote template source.
- `pnpm --filter create-mono-stack test:integration` reaches generated build and reference validation, but its later managed add-app step fails because a newly added app retains `@monorepo-template/api-client` rather than the generated project scope. This is outside the auth/server propagation change and remains unmodified.

## Implementation Description

Propagate the opinionated Better Auth and domain-driven Nest server contract from the canonical source app into the managed `api-nest` reference profile, including dependencies, nested transport/infrastructure files, documentation, tests, and structural regression assertions.

## Validation Notes

- First observed results and passing reruns will be recorded after each planned command runs.
- `pnpm --filter create-mono-stack lint` and `pnpm --filter create-mono-stack typecheck` pass.
