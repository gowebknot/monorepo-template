import { join } from "node:path";
import { fileURLToPath } from "node:url";

const referenceTemplatesRoot = fileURLToPath(
  new URL("../reference-templates", import.meta.url)
);
const managedTemplatesRoot = join(referenceTemplatesRoot, "managed");

function managedTemplate(name) {
  return join(managedTemplatesRoot, name);
}

const reactTypeScriptDependencies = ["react", "react-dom"];
const reactTypeScriptDevDependencies = [
  "@types/react",
  "@types/react-dom",
  "typescript",
  "vite"
];

async function matchesReactTypeScript({ appRoot, packageJson }, dependencies) {
  if (
    !hasEvery(packageJson.dependencies, reactTypeScriptDependencies) ||
    !hasEvery(packageJson.devDependencies, reactTypeScriptDevDependencies)
  ) {
    return false;
  }

  try {
    await dependencies.readFile(join(appRoot, "src", "main.tsx"), "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
  return true;
}

function hasDependency(packageJson, name) {
  return (
    typeof packageJson.dependencies?.[name] === "string" ||
    typeof packageJson.devDependencies?.[name] === "string"
  );
}

function delegatedProfile(directory, dependency, variantPattern) {
  return {
    codeOnly: true,
    generator: "vite",
    matches: ({ packageJson }) => hasDependency(packageJson, dependency),
    referenceEntries: [{ destination: "reference", source: "." }],
    requiresSelection: true,
    selectionMatches: (selection) =>
      isReactSelection(selection) && variantPattern.test(selection.variant),
    templateRoot: join(referenceTemplatesRoot, directory)
  };
}

function isReactSelection(selection) {
  return selection?.framework.trim().toLowerCase() === "react";
}

function isReactTypeScriptSelection(selection) {
  return (
    isReactSelection(selection) &&
    selection.variant.trim().toLowerCase().includes("typescript")
  );
}

export const REFERENCE_PROFILES = {
  "nestjs/default": {
    canonicalName: "server",
    generator: "nestjs",
    managedTemplateRoot: managedTemplate("server"),
    replaceScriptNames: [
      "test",
      "test:unit",
      "test:api:e2e",
      "test:api:smoke",
      "test:watch",
      "test:cov",
      "test:debug",
      "test:e2e"
    ],
    overlayEntries: [
      ".prettierrc",
      "AGENTS.md",
      "CLAUDE.md",
      "eslint.config.mjs",
      "nest-cli.json",
      "nest-cli.reference.json",
      "reference",
      "src",
      "test",
      "tsconfig.build.json",
      "tsconfig.json",
      "tsconfig.reference.build.json",
      "vitest.config.ts",
      "vitest.e2e.config.ts"
    ]
  },
  "vite/react-router-v7": delegatedProfile(
    "react-router-v7",
    "react-router",
    /^React Router v7(?:\s|$)/iu
  ),
  "vite/tanstack-router": delegatedProfile(
    "tanstack-router",
    "@tanstack/react-router",
    /^TanStack Router(?:\s|$)/iu
  ),
  "vite/redwood-sdk": delegatedProfile(
    "redwood-sdk",
    "rwsdk",
    /^RedwoodSDK(?:\s|$)/iu
  ),
  "vite/vike": delegatedProfile("vike", "vike", /^Vike(?:\s|$)/iu),
  "vite/react-ts": {
    canonicalName: "web",
    generator: "vite",
    managedTemplateRoot: managedTemplate("web"),
    mergeScriptNames: ["test"],
    postProcess: "tailwind-vite",
    matches: matchesReactTypeScript,
    referenceEntries: [
      { destination: "AGENTS.md", source: "AGENTS.md" },
      { destination: "CLAUDE.md", source: "CLAUDE.md" },
      { destination: "vitest.config.ts", source: "vitest.config.ts" },
      { destination: "reference/index.html", source: "index.html" },
      { destination: "reference/src", source: "src" }
    ],
    selectionMatches: isReactTypeScriptSelection
  },
  "next/default": {
    canonicalName: "next",
    generator: "next",
    managedTemplateRoot: managedTemplate("next"),
    mergeScriptNames: ["test"],
    referenceEntries: [
      { destination: "vitest.config.ts", source: "vitest.config.ts" },
      { destination: ".env.example", source: ".env.example" },
      { destination: "AGENTS.md", source: "AGENTS.md" },
      { destination: "CLAUDE.md", source: "CLAUDE.md" },
      // Overlay the root tsconfig so the generated app's build excludes
      // reference/ (its own build is driven by reference/tsconfig.json).
      { destination: "tsconfig.json", source: "tsconfig.json" },
      { destination: "reference/components.json", source: "components.json" },
      { destination: "reference/next.config.ts", source: "next.config.ts" },
      {
        destination: "reference/postcss.config.mjs",
        source: "postcss.config.mjs"
      },
      { destination: "reference/src", source: "src" },
      { destination: "reference/tsconfig.json", source: "tsconfig.json" }
    ]
  },
  "expo/default": {
    canonicalName: "expo",
    generator: "expo",
    managedTemplateRoot: managedTemplate("expo"),
    mergeScriptNames: ["dev", "test"],
    nativeOwnedDependencies: ["expo", "react-native"],
    overlayEntries: [
      "AGENTS.md",
      "CLAUDE.md",
      "README.md",
      "app",
      "app.json",
      "babel.config.js",
      "components",
      "css.d.ts",
      ".env.example",
      "globals.css",
      "index.ts",
      "lib",
      "metro.config.js",
      "nativewind-env.d.ts",
      "postcss.config.js",
      "tsconfig.json",
      "vitest.config.ts"
    ]
  },
  "react-native/default": {
    canonicalName: "mobile",
    generator: "react-native",
    managedTemplateRoot: managedTemplate("mobile"),
    mergeScriptNames: ["dev", "test"],
    nativeOwnedDependencies: ["react-native"],
    overlayEntries: [
      ".env.example",
      "AGENTS.md",
      "App.tsx",
      "CLAUDE.md",
      "README.md",
      "babel.config.js",
      "css.d.ts",
      "index.js",
      "metro.config.js",
      "nativewind-env.d.ts",
      "postcss.config.js",
      "src",
      "tsconfig.json",
      "vitest.config.ts"
    ]
  }
};

function hasEvery(record, names) {
  return names.every((name) => typeof record?.[name] === "string");
}

export async function detectViteReferenceProfile(
  { appRoot, packageJson, selection },
  dependencies,
  profiles = REFERENCE_PROFILES
) {
  for (const [profileId, profile] of Object.entries(profiles)) {
    if (
      profile.generator === "vite" &&
      (!profile.requiresSelection || selection) &&
      (!profile.selectionMatches ||
        !selection ||
        profile.selectionMatches(selection)) &&
      (await profile.matches?.({ appRoot, packageJson }, dependencies))
    ) {
      return profileId;
    }
  }
  return null;
}

export function selectionSupportsViteProfile(selection, profileId) {
  const profile = REFERENCE_PROFILES[profileId];
  return Boolean(selection && profile?.selectionMatches?.(selection));
}

// The native scaffold command (see `commandFor` in native-scaffold.js) always fetches the latest
// upstream generator template, so its own choice of dependency version is not reproducible over time.
// For most profiles that is still the right version to keep: `referenceEntries`/`codeOnly` profiles
// leave the native scaffold's own app code live at the project root, so its dependency choices are for
// code that actually runs. `overlayEntries` profiles instead delete and fully replace that source with
// this template's own code, so the native scaffold's dependency choices describe code that no longer
// exists in the output; this template's pinned, tested versions should be authoritative there instead.
// The one exception is the generator's own core framework package(s) (for example `react-native`,
// or `expo` and `react-native` together): the native `android`/`ios` project files that generator
// actually produced are tied to whatever version it scaffolded, so overriding only the `package.json`
// string for those names would desync it from the already-generated native project files.
//
// `nativeOwnedDependencies` lets a profile opt into template-preferred precedence while keeping the
// native scaffold's version for specific listed names. Profiles that do not set it keep today's
// unconditional "native wins on overlap" behavior unchanged, including the cross-field placement rule:
// a template dependency is dropped if native already declares that name in *either* `dependencies` or
// `devDependencies`, regardless of which field is being computed, so a name cannot end up listed in
// both sections just because native and the template placed it differently.
function mergeDependencyMap(
  fieldName,
  nativePackage,
  templatePackage,
  nativeDependencyNames,
  nativeOwnedDependencies
) {
  const nativeMap = nativePackage[fieldName] ?? {};
  const templateMap = templatePackage[fieldName] ?? {};

  if (!nativeOwnedDependencies) {
    const templateOnly = Object.fromEntries(
      Object.entries(templateMap).filter(
        ([name]) => !nativeDependencyNames.has(name)
      )
    );
    return { ...templateOnly, ...nativeMap };
  }

  const ownedNames = new Set(nativeOwnedDependencies);
  const nativeOverrides = Object.fromEntries(
    Object.entries(nativeMap).filter(
      ([name]) => ownedNames.has(name) || !(name in templateMap)
    )
  );
  return { ...templateMap, ...nativeOverrides };
}

export function mergeProfilePackageJson(
  nativePackage,
  templatePackage,
  selectedName,
  mergeScriptNames = [],
  nativeOwnedDependencies = null,
  replaceScriptNames = []
) {
  const nativeDependencyNames = new Set([
    ...Object.keys(nativePackage.dependencies ?? {}),
    ...Object.keys(nativePackage.devDependencies ?? {})
  ]);
  const referenceScripts = Object.fromEntries(
    Object.entries(templatePackage.scripts ?? {}).filter(([name]) => {
      if (name.endsWith(":reference")) return true;
      if (replaceScriptNames.includes(name)) return true;
      return (
        mergeScriptNames.includes(name) &&
        nativePackage.scripts?.[name] === undefined
      );
    })
  );

  return {
    ...nativePackage,
    name: selectedName,
    scripts: {
      ...nativePackage.scripts,
      ...referenceScripts
    },
    dependencies: mergeDependencyMap(
      "dependencies",
      nativePackage,
      templatePackage,
      nativeDependencyNames,
      nativeOwnedDependencies
    ),
    devDependencies: mergeDependencyMap(
      "devDependencies",
      nativePackage,
      templatePackage,
      nativeDependencyNames,
      nativeOwnedDependencies
    )
  };
}
