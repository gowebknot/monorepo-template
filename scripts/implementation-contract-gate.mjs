import { readFile } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";

import {
  findActiveChecklist,
  extractChecklistReferences,
  formatValidationFailure,
  parseLightAttestation,
  validateActiveChecklist
} from "./implementation-contract.mjs";

// Re-exported so the OpenCode plugin can reach it through this single adapter
// module rather than importing the shared validator across package boundaries.
export { parseLightAttestation };

const checklistPath = "docs/checklists";
const patchMarkers = [
  /^\*\*\* (?:Add|Update|Delete) File:\s*(.+?)\s*$/,
  /^\*\*\* Move to:\s*(.+?)\s*$/
];

function normalizePath(directory, filePath) {
  const value = String(filePath).replaceAll("\\", "/");
  const absolutePath = isAbsolute(value) ? value : resolve(directory, value);
  return relative(directory, absolutePath)
    .replaceAll("\\", "/")
    .replace(/^\.\/+/, "");
}

export function isChecklistPath(directory, filePath) {
  const normalizedPath = normalizePath(directory, filePath);
  return (
    normalizedPath === checklistPath ||
    normalizedPath.startsWith(`${checklistPath}/`)
  );
}

export function extractPatchPaths(patchText) {
  if (typeof patchText !== "string") return [];

  const paths = [];
  for (const line of patchText.split("\n")) {
    const match = patchMarkers
      .map((marker) => line.match(marker))
      .find(Boolean);
    if (match?.[1]) paths.push(match[1]);
  }
  return [...new Set(paths)];
}

export function getToolPaths(tool, args = {}) {
  const toolArgs = args ?? {};
  if (tool === "apply_patch") {
    const paths = extractPatchPaths(toolArgs.patchText);
    if (paths.length === 0) {
      throw new Error(
        "Implementation contract gate: apply_patch did not contain a file path."
      );
    }
    return paths;
  }

  const filePath = toolArgs.filePath ?? toolArgs.file_path;
  if (!filePath) {
    throw new Error(
      `Implementation contract gate: ${tool} did not contain a file path.`
    );
  }
  return [filePath];
}

export async function validateBeforeEdit(
  directory,
  filePaths,
  transcriptText = ""
) {
  const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
  if (paths.length === 0 || paths.some((filePath) => !filePath)) {
    throw new Error(
      "Implementation contract gate: unable to determine the edited file path."
    );
  }
  if (paths.every((filePath) => isChecklistPath(directory, filePath))) return;

  if (parseLightAttestation(transcriptText) === "light") return;

  const activeChecklist = await findActiveChecklist(directory);
  if (!activeChecklist) {
    throw new Error(
      "Implementation contract gate: no active checklist was found before an implementation edit."
    );
  }

  const result = await validateActiveChecklist(
    await readFile(resolve(directory, activeChecklist), "utf8"),
    { cwd: directory }
  );
  if (!result.valid) throw new Error(formatValidationFailure(result));
}

export async function getChecklistReadRequirements(directory) {
  const activeChecklist = await findActiveChecklist(directory);
  if (!activeChecklist) return [];
  const markdown = await readFile(resolve(directory, activeChecklist), "utf8");
  return [activeChecklist, ...extractChecklistReferences(markdown)];
}
