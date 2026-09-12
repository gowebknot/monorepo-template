import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  readStackConfig,
  STACK_CONFIG_FILENAME
} from "#scripts/stack-config.mjs";

export function findAppByFeature(
  cwd,
  features,
  { exists = existsSync, read = readFileSync } = {}
) {
  if (!exists(join(cwd, STACK_CONFIG_FILENAME))) return null;
  const manifest = readStackConfig(cwd, read);
  return manifest.apps.find((app) => features.includes(app.feature)) ?? null;
}
