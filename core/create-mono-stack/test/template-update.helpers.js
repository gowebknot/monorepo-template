export const stackConfig = JSON.stringify({
  schemaVersion: 3,
  features: ["web-vite", "api-express", "mobile-expo"],
  apps: [
    {
      feature: "web-vite",
      generator: "vite",
      name: "dashboard",
      path: "apps/dashboard",
      referenceProfile: "vite/react-ts"
    }
  ]
});

export const expectedStackArguments = [
  "--data",
  'features_json="[\\"web-vite\\",\\"api-express\\",\\"mobile-expo\\"]"',
  "--data",
  "feature_web_vite=true",
  "--data",
  "feature_web_next=false",
  "--data",
  "feature_api_nest=false",
  "--data",
  "feature_api_express=true",
  "--data",
  "feature_mobile_expo=true",
  "--data",
  "feature_mobile_react_native=false",
  "--exclude",
  "apps/web",
  "--exclude",
  "apps/server"
];

export const validStackDependencies = { readFile: () => stackConfig };
