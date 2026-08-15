import { join } from "node:path";

const reactTypeScriptDependencies = ["react", "react-dom"];
const reactTypeScriptDevDependencies = [
  "@types/react",
  "@types/react-dom",
  "@vitejs/plugin-react",
  "typescript",
  "vite"
];
const reactCompilerDependencies = [
  "@rolldown/plugin-babel",
  "babel-plugin-react-compiler"
];

async function matchesReactTypeScript({ appRoot, packageJson }, dependencies) {
  if (
    !hasEvery(packageJson.dependencies, reactTypeScriptDependencies) ||
    !hasEvery(packageJson.devDependencies, reactTypeScriptDevDependencies) ||
    reactCompilerDependencies.some(
      (name) => typeof packageJson.devDependencies?.[name] === "string"
    )
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
  "vite/react-ts": {
    canonicalName: "web",
    generator: "vite",
    matches: matchesReactTypeScript,
    overlayEntries: [
      ".gitignore",
      "components.json",
      "eslint.config.js",
      "index.html",
      "src",
      "tsconfig.app.json",
      "tsconfig.json",
      "tsconfig.node.json",
      "vite.config.ts"
    ]
  }
};

function hasEvery(record, names) {
  return names.every((name) => typeof record?.[name] === "string");
}

export async function detectViteReferenceProfile(
  { appRoot, packageJson },
  dependencies,
  profiles = REFERENCE_PROFILES
) {
  for (const [profileId, profile] of Object.entries(profiles)) {
    if (
      profile.generator === "vite" &&
      (await profile.matches?.({ appRoot, packageJson }, dependencies))
    ) {
      return profileId;
    }
  }
  return null;
}

export function mergeProfilePackageJson(
  nativePackage,
  templatePackage,
  selectedName
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

  return {
    ...templatePackage,
    ...nativePackage,
    name: selectedName,
    scripts: {
      ...nativePackage.scripts,
      ...templatePackage.scripts
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
