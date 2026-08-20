import { readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import {
  addPackage,
  listUserPackages,
  removePackage,
  TEMPLATE_OWNED_PACKAGE_NAMES
} from "./project-management-packages.js";
import {
  invalid,
  projectPath,
  runProjectCommand,
  validateName
} from "./project-management-runtime.js";

export const MANAGEABLE_APP_DEFINITIONS = [
  {
    feature: "web-vite",
    generator: "vite",
    referenceProfile: "vite/react-ts"
  },
  { feature: "web-next", generator: "next", referenceProfile: null },
  { feature: "api-nest", generator: "nestjs", referenceProfile: null },
  { feature: "mobile-expo", generator: "expo", referenceProfile: null },
  {
    feature: "mobile-react-native",
    generator: "react-native",
    referenceProfile: null
  }
];

async function readManifest(cwd, read = readFile) {
  let manifest;
  try {
    manifest = JSON.parse(await read(join(cwd, ".mono-stack.json"), "utf8"));
  } catch (error) {
    invalid(`unable to read .mono-stack.json (${error.message})`);
  }
  if (
    !manifest ||
    manifest.schemaVersion !== 3 ||
    !Array.isArray(manifest.features) ||
    !Array.isArray(manifest.apps)
  ) {
    invalid(".mono-stack.json must be a schemaVersion 3 project manifest");
  }
  return manifest;
}

async function writeManifest(cwd, manifest, write = writeFile) {
  await write(
    join(cwd, ".mono-stack.json"),
    `${JSON.stringify(manifest, null, 2)}\n`
  );
}

function commandForApp(definition, name) {
  const target = `apps/${name}`;
  switch (definition.generator) {
    case "vite":
      return ["pnpm", ["create", "vite", target, "--template", "react-ts"]];
    case "next":
      return [
        "pnpm",
        [
          "dlx",
          "create-next-app@latest",
          target,
          "--ts",
          "--app",
          "--src-dir",
          "--eslint",
          "--tailwind",
          "--import-alias",
          "@/*",
          "--use-pnpm",
          "--skip-install",
          "--disable-git",
          "--yes"
        ]
      ];
    case "nestjs":
      return [
        "pnpm",
        [
          "dlx",
          "@nestjs/cli",
          "new",
          target,
          "--skip-git",
          "--package-manager",
          "pnpm",
          "--skip-install"
        ]
      ];
    case "expo":
      return [
        "pnpm",
        [
          "dlx",
          "create-expo-app@latest",
          target,
          "--template",
          "blank-typescript",
          "--no-install"
        ]
      ];
    case "react-native":
      return [
        "pnpm",
        [
          "dlx",
          "@react-native-community/cli@latest",
          "init",
          name,
          "--directory",
          target,
          "--skip-install",
          "--skip-git-init"
        ]
      ];
    default:
      invalid(`unsupported app generator: ${definition.generator}`);
  }
}

function findAppDefinition(feature) {
  const definition = MANAGEABLE_APP_DEFINITIONS.find(
    (candidate) => candidate.feature === feature
  );
  if (!definition) invalid(`app feature is not manageable: ${feature}`);
  return definition;
}

export async function addApp(
  cwd,
  { feature, name },
  { runCommand = runProjectCommand, write = writeFile, read = readFile } = {}
) {
  const definition = findAppDefinition(feature);
  validateName(name, "app name");
  const manifest = await readManifest(cwd, read);
  if (manifest.apps.some((app) => app.name === name)) {
    invalid(`app name already exists: ${name}`);
  }
  const [command, args] = commandForApp(definition, name);
  await runCommand(command, args, { cwd });
  const app = {
    feature,
    generator: definition.generator,
    name,
    path: `apps/${name}`,
    referenceProfile: definition.referenceProfile
  };
  await writeManifest(
    cwd,
    {
      ...manifest,
      features: manifest.features.includes(feature)
        ? manifest.features
        : [...manifest.features, feature],
      apps: [...manifest.apps, app]
    },
    write
  );
  await runCommand("pnpm", ["install"], { cwd });
  return app;
}

export async function removeApp(
  cwd,
  name,
  {
    confirmed,
    remove = rm,
    write = writeFile,
    read = readFile,
    runCommand = runProjectCommand
  } = {}
) {
  validateName(name, "app name");
  if (!confirmed) return false;
  const manifest = await readManifest(cwd, read);
  const app = manifest.apps.find((candidate) => candidate.name === name);
  if (!app) invalid(`app does not exist: ${name}`);
  const remainingApps = manifest.apps.filter(
    (candidate) => candidate.name !== name
  );
  const remainingFeatures = manifest.features.filter((feature) =>
    remainingApps.some((candidate) => candidate.feature === feature)
  );
  if (remainingFeatures.length === 0) {
    invalid("at least one app must remain in the project");
  }
  await remove(projectPath(cwd, app.path), { force: true, recursive: true });
  await writeManifest(
    cwd,
    { ...manifest, features: remainingFeatures, apps: remainingApps },
    write
  );
  await runCommand("pnpm", ["install"], { cwd });
  return true;
}

export async function manageProject(cwd, action, dependencies = {}) {
  switch (action?.action) {
    case "add-app":
      return addApp(cwd, action, dependencies);
    case "remove-app":
      return removeApp(cwd, action.name, {
        ...dependencies,
        confirmed: action.confirmed
      });
    case "add-package":
      return addPackage(cwd, action.name, dependencies);
    case "remove-package":
      return removePackage(cwd, action.name, {
        ...dependencies,
        confirmed: action.confirmed
      });
    default:
      invalid("unknown management action");
  }
}

export function packagePathIsSafe(cwd, packagePath) {
  return projectPath(cwd, packagePath) !== resolve(cwd);
}

export {
  addPackage,
  commandForApp,
  listUserPackages,
  readManifest,
  removePackage,
  runProjectCommand,
  TEMPLATE_OWNED_PACKAGE_NAMES,
  writeManifest
};
