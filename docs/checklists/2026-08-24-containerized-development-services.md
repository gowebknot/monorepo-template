# Containerized Development Services

Checklist ID: CHECKLIST-CONTAINERIZED-DEVELOPMENT-SERVICES-001

## Scope

- [x] Provide a generated-project Docker Compose stack without a project Dockerfile.
  - [x] Keep Postgres and Redis available to generated applications through container-network URLs.
  - [x] Keep the SQLite reference database under `packages/db/example/` unchanged.
  - [x] Add pgAdmin, QEMU, OpenDesign, Act, and OpenPanel services.
  - [x] Add OpenPanel's ClickHouse and Redpanda dependencies with named volumes.
- [x] Wire safe environment defaults and document required Docker host integrations.
  - [x] Keep credentials in ignored `.env` and provide only safe placeholders in `.env.example`.
  - [x] Use separate application and OpenPanel database/Redis namespaces.
  - [x] Document Docker socket access for Act and Linux KVM requirements for QEMU.

## Acceptance Criteria

- Generated projects contain `compose.yaml` and no generated Dockerfile from this change.
- Compose declares Postgres, Redis, pgAdmin, Act, QEMU, OpenDesign, OpenPanel, ClickHouse, and Redpanda services.
- Generated `DATABASE_URL` uses Postgres and generated `REDIS_URL` uses Redis.
- Reference SQLite schemas, CRUD helpers, and SQLite Drizzle configuration remain unchanged.
- Persistent service data uses named Docker volumes, not repository bind-mounted data directories.
- Compose configuration is valid when evaluated with safe example environment values.
- Existing Copier generation and update behavior continues to preserve `.env`.

## Exact Validation Cases

### TEST-DOCKER-001: Compose declares the complete service set

- Small task: Add the containerized service definitions.
- Source: User request and official QEMU, OpenDesign, and OpenPanel deployment definitions.
- Test place: `core/create-mono-stack/test/copier-template.test.js`.
- Starting state: Source template has no Compose file.
- Exact input or fixture: Parse `compose.yaml` with the repository YAML parser.
- Interaction steps: Read the Compose file and inspect its service keys.
- Main behavior: The generated infrastructure includes every requested service and OpenPanel dependency.
- Expected result: Services include `postgres`, `redis`, `pgadmin`, `act`, `qemu`, `open-design`, `op-db`, `op-kv`, `op-ch`, `op-rp`, `op-rp-console`, `op-api`, `op-dashboard`, and `op-worker`.
- Must change: Add Compose service definitions and named volumes.
- Must not happen: No host data-directory bind mounts or project Dockerfile requirement.
- Planned command: `pnpm --filter create-mono-stack test -- --test-name-pattern='Compose declares'`.
- Expected result before the code change: Fails because `compose.yaml` does not exist.
- First observed run: Failed because YAML parses empty named-volume declarations as `null`, while the initial assertion required a truthy value.
- Passing rerun: `pnpm --filter create-mono-stack test -- --test-name-pattern='TEST-DOCKER|TEST-ENV-001|project identity adapters'` passed all 266 tests after checking volume keys instead of truthiness and pinning Act installation to `v0.2.89`.

### TEST-ENV-006: Generated environment uses containerized Postgres and Redis

- Small task: Wire generated application environment values.
- Source: User requirement that generated projects use Postgres and Docker for dependencies.
- Test place: `core/create-mono-stack/test/copier-template.test.js` and generated integration assertions.
- Starting state: `.env.example` uses `DATABASE_URL=./local.db` and has no Redis URL.
- Exact input or fixture: Read `.env.example` and generated `.env.example`.
- Interaction steps: Assert the database and Redis URLs and required service credentials are present.
- Main behavior: Generated apps connect to Compose service names while host tools use published ports.
- Expected result: `DATABASE_URL` is PostgreSQL, `REDIS_URL` references Redis, and OpenPanel has separate connection variables.
- Must change: Update global env schema defaults and `.env.example`.
- Must not happen: Reference SQLite code must not be changed to use Postgres.
- Planned command: `pnpm --filter create-mono-stack test -- --test-name-pattern='environment'`.
- Expected result before the code change: Fails because the current default is SQLite and Redis is absent.
- First observed run: Focused environment test passed after the Postgres and Redis defaults were added.
- Passing rerun: Included in the 266-test focused launcher run; passed.

### TEST-DOCKER-002: Compose security-sensitive integrations are explicit

- Small task: Configure Act and QEMU host integrations.
- Source: Official `nektos/act` Docker API behavior and `qemus/qemu` Compose definition.
- Test place: `core/create-mono-stack/test/copier-template.test.js`.
- Starting state: No service has Docker socket or KVM device configuration.
- Exact input or fixture: Parse the Act and QEMU service definitions.
- Interaction steps: Inspect mounts, devices, capabilities, and privileged settings.
- Main behavior: Required integrations are available without making unrelated services privileged.
- Expected result: Act mounts the Docker socket and project workspace; QEMU declares `/dev/kvm`, `/dev/net/tun`, and `NET_ADMIN`; no global privileged mode is added.
- Must change: Add only the documented integrations.
- Must not happen: Credentials must not be mounted or logged; all services must not receive the Docker socket.
- Planned command: `pnpm --filter create-mono-stack test -- --test-name-pattern='security-sensitive'`.
- Expected result before the code change: Fails because the services do not exist.
- First observed run: Focused security configuration test passed after the Act socket and QEMU device declarations were added.
- Passing rerun: Included in the 266-test focused launcher run; passed.

### TEST-GENERATION-001: Copier generation and update preserve infrastructure and user env

- Small task: Ensure generated projects receive the Compose configuration.
- Source: Existing Copier integration contract.
- Test place: `core/create-mono-stack/test/copier-template.integration.test.js`.
- Starting state: Generated project has no Compose file and uses the source `.env.example`.
- Exact input or fixture: Generate `Acme Platform`, copy `.env.example` to `.env`, add `CONSUMER_ENV_MARKER=preserve-me`, then run Copier update.
- Interaction steps: Generate, inspect files, modify `.env`, update, and inspect again.
- Main behavior: Compose is generated and user environment changes survive template updates.
- Expected result: `compose.yaml` exists after generation and `.env` retains the consumer marker after update.
- Must change: Extend generated-project assertions.
- Must not happen: Copier must not include `core/`, secrets, or a generated `.env` commit.
- Planned command: `pnpm --filter create-mono-stack test:integration`.
- Expected result before the code change: Existing integration passes but has no Compose assertions.
- First observed run: Initially blocked because the configured Colima Docker socket was unavailable at `/Users/mr_adventurous/.colima/default/docker.sock`. After Colima was started, the test reached validation but Copier rejected the template's `tasks` feature as untrusted before generation.
- Passing rerun: The invalid-input invocation passed after adding `--trust`, then generation reached the native-profile assertion and exposed a stale expected server test script (`vitest run` versus the current `pnpm test:unit && pnpm test:api:e2e`).

## Implementation Plan

- [x] Add `compose.yaml` with pinned service image families, health checks, named volumes, internal URLs, and localhost-only published ports where applicable.
  - [x] Add generated app `postgres` and `redis` services.
  - [x] Add pgAdmin using the application Postgres service.
  - [x] Add QEMU using `qemux/qemu`, KVM devices, `NET_ADMIN`, and named storage.
  - [x] Add OpenDesign using `ghcr.io/nexu-io/od:latest`, token configuration, health check, and named storage.
  - [x] Add Act as a Docker-API client with workspace and socket access, installing the pinned release inside a Go container because Act does not publish an official runtime image.
  - [x] Add OpenPanel API, dashboard, worker, Postgres, Redis, ClickHouse, and Redpanda services.
- [x] Update `packages/env/src/global-env.ts` with Postgres, Redis, pgAdmin, OpenDesign, OpenPanel, and service port variables using safe defaults.
- [x] Update `.env.example` and generated environment adapter expectations without adding secrets.
- [x] Add production Postgres connection support to `packages/db/src/` while leaving `packages/db/example/` SQLite-only.
- [x] Update package dependencies, Vite externals, and database package guidance for the production Postgres helper.
- [x] Update README documentation for `docker compose up -d`, service URLs, volumes, credentials, Docker socket access, and Linux/KVM limitations.
- [/] Extend focused and Copier integration tests with the cases above. Copier integration is blocked by the unavailable local Docker daemon.

## Risks and Non-Goals

- Act requires Docker API access; this is an intentional privileged boundary and must remain limited to the Act service.
- QEMU requires a Linux host with KVM support; Docker Desktop may not expose the required devices.
- OpenPanel is a multi-service deployment, not a single container; its database and analytics dependencies are isolated from the generated app's logical database and Redis namespace.
- The generated web/API applications are not Dockerized in this change because the user explicitly deferred the Dockerfile.
- Live third-party image pulls are not part of ordinary unit tests; Compose runtime validation is an explicit local integration check.

## Verification Commands

- `pnpm --filter create-mono-stack test`
- `pnpm --filter create-mono-stack lint`
- `pnpm --filter create-mono-stack test:integration`
- `pnpm --filter @monorepo-template/env build`
- `pnpm --filter @monorepo-template/env typecheck`
- `pnpm --filter @monorepo-template/db build`
- `pnpm --filter @monorepo-template/db typecheck`
- `pnpm format:check`
- `docker compose --env-file .env.example config`

## Validation Notes

- `pnpm format:check` initially failed because `pnpm-lock.yaml` needed formatting after adding the Postgres driver dependency; after formatting, the command passed.
- `pnpm --filter create-mono-stack test:integration` first failed before generation when the Docker socket was unavailable, then failed during invalid-input validation because Copier required `--trust` for the template's `tasks` feature. After that was corrected, it reached generated native-profile assertions and found stale server script expectations; those were aligned with the current source. The suite now reaches the build phase but the updated generated server still lacks `test:unit` after Copier update, so the unrelated template-update synchronization issue remains. `docker compose --env-file .env.example config` passes.
- `pnpm --filter create-mono-stack test` passed 264 of 266 tests in one run; two unrelated Ink timing tests failed, and a focused rerun passed those two but exposed one additional intermittent Ink timing failure. The package lint and format checks pass.
