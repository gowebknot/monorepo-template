import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const skillTriggersPath = join(".claude", "skill-triggers.json");

const frontendFeatures = new Set([
  "web-vite",
  "web-next",
  "mobile-expo",
  "mobile-react-native"
]);

const backendFeatures = new Set(["api-nest", "api-express"]);

function appSkills(feature) {
  if (frontendFeatures.has(feature)) {
    return ["frontend-standards", "aspiron-source-architecture"];
  }
  if (backendFeatures.has(feature)) {
    return ["backend-standards", "aspiron-source-architecture"];
  }
  return [];
}

export function buildAppTriggerRules(apps) {
  const rules = [];
  const paths = new Set();

  for (const app of apps) {
    const skills = appSkills(app.feature);
    if (skills.length === 0 || paths.has(app.path)) continue;
    paths.add(app.path);
    rules.push({ when: [`${app.path}/**`], require: skills });
  }

  return rules;
}

export async function syncSkillTriggers(
  projectRoot,
  apps,
  { read = readFile, write = writeFile } = {}
) {
  const path = join(projectRoot, skillTriggersPath);
  let triggers;
  try {
    triggers = JSON.parse(await read(path, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }
  const rules = (triggers.rules ?? []).filter(
    (rule) =>
      !rule.require?.includes("frontend-standards") &&
      !rule.require?.includes("backend-standards") &&
      !rule.require?.includes("aspiron-source-architecture")
  );

  await write(
    path,
    `${JSON.stringify(
      { ...triggers, rules: [...rules, ...buildAppTriggerRules(apps)] },
      null,
      2
    )}\n`
  );
}
