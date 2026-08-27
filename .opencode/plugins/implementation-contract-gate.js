import { readFile } from "node:fs/promises";

import {
  findActiveChecklist,
  formatValidationFailure,
  validateImplementationContract
} from "../../scripts/implementation-contract.mjs";

const editableTools = new Set(["edit", "write", "multiedit", "notebookedit"]);

export async function validateBeforeEdit(directory, filePath) {
  if (!filePath || String(filePath).includes("docs/checklists/")) return;

  const activeChecklist = await findActiveChecklist(directory);
  if (!activeChecklist) {
    throw new Error(
      "Implementation contract gate: no active checklist was found before an implementation edit."
    );
  }

  const result = validateImplementationContract(
    await readFile(`${directory}/${activeChecklist}`, "utf8")
  );
  if (!result.valid) throw new Error(formatValidationFailure(result));
}

export default async ({ directory }) => ({
  "tool.execute.before": async (input) => {
    if (!editableTools.has(String(input.tool).toLowerCase())) return;
    await validateBeforeEdit(
      directory,
      input.args?.filePath ?? input.args?.file_path
    );
  }
});
