const { getDefaultConfig } = require("@expo/metro-config");
const {
  getDefaultConfig: getReactNativeConfig
} = require("@react-native/metro-config");
const { withNativewind } = require("nativewind/metro");
const { existsSync } = require("fs");
const path = require("path");

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@expo/metro-config').MetroConfig}
 */
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const config = getDefaultConfig(projectRoot);
const reactNativeConfig = getReactNativeConfig(projectRoot);
// NativeWind v5 uses Expo's CSS transformer; RN supplies the version-matched
// polyfills so the bare app remains compatible with RN 0.87.
config.serializer.getPolyfills = reactNativeConfig.serializer.getPolyfills;
config.transformer.asyncRequireModulePath =
  reactNativeConfig.transformer.asyncRequireModulePath;

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules")
];
config.resolver.extraNodeModules = {
  "@babel/runtime": path.resolve(
    projectRoot,
    "node_modules",
    "@babel",
    "runtime"
  )
};
const resolveRuntimeHelper = (context, moduleName, platform, fallback) => {
  if (moduleName.startsWith("@/")) {
    return fallback(
      context,
      path.resolve(projectRoot, "src", moduleName.slice(2)),
      platform
    );
  }
  if (moduleName.startsWith("@babel/runtime/helpers/")) {
    const helperName = moduleName.slice("@babel/runtime/helpers/".length);
    const helperFile = helperName.endsWith(".js")
      ? helperName
      : `${helperName}.js`;
    const helperPath = path.resolve(
      projectRoot,
      "node_modules",
      "@babel",
      "runtime",
      "helpers",
      helperFile
    );
    if (existsSync(helperPath)) {
      return { type: "sourceFile", filePath: helperPath };
    }
  }
  return fallback(context, moduleName, platform);
};

const nativewindConfig = withNativewind(config);
const nativewindResolveRequest = nativewindConfig.resolver.resolveRequest;
nativewindConfig.resolver.resolveRequest = (context, moduleName, platform) =>
  resolveRuntimeHelper(context, moduleName, platform, nativewindResolveRequest);

module.exports = nativewindConfig;
