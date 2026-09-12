import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { findAppByFeature } from "#scripts/stack-app-lookup.mjs";

const routeDecorators = new Set([
  "All",
  "Delete",
  "Get",
  "Head",
  "Options",
  "Patch",
  "Post",
  "Put"
]);

function decoratorNames(line) {
  return [...line.matchAll(/@(\w+)/g)].map((match) => match[1]);
}

export function validateControllerSource(source, filePath) {
  const errors = [];
  const lines = source.split("\n");
  let controllerName = "UnknownController";
  let decorators = [];

  for (const line of lines) {
    const controller = line.match(/export class (\w+Controller)\b/);
    if (controller) controllerName = controller[1];

    const names = decoratorNames(line);
    if (names.length > 0) {
      decorators.push(...names);
      continue;
    }

    const method = line.match(/^\s*(\w+)\s*\(/);
    if (!method) continue;

    if (decorators.some((decorator) => routeDecorators.has(decorator))) {
      const prefix = `${filePath}: ${controllerName}.${method[1]}`;
      if (!decorators.includes("ApiOperation")) {
        errors.push(`${prefix} is missing @ApiOperation`);
      }
      if (
        !decorators.some(
          (decorator) =>
            decorator.startsWith("Api") && decorator.endsWith("Response")
        )
      ) {
        errors.push(`${prefix} is missing @ApiResponse`);
      }
    }

    decorators = [];
  }

  return { errors };
}

async function findControllerFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return findControllerFiles(path);
      return entry.name.endsWith(".controller.ts") ? [path] : [];
    })
  );
  return files.flat();
}

export async function validateSwaggerDocumentation(
  root,
  { serverAppPath = "apps/server" } = {}
) {
  const files = await findControllerFiles(join(root, serverAppPath, "src"));
  const results = await Promise.all(
    files.map(async (file) =>
      validateControllerSource(
        await readFile(file, "utf8"),
        relative(root, file)
      )
    )
  );
  return results.flatMap(({ errors }) => errors);
}

async function main() {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const serverApp = findAppByFeature(root, ["api-nest", "api-express"]);
  const errors = await validateSwaggerDocumentation(root, {
    serverAppPath: serverApp?.path ?? "apps/server"
  });
  if (errors.length > 0) {
    console.error("Swagger documentation convention failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
