# @monorepo-template/db

Shared Drizzle database connection helpers.

## Usage

```ts
import { createDb, getDatabaseUrl } from "@monorepo-template/db";
```

`src/` stays connection-only in this template. Driver-specific examples and schema tables live under `example/`.

## Example database migrations

`example/migrate.ts` exports `migrateExampleDb`, which applies the generated SQLite migrations in
`example/migrations/` through Drizzle's `better-sqlite3` migrator. The reference server
(`apps/server/reference/database/database.module.ts`) calls it on startup instead of executing
handwritten SQL through the driver.

- **Fresh database:** creates every table from the migrations.
- **Already-migrated database:** re-running is a no-op; existing rows are preserved.
- **Existing unmanaged database** (tables created outside this migration history, e.g. via
  `drizzle-kit push`): the migration fails with an actionable error and does not delete or alter
  existing data. Point such a database at a fresh path, or plan an explicit baseline, before
  migrating it.

## Development

```sh
pnpm --filter @monorepo-template/db build
pnpm --filter @monorepo-template/db typecheck
pnpm --filter @monorepo-template/db lint
pnpm --filter @monorepo-template/db db:generate
```
