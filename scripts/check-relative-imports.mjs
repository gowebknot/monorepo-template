import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";

const sourceExtensions = new Set([
  ".cjs",
  ".js",
  ".jsx",
  ".mjs",
  ".ts",
  ".tsx"
]);
const barrelNames = new Set([
  "index.cjs",
  "index.js",
  "index.jsx",
  "index.mjs",
  "index.ts",
  "index.tsx",
  // @monorepo-template/env's package-root and src/ barrels (documented in its AGENTS.md as using
  // relative exports so generated .d.ts files stay portable, same reason as index.ts elsewhere).
  "env.ts"
]);

function isSourceFile(filePath) {
  return sourceExtensions.has(extname(filePath));
}

function isBarrelFile(filePath) {
  return barrelNames.has(basename(filePath));
}

export function findRelativeImports(text, filePath) {
  if (isBarrelFile(filePath)) return [];

  const patterns = [
    /\b(?:import|export)\b[^\n;]*?(?:\bfrom\s*)?["'](\.{1,2}\/[^"']+)["']/g,
    /\bimport\s*\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g,
    /\brequire\s*\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g
  ];
  const violations = [];

  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const index = match.index ?? 0;
      violations.push({
        line: text.slice(0, index).split("\n").length,
        specifier: match[1]
      });
    }
  }

  return violations
    .filter(
      (violation, index, all) =>
        all.findIndex(
          (candidate) =>
            candidate.line === violation.line &&
            candidate.specifier === violation.specifier
        ) === index
    )
    .sort((left, right) => left.line - right.line);
}

function hasInitialCommit(cwd) {
  try {
    execFileSync("git", ["rev-parse", "--verify", "HEAD"], {
      cwd,
      stdio: "ignore"
    });
    return true;
  } catch {
    return false;
  }
}

export function getStagedSourceFiles(cwd = process.cwd()) {
  // Before a project's first commit, `git diff --cached` compares the index against the empty
  // tree, so every staged file (the entire generated codebase) would be reported as newly added.
  // The rule only makes sense against an established baseline, which does not exist yet here.
  if (!hasInitialCommit(cwd)) return [];

  const output = execFileSync(
    "git",
    ["diff", "--cached", "--name-only", "--diff-filter=ACMRT"],
    {
      cwd,
      encoding: "utf8"
    }
  );
  return output
    .split("\n")
    .filter((filePath) => filePath && isSourceFile(filePath));
}

export async function checkFiles(filePaths) {
  const failures = [];

  for (const filePath of filePaths) {
    const text = await readFile(filePath, "utf8");
    for (const violation of findRelativeImports(text, filePath)) {
      failures.push(
        `${filePath}:${violation.line} uses relative import ${violation.specifier}; use an alias or package name`
      );
    }
  }

  return failures;
}

async function main() {
  const filePaths = process.argv.includes("--staged")
    ? getStagedSourceFiles()
    : [];
  const failures = await checkFiles(filePaths);

  if (failures.length > 0) {
    process.stderr.write(`${failures.join("\n")}\n`);
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
