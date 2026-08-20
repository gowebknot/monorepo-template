import { createServer } from "node:net";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const PORT_MODES = ["dev", "reference"];

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

export function isPortAvailable(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const server = createServer();
    const finish = (available) => {
      server.close(() => resolve(available));
    };
    server.once("error", () => resolve(false));
    server.listen({ host, port }, () => finish(true));
  });
}

export async function allocateAppPorts(
  apps,
  { checkPort = isPortAvailable } = {}
) {
  const used = new Map(PORT_MODES.map((mode) => [mode, new Set()]));
  const allocated = [];

  for (const app of apps) {
    const ports = { ...app.ports };
    for (const mode of PORT_MODES) {
      const existing = ports[mode];
      if (
        Number.isInteger(existing) &&
        existing > 0 &&
        !used.get(mode).has(existing)
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
    allocated.push({ ...app, ports });
  }

  return allocated;
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
    packageJson.scripts = {
      ...packageJson.scripts,
      dev: "node ../../scripts/run-app.mjs dev",
      "dev:reference": "node ../../scripts/run-app.mjs reference"
    };
    await write(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
  }
}
