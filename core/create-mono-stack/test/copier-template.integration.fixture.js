import { cp, mkdir, readdir, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

export async function copyTemplateFixture({ root, templateRoot }) {
  const excludedDirectories = new Set([
    ".git",
    ".npmrc",
    ".npmrc.auth",
    ".tmp",
    ".turbo",
    ".venv",
    "dist",
    "node_modules"
  ]);
  await mkdir(templateRoot);
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (excludedDirectories.has(entry.name)) continue;
    await cp(join(root, entry.name), join(templateRoot, entry.name), {
      recursive: true,
      filter(source) {
        const path = relative(root, source);
        const parts = path.split(sep);
        if (parts.some((part) => excludedDirectories.has(part))) return false;
        if (path.endsWith("routeTree.gen.ts")) return false;
        return !path.startsWith(join(".claude", "worktrees"));
      }
    });
  }
  await mkdir(join(templateRoot, ".github/workflows"), { recursive: true });
  await writeFile(
    join(templateRoot, ".github/workflows/template-check.yml"),
    "name: Template check\n"
  );
}
