import { readFileSync } from "node:fs";
import { join } from "node:path";

export const STACK_CONFIG_FILENAME = ".mono-stack.json";

const stackFeatureIds = [
  "web-vite",
  "web-next",
  "api-nest",
  "api-express",
  "mobile-expo",
  "mobile-react-native"
];
const stackFeatureIdSet = new Set(stackFeatureIds);
const appDefinitions = {
  "api-nest": { generator: "nestjs", profiles: ["nestjs/default"] },
  "mobile-expo": { generator: "expo", profiles: ["expo/default"] },
  "mobile-react-native": {
    generator: "react-native",
    profiles: ["react-native/default"]
  },
  "web-next": { generator: "next", profiles: ["next/default"] },
  "web-vite": {
    generator: "vite",
    profiles: [
      null,
      "vite/react-ts",
      "vite/react-router-v7",
      "vite/tanstack-router",
      "vite/redwood-sdk",
      "vite/vike"
    ]
  }
};
const knownProfiles = new Set(
  Object.values(appDefinitions).flatMap(({ profiles }) =>
    profiles.filter((profile) => profile !== null)
  )
);

function invalid(message) {
  throw new Error(`Stack configuration is invalid: ${message}.`);
}

function validateFeatures(features) {
  if (!Array.isArray(features)) invalid("features must be an array");
  if (
    features.length === 0 ||
    features.some(
      (feature) =>
        typeof feature !== "string" || !stackFeatureIdSet.has(feature)
    )
  ) {
    invalid("features must contain known non-empty feature IDs");
  }
  if (new Set(features).size !== features.length) {
    invalid("features must not contain duplicates");
  }
}

function validateAppName(name) {
  if (typeof name !== "string" || !/^[a-z0-9][a-z0-9-]*$/i.test(name)) {
    invalid("invalid app name");
  }
}

function validateViteSelection(selection) {
  if (selection === undefined) return;
  if (!selection || typeof selection !== "object" || Array.isArray(selection)) {
    invalid("Vite selection must be an object");
  }
  if (
    typeof selection.framework !== "string" ||
    !selection.framework.trim() ||
    typeof selection.variant !== "string" ||
    !selection.variant.trim()
  ) {
    invalid("Vite selection must contain framework and variant strings");
  }
  if (
    selection.linter !== undefined &&
    (typeof selection.linter !== "string" || !selection.linter.trim())
  ) {
    invalid("Vite selection linter must be a non-empty string");
  }
}

function validateApp(app, selectedFeatures) {
  if (!app || typeof app !== "object" || Array.isArray(app)) {
    invalid("app records must be objects");
  }
  if (typeof app.feature !== "string" || !appDefinitions[app.feature]) {
    invalid("app feature must be a known app feature");
  }
  if (!selectedFeatures.has(app.feature)) {
    invalid(`app feature is not selected: ${app.feature}`);
  }
  validateAppName(app.name);
  if (app.generator !== appDefinitions[app.feature].generator) {
    invalid(
      `generator must be ${appDefinitions[app.feature].generator} for ${app.feature}`
    );
  }
  const definition = appDefinitions[app.feature];
  if (app.path !== `apps/${app.name}`) {
    invalid(`path must equal apps/${app.name}`);
  }
  if (
    app.referenceProfile !== null &&
    typeof app.referenceProfile !== "string"
  ) {
    invalid("referenceProfile must be a string or null");
  }
  if (
    typeof app.referenceProfile === "string" &&
    !knownProfiles.has(app.referenceProfile)
  ) {
    invalid(`unknown referenceProfile: ${app.referenceProfile}`);
  }
  if (!definition.profiles.includes(app.referenceProfile)) {
    invalid(`referenceProfile is incompatible with ${app.feature}`);
  }
  if (app.generator === "vite") validateViteSelection(app.selection);
}

export function readStackConfig(cwd, readFile = readFileSync) {
  const path = join(cwd, STACK_CONFIG_FILENAME);
  let value;
  try {
    value = JSON.parse(readFile(path, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error(
        `Stack configuration is missing at ${path}. Recreate the project manifest before running a template update.`,
        { cause: error }
      );
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Stack configuration is not valid JSON: ${path}.`, {
        cause: error
      });
    }
    throw error;
  }

  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    value.schemaVersion !== 3
  ) {
    invalid("manifest must be a schemaVersion 3 object");
  }
  validateFeatures(value.features);
  if (!Array.isArray(value.apps)) invalid("apps must be an array");

  const selectedFeatures = new Set(value.features);
  for (const app of value.apps) validateApp(app, selectedFeatures);

  const appFeatures = value.apps.map(({ feature }) => feature);
  const appNames = value.apps.map(({ name }) => name);
  const duplicateName = appNames.find(
    (name, index) => appNames.indexOf(name) !== index
  );
  if (duplicateName) invalid(`duplicate app name: ${duplicateName}`);
  for (const feature of selectedFeatures) {
    if (appDefinitions[feature] && !appFeatures.includes(feature)) {
      invalid(`missing app metadata for selected feature: ${feature}`);
    }
  }

  return value;
}
