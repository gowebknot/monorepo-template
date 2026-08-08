import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const coreRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

test("gives every core package package-local agent guidance", async () => {
  const packageDirectories = [];

  for (const entry of await readdir(coreRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const packageRoot = join(coreRoot, entry.name);
    const manifest = await readFile(
      join(packageRoot, "package.json"),
      "utf8"
    ).catch(() => undefined);
    if (manifest) packageDirectories.push(packageRoot);
  }

  assert.ok(packageDirectories.length > 0);
  for (const packageRoot of packageDirectories) {
    await access(join(packageRoot, "AGENTS.md"));
  }
});
