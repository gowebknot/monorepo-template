import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import {
  nativeScaffoldDependencies,
  scaffoldNativeApps
} from "../src/native-scaffold.js";
import {
  allocateAppPorts,
  configureAppScripts
} from "../src/port-allocation.js";

function pickPackages(record, names) {
  return Object.fromEntries(
    names.map((name) => {
      const value = record[name];
      if (typeof value !== "string") {
        throw new Error(`Native integration fixture is missing ${name}.`);
      }
      return [name, value];
    })
  );
}

async function writeTree(root, entries) {
  for (const [path, contents] of Object.entries(entries)) {
    const target = join(root, path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, contents);
  }
}

function viteNativePackage(templatePackage, name) {
  return {
    name,
    private: true,
    version: "1.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "tsc -b && vite build",
      lint: "eslint .",
      preview: "vite preview"
    },
    dependencies: pickPackages(templatePackage.dependencies, [
      "react",
      "react-dom"
    ]),
    devDependencies: pickPackages(templatePackage.devDependencies, [
      "@types/react",
      "@types/react-dom",
      "@vitejs/plugin-react",
      "eslint",
      "typescript",
      "vite"
    ])
  };
}

function nestNativePackage(templatePackage, name) {
  return {
    name,
    private: true,
    version: "1.0.0",
    scripts: {
      build: "nest build",
      start: "nest start",
      "start:dev": "nest start --watch"
    },
    dependencies: pickPackages(templatePackage.dependencies, [
      "@nestjs/common",
      "@nestjs/core",
      "@nestjs/platform-express",
      "reflect-metadata",
      "rxjs"
    ]),
    devDependencies: pickPackages(templatePackage.devDependencies, [
      "@nestjs/cli",
      "@nestjs/schematics",
      "@nestjs/testing",
      "@types/node",
      "typescript"
    ])
  };
}

export async function applyNativeReferenceProfiles({
  projectRoot,
  temporaryRoot
}) {
  await mkdir(temporaryRoot, { recursive: true });
  const webPackage = JSON.parse(
    await readFile(join(projectRoot, "apps/web/package.json"), "utf8")
  );
  const serverPackage = JSON.parse(
    await readFile(join(projectRoot, "apps/server/package.json"), "utf8")
  );
  const runCommand = async (_command, args) => {
    if (args[0] === "create" && args[1] === "vite") {
      await writeTree(join(temporaryRoot, args[2]), {
        "index.html":
          '<div id="root"></div><script type="module" src="/src/main.tsx"></script>\n',
        "package.json": `${JSON.stringify(
          viteNativePackage(webPackage, args[2]),
          null,
          2
        )}\n`,
        "src/App.tsx": "export default function App() { return null; }\n",
        "src/main.tsx": "// controlled React TypeScript native entry\n",
        "tsconfig.app.json":
          '{"compilerOptions":{"jsx":"react-jsx","module":"esnext","moduleResolution":"bundler","noEmit":true,"skipLibCheck":true},"include":["src"]}\n',
        "tsconfig.json":
          '{"files":[],"references":[{"path":"./tsconfig.app.json"},{"path":"./tsconfig.node.json"}]}\n',
        "tsconfig.node.json":
          '{"compilerOptions":{"composite":true,"module":"esnext","moduleResolution":"bundler","noEmit":true,"skipLibCheck":true},"include":["vite.config.ts"]}\n',
        "vite.config.ts":
          'import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\nexport default defineConfig({ plugins: [react()] });\n'
      });
      return;
    }
    if (args[0] === "dlx" && args[1] === "@nestjs/cli") {
      await writeTree(join(temporaryRoot, args[3]), {
        "package.json": `${JSON.stringify(
          nestNativePackage(serverPackage, args[3]),
          null,
          2
        )}\n`,
        "src/main.ts": "// controlled NestJS native entry\n"
      });
      return;
    }
    throw new Error(`Unexpected native integration command: ${args.join(" ")}`);
  };
  const apps = await scaffoldNativeApps(
    {
      appNames: { "api-nest": ["server"], "web-vite": ["web"] },
      destination: projectRoot,
      features: ["web-vite", "api-nest"]
    },
    {
      ...nativeScaffoldDependencies({}),
      runCommand,
      runInteractiveCommand: async (...args) => {
        await runCommand(...args);
        return {
          observation: {
            framework: "React",
            linter: "ESLint",
            variant: "TypeScript"
          }
        };
      },
      temporaryRoot
    }
  );
  const allocatedApps = await allocateAppPorts(apps, {
    checkPort: async () => true
  });
  await configureAppScripts(projectRoot, allocatedApps);
  const config = {
    schemaVersion: 3,
    features: ["web-vite", "api-nest"],
    apps: allocatedApps
  };
  const contents = `${JSON.stringify(config, null, 2)}\n`;
  await writeFile(join(projectRoot, ".mono-stack.json"), contents);
  return { config, contents };
}
