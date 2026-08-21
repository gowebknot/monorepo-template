import { createServer } from "node:net";
import { readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

export const PORT_MODES = ["dev", "reference"];
export const STACK_CONFIG_FILENAME = ".mono-stack.json";

const BASE_PORTS = {
  dev: {
    expo: 8081,
    next: 3000,
    nestjs: 3000,
    "react-native": 8082,
    vite: 5173
  },
  reference: {
    expo: 8081,
    next: 3000,
    nestjs: 3001,
    "react-native": 8082,
    vite: 5173
  }
};

function defaultPort(generator, mode) {
  return BASE_PORTS[mode][generator] ?? 3000;
}

export function isPortAvailable(port, host = "0.0.0.0") {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", () => resolve(false));
    server.listen({ host, port }, () => {
      server.close(() => resolve(true));
    });
  });
}

export async function allocateAppPorts(
  apps,
  { checkPort = isPortAvailable } = {}
) {
  const used = new Map(PORT_MODES.map((mode) => [mode, new Set()]));
  const result = [];

  for (const app of apps) {
    const ports = { ...app.ports };
    for (const mode of PORT_MODES) {
      const existing = ports[mode];
      if (
        Number.isInteger(existing) &&
        existing > 0 &&
        !used.get(mode).has(existing) &&
        (await checkPort(existing))
      ) {
        used.get(mode).add(existing);
        continue;
      }

      let candidate =
        Number.isInteger(existing) && existing > 0
          ? existing
          : defaultPort(app.generator, mode);
      while (used.get(mode).has(candidate) || !(await checkPort(candidate))) {
        candidate += 1;
      }
      ports[mode] = candidate;
      used.get(mode).add(candidate);
    }
    result.push({ ...app, ports });
  }

  return result;
}

export async function configureAppScripts(
  projectRoot,
  apps,
  { read = readFile, write = writeFile } = {}
) {
  for (const app of apps) {
    const packagePath = join(projectRoot, app.path, "package.json");
    let packageJson;
    try {
      packageJson = JSON.parse(await read(packagePath, "utf8"));
    } catch (error) {
      if (error?.code === "ENOENT") continue;
      throw error;
    }
    const next = {
      ...packageJson,
      scripts: {
        ...packageJson.scripts,
        dev: "node ../../scripts/run-app.mjs dev",
        "dev:reference": "node ../../scripts/run-app.mjs reference"
      }
    };
    const contents = `${JSON.stringify(next, null, 2)}\n`;
    if (contents !== `${JSON.stringify(packageJson, null, 2)}\n`) {
      await write(packagePath, contents);
    }
  }
}

export async function ensureProjectPorts(
  projectRoot,
  { read = readFile, write = writeFile, checkPort = isPortAvailable } = {}
) {
  const manifestPath = join(projectRoot, STACK_CONFIG_FILENAME);
  const manifest = JSON.parse(await read(manifestPath, "utf8"));
  const apps = await allocateAppPorts(manifest.apps, { checkPort });
  const next = { ...manifest, apps };
  const changed = JSON.stringify(next) !== JSON.stringify(manifest);
  if (changed) await write(manifestPath, `${JSON.stringify(next, null, 2)}\n`);
  await configureAppScripts(projectRoot, apps, { read, write });
  return next;
}

if (process.argv[1] && basename(process.argv[1]) === "dev-ports.mjs") {
  try {
    await ensureProjectPorts(process.cwd());
  } catch (error) {
    if (error?.code === "ENOENT") process.exit(0);
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
