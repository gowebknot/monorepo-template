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
