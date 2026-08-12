export const FEATURE_DEFINITIONS = [
  { id: "web-vite", label: "Vite web app", default: true },
  { id: "web-next", label: "Next.js web app", default: false },
  { id: "api-nest", label: "NestJS API", default: true },
  { id: "api-express", label: "Express API", default: false },
  { id: "mobile-expo", label: "Expo React Native app", default: false },
  {
    id: "mobile-react-native",
    label: "Bare React Native app",
    default: false
  }
];

const featureIds = new Set(FEATURE_DEFINITIONS.map(({ id }) => id));

export const DEFAULT_FEATURES = FEATURE_DEFINITIONS.filter(
  ({ default: enabled }) => enabled
).map(({ id }) => id);

function invalidFeatures(value, reason) {
  throw new Error(`Invalid feature selection${reason ? `: ${reason}` : ""}.`);
}

export function normalizeFeatures(value) {
  const values =
    value === undefined
      ? DEFAULT_FEATURES
      : typeof value === "string"
        ? value.split(",").map((feature) => feature.trim())
        : Array.isArray(value)
          ? value
          : invalidFeatures(
              value,
              "expected a comma-separated string or array"
            );

  if (
    values.length === 0 ||
    values.some((feature) => typeof feature !== "string")
  ) {
    invalidFeatures(value, "expected at least one feature ID");
  }
  if (values.some((feature) => !feature)) {
    invalidFeatures(value, "empty feature IDs are not allowed");
  }

  const duplicates = values.filter(
    (feature, index) => values.indexOf(feature) !== index
  );
  if (duplicates.length > 0) {
    invalidFeatures(value, `duplicate feature ID: ${duplicates[0]}`);
  }

  const unknown = values.find((feature) => !featureIds.has(feature));
  if (unknown) invalidFeatures(value, `unknown feature ID: ${unknown}`);

  const selected = new Set(values);
  return FEATURE_DEFINITIONS.filter(({ id }) => selected.has(id)).map(
    ({ id }) => id
  );
}

export function serializeFeatureData(features) {
  const normalized = normalizeFeatures(features);
  const selected = new Set(normalized);
  return [
    `features_json=${JSON.stringify(JSON.stringify(normalized))}`,
    ...FEATURE_DEFINITIONS.map(
      ({ id }) => `feature_${id.replaceAll("-", "_")}=${selected.has(id)}`
    )
  ];
}
