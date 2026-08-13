import { cp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  REFERENCE_PROFILES,
  detectViteReferenceProfile,
  mergeProfilePackageJson
} from "./reference-profiles.js";

const appDefinitions = [
  {
    canonicalName: "web",
    feature: "web-vite",
    generator: "vite",
    nameKey: "webAppName"
  },
  {
    canonicalName: "server",
    feature: "api-nest",
    generator: "nestjs",
    nameKey: "serverAppName"
  }
];

const temporaryArtifacts = [
  ".git",
  "bun.lock",
  "bun.lockb",
  "node_modules",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock"
];

function appPath(root, name) {
  return join(root, "apps", name);
}

function temporaryAppName(generator, name) {
  return `${generator}-${name}`;
}

function commandFor(generator, target) {
  return generator === "vite"
    ? ["pnpm", ["create", "vite", target, "--no-immediate"]]
    : [
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
}

export function validateAppName(name) {
  if (typeof name !== "string" || !/^[a-z0-9][a-z0-9-]*$/i.test(name)) {
    throw new Error(
      `Invalid app name: ${name}. Use letters, numbers, and hyphens only.`
    );
  }
  return name;
}

function selectedDefinitions(options) {
  const selected = new Set(options.features ?? []);
  const definitions = appDefinitions
    .filter(({ feature }) => selected.has(feature))
    .map((definition) => ({
      ...definition,
      name: validateAppName(
        options.appNames?.[definition.feature] ?? options[definition.nameKey]
      )
    }));
  const duplicate = definitions.find(
    ({ name }, index) =>
      definitions.findIndex((definition) => definition.name === name) !== index
  );
  if (duplicate) {
    throw new Error(`App names must be unique: ${duplicate.name}`);
  }
  return definitions;
}

async function removeTemporaryArtifacts(root, dependencies) {
  for (const artifact of temporaryArtifacts) {
    await dependencies.rm(join(root, artifact), {
      force: true,
      recursive: true
    });
  }
}

async function applyReferenceProfile(
  { name, nativeTarget, profileId, templateTarget },
  dependencies
) {
  const nativePackage = JSON.parse(
    await dependencies.readFile(join(nativeTarget, "package.json"), "utf8")
  );
  if (!profileId) {
    const packageJson = mergeProfilePackageJson(nativePackage, {}, name);
    await dependencies.writeFile(
      join(nativeTarget, "package.json"),
      `${JSON.stringify(packageJson, null, 2)}\n`
    );
    return;
  }

  const profile = REFERENCE_PROFILES[profileId];
  const templatePackage = JSON.parse(
    await dependencies.readFile(join(templateTarget, "package.json"), "utf8")
  );
  for (const entry of profile.overlayEntries) {
    const destination = join(nativeTarget, entry);
    await dependencies.rm(destination, { force: true, recursive: true });
    await dependencies.cp(join(templateTarget, entry), destination, {
      recursive: true
    });
  }
  const packageJson = mergeProfilePackageJson(
    nativePackage,
    templatePackage,
    name
  );
  await dependencies.writeFile(
    join(nativeTarget, "package.json"),
    `${JSON.stringify(packageJson, null, 2)}\n`
  );
}

export async function scaffoldNativeApps(options, dependencies) {
  const selected = selectedDefinitions(options);
  const stagedApps = [];

  for (const definition of selected) {
    const temporaryName = temporaryAppName(
      definition.generator,
      definition.name
    );
    const nativeTarget = join(dependencies.temporaryRoot, temporaryName);
    const [command, args] = commandFor(definition.generator, temporaryName);
    await dependencies.runCommand(command, args, {
      cwd: dependencies.temporaryRoot,
      stdio: "inherit"
    });
    await removeTemporaryArtifacts(nativeTarget, dependencies);
    const nativePackage = JSON.parse(
      await dependencies.readFile(join(nativeTarget, "package.json"), "utf8")
    );
    const referenceProfile =
      definition.generator === "vite"
        ? await detectViteReferenceProfile(
            { appRoot: nativeTarget, packageJson: nativePackage },
            dependencies
          )
        : "nestjs/default";
    await applyReferenceProfile(
      {
        name: definition.name,
        nativeTarget,
        profileId: referenceProfile,
        templateTarget: appPath(options.destination, definition.canonicalName)
      },
      dependencies
    );
    stagedApps.push({
      definition,
      nativeTarget,
      record: {
        feature: definition.feature,
        generator: definition.generator,
        name: definition.name,
        path: `apps/${definition.name}`,
        referenceProfile
      }
    });
  }

  for (const { canonicalName } of appDefinitions) {
    await dependencies.rm(appPath(options.destination, canonicalName), {
      force: true,
      recursive: true
    });
  }
  for (const { definition, nativeTarget } of stagedApps) {
    const target = appPath(options.destination, definition.name);
    await dependencies.rm(target, { force: true, recursive: true });
    await dependencies.cp(nativeTarget, target, { recursive: true });
  }

  return stagedApps.map(({ record }) => record);
}

export function nativeScaffoldDependencies({
  cp: copy,
  readFile: read,
  rm: remove,
  writeFile: write
}) {
  return {
    cp: copy ?? cp,
    readFile: read ?? readFile,
    rm: remove ?? rm,
    writeFile: write ?? writeFile
  };
}
