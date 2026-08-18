import { spawn } from "node:child_process";
import { copyFile, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, isAbsolute, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

import {
  initializeGit,
  preflightGit,
  sanitizeGitEnvironment
} from "./git-setup.js";
import { cleanupFailedProject } from "./project-cleanup.js";
import { promptForProjectArguments } from "./interactive-wizard.js";
import { runInteractiveCommand } from "./interactive-command.js";
import { confirmInstallation, requirePython } from "./python-runtime.js";
import {
  DEFAULT_FEATURE_NAMES,
  normalizeFeatures,
  serializeFeatureData
} from "./feature-config.js";
import {
  nativeScaffoldDependencies,
  scaffoldNativeApps,
  validateAppName
} from "./native-scaffold.js";

export const DEFAULT_TEMPLATE_SOURCE =
  "git@github.com:gowebknot/monorepo-template.git";
export const DEFAULT_TEMPLATE_REF = "master";

const genericGitHubSshPrefix = "git@github.com:";
const requirementsPath = fileURLToPath(
  new URL("../requirements/copier.txt", import.meta.url)
);
const help = `Usage:
  create-mono-stack
  create-mono-stack <destination> [options]

Run without arguments in a terminal to open interactive setup.

Options:
  -n, --name <name>       Project display name (defaults to destination name)
      --git-host-alias <alias>
                          SSH host alias for github.com template access
      --python <path>     Python 3.10+ executable
       --template <source> Copier template Git URL or local path
       --vcs-ref <ref>     Copier template Git revision
       --features <ids>    Comma-separated stack feature IDs
                           (web-vite, api-nest, web-next, api-express,
                            mobile-expo, mobile-react-native)
       --app-name <feature>:<name>
                           Name a selected feature's app; repeatable
                           (e.g. --app-name web-next:next)
       --web-app-name <name>
                           Vite app name (default: web)
       --server-app-name <name>
                           NestJS app name (default: server)
  -h, --help              Show this help
`;

function commandError(command, stderr, signal, exitCode) {
  const detail = stderr.trim();
  const reason = signal ? ` terminated by ${signal}` : " failed";
  const error = new Error(`${command}${reason}${detail ? `: ${detail}` : ""}`);
  error.exitCode = exitCode;
  error.signal = signal;
  return error;
}

function runCommand(command, args, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const capture = options.capture === true;
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env
        ? options.replaceEnvironment
          ? options.env
          : { ...process.env, ...options.env }
        : undefined,
      stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit"
    });
    let stderr = "";
    let stdout = "";
    let settled = false;

    if (capture) {
      child.stdout.setEncoding("utf8");
      child.stderr.setEncoding("utf8");
      child.stdout.on("data", (chunk) => {
        stdout += chunk;
      });
      child.stderr.on("data", (chunk) => {
        stderr += chunk;
      });
    }

    child.once("error", (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    });
    child.once("close", (code, signal) => {
      if (settled) return;
      settled = true;
      if (code === 0) {
        resolvePromise({ stderr, stdout });
        return;
      }
      reject(commandError(command, stderr, signal, code));
    });
  });
}

const systemDependencies = {
  confirmMiseInstall: confirmInstallation,
  confirmPythonInstall: confirmInstallation,
  environment: process.env,
  isAdministrator: process.getuid?.() === 0,
  cp: undefined,
  copyFile,
  readFile: undefined,
  mkdtemp,
  platform: process.platform,
  readdir,
  rm,
  writeFile,
  runCommand,
  runInteractiveCommand,
  temporaryDirectory: tmpdir()
};

function validateGitHostAlias(alias) {
  if (
    alias !== undefined &&
    (alias.length > 255 || !/^[a-z\d][a-z\d._-]*$/i.test(alias))
  ) {
    throw new Error(`Not a valid SSH host alias: ${alias}`);
  }
  return alias;
}

function gitHostAliasEnvironment(alias, environment) {
  if (!alias) return undefined;
  const countValue = environment.GIT_CONFIG_COUNT ?? "0";
  if (!/^\d+$/.test(countValue)) {
    throw new Error("GIT_CONFIG_COUNT must be a non-negative integer.");
  }
  const index = Number(countValue);
  if (!Number.isSafeInteger(index)) {
    throw new Error("GIT_CONFIG_COUNT is too large.");
  }
  return {
    GIT_CONFIG_COUNT: String(index + 1),
    [`GIT_CONFIG_KEY_${index}`]: `url.git@${alias}:.insteadOf`,
    [`GIT_CONFIG_VALUE_${index}`]: genericGitHubSshPrefix
  };
}

function resolveTemplateSource(source, cwd) {
  if (!source) return DEFAULT_TEMPLATE_SOURCE;
  const hasProtocol = /^[a-z][a-z\d+.-]*:/i.test(source);
  const isScpStyleGitUrl = /^[^\s@]+@[^\s:]+:.+$/.test(source);
  return isAbsolute(source) || hasProtocol || isScpStyleGitUrl
    ? source
    : resolve(cwd, source);
}

async function ensureDestinationIsAvailable(destination, dependencies) {
  try {
    const entries = await dependencies.readdir(destination);
    if (entries.length > 0) {
      throw new Error(`Destination directory is not empty: ${destination}`);
    }
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

export function parseArguments(args, cwd = process.cwd()) {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    args,
    options: {
      help: { short: "h", type: "boolean" },
      "git-host-alias": { type: "string" },
      name: { short: "n", type: "string" },
      python: { type: "string" },
      template: { type: "string" },
      "vcs-ref": { type: "string" },
      features: { type: "string" },
      "app-name": { type: "string", multiple: true },
      "web-app-name": { type: "string" },
      "server-app-name": { type: "string" }
    },
    strict: true
  });

  if (values.help) return { help: true };
  if (positionals.length !== 1) {
    throw new Error(
      "Exactly one destination directory is required.\n\n" + help
    );
  }

  const destination = resolve(cwd, positionals[0]);
  const projectName = values.name ?? basename(destination);
  if (!projectName.trim()) throw new Error("Project name must not be empty.");

  const appNames = values["app-name"]?.reduce((result, value) => {
    const separator = value.indexOf(":");
    if (separator <= 0) throw new Error(`Invalid app name mapping: ${value}`);
    const featureId = value.slice(0, separator);
    result[featureId] = validateAppName(value.slice(separator + 1));
    return result;
  }, {});

  return {
    destination,
    gitHostAlias: validateGitHostAlias(values["git-host-alias"]),
    projectName,
    python: values.python,
    template: resolveTemplateSource(values.template, cwd),
    vcsRef: values["vcs-ref"],
    ...(values.features === undefined
      ? {}
      : { features: normalizeFeatures(values.features) }),
    ...(values["web-app-name"] === undefined
      ? {}
      : {
          webAppName: validateAppName(values["web-app-name"])
        }),
    ...(values["server-app-name"] === undefined
      ? {}
      : {
          serverAppName: validateAppName(values["server-app-name"])
        }),
    ...(appNames ? { appNames } : {})
  };
}

export async function createProject(
  options,
  dependencies = systemDependencies
) {
  const features = normalizeFeatures(options.features);
  const appNames = Object.fromEntries(
    features.map((feature) => [
      feature,
      options.appNames?.[feature] ??
        (feature === "web-vite" ? options.webAppName : undefined) ??
        (feature === "api-nest" ? options.serverAppName : undefined) ??
        DEFAULT_FEATURE_NAMES[feature]
    ])
  );
  const scaffoldOptions = { ...options, appNames, features };
  const destinationExisted = await ensureDestinationIsAvailable(
    options.destination,
    dependencies
  );
  await preflightGit(dependencies);
  const python = await requirePython(options.python, dependencies);
  const temporaryRoot = await dependencies.mkdtemp(
    join(dependencies.temporaryDirectory, "create-mono-stack-")
  );

  try {
    const virtualEnvironment = join(temporaryRoot, "venv");
    const virtualPython = join(
      virtualEnvironment,
      dependencies.platform === "win32" ? "Scripts/python.exe" : "bin/python"
    );
    await dependencies.runCommand(python.command, [
      ...python.prefixArgs,
      "-m",
      python.venvModule,
      virtualEnvironment
    ]);
    await dependencies.runCommand(virtualPython, [
      "-m",
      "pip",
      "install",
      "--disable-pip-version-check",
      "--no-input",
      "--requirement",
      requirementsPath
    ]);

    const copierArguments = [
      "-m",
      "copier",
      "copy",
      "--defaults",
      "--quiet",
      "--data",
      `project_name=${options.projectName}`
    ];
    if (options.features !== undefined) {
      for (const data of serializeFeatureData(options.features)) {
        copierArguments.push("--data", data);
      }
    }
    copierArguments.push("--vcs-ref", options.vcsRef ?? DEFAULT_TEMPLATE_REF);
    copierArguments.push(options.template, options.destination);
    const environment = sanitizeGitEnvironment(dependencies.environment);
    const aliasEnvironment = gitHostAliasEnvironment(
      options.gitHostAlias,
      environment
    );
    await dependencies.runCommand(virtualPython, copierArguments, {
      env: aliasEnvironment
        ? { ...environment, ...aliasEnvironment }
        : environment,
      replaceEnvironment: true
    });

    const environmentExample = join(options.destination, ".env.example");
    const environmentFile = join(options.destination, ".env");
    try {
      await (dependencies.copyFile ?? copyFile)(
        environmentExample,
        environmentFile
      );
    } catch (error) {
      if (error?.code === "ENOENT") {
        throw new Error(
          `The custom template must provide .env.example at ${environmentExample} before project setup can continue.`,
          { cause: error }
        );
      }
      throw new Error(
        `Unable to create the local environment file at ${environmentFile}.`,
        { cause: error }
      );
    }

    const scaffold = dependencies.scaffoldNativeApps ?? scaffoldNativeApps;
    const nativeApps = await scaffold(scaffoldOptions, {
      ...nativeScaffoldDependencies({
        cp: dependencies.cp,
        readFile: dependencies.readFile,
        rm: dependencies.rm,
        writeFile: dependencies.writeFile
      }),
      runCommand: dependencies.runCommand,
      runInteractiveCommand: dependencies.runInteractiveCommand,
      temporaryRoot
    });

    await dependencies.writeFile(
      join(options.destination, ".mono-stack.json"),
      `${JSON.stringify(
        { schemaVersion: 3, features, apps: nativeApps },
        null,
        2
      )}\n`
    );

    await dependencies.runCommand("pnpm", ["install", "--lockfile-only"], {
      cwd: options.destination
    });

    const projectVirtualEnvironment = join(options.destination, ".venv");
    const projectPython = join(
      projectVirtualEnvironment,
      dependencies.platform === "win32" ? "Scripts/python.exe" : "bin/python"
    );
    await dependencies.runCommand(python.command, [
      ...python.prefixArgs,
      "-m",
      python.venvModule,
      projectVirtualEnvironment
    ]);
    await dependencies.runCommand(projectPython, [
      "-m",
      "pip",
      "install",
      "--disable-pip-version-check",
      "--no-input",
      "--requirement",
      requirementsPath
    ]);
    await initializeGit(
      options.destination,
      dependencies,
      options.gitHostAlias
    );
    scaffoldOptions.generatedStack = { apps: nativeApps, features };
  } catch (setupError) {
    await cleanupFailedProject(
      {
        destination: options.destination,
        destinationExisted,
        setupError,
        temporaryRoot
      },
      dependencies
    );
  }
  await dependencies.rm(temporaryRoot, { force: true, recursive: true });
  return scaffoldOptions.generatedStack;
}

export async function main(args = process.argv.slice(2), dependencies = {}) {
  const input = dependencies.input ?? process.stdin;
  const output = dependencies.output ?? process.stdout;
  const log = dependencies.log ?? console.log;
  let effectiveArgs = args;

  if (effectiveArgs.length === 0 && input.isTTY && output.isTTY) {
    const openWizard =
      dependencies.promptForProjectArguments ?? promptForProjectArguments;
    effectiveArgs = await openWizard({ input, output });
    if (!effectiveArgs) {
      log("Project setup cancelled.");
      return;
    }
  }

  const options = parseArguments(
    effectiveArgs,
    dependencies.cwd ?? process.cwd()
  );
  if (options.help) {
    log(help);
    return;
  }
  const setupProject = dependencies.createProject ?? createProject;
  const generatedStack = await setupProject(options);
  const unsupportedViteApps = generatedStack?.apps?.filter(
    (app) => app.generator === "vite" && app.referenceProfile === null
  );
  const referenceNotice = unsupportedViteApps?.length
    ? `\n\n${unsupportedViteApps
        .map(
          ({ name }) =>
            `Web reference mode was skipped for ${name} because only Vite React TypeScript is supported.`
        )
        .join("\n")}`
    : "";
  log(
    `Project setup complete. Native app scaffolding, dependencies, and Git initialization finished.${referenceNotice}

What's next:
  cd ${options.destination}
  pnpm install
  git add .
  git commit -m "chore: initialize project"
  pnpm dev

Git is initialized on main; create the initial commit before template updates.`
  );
}
