# @repo/db

Shared Drizzle database connection helpers.

## Usage

```ts
import { createDb, getDatabaseUrl } from "@repo/db";
```

`src/` stays connection-only in this template. Driver-specific examples and schema tables live under `example/`.

## Development

```sh
pnpm --filter @repo/db build
pnpm --filter @repo/db typecheck
pnpm --filter @repo/db lint
pnpm --filter @repo/db db:generate
```
