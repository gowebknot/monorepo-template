const { getDefaultConfig } = require("@expo/metro-config");
const {
  getDefaultConfig: getReactNativeConfig
} = require("@react-native/metro-config");
const { withNativewind } = require("nativewind/metro");
const { existsSync, realpathSync } = require("fs");
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
  ),
  "react-native": path.resolve(projectRoot, "node_modules", "react-native"),
  "react-native-css": path.resolve(
    projectRoot,
    "node_modules",
    "react-native-css"
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
nativewindConfig.resolver.extraNodeModules.react = path.resolve(
  projectRoot,
  "node_modules",
  "react"
);
nativewindConfig.resolver.extraNodeModules["@tanstack/react-query"] =
  path.resolve(projectRoot, "node_modules", "@tanstack", "react-query");

// The workspace also builds the Expo app on react-native 0.86.2. Some of
// these packages ship a second copy built against that peer version (for
// example inside NativeWind/react-native-css's own dependency tree), and
// package-relative resolution from a file that lives under that copy can
// land there instead of this app's react-native 0.87.0 copy. Each copy
// carries its own react-native ReactNativeViewConfigRegistry singleton, so
// a native view registered through one copy is invisible to the other and
// React throws "View config getter callback ... must be a function" at
// render time.
//
// NativeWind/react-native-css's own Metro resolver (nativeResolver in
// react-native-css/src/metro/resolver.ts) redirects bare imports of these
// packages to its own CSS-interop shim, and that shim re-imports the real
// package by bare name from its own file. react-native-css treats that
// re-import as "internal" and resolves it with plain resolution instead of
// going through its own redirect again; that plain resolution is not
// reliable here because none of react-native-css's own installed peer
// variants nest a private copy of these packages (confirmed on disk), so it
// can land on an unrelated wrong-peer copy or, for react-native-css's own
// react-native-safe-area-context shim specifically, resolve back to the
// shim file itself (a same-file self-import that leaves its named exports,
// including SafeAreaInsetsContext, undefined).
//
// Force every bare import of these packages straight to this app's own
// installed copy, the same way the existing "react-native" case already
// does, bypassing NativeWind's CSS-interop redirect for them entirely. This
// app does not apply any className to a SafeAreaView/SafeAreaProvider or a
// react-native-screens component, so there is no interop behavior to lose.
const SINGLETON_NATIVE_MODULES = [
  "react-native",
  "react-native-safe-area-context",
  "react-native-screens",
  // The workspace resolves two peer-differentiated copies of react-native-css
  // (this app on react-native 0.87, the Expo app on 0.86). Its Babel
  // import-plugin and its className-interop component shims must come from the
  // SAME copy, otherwise the plugin's own "is this my file?" guard fails to
  // recognize the other copy's shims and rewrites their `import … from
  // "react-native"` into a self-import, leaving the wrapped base component
  // undefined (a crash in copyComponentProperties). Canonicalize every
  // react-native-css resolution onto this app's single copy, same as the
  // native singletons above.
  "react-native-css"
];

// Deep subpath imports of these packages (for example
// "react-native/Libraries/Animated/Animated.js") are not caught by the
// bare-specifier case above, since their moduleName is the full subpath,
// not just the package name. Canonicalize any resolution that still lands
// under the wrong peer-paired copy back onto this app's own copy,
// regardless of which file requested it.
const canonicalizeSingletonResolution = (resolution) => {
  if (!resolution || resolution.type !== "sourceFile") {
    return resolution;
  }
  // pnpm nests each package's own copy of its dependencies as symlink
  // siblings inside that package's private store directory, not inside a
  // literal "<package>/node_modules" folder. Comparing and rewriting by the
  // symlinked path (rather than its real, dereferenced path) can produce a
  // path whose on-disk ancestry no longer matches the real store layout,
  // which breaks Metro's later resolution of that file's own sibling
  // dependencies (for example react-native's own "nullthrows" dependency).
  // Always compare and return real, dereferenced paths.
  const realFilePath = realpathSync(resolution.filePath);
  for (const moduleName of SINGLETON_NATIVE_MODULES) {
    const marker = `${path.sep}node_modules${path.sep}${moduleName}${path.sep}`;
    const markerIndex = realFilePath.lastIndexOf(marker);
    if (markerIndex === -1) {
      continue;
    }
    const relativePath = realFilePath.slice(markerIndex + marker.length);
    const canonicalSymlinkPath = path.join(
      projectRoot,
      "node_modules",
      moduleName,
      relativePath
    );
    if (!existsSync(canonicalSymlinkPath)) {
      break;
    }
    const canonicalRealPath = realpathSync(canonicalSymlinkPath);
    if (canonicalRealPath !== realFilePath) {
      return { ...resolution, filePath: canonicalRealPath };
    }
    break;
  }
  return resolution;
};

const nativewindResolveRequest = nativewindConfig.resolver.resolveRequest;
nativewindConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  if (SINGLETON_NATIVE_MODULES.includes(moduleName)) {
    return context.resolveRequest(
      context,
      path.resolve(projectRoot, "node_modules", moduleName),
      platform
    );
  }
  if (moduleName === "react" || moduleName === "@tanstack/react-query") {
    return nativewindResolveRequest(
      context,
      path.resolve(projectRoot, "node_modules", moduleName),
      platform
    );
  }
  return canonicalizeSingletonResolution(
    resolveRuntimeHelper(
      context,
      moduleName,
      platform,
      nativewindResolveRequest
    )
  );
};

module.exports = nativewindConfig;
