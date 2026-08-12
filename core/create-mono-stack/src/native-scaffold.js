import { cp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";

const appDefinitions = [
  {
    generator: "vite",
    id: "web-vite",
    nameKey: "webAppName",
    path: "apps"
  },
  {
    generator: "nestjs",
    id: "api-nest",
    nameKey: "serverAppName",
    path: "apps"
  }
];

function appPath(root, name) {
  return join(root, "apps", name);
}

function commandFor(generator, target) {
  return generator === "vite"
    ? ["pnpm", ["create", "vite", target]]
    : [
        "pnpm",
        [
          "dlx",
          "@nestjs/cli",
          "new",
          target,
          "--skip-git",
          "--package-manager",
          "pnpm"
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

export async function scaffoldNativeApps(options, dependencies) {
  const selected = new Set(options.features ?? []);
  const apps = [];
  const selectedDefinitions = new Set(
    appDefinitions.filter(({ id }) => selected.has(id)).map(({ path }) => path)
  );
  for (const definition of appDefinitions) {
    if (selectedDefinitions.has(definition.path)) continue;
    await dependencies.rm(
      join(
        options.destination,
        definition.path,
        definition.id === "web-vite" ? "web" : "server"
      ),
      {
        force: true,
        recursive: true
      }
    );
  }
  for (const definition of appDefinitions) {
    if (!selected.has(definition.id)) continue;
    const name = validateAppName(
      options.appNames?.[definition.id] ?? options[definition.nameKey]
    );
    const target = appPath(options.destination, name);
    const temporaryTarget = join(
      dependencies.temporaryRoot,
      `${definition.generator}-${name}`
    );
    const [command, args] = commandFor(definition.generator, temporaryTarget);
    await dependencies.runCommand(command, args, {
      cwd: options.destination,
      stdio: "inherit"
    });
    const packageJson = JSON.parse(
      await dependencies.readFile(join(temporaryTarget, "package.json"), "utf8")
    );
    if (definition.id === "web-vite" && name !== "web") {
      await dependencies.rm(join(options.destination, "apps", "web"), {
        force: true,
        recursive: true
      });
    }
    if (definition.id === "api-nest" && name !== "server") {
      await dependencies.rm(join(options.destination, "apps", "server"), {
        force: true,
        recursive: true
      });
    }
    await dependencies.rm(target, { force: true, recursive: true });
    await dependencies.cp(temporaryTarget, target, { recursive: true });
    apps.push({
      generator: definition.generator,
      name,
      packageName: packageJson.name,
      path: `apps/${name}`,
      reference: definition.id === "web-vite" ? "vite-react" : "nestjs"
    });
  }
  return apps;
}

export function nativeScaffoldDependencies({
  cp: copy,
  readFile: read,
  rm: remove
}) {
  return {
    cp: copy ?? cp,
    readFile: read ?? readFile,
    rm: remove ?? rm
  };
}
