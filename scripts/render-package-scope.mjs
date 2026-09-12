import { basename, join } from "node:path";
import { readFile, readdir, writeFile } from "node:fs/promises";

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
const bareTemplateNamePattern = /"monorepo-template(?=["/])/g;

export function renderFileContents(contents, scope) {
  return contents
    .replaceAll("@monorepo-template/", `@${scope}/`)
    .replace(bareTemplateNamePattern, `"${scope}`);
}

export async function renderPackageScope(root) {
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
      const rendered = renderFileContents(contents, scope);
      if (rendered !== contents) await writeFile(path, rendered);
    }
  }

  await visit(root);
  return scope;
}

if (
  process.argv[1] &&
  basename(process.argv[1]) === "render-package-scope.mjs"
) {
  await renderPackageScope(process.cwd());
}
