# @repo/env

Workspace environment validation package built with T3 env and Zod.

## Usage

Import parsed app envs from subpaths:

```ts
import { serverEnv } from "@repo/env/server";
import { webEnv } from "@repo/env/web";
```

Import validators and factory functions from the package root:

```ts
import { createServerEnv, globalEnv } from "@repo/env";
```

## Development

```sh
pnpm --filter @repo/env build
pnpm --filter @repo/env typecheck
pnpm --filter @repo/env lint
```
