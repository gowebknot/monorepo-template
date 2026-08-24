# Minimal Package Pattern

Use `packages/entities` as the reference implementation for minimal workspace library packages.

## Scaffolding Command

For a new package, run the helper instead of writing the setup files by hand:

```sh
pnpm package:create <project-name>
```

The helper sets the generated package name to `@monorepo-template/<project-name>`.

Options:

```sh
--root <repo-root>       # defaults to current working directory
--force                  # overwrite scaffold-managed files in an existing package
```

Examples:

```sh
node skills/create-minimal-package/scripts/scaffold-package.mjs billing
pnpm package:create billing
just package-create billing
```

The example creates `packages/billing/package.json` with `"name": "@monorepo-template/billing"`.

After scaffolding, add feature files and barrel exports. The helper intentionally creates `src/index.ts` as an empty module because it cannot know the package API.

## Required Shape

```text
packages/<name>/
├── AGENTS.md
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── index.ts
    └── <feature>/
        ├── index.ts
        └── <implementation>.ts
```

Do not keep Vite app boilerplate in a library package: `index.html`, demo CSS, demo assets, counters, and public demo icons should be removed unless the package is an app.

## Package Manifest

Expose only the built entrypoint:

```json
{
  "name": "@monorepo-template/<project-name>",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint .",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "preview": "vite preview"
  }
}
```

Other workspace packages consume it through a workspace dependency:

```json
{
  "dependencies": {
    "<package-name>": "workspace:*"
  }
}
```

Then import from the package name, not from its source path:

```ts
import { thing } from "<package-name>";
```

## Vite Config

Use library mode with ESM output and dts generation:

```ts
import path from "path";
import dts from "unplugin-dts/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index"
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
```

## TypeScript Config

Use bundler resolution and mirror the Vite alias:

```json
{
  "compilerOptions": {
    "target": "es2023",
    "module": "esnext",
    "lib": ["ES2023", "DOM"],
    "types": ["vite/client"],
    "allowArbitraryExtensions": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

Do not add `baseUrl` unless a compiler version requires it; the repository's TypeScript 7 compiler
accepts `paths` without it and avoids the `ignoreDeprecations` workaround. The
`@typescript/typescript6` dependency exists only for declaration-tooling compatibility.

## Import Rules

Implementation files should use the package alias:

```ts
import { helper } from "@/feature/helper";
```

Barrel files should use relative exports:

```ts
// src/index.ts
export * from "./feature";

// src/feature/index.ts
export * from "./helper";
```

This keeps source ergonomics while ensuring emitted declaration files do not leak the private `@/` alias to consuming packages.

## Validation

Run focused checks before finishing:

```sh
pnpm --filter <package-name> build
pnpm --filter <package-name> typecheck
pnpm --filter <package-name> lint
```

If the package is new, also run root `pnpm typecheck` and `pnpm lint` so Turbo includes it correctly.
