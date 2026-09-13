import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

export async function collectFiles(path, prefix = "") {
  const files = [];
  for (const entry of (await readdir(path, { withFileTypes: true })).sort(
    (left, right) => left.name.localeCompare(right.name)
  )) {
    const entryPath = join(path, entry.name);
    const entryPrefix = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) {
      throw new Error(
        `Symlinks are not allowed in portable skills: ${entryPath}`
      );
    }
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath, entryPrefix)));
    } else if (entry.isFile()) {
      files.push({
        path: entryPrefix,
        content: await readFile(entryPath)
      });
    }
  }
  return files;
}

export async function hashTree(path) {
  const hash = createHash("sha256");
  for (const file of await collectFiles(path)) {
    hash.update(file.path);
    hash.update("\0");
    hash.update(file.content);
    hash.update("\0");
  }
  return hash.digest("hex");
}
