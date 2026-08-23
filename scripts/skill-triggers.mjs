import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const skillTriggersPath = join(".claude", "skill-triggers.json");

const frontendFeatures = new Set([
  "web-vite",
  "web-next",
  "mobile-expo",
  "mobile-react-native"
]);

const backendFeatures = new Set(["api-nest", "api-express"]);

function appSkill(feature) {
  if (frontendFeatures.has(feature)) return "frontend-standards";
  if (backendFeatures.has(feature)) return "backend-standards";
  return undefined;
}

export function buildAppTriggerRules(apps) {
  const rules = [];
  const paths = new Set();

  for (const app of apps) {
    const skill = appSkill(app.feature);
    if (!skill || paths.has(app.path)) continue;
    paths.add(app.path);
    rules.push({ when: [`${app.path}/**`], require: [skill] });
  }

  return rules;
}

export function synchronizeSkillTriggers(projectRoot, apps, dependencies = {}) {
  const read = dependencies.read ?? readFileSync;
  const write = dependencies.write ?? writeFileSync;
  const path = join(projectRoot, skillTriggersPath);
  let triggers;
  try {
    triggers = JSON.parse(read(path, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }
  const rules = (triggers.rules ?? []).filter(
    (rule) =>
      !rule.require?.includes("frontend-standards") &&
      !rule.require?.includes("backend-standards")
  );

  write(
    path,
    `${JSON.stringify(
      { ...triggers, rules: [...rules, ...buildAppTriggerRules(apps)] },
      null,
      2
    )}\n`
  );
}
