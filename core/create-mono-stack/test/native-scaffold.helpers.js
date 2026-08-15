import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

export const renderedWebPackage = {
  name: "web",
  private: true,
  version: "0.0.0",
  scripts: {
    build: "pnpm routes:generate && tsc -b && vite build",
    "dev:reference": "vite",
    "routes:generate": "tsr generate"
  },
  dependencies: {
    "@repo/env": "workspace:^",
    "@tanstack/react-router": "^1.170.18",
    react: "^19.2.7"
  },
  devDependencies: {
    eslint: "^10.6.0",
    typescript: "^7.0.0",
    vite: "^8.1.1"
  }
};

export const renderedServerPackage = {
  name: "server",
  private: true,
  version: "0.0.1",
  scripts: {
    build: "nest build",
    "build:reference": "nest build --config nest-cli.reference.json",
    dev: "nest start --watch",
    "dev:reference": "nest start --config nest-cli.reference.json --watch",
    typecheck: "tsc --noEmit -p tsconfig.json"
  },
  dependencies: {
    "@nestjs/common": "^11.0.1",
    "@repo/db": "workspace:^",
    "@repo/env": "workspace:^"
  },
  devDependencies: {
    "@nestjs/cli": "^11.0.0",
    typescript: "^7.0.0"
  }
};

export const reactTypeScriptNativeTree = {
  "package.json": JSON.stringify({
    name: "temporary-react",
    private: true,
    version: "1.0.0",
    scripts: { build: "tsc -b && vite build", dev: "vite" },
    dependencies: { react: "^20.0.0", "react-dom": "^20.0.0" },
    devDependencies: {
      "@types/react": "^20.0.0",
      "@types/react-dom": "^20.0.0",
      "@vitejs/plugin-react": "^9.0.0",
      oxlint: "^2.0.0",
      typescript: "~6.0.2",
      vite: "^9.0.0"
    }
  }),
  "src/App.tsx": "native-app",
  "src/main.tsx": "native-main"
};

export const vueTypeScriptNativeTree = {
  "package.json": JSON.stringify({
    name: "temporary-vue",
    private: true,
    version: "1.0.0",
    scripts: { build: "vue-tsc -b && vite build", dev: "vite" },
    dependencies: { vue: "^3.5.0" },
    devDependencies: {
      "@vitejs/plugin-vue": "^6.0.0",
      typescript: "~6.0.2",
      vite: "^9.0.0",
      "vue-tsc": "^3.0.0"
    }
  }),
  "src/main.ts": "vue-main"
};

export const nestNativeTree = {
  "eslint.config.mjs": "native-eslint",
  "nest-cli.json": '{"native":true}',
  "package.json": JSON.stringify({
    name: "temporary-nest",
    private: true,
    version: "1.0.0",
    scripts: { build: "nest build", start: "nest start" },
    dependencies: { "@nestjs/common": "^12.0.0" },
    devDependencies: {
      "@nestjs/cli": "^12.0.0",
      typescript: "^6.0.0"
    }
  }),
  "src/main.ts": "native-main",
  "src/native.controller.ts": "native-controller",
  "test/native.e2e-spec.ts": "native-test",
  "tsconfig.build.json": '{"native":true}',
  "tsconfig.json": '{"native":true}'
};

const renderedWebTree = {
  ".gitignore": "web-ignore-marker",
  "components.json": '{"marker":"components"}',
  "eslint.config.js": "web-eslint-marker",
  "index.html": "template-index",
  "package.json": JSON.stringify(renderedWebPackage),
  "src/main.tsx": "template-main",
  "src/template-only.tsx": "template-only",
  "tsconfig.app.json": '{"marker":"app-tsconfig"}',
  "tsconfig.json": '{"marker":"root-tsconfig"}',
  "tsconfig.node.json": '{"marker":"node-tsconfig"}',
  "vite.config.ts": "vite-config-marker"
};

const renderedServerTree = {
  ".prettierrc": '{"marker":"prettier"}',
  "AGENTS.md": "server-agent-marker",
  "CLAUDE.md": "server-claude-marker",
  "eslint.config.mjs": "server-eslint-marker",
  "nest-cli.json": '{"marker":"nest-main"}',
  "nest-cli.reference.json": '{"marker":"nest-reference"}',
  "package.json": JSON.stringify(renderedServerPackage),
  "reference/main.ts": "reference-main",
  "src/main.ts": "template-main @repo/env/server",
  "src/template.controller.ts": "template-controller",
  "test/app.e2e-spec.ts": "template-test",
  "tsconfig.build.json": '{"marker":"build-tsconfig"}',
  "tsconfig.json": '{"marker":"root-tsconfig"}',
  "tsconfig.reference.build.json": '{"marker":"reference-tsconfig"}'
};

export async function writeTree(root, entries) {
  for (const [path, contents] of Object.entries(entries)) {
    const target = join(root, path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, contents);
  }
}

export async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

export async function createNativeScaffoldFixture(
  t,
  { nativeNest = nestNativeTree, nativeVite = reactTypeScriptNativeTree } = {}
) {
  const root = await mkdtemp(join(tmpdir(), "native-scaffold-test-"));
  const destination = join(root, "project");
  const temporaryRoot = join(root, "temporary");
  const calls = [];
  await mkdir(temporaryRoot, { recursive: true });
  await writeTree(join(destination, "apps", "web"), renderedWebTree);
  await writeTree(join(destination, "apps", "server"), renderedServerTree);
  t.after(() => rm(root, { force: true, recursive: true }));

  return {
    calls,
    destination,
    temporaryRoot,
    read: (path) => readFile(path, "utf8"),
    runCommand: async (command, args, options) => {
      calls.push({ args, command, options });
      if (args[0] === "create" && args[1] === "vite") {
        await writeTree(join(temporaryRoot, args[2]), nativeVite);
      } else if (args[0] === "dlx" && args[1] === "@nestjs/cli") {
        await writeTree(join(temporaryRoot, args[3]), nativeNest);
      }
    }
  };
}
