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
  "index.tsx"
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

export function getStagedSourceFiles() {
  const output = execFileSync(
    "git",
    ["diff", "--cached", "--name-only", "--diff-filter=ACMRT"],
    {
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
