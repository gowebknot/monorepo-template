import { readFile, readdir, rm } from "node:fs/promises";
import { join } from "node:path";

import {
  invalid,
  projectPath,
  runProjectCommand,
  validateName
} from "./project-management-runtime.js";

export const TEMPLATE_OWNED_PACKAGE_NAMES = new Set([
  "api-client",
  "config",
  "db",
  "entities",
  "env",
  "query-client"
]);

async function install(cwd, runCommand) {
  await runCommand("pnpm", ["install"], { cwd });
}

export async function listUserPackages(
  cwd,
  { readDirectory = readdir, read = readFile } = {}
) {
  const packageRoot = projectPath(cwd, "packages");
  let entries;
  try {
    entries = await readDirectory(packageRoot, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  const packages = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || TEMPLATE_OWNED_PACKAGE_NAMES.has(entry.name)) {
      continue;
    }
    try {
      const packageJson = JSON.parse(
        await read(join(packageRoot, entry.name, "package.json"), "utf8")
      );
      packages.push({
        name: entry.name,
        packageName: packageJson.name,
        path: `packages/${entry.name}`
      });
    } catch (error) {
      if (error.code !== "ENOENT" && !(error instanceof SyntaxError))
        throw error;
    }
  }
  return packages.sort((left, right) => left.name.localeCompare(right.name));
}

export async function addPackage(
  cwd,
  name,
  { runCommand = runProjectCommand } = {}
) {
  validateName(name, "package name");
  if (TEMPLATE_OWNED_PACKAGE_NAMES.has(name)) {
    invalid(`template-owned package cannot be added or replaced: ${name}`);
  }
  await runCommand("pnpm", ["package:create", name], { cwd });
  await install(cwd, runCommand);
  return { name, path: `packages/${name}` };
}

export async function removePackage(
  cwd,
  name,
  { confirmed, remove = rm, runCommand = runProjectCommand } = {}
) {
  validateName(name, "package name");
  if (TEMPLATE_OWNED_PACKAGE_NAMES.has(name)) {
    invalid(`template-owned package cannot be removed: ${name}`);
  }
  if (!confirmed) return false;
  await remove(projectPath(cwd, `packages/${name}`), {
    force: true,
    recursive: true
  });
  await install(cwd, runCommand);
  return true;
}
