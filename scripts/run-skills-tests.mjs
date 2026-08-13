import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";

const files = readdirSync(new URL(".", import.meta.url))
  .filter((name) => name.endsWith(".test.mjs"))
  .sort()
  .map((name) => `scripts/${name}`);
const result = spawnSync(process.execPath, ["--test", ...files], {
  cwd: new URL("..", import.meta.url),
  stdio: "inherit"
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
