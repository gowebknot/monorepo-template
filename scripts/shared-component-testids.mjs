#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { execFile } from "node:child_process";

const execFileAsync = promisify(execFile);
const sharedComponentPattern =
  /^packages\/ui\/src\/components\/ui\/[^/]+\.tsx$/;
const nonRenderingHelpers = new Set([
  "DropdownMenu",
  "DropdownMenuPortal",
  "DropdownMenuRadioGroup",
  "DropdownMenuSub",
  "Select"
]);

function componentDeclarations(source) {
  return [...source.matchAll(/function\s+([A-Z][A-Za-z0-9_]*)\s*\(/g)].map(
    (match) => ({
      name: match[1],
      start: match.index
    })
  );
}

function declarationText(source, declaration) {
  const openingBrace = source.indexOf("{", declaration.start);
  const nextDeclaration = source.indexOf("\nfunction ", openingBrace);
  return source.slice(
    declaration.start,
    nextDeclaration === -1 ? source.length : nextDeclaration
  );
}

export function checkSharedComponentSource(source, filePath) {
  const issues = [];
  for (const declaration of componentDeclarations(source)) {
    if (nonRenderingHelpers.has(declaration.name)) continue;

    const text = declarationText(source, declaration);
    const signatureEnd = text.search(/\)\s*\{/);
    const signature = signatureEnd === -1 ? text : text.slice(0, signatureEnd);
    if (
      !signature.includes("TestIdProps") ||
      (!text.includes("...props") && !text.includes("data-testid"))
    ) {
      issues.push(
        `${filePath}: ${declaration.name} must use required TestIdProps and forward data-testid`
      );
    }
  }
  return issues;
}

export async function checkStagedSharedComponents({
  files,
  readFile: read = readFile
}) {
  const issues = [];
  for (const filePath of files.filter((file) =>
    sharedComponentPattern.test(file)
  )) {
    const source = await read(filePath, "utf8");
    issues.push(...checkSharedComponentSource(source, filePath));
  }
  return issues;
}

async function stagedFiles() {
  const { stdout } = await execFileAsync("git", [
    "diff",
    "--cached",
    "--name-only",
    "--diff-filter=ACMR"
  ]);
  return stdout.split("\n").filter(Boolean);
}

export async function main() {
  const issues = await checkStagedSharedComponents({
    files: await stagedFiles()
  });
  if (issues.length === 0) return;

  process.stderr.write(`${issues.join("\n")}\n`);
  process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
