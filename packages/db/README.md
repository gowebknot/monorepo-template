# @monorepo-template/db

Shared Drizzle database connection helpers.

## Usage

```ts
import { createDb, getDatabaseUrl } from "@monorepo-template/db";
```

`src/` stays connection-only in this template. Driver-specific examples and schema tables live under `example/`.

## Development

```sh
pnpm --filter @monorepo-template/db build
pnpm --filter @monorepo-template/db typecheck
pnpm --filter @monorepo-template/db lint
pnpm --filter @monorepo-template/db db:generate
```
