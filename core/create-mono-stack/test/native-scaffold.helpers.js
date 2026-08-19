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
  ".gitignore": "native-ignore",
  "components.json": '{"native":true}',
  "eslint.config.js": "native-eslint",
  "index.html": "native-index",
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
  "src/main.tsx": "native-main",
  "tsconfig.app.json": '{"native":"app"}',
  "tsconfig.json": '{"native":"root"}',
  "tsconfig.node.json": '{"native":"node"}',
  "vite.config.ts": "native-vite"
};

export const reactCompilerTypeScriptNativeTree = {
  ...reactTypeScriptNativeTree,
  "package.json": JSON.stringify({
    ...JSON.parse(reactTypeScriptNativeTree["package.json"]),
    devDependencies: {
      ...JSON.parse(reactTypeScriptNativeTree["package.json"]).devDependencies,
      "@rolldown/plugin-babel": "^0.2.3",
      "babel-plugin-react-compiler": "^1.0.0"
    }
  }),
  "vite.config.ts": "native-react-compiler-vite"
};

export function delegatedReactNativeTree(dependency) {
  const nativePackage = JSON.parse(reactTypeScriptNativeTree["package.json"]);
  return {
    ...reactTypeScriptNativeTree,
    "package.json": JSON.stringify({
      ...nativePackage,
      frameworkMetadata: { preserve: true },
      dependencies: {
        ...nativePackage.dependencies,
        [dependency]: "^1.0.0"
      },
      scripts: {
        ...nativePackage.scripts,
        "framework-native": "framework dev"
      }
    }),
    "src/main.tsx": "delegated-native-main",
    "vite.config.ts": "delegated-native-config"
  };
}

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

export const renderedNextPackage = {
  name: "next",
  private: true,
  version: "0.0.0",
  scripts: {
    build: "next build",
    "build:reference": "next build reference",
    dev: "next dev",
    "dev:reference": "next dev reference",
    "start:reference": "next start reference"
  },
  dependencies: {
    "@repo/api-client": "workspace:^",
    "@repo/entities": "workspace:^",
    "@repo/env": "workspace:^",
    "@repo/query-client": "workspace:^",
    "@tanstack/react-query": "^5.0.0",
    next: "^14.0.0",
    react: "^18.0.0"
  },
  devDependencies: { typescript: "^7.0.0" }
};

export const renderedExpoPackage = {
  name: "expo",
  private: true,
  version: "0.0.0",
  scripts: {
    dev: "expo start",
    "dev:reference": "expo start",
    start: "expo start"
  },
  dependencies: {
    "@repo/api-client": "workspace:^",
    "@repo/entities": "workspace:^",
    "@repo/env": "workspace:^",
    "@repo/query-client": "workspace:^",
    "@tanstack/react-query": "^5.0.0",
    expo: "^51.0.0",
    "expo-router": "^3.0.0",
    react: "^18.0.0",
    "react-native-safe-area-context": "5.9.1"
  },
  devDependencies: { typescript: "^7.0.0" }
};

export const renderedMobilePackage = {
  name: "mobile",
  private: true,
  version: "0.0.0",
  scripts: {
    dev: "react-native start",
    "dev:reference": "react-native start",
    start: "react-native start"
  },
  dependencies: {
    "@react-navigation/native": "^7.0.0",
    "@react-navigation/native-stack": "^7.0.0",
    "@repo/api-client": "workspace:^",
    "@repo/entities": "workspace:^",
    "@repo/env": "workspace:^",
    "@repo/query-client": "workspace:^",
    "@tanstack/react-query": "^5.0.0",
    react: "^18.0.0",
    "react-native": "^0.75.0",
    "react-native-safe-area-context": "5.9.1"
  },
  devDependencies: { typescript: "^7.0.0" }
};

export const nextNativeTree = {
  ".gitignore": "next-native-ignore",
  "next.config.ts": "next-native-config",
  "package.json": JSON.stringify({
    name: "next-next",
    private: true,
    version: "0.1.0",
    scripts: { build: "next build", dev: "next dev" },
    dependencies: {
      next: "^15.0.0",
      react: "^19.0.0",
      "react-dom": "^19.0.0"
    },
    devDependencies: { "@types/node": "^22.0.0", typescript: "^5.6.0" }
  }),
  "src/app/page.tsx": "next-native-page",
  "tsconfig.json": '{"native":"next"}'
};

export const expoNativeTree = {
  ".gitignore": "expo-native-ignore",
  "app.json": "expo-native-appjson",
  "index.ts": "expo-native-index",
  "package.json": JSON.stringify({
    name: "expo-expo",
    private: true,
    version: "1.0.0",
    scripts: { start: "expo start" },
    dependencies: {
      expo: "^52.0.0",
      react: "^19.0.0",
      "react-native": "^0.76.0",
      "react-native-safe-area-context": "^5.5.2"
    },
    devDependencies: { typescript: "^5.6.0" }
  }),
  "tsconfig.json": '{"native":"expo"}'
};

export const reactNativeNativeTree = {
  ".gitignore": "rn-native-ignore",
  "App.tsx": "rn-native-app",
  "metro.config.js": "rn-native-metro",
  "package.json": JSON.stringify({
    name: "MobileApp",
    private: true,
    version: "0.0.1",
    scripts: { start: "react-native start" },
    dependencies: {
      react: "^19.0.0",
      "react-native": "^0.76.0",
      "react-native-safe-area-context": "^5.5.2"
    },
    devDependencies: { typescript: "^5.6.0" }
  }),
  "tsconfig.json": '{"native":"rn"}'
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

const renderedNextTree = {
  "AGENTS.md": "next-agent-marker",
  "CLAUDE.md": "next-claude-marker",
  "README.md": "next-readme-marker",
  "components.json": '{"marker":"next-components"}',
  "next.config.ts": "next-template-config",
  "postcss.config.mjs": "next-template-postcss",
  "tsconfig.json": '{"marker":"next-tsconfig"}',
  ".env.example": "next-env-example",
  "package.json": JSON.stringify(renderedNextPackage),
  "src/app/page.tsx": "next-template-page",
  "src/app/reference/todos/page.tsx": "next-template-todos"
};

const renderedExpoTree = {
  ".env.example": "expo-env-example",
  "AGENTS.md": "expo-agent-marker",
  "CLAUDE.md": "expo-claude-marker",
  "README.md": "expo-readme-marker",
  "app.json": '{"expo":{"name":"expo-template"}}',
  "babel.config.js": "expo-babel-config",
  "components/ui/button.tsx": "expo-button",
  "css.d.ts": "declare module '*.css';",
  "globals.css": "expo-global-css",
  "index.ts": 'import "expo-router/entry";\n',
  "metro.config.js": "expo-metro-config",
  "nativewind-env.d.ts": "expo-nativewind-types",
  "postcss.config.js": "expo-postcss-config",
  "package.json": JSON.stringify(renderedExpoPackage),
  "app/form-demo.tsx": "expo-template-form",
  "app/index.tsx": "expo-template-home",
  "app/reference/index.tsx": "expo-template-reference",
  "app/reference/todos/[todoId].tsx": "expo-template-detail",
  "app/reference/todos.tsx": "expo-template-reference-todos",
  "app/table-demo.tsx": "expo-template-table",
  "app/todos.tsx": "expo-template-todos",
  "components/todo-list.tsx": "expo-template-list",
  "lib/bug-report-form.ts": "expo-template-form-options",
  "lib/query-client.ts": "expo-template-query",
  "tsconfig.json": "expo-tsconfig"
};

const renderedMobileTree = {
  ".env.example": "mobile-env-example",
  "AGENTS.md": "mobile-agent-marker",
  "CLAUDE.md": "mobile-claude-marker",
  "README.md": "mobile-readme-marker",
  "App.tsx": "mobile-template-app",
  "babel.config.js": "mobile-babel-config",
  "css.d.ts": "declare module '*.css';",
  "index.js": "mobile-entry",
  "metro.config.js": "mobile-metro-config",
  "nativewind-env.d.ts": "mobile-nativewind-types",
  "postcss.config.js": "mobile-postcss-config",
  "package.json": JSON.stringify(renderedMobilePackage),
  "src/app.tsx": "mobile-template-root",
  "src/global.css": "mobile-global-css",
  "src/components/ui/button.tsx": "mobile-button",
  "src/components/forms/form-core.ts": "mobile-form-core",
  "src/screens/home.tsx": "mobile-template-home",
  "src/screens/form-demo.tsx": "mobile-template-form",
  "src/screens/reference.tsx": "mobile-template-reference",
  "src/screens/table-demo.tsx": "mobile-template-table",
  "src/screens/todo-detail.tsx": "mobile-template-detail",
  "src/screens/todos.tsx": "mobile-template-todos",
  "tsconfig.json": "mobile-tsconfig"
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
  {
    nativeNest = nestNativeTree,
    nativeVite = reactTypeScriptNativeTree,
    nativeNext = nextNativeTree,
    nativeExpo = expoNativeTree,
    nativeReactNative = reactNativeNativeTree,
    viteSelection = {
      framework: "React",
      linter: "ESLint",
      variant: "TypeScript"
    }
  } = {}
) {
  const root = await mkdtemp(join(tmpdir(), "native-scaffold-test-"));
  const destination = join(root, "project");
  const temporaryRoot = join(root, "temporary");
  const calls = [];
  await mkdir(temporaryRoot, { recursive: true });
  await writeTree(join(destination, "apps", "web"), renderedWebTree);
  await writeTree(join(destination, "apps", "server"), renderedServerTree);
  await writeTree(join(destination, "apps", "next"), renderedNextTree);
  await writeTree(join(destination, "apps", "expo"), renderedExpoTree);
  await writeTree(join(destination, "apps", "mobile"), renderedMobileTree);
  t.after(() => rm(root, { force: true, recursive: true }));

  const runCommand = async (command, args, options) => {
    calls.push({ args, command, options });
    if (args[0] === "create" && args[1] === "vite") {
      await writeTree(join(temporaryRoot, args[2]), nativeVite);
    } else if (args[0] === "dlx" && args[1] === "@nestjs/cli") {
      await writeTree(join(temporaryRoot, args[3]), nativeNest);
    } else if (args[0] === "dlx" && args[1] === "create-next-app@latest") {
      await writeTree(join(temporaryRoot, args[2]), nativeNext);
    } else if (args[0] === "dlx" && args[1] === "create-expo-app@latest") {
      await writeTree(join(temporaryRoot, args[2]), nativeExpo);
    } else if (
      args[0] === "dlx" &&
      args[1] === "@react-native-community/cli@latest"
    ) {
      const directoryIndex = args.indexOf("--directory");
      await writeTree(
        join(temporaryRoot, args[directoryIndex + 1]),
        nativeReactNative
      );
    }
  };

  return {
    calls,
    destination,
    temporaryRoot,
    read: (path) => readFile(path, "utf8"),
    runCommand,
    runInteractiveCommand: async (...args) => {
      await runCommand(...args);
      return { observation: viteSelection };
    }
  };
}
