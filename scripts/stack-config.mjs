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
  "web-vite": {
    generator: "vite",
    profiles: [null, "vite/react-ts"]
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

function validateApp(app, selectedFeatures) {
  if (!app || typeof app !== "object" || Array.isArray(app)) {
    invalid("app records must be objects");
  }
  if (typeof app.feature !== "string" || !appDefinitions[app.feature]) {
    invalid("app feature must be web-vite or api-nest");
  }
  if (!selectedFeatures.has(app.feature)) {
    invalid(`app feature is not selected: ${app.feature}`);
  }
  validateAppName(app.name);
  if (app.generator !== "vite" && app.generator !== "nestjs") {
    invalid("generator must be vite or nestjs");
  }
  const definition = appDefinitions[app.feature];
  if (app.generator !== definition.generator) {
    invalid(`generator must be ${definition.generator} for ${app.feature}`);
  }
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
  const duplicateFeature = appFeatures.find(
    (feature, index) => appFeatures.indexOf(feature) !== index
  );
  if (duplicateFeature) invalid(`duplicate app feature: ${duplicateFeature}`);
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
