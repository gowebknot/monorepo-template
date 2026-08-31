import {
  getChecklistReadRequirements,
  getToolPaths,
  isChecklistPath,
  parseLightAttestation,
  validateBeforeEdit
} from "../../scripts/implementation-contract-gate.mjs";
import { readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";

const editableTools = new Set(["apply_patch", "edit", "write"]);

export default async ({ directory, client }) => {
  let readPaths = new Set();

  const readTranscript = async (sessionID) => {
    if (!client?.session?.messages || !sessionID) return "";
    try {
      const response = await client.session.messages({
        path: { id: sessionID }
      });
      const messages = response?.data ?? response ?? [];
      return messages
        .flatMap((entry) => entry?.parts ?? [])
        .filter((part) => part?.type === "text")
        .map((part) => part?.text ?? "")
        .join("\n");
    } catch {
      return ""; // Fail closed to the checklist requirement.
    }
  };
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
      const transcript = await readTranscript(input?.sessionID);
      await validateBeforeEdit(
        directory,
        getToolPaths(tool, output?.args),
        transcript
      );
      if (parseLightAttestation(transcript) === "light") return;
      await checkReads();
    }
  };
};
