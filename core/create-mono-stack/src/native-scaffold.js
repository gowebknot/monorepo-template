import { cp, readFile, rm, writeFile } from "node:fs/promises";
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
    const temporaryName = temporaryAppName(definition.generator, name);
    const temporaryTarget = join(dependencies.temporaryRoot, temporaryName);
    const preservedReference = join(
      dependencies.temporaryRoot,
      `${temporaryName}-reference`
    );
    if (definition.id === "api-nest") {
      await dependencies.cp(
        join(options.destination, "apps", "server", "reference"),
        join(preservedReference, "reference"),
        { recursive: true }
      );
      await dependencies.cp(
        join(options.destination, "apps", "server", "nest-cli.reference.json"),
        join(preservedReference, "nest-cli.reference.json")
      );
    }
    const [command, args] = commandFor(definition.generator, temporaryName);
    await dependencies.runCommand(command, args, {
      cwd: dependencies.temporaryRoot,
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
    if (definition.id === "api-nest") {
      packageJson.devDependencies ??= {};
      packageJson.scripts ??= {};
      packageJson.devDependencies.typescript = "6.0.2";
      packageJson.scripts["build:reference"] =
        "nest build --config nest-cli.reference.json";
      packageJson.scripts["dev:reference"] =
        "nest start --config nest-cli.reference.json --watch";
      packageJson.scripts["start:reference"] = "node dist/reference/main";
      await dependencies.writeFile(
        join(target, "package.json"),
        `${JSON.stringify(packageJson, null, 2)}\n`
      );
      const tsconfig = JSON.parse(
        await dependencies.readFile(join(target, "tsconfig.json"), "utf8")
      );
      tsconfig.compilerOptions.rootDir = "./src";
      tsconfig.compilerOptions.types = ["node"];
      tsconfig.compilerOptions.ignoreDeprecations = "6.0";
      delete tsconfig.compilerOptions.baseUrl;
      await dependencies.writeFile(
        join(target, "tsconfig.json"),
        `${JSON.stringify(tsconfig, null, 2)}\n`
      );
      await dependencies.cp(
        join(preservedReference, "reference"),
        join(target, "reference"),
        {
          recursive: true
        }
      );
      await dependencies.cp(
        join(preservedReference, "nest-cli.reference.json"),
        join(target, "nest-cli.reference.json")
      );
      await dependencies.writeFile(
        join(target, "tsconfig.reference.build.json"),
        JSON.stringify(
          {
            extends: "./tsconfig.json",
            compilerOptions: { rootDir: "./reference" },
            include: ["reference/**/*.ts"],
            exclude: ["node_modules", "dist"]
          },
          null,
          2
        ) + "\n"
      );
    }
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
