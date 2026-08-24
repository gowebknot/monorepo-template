# Root Postgres And pgAdmin Script

Checklist ID: CHECKLIST-ROOT-POSTGRES-PGADMIN-SCRIPT-001

## Scope

- [x] Add root `db:up` and `db:down` package scripts for only the `postgres` and `pgadmin` Compose services.
- [x] Preserve the scripts in generated projects and verify Compose configuration.

## Exact Validation Cases

### TEST-DB-001: Root script targets Postgres and pgAdmin only

- Small task: Add the root database startup script.
- Source: User request for a root script to start Postgres and pgAdmin.
- Test place: `core/create-mono-stack/test/copier-template.test.js` and root `package.json`.
- Starting state: Root package has no database startup script.
- Exact input or fixture: `package.json` script `db:up`.
- Interaction steps: Read the script and assert its exact Compose service arguments.
- Main behavior: The command starts only the requested services.
- Expected result: `db:up` equals `docker compose up -d postgres pgadmin` and `db:down` equals `docker compose stop postgres pgadmin`.
- Must change: Root package scripts and generated package adapter expectations.
- Must not happen: Redis, OpenPanel, QEMU, or all services must not be started by this script.
- Planned command: `pnpm --filter create-mono-stack test -- --test-name-pattern='TEST-DB-001'`.
- Expected result before the code change: Fails because `db:up` is absent.
- First observed run: The existing suite passed before the new assertion existed; no database-script assertion was present.
- Passing rerun: `node --test test/copier-template.test.js --test-name-pattern='TEST-DB-001'` passed `22/22` selected tests.

### TEST-DB-002: Compose remains valid

- Small task: Verify the root script's target services exist in Compose.
- Source: `compose.yaml` service definitions and root script.
- Test place: Docker Compose parser/configuration validation.
- Starting state: Compose defines `postgres` and `pgadmin` services.
- Exact input or fixture: `.env.example` and `compose.yaml`.
- Interaction steps: Render Compose configuration with safe example environment values.
- Main behavior: The referenced services can be resolved by Docker Compose.
- Expected result: `docker compose --env-file .env.example config` exits successfully.
- Must change: No Compose service changes required.
- Must not happen: The script must not reference a nonexistent service.
- Planned command: `docker compose --env-file .env.example config`.
- Expected result before the code change: Existing Compose config passes independently.
- First observed run: Existing Compose configuration rendered successfully.
- Passing rerun: `docker compose --env-file .env.example config` rendered successfully with both `postgres` and `pgadmin` services.

## Implementation Plan

- [x] Add `db:up` and `db:down` to root `package.json`.
- [x] Add the exact script assertion to the template test.
- [x] Run focused tests, Compose config, formatting, and whitespace validation.

## Verification Commands

- `pnpm --filter create-mono-stack test -- --test-name-pattern='TEST-DB-001'`
- `docker compose --env-file .env.example config`
- `pnpm format:check`
- `git diff --check`

## Validation Notes

- `pnpm exec prettier --check package.json core/create-mono-stack/test/copier-template.test.js docs/checklists/2026-08-24-root-postgres-pgadmin-script.md` initially failed because the test file needed formatting; rerunning after Prettier passed.
- `git diff --check` passed.
- The first full `pnpm --filter create-mono-stack test` run had one unrelated flaky Ink timeout in `selects additional stack features through the multiselect screen`; the new `TEST-DB-001` assertion passed.
- A second full suite run had a different unrelated Ink timeout in `TEST-WIZARD-008`; the focused template test, Compose validation, formatting, and whitespace checks remain passing.
