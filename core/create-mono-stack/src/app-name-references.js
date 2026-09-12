import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { DEFAULT_FEATURE_NAMES } from "#src/feature-config.js";

const referenceFileNames = ["AGENTS.md", "CLAUDE.md", "README.md"];

async function rewriteAppFile(path, canonicalName, realName, { read, write }) {
  let contents;
  try {
    contents = await read(path, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }

  const pattern = new RegExp(`--filter ${canonicalName}\\b`, "g");
  const rewritten = contents.replace(pattern, `--filter ${realName}`);
  if (rewritten !== contents) await write(path, rewritten);
}

export async function syncAppNameReferences(
  projectRoot,
  apps,
  { read = readFile, write = writeFile } = {}
) {
  for (const app of apps) {
    const canonicalName = DEFAULT_FEATURE_NAMES[app.feature];
    if (!canonicalName || app.name === canonicalName) continue;

    for (const fileName of referenceFileNames) {
      const path = join(projectRoot, app.path, fileName);
      await rewriteAppFile(path, canonicalName, app.name, { read, write });
    }
  }
}
