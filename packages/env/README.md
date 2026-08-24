# @monorepo-template/env

Workspace environment validation package built with T3 env and Zod.

## Usage

Import parsed app envs from subpaths:

```ts
import { serverEnv } from "@monorepo-template/env/server";
import { webEnv } from "@monorepo-template/env/web";
```

Import validators and factory functions from the package root:

```ts
import { createServerEnv, globalEnv } from "@monorepo-template/env";
```

## Development

```sh
pnpm --filter @monorepo-template/env build
pnpm --filter @monorepo-template/env typecheck
pnpm --filter @monorepo-template/env lint
```
