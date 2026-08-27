import {
  getToolPaths,
  validateBeforeEdit
} from "../../scripts/implementation-contract-gate.mjs";

const editableTools = new Set(["apply_patch", "edit", "write"]);

export default async ({ directory }) => ({
  "tool.execute.before": async (input, output) => {
    const tool = String(input?.tool ?? "").toLowerCase();
    if (!editableTools.has(tool)) return;
    await validateBeforeEdit(directory, getToolPaths(tool, output?.args));
  }
});
