import { join } from "node:path";
import { fileURLToPath } from "node:url";

const referenceTemplatesRoot = fileURLToPath(
  new URL("../reference-templates", import.meta.url)
);

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
      "tsconfig.reference.build.json"
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
    matches: matchesReactTypeScript,
    referenceEntries: [
      { destination: "reference/index.html", source: "index.html" },
      { destination: "reference/src", source: "src" }
    ],
    selectionMatches: isReactTypeScriptSelection
  },
  "next/default": {
    canonicalName: "next",
    generator: "next",
    referenceEntries: [
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
    mergeScriptNames: ["dev"],
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
      "tsconfig.json"
    ]
  },
  "react-native/default": {
    canonicalName: "mobile",
    generator: "react-native",
    mergeScriptNames: ["dev"],
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
      "tsconfig.json"
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

export function mergeProfilePackageJson(
  nativePackage,
  templatePackage,
  selectedName,
  mergeScriptNames = []
) {
  const nativeDependencyNames = new Set([
    ...Object.keys(nativePackage.dependencies ?? {}),
    ...Object.keys(nativePackage.devDependencies ?? {})
  ]);
  const templateDependencies = Object.fromEntries(
    Object.entries(templatePackage.dependencies ?? {}).filter(
      ([name]) => !nativeDependencyNames.has(name)
    )
  );
  const templateDevDependencies = Object.fromEntries(
    Object.entries(templatePackage.devDependencies ?? {}).filter(
      ([name]) => !nativeDependencyNames.has(name)
    )
  );
  const referenceScripts = Object.fromEntries(
    Object.entries(templatePackage.scripts ?? {}).filter(([name]) => {
      if (name.endsWith(":reference")) return true;
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
    dependencies: {
      ...templateDependencies,
      ...nativePackage.dependencies
    },
    devDependencies: {
      ...templateDevDependencies,
      ...nativePackage.devDependencies
    }
  };
}
