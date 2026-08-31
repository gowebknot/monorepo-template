import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function withGitRepository(callback) {
  const directory = await mkdtemp(join(tmpdir(), "implementation-contract-"));
  try {
    await execFileAsync("git", ["init", "--quiet"], { cwd: directory });
    return await callback(directory);
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
}

export async function writeChecklist(directory, content, name = "plan.md") {
  const checklistDirectory = join(directory, "docs", "checklists");
  await mkdir(checklistDirectory, { recursive: true });
  await writeFile(join(checklistDirectory, name), content);
}

// Minimal stand-in for the OpenCode SDK client. `assistantTexts` becomes the
// text parts of a single assistant message returned by session.messages, which
// is how the plugin reads the current session transcript.
export function fakeClient(assistantTexts = []) {
  const texts = Array.isArray(assistantTexts)
    ? assistantTexts
    : [assistantTexts];
  return {
    session: {
      messages: async () => ({
        data: [
          {
            info: { role: "assistant" },
            parts: texts.map((text) => ({ type: "text", text }))
          }
        ]
      })
    }
  };
}
