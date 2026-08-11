import { spawn } from "node:child_process";
import { access, readFile, readdir } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

import { discoverPythonOptions } from "./python-runtime.js";

function runProbe(command, args, options = {}) {
  return new Promise((resolveResult, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: {
        ...process.env,
        MISE_AUTO_INSTALL: "0",
        MISE_EXEC_AUTO_INSTALL: "0",
        MISE_NOT_FOUND_AUTO_INSTALL: "0",
        MISE_NOT_FOUND_SYSTEM_FALLBACK: "0",
        MISE_NO_CONFIG: "1",
        MISE_NO_HOOKS: "1",
        PYTHON_MANAGER_AUTOMATIC_INSTALL: "false"
      },
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdoutValue = "";
    let stderrValue = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdoutValue += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderrValue += chunk;
    });
    child.once("error", reject);
    child.once("close", (code) => {
      if (code === 0)
        resolveResult({ stdout: stdoutValue, stderr: stderrValue });
      else reject(new Error(`${command} exited with ${code}`));
    });
  });
}

export async function discoverWizardOptions() {
  const cwd = process.env.INIT_CWD || process.cwd();
  const destinations = [];
  for (const entry of await readdir(cwd, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    try {
      if ((await readdir(join(cwd, entry.name))).length === 0) {
        destinations.push({
          label: `${entry.name} (empty directory in ${cwd})`,
          value: entry.name
        });
      }
    } catch {
      continue;
    }
  }
  const templateSource = await discoverLocalTemplate(cwd);
  return {
    destinations,
    gitHostAliases: await discoverGitAliases(),
    python: await discoverPythonOptions({
      platform: process.platform,
      runCommand: runProbe
    }),
    templateSources: templateSource ? [templateSource] : [],
    vcsRefs: templateSource
      ? await discoverLocalRevisions(templateSource.value)
      : []
  };
}

async function discoverGitAliases() {
  const aliases = new Map();
  try {
    const result = await runProbe("git", [
      "config",
      "--get-regexp",
      "^url\\..*\\.insteadOf$"
    ]);
    for (const [, alias] of result.stdout
      .split("\n")
      .map((line) =>
        /^url\.git@([^:]+):\.insteadOf\s+git@github\.com:$/.exec(line)
      )
      .filter(Boolean)) {
      aliases.set(alias, `${alias} (detected Git alias)`);
    }
  } catch {
    // SSH config discovery is independent of Git config.
  }
  try {
    const config = await readFile(join(homedir(), ".ssh", "config"), "utf8");
    for (const alias of parseSshAliases(config)) {
      aliases.set(alias, `${alias} (detected SSH alias)`);
    }
  } catch {
    // A missing SSH config is a normal discovery result.
  }
  return [...aliases].map(([value, label]) => ({ label, value }));
}

export function parseSshAliases(config) {
  const aliases = new Set();
  for (const line of config.split("\n")) {
    const match = /^\s*Host\s+(.+)$/i.exec(line);
    if (!match) continue;
    for (const alias of match[1].split(/\s+/)) {
      if (!alias.includes("*") && !alias.includes("?")) aliases.add(alias);
    }
  }
  return [...aliases];
}

async function discoverLocalTemplate(cwd) {
  let directory = resolve(cwd);
  while (true) {
    for (const filename of ["copier.yml", "copier.yaml"]) {
      try {
        await access(join(directory, filename));
        return {
          label: `${directory} (detected template)`,
          value: directory
        };
      } catch {
        continue;
      }
    }
    const parent = dirname(directory);
    if (parent === directory) return undefined;
    directory = parent;
  }
}

async function discoverLocalRevisions(cwd) {
  try {
    const result = await runProbe(
      "git",
      [
        "-C",
        cwd,
        "for-each-ref",
        "--format=%(refname:short)",
        "refs/heads",
        "refs/tags"
      ],
      { cwd }
    );
    return result.stdout
      .split("\n")
      .filter(Boolean)
      .map((value) => ({
        label: `${value} (detected in ${cwd})`,
        value
      }));
  } catch {
    return [];
  }
}
