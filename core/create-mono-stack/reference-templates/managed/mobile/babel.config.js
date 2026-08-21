// react-native-css (NativeWind v5) rewrites bare `react-native` imports to its
// className-aware interop components. This transform is what makes `className`
// work on core components in a bare React Native app (the Expo app gets the
// equivalent for free through `babel-preset-expo`).
//
// The published `react-native-css/babel` preset also injects
// `react-native-worklets/plugin`. This bare app does not install
// Reanimated/Worklets, so that plugin is neither needed nor resolvable here;
// keep only the import-rewrite plugin.
const reactNativeCssBabel = require("react-native-css/babel").default;

function nativewindImportPreset(api) {
  const preset = reactNativeCssBabel(api);
  return {
    ...preset,
    plugins: (preset.plugins ?? []).filter(
      (plugin) => plugin !== "react-native-worklets/plugin"
    )
  };
}

module.exports = {
  presets: ["module:@react-native/babel-preset", nativewindImportPreset],
  plugins: ["@babel/plugin-transform-export-namespace-from"]
};
