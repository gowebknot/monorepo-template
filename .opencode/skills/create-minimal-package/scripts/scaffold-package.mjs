#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

process.on("uncaughtException", (error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

const args = process.argv.slice(2);

function takeFlag(name) {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${name} requires a value`);
  }
  args.splice(index, 2);
  return value;
}

const root = path.resolve(takeFlag("--root") ?? process.cwd());
const force = args.includes("--force");
const projectName = args.find((arg) => !arg.startsWith("--"));

if (!projectName) {
  throw new Error(
    "Usage: scaffold-package.mjs <project-name> [--root <repo-root>] [--force]"
  );
}

if (!/^[a-z0-9-]+$/.test(projectName)) {
  throw new Error("Project name must be lowercase kebab-case");
}

const packageName = `@repo/${projectName}`;
const packageDirName = projectName;
const packageDir = path.join(root, "packages", packageDirName);

if (existsSync(packageDir) && !force) {
  throw new Error(
    `Refusing to overwrite existing package: ${path.relative(root, packageDir)}. Pass --force to overwrite scaffold files.`
  );
}

const packageJson = {
  name: packageName,
  private: true,
  version: "0.0.0",
  type: "module",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js"
    }
  },
  scripts: {
    dev: "vite",
    build: "tsc && vite build",
    lint: "eslint .",
    typecheck: "tsc -p tsconfig.json --noEmit",
    preview: "vite preview"
  },
  devDependencies: {
    typescript: "~6.0.2",
    "unplugin-dts": "^1.0.3",
    vite: "^8.1.1"
  }
};

const tsconfig = {
  compilerOptions: {
    target: "es2023",
    module: "esnext",
    lib: ["ES2023", "DOM"],
    types: ["vite/client"],
    allowArbitraryExtensions: true,
    skipLibCheck: true,
    moduleResolution: "bundler",
    allowImportingTsExtensions: true,
    verbatimModuleSyntax: true,
    moduleDetection: "force",
    noEmit: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    erasableSyntaxOnly: true,
    noFallthroughCasesInSwitch: true,
    paths: {
      "@/*": ["./src/*"]
    }
  },
  include: ["src"]
};

const viteConfig = `import path from "path";
import dts from "unplugin-dts/vite";
import { defineConfig } from "vite";

// <https://vite.dev/config/>
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
`;

const gitignore = `node_modules
dist
dist-ssr
*.local
`;

const agents = `# AGENTS.md

## Purpose

\`${packageName}\` owns shared library code for the \`${projectName}\` package.

## Rules

- Keep this package focused on reusable library code.
- Do not read \`process.env\` directly in this package. Runtime configuration should be passed in by consumers or imported from \`@repo/env\` when appropriate.
- Keep runtime-only peer dependencies external in \`vite.config.ts\`.
- Add package-specific rules here when this package gains concrete responsibilities.

## Source Layout

\`\`\`text
src/
  index.ts
\`\`\`

## Imports

- Implementation files may use absolute \`@/...\` imports.
- Barrel files use relative exports so generated \`.d.ts\` files stay portable.

## Validation

Run from the repo root:

\`\`\`sh
pnpm --filter ${packageName} build
pnpm --filter ${packageName} typecheck
pnpm --filter ${packageName} lint
\`\`\`
`;

const readme = `# ${packageName}

Shared workspace package for \`${projectName}\`.

## Usage

Export public APIs from \`src/index.ts\`, then import them from the package root:

\`\`\`ts
import { example } from "${packageName}";
\`\`\`

## Development

\`\`\`sh
pnpm --filter ${packageName} build
pnpm --filter ${packageName} typecheck
pnpm --filter ${packageName} lint
\`\`\`
`;

await mkdir(path.join(packageDir, "src"), { recursive: true });
await writeFile(
  path.join(packageDir, "package.json"),
  `${JSON.stringify(packageJson, null, 2)}\n`
);
await writeFile(
  path.join(packageDir, "tsconfig.json"),
  `${JSON.stringify(tsconfig, null, 2)}\n`
);
await writeFile(path.join(packageDir, "vite.config.ts"), viteConfig);
await writeFile(path.join(packageDir, ".gitignore"), gitignore);
await writeFile(path.join(packageDir, "AGENTS.md"), agents);
await writeFile(path.join(packageDir, "README.md"), readme);
await writeFile(path.join(packageDir, "src", "index.ts"), "export {};\n");

console.log(`Scaffolded ${path.relative(root, packageDir)}`);
console.log(
  `Next: add exports to ${path.relative(root, path.join(packageDir, "src", "index.ts"))} and run pnpm install if dependencies are not already linked.`
);
