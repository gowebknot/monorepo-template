import { basename, join } from "node:path";
import { readFile, readdir, writeFile } from "node:fs/promises";

import { hashTree } from "#scripts/skills-hash.mjs";

const skillsManifestFile = ".skills-sync.json";
const skillsRootDirectory = "skills";
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
  await recomputeSkillsManifest(root);
  return scope;
}

// The scope substitution above rewrites illustrative `@monorepo-template/<name>` examples inside
// this repository's own shipped skill docs (create-minimal-package, end-to-end-api-flow,
// frontend-standards, jsx-component-extraction all reference the pattern), which changes those
// skills' on-disk content without updating the recorded manifest hash from .skills-sync.json's
// authoring-time value. Recompute it here so the mandatory skills:check step passes on a
// generated project's very first commit instead of failing on stale hashes.
async function recomputeSkillsManifest(root) {
  const manifestPath = join(root, skillsManifestFile);
  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }

  for (const name of Object.keys(manifest.skills)) {
    manifest.skills[name] = {
      hash: await hashTree(join(root, skillsRootDirectory, name))
    };
  }

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

if (
  process.argv[1] &&
  basename(process.argv[1]) === "render-package-scope.mjs"
) {
  await renderPackageScope(process.cwd());
}
