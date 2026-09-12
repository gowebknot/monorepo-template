import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  REFERENCE_PROFILES,
  detectViteReferenceProfile,
  mergeProfilePackageJson,
  selectionSupportsViteProfile
} from "./reference-profiles.js";

const appDefinitions = [
  {
    canonicalName: "web",
    feature: "web-vite",
    generator: "vite",
    nameKey: "webAppName",
    interactive: true,
    detectProfile: detectViteReferenceProfile
  },
  {
    canonicalName: "server",
    feature: "api-nest",
    generator: "nestjs",
    nameKey: "serverAppName",
    interactive: false,
    defaultProfile: "nestjs/default"
  },
  {
    canonicalName: "next",
    feature: "web-next",
    generator: "next",
    nameKey: null,
    interactive: false,
    defaultProfile: "next/default"
  },
  {
    canonicalName: "expo",
    feature: "mobile-expo",
    generator: "expo",
    nameKey: null,
    interactive: false,
    defaultProfile: "expo/default"
  },
  {
    canonicalName: "mobile",
    feature: "mobile-react-native",
    generator: "react-native",
    nameKey: null,
    interactive: false,
    defaultProfile: "react-native/default"
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

const templateScope = "@monorepo-template/";
const bareTemplateNamePattern = /"monorepo-template(?=["/])/g;
// Mirrors scripts/render-package-scope.mjs's own rule exactly: that script rewrites the whole
// destination project once, right after `copier copy` finishes; managed-template content is
// copied in afterward (see applyReferenceProfile below), so it needs the same rewrite applied
// again, scoped to just the app directory it was copied into.
const scopeRenderIgnoredDirectories = new Set([
  ".git",
  ".venv",
  "dist",
  "node_modules"
]);
const scopeRenderTextExtensions = new Set([
  ".cjs",
  ".css",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml"
]);

async function renderTemplateScope(root, scope, dependencies) {
  for (const entry of await dependencies.readdir(root, {
    withFileTypes: true
  })) {
    if (entry.isDirectory() && scopeRenderIgnoredDirectories.has(entry.name)) {
      continue;
    }
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      await renderTemplateScope(path, scope, dependencies);
      continue;
    }
    const extension = entry.name.includes(".")
      ? `.${entry.name.split(".").pop()}`
      : "";
    if (!scopeRenderTextExtensions.has(extension)) continue;
    const contents = await dependencies.readFile(path, "utf8");
    const rendered = contents
      .replaceAll(templateScope, `@${scope}/`)
      .replace(bareTemplateNamePattern, `"${scope}`);
    if (rendered !== contents) await dependencies.writeFile(path, rendered);
  }
}

function appPath(root, name) {
  return join(root, "apps", name);
}

async function injectTailwindVitePlugin(nativeTarget, dependencies) {
  const configPath = join(nativeTarget, "vite.config.ts");
  let config = await dependencies.readFile(configPath, "utf8");

  if (!config.includes('from "@tailwindcss/vite"')) {
    config = `import tailwindcss from "@tailwindcss/vite";\n${config}`;
  }
  if (!config.includes("tailwindcss()")) {
    if (!/plugins\s*:\s*\[/.test(config)) {
      throw new Error(`Vite config has no plugins array: ${configPath}`);
    }
    config = config.replace(
      /plugins\s*:\s*\[/,
      (match) => `${match}\n    tailwindcss(),`
    );
  }

  await dependencies.writeFile(configPath, config);
}

async function disableReferenceReactRefreshRule(nativeTarget, dependencies) {
  const configPath = join(nativeTarget, "eslint.config.js");
  const config = await dependencies.readFile(configPath, "utf8");

  if (config.includes("react-refresh/only-export-components")) return;

  const languageOptionsPattern =
    /languageOptions:\s*\{\s*globals:\s*globals\.browser\s*,?\s*\}/;
  if (!languageOptionsPattern.test(config)) {
    throw new Error(
      `Vite ESLint config has no languageOptions block to extend: ${configPath}`
    );
  }

  const patched = config.replace(
    languageOptionsPattern,
    (match) =>
      `${match},\n    rules: {\n      "react-refresh/only-export-components": "off"\n    }`
  );

  await dependencies.writeFile(configPath, patched);
}

function temporaryAppName(generator, name) {
  return `${generator}-${name}`;
}

function pascalCaseName(name) {
  return name
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function commandFor(definition, target) {
  switch (definition.generator) {
    case "vite":
      return ["pnpm", ["create", "vite", target, "--no-immediate"]];
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
      // `--pm` is intentionally omitted: with `--skip-install` no package
      // manager runs, and passing `--pm pnpm` makes the CLI fail a pnpm
      // detection check inside `pnpm dlx`.
      return [
        "pnpm",
        [
          "dlx",
          "@react-native-community/cli@latest",
          "init",
          pascalCaseName(definition.name),
          "--directory",
          target,
          "--skip-install",
          "--skip-git-init"
        ]
      ];
    default:
      throw new Error(`Unsupported generator: ${definition.generator}`);
  }
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
    .flatMap((definition) => {
      const names =
        options.appNames?.[definition.feature] ??
        (options[definition.nameKey] !== undefined
          ? [options[definition.nameKey]]
          : []);
      const instanceNames = names.length > 0 ? names : [undefined];
      return instanceNames.map((name) => ({
        ...definition,
        name: validateAppName(name)
      }));
    });
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

export async function applyReferenceProfile(
  {
    name,
    nativeTarget,
    profileId,
    projectRoot,
    templateTarget,
    useManagedTemplate = false
  },
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
  const profileTemplateTarget =
    profile.templateRoot ??
    (useManagedTemplate ? profile.managedTemplateRoot : undefined) ??
    templateTarget;
  const templatePackage = profile.codeOnly
    ? {}
    : JSON.parse(
        await dependencies.readFile(
          join(profileTemplateTarget, "package.json"),
          "utf8"
        )
      );
  if (profile.referenceEntries) {
    for (const entry of profile.referenceEntries) {
      const destination = join(nativeTarget, entry.destination);
      await dependencies.mkdir(join(nativeTarget, "reference"), {
        recursive: true
      });
      await dependencies.cp(
        join(profileTemplateTarget, entry.source),
        destination,
        { recursive: true }
      );
    }
  } else {
    for (const entry of profile.overlayEntries) {
      const destination = join(nativeTarget, entry);
      await dependencies.rm(destination, { force: true, recursive: true });
      await dependencies.cp(join(profileTemplateTarget, entry), destination, {
        recursive: true
      });
    }
  }
  if (profile.postProcess === "tailwind-vite") {
    await injectTailwindVitePlugin(nativeTarget, dependencies);
    await disableReferenceReactRefreshRule(nativeTarget, dependencies);
  }
  const packageJson = mergeProfilePackageJson(
    nativePackage,
    templatePackage,
    name,
    profile.mergeScriptNames,
    profile.nativeOwnedDependencies,
    profile.replaceScriptNames
  );
  await dependencies.writeFile(
    join(nativeTarget, "package.json"),
    `${JSON.stringify(packageJson, null, 2)}\n`
  );

  if (useManagedTemplate && profile.managedTemplateRoot) {
    const projectPackage = JSON.parse(
      await dependencies.readFile(join(projectRoot, "package.json"), "utf8")
    );
    await renderTemplateScope(nativeTarget, projectPackage.name, dependencies);
  }
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
    const [command, args] = commandFor(definition, temporaryName);
    const runGenerator =
      definition.interactive && dependencies.runInteractiveCommand
        ? dependencies.runInteractiveCommand
        : dependencies.runCommand;
    const commandResult = await runGenerator(command, args, {
      cwd: dependencies.temporaryRoot,
      stdio: "inherit"
    });
    const selection = definition.interactive
      ? commandResult?.observation
      : undefined;
    await removeTemporaryArtifacts(nativeTarget, dependencies);
    const nativePackage = JSON.parse(
      await dependencies.readFile(join(nativeTarget, "package.json"), "utf8")
    );
    const detectedProfile = definition.detectProfile
      ? await definition.detectProfile(
          { appRoot: nativeTarget, packageJson: nativePackage, selection },
          dependencies
        )
      : definition.defaultProfile;
    const referenceProfile =
      definition.interactive &&
      !selectionSupportsViteProfile(selection, detectedProfile)
        ? null
        : detectedProfile;
    await applyReferenceProfile(
      {
        name: definition.name,
        nativeTarget,
        profileId: referenceProfile,
        projectRoot: options.destination,
        templateTarget: appPath(options.destination, definition.canonicalName),
        useManagedTemplate: true
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
        referenceProfile,
        ...(selection ? { selection } : {})
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
  mkdir: makeDirectory,
  readFile: read,
  readdir: readDirectory,
  rm: remove,
  writeFile: write
}) {
  return {
    cp: copy ?? cp,
    mkdir: makeDirectory ?? mkdir,
    readFile: read ?? readFile,
    readdir: readDirectory ?? readdir,
    rm: remove ?? rm,
    writeFile: write ?? writeFile
  };
}
