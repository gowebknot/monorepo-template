import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([".git", ".venv", "dist", "node_modules"]);
const textExtensions = new Set([
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

const packageJson = JSON.parse(
  await readFile(join(root, "package.json"), "utf8")
);
const scope = packageJson.name;
if (!/^([a-z0-9][a-z0-9.-]*)$/.test(scope)) {
  throw new Error(
    "Generated project package name must be a valid npm scope name"
  );
}

async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await visit(path);
      continue;
    }
    if (
      !textExtensions.has(
        entry.name.includes(".") ? `.${entry.name.split(".").pop()}` : ""
      )
    ) {
      continue;
    }
    const contents = await readFile(path, "utf8");
    const rendered = contents.replaceAll("@monorepo-template/", `@${scope}/`);
    if (rendered !== contents) await writeFile(path, rendered);
  }
}

await visit(root);
