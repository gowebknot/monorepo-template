import {
  getChecklistReadRequirements,
  getToolPaths,
  isChecklistPath,
  validateBeforeEdit
} from "../../scripts/implementation-contract-gate.mjs";
import { readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";

const editableTools = new Set(["apply_patch", "edit", "write"]);

export default async ({ directory }) => {
  let readPaths = new Set();
  const normalize = (filePath) =>
    relative(directory, resolve(directory, String(filePath))).replaceAll(
      "\\",
      "/"
    );

  const checkReads = async () => {
    const required = await getChecklistReadRequirements(directory);
    const missing = required.filter((filePath) => !readPaths.has(filePath));
    if (missing.length > 0) {
      throw new Error(
        `Checklist gate: before editing implementation, read the active and related checklist file(s): ${missing.join(
          ", "
        )}.`
      );
    }
  };

  return {
    "tool.execute.before": async (input, output) => {
      const tool = String(input?.tool ?? "").toLowerCase();
      if (tool === "read") {
        const filePath = output?.args?.filePath ?? output?.args?.file_path;
        if (filePath && isChecklistPath(directory, filePath)) {
          await readFile(resolve(directory, filePath), "utf8");
          readPaths.add(normalize(filePath));
        }
        return;
      }
      if (!editableTools.has(tool)) return;
      await validateBeforeEdit(directory, getToolPaths(tool, output?.args));
      await checkReads();
    }
  };
};
