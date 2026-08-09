const gitRoutingVariables = [
  "GIT_COMMON_DIR",
  "GIT_DIR",
  "GIT_INDEX_FILE",
  "GIT_OBJECT_DIRECTORY",
  "GIT_WORK_TREE"
];
const gitRoutingVariableNames = new Set(
  gitRoutingVariables.map((name) => name.toLowerCase())
);
const gitConfigVariablePattern = /^GIT_CONFIG_(?:COUNT|KEY_\d+|VALUE_\d+)$/i;

export function sanitizeGitEnvironment(environment = process.env) {
  const env = {};
  const gitConfig = new Map();
  for (const [name, value] of Object.entries(environment)) {
    if (gitRoutingVariableNames.has(name.toLowerCase())) continue;
    if (gitConfigVariablePattern.test(name)) {
      const canonicalName = name.toUpperCase();
      if (!gitConfig.has(canonicalName) || name === canonicalName) {
        gitConfig.set(canonicalName, value);
      }
      continue;
    }
    env[name] = value;
  }
  Object.assign(env, Object.fromEntries(gitConfig));
  return env;
}

function gitOptions(dependencies, capture = false) {
  return {
    ...(capture ? { capture: true } : {}),
    env: sanitizeGitEnvironment(dependencies.environment),
    replaceEnvironment: true
  };
}

export async function preflightGit(dependencies) {
  try {
    await dependencies.runCommand(
      "git",
      ["--version"],
      gitOptions(dependencies, true)
    );
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Git is required before project setup can continue: ${detail}. Install Git and rerun create-mono-stack.`,
      { cause: error }
    );
  }
}

export async function initializeGit(destination, dependencies) {
  try {
    const options = gitOptions(dependencies);
    await dependencies.runCommand(
      "git",
      ["init", "--initial-branch", "main", destination],
      options
    );
    await dependencies.runCommand(
      "git",
      ["-C", destination, "rev-parse", "--git-dir"],
      gitOptions(dependencies, true)
    );
    const branch = await dependencies.runCommand(
      "git",
      ["-C", destination, "symbolic-ref", "--short", "HEAD"],
      gitOptions(dependencies, true)
    );
    if (branch.stdout.trim() !== "main") {
      throw new Error(
        `Expected unborn branch main, but Git reported ${branch.stdout.trim() || "no branch"}.`
      );
    }
    let hasCommit = true;
    try {
      await dependencies.runCommand(
        "git",
        ["-C", destination, "rev-parse", "--verify", "--quiet", "HEAD"],
        gitOptions(dependencies, true)
      );
    } catch (error) {
      if (error?.exitCode !== 1) throw error;
      hasCommit = false;
    }
    if (hasCommit) {
      throw new Error("Generated repository already contains a commit.");
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Git initialization failed: ${detail}. Verify the destination is writable and rerun create-mono-stack.`,
      { cause: error }
    );
  }
}
