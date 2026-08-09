import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile
} from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  assertDevelopmentTaskGraph,
  assertGeneratedProject
} from "./copier-template.integration.helpers.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const temporaryRoot = join(root, ".tmp");
const pythonImage =
  "python@sha256:db9dfbd4f3385e3d56790c8f3b811d8eb979e26a674c8032deb862f2e36b3d21";

function execute(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: options.cwd ?? root,
    encoding: "utf8",
    timeout: options.timeout ?? 120_000
  });
}

function run(command, args, options = {}) {
  const result = execute(command, args, options);
  assert.equal(
    result.status,
    0,
    result.error?.message || result.stderr || result.stdout
  );
  return result.stdout.trim();
}

function git(cwd, ...args) {
  return run("git", args, { cwd });
}

test("creates and updates a customized project with Copier", async (t) => {
  const startedAt = Date.now();
  const stage = (event) =>
    console.log(
      JSON.stringify({
        elapsedMs: Date.now() - startedAt,
        event: `copier.integration.${event}`
      })
    );

  stage("docker-check.started");
  const dockerContext = run("docker", ["context", "show"]);
  const dockerResult = (...args) =>
    execute("docker", ["--context", dockerContext, ...args], {
      timeout: 300_000
    });
  const docker = (...args) =>
    run("docker", ["--context", dockerContext, ...args], {
      timeout: 300_000
    });
  const hostUser = `${process.getuid?.() ?? 1000}:${process.getgid?.() ?? 1000}`;
  const containerUserArgs = [
    "--user",
    hostUser,
    "--env",
    "HOME=/tmp/copier-home"
  ];
  docker("info", "--format", "{{.ServerVersion}}");
  stage("docker-check.completed");

  await mkdir(temporaryRoot, { recursive: true });
  const fixtureRoot = await mkdtemp(join(temporaryRoot, "copier-integration-"));
  const templateRoot = join(fixtureRoot, "template");
  const projectRoot = join(fixtureRoot, "project");
  const containerName = `copier-template-${process.pid}-${Date.now()}`;

  t.after(async () => {
    stage("cleanup.started");
    const cleanup = execute(
      "docker",
      ["--context", dockerContext, "rm", "--force", containerName],
      { timeout: 30_000 }
    );
    const cleanupOutput = `${cleanup.stdout}${cleanup.stderr}`;
    const unexpectedCleanupFailure =
      cleanup.status !== 0 && !/No such container/i.test(cleanupOutput);
    await rm(fixtureRoot, { recursive: true, force: true });
    assert.equal(
      unexpectedCleanupFailure,
      false,
      cleanup.error?.message || cleanupOutput
    );
    stage("cleanup.completed");
  });

  const excludedDirectories = new Set([
    ".git",
    ".npmrc",
    ".tmp",
    ".turbo",
    ".venv",
    "dist",
    "node_modules"
  ]);
  await mkdir(templateRoot);
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (excludedDirectories.has(entry.name)) continue;
    await cp(join(root, entry.name), join(templateRoot, entry.name), {
      recursive: true,
      filter(source) {
        const path = relative(root, source);
        const parts = path.split(sep);
        if (parts.some((part) => excludedDirectories.has(part))) return false;
        if (path.endsWith("routeTree.gen.ts")) return false;
        return !path.startsWith(join(".claude", "worktrees"));
      }
    });
  }
  await mkdir(join(templateRoot, ".github/workflows"), { recursive: true });
  await writeFile(
    join(templateRoot, ".github/workflows/template-check.yml"),
    "name: Template check\n"
  );

  git(templateRoot, "init", "--initial-branch", "main");
  git(templateRoot, "config", "user.email", "template@example.test");
  git(templateRoot, "config", "user.name", "Template Test");
  git(templateRoot, "add", ".");
  git(templateRoot, "commit", "--message", "template v1");
  git(templateRoot, "tag", "v1.0.0");
  stage("fixture.completed");

  docker(
    "run",
    "--detach",
    "--rm",
    "--name",
    containerName,
    "--volume",
    `${fixtureRoot}:/workspace`,
    "--workdir",
    "/workspace",
    pythonImage,
    "tail",
    "--follow",
    "/dev/null"
  );
  stage("copier-install.started");
  docker(
    "exec",
    containerName,
    "sh",
    "-c",
    `python -m pip install --disable-pip-version-check --quiet --requirement /workspace/template/requirements/copier.txt && mkdir -p /tmp/copier-home && chown ${hostUser} /tmp/copier-home`
  );
  stage("copier-install.completed");
  docker(
    "exec",
    ...containerUserArgs,
    containerName,
    "git",
    "config",
    "--global",
    "--add",
    "safe.directory",
    "/workspace/template"
  );
  docker(
    "exec",
    ...containerUserArgs,
    containerName,
    "git",
    "config",
    "--global",
    "--add",
    "safe.directory",
    "/workspace/project"
  );

  stage("validation.started");
  for (const projectName of ["!!!", "a".repeat(215)]) {
    const invalidCopy = dockerResult(
      "exec",
      ...containerUserArgs,
      containerName,
      "copier",
      "copy",
      "--defaults",
      "--data",
      `project_name=${projectName}`,
      "/workspace/template",
      `/workspace/invalid-${projectName.length}`
    );
    assert.notEqual(invalidCopy.status, 0);
    assert.match(
      `${invalidCopy.stdout}${invalidCopy.stderr}`,
      /letter or number|214 characters/
    );
  }
  stage("validation.completed");

  stage("copy.started");
  docker(
    "exec",
    ...containerUserArgs,
    containerName,
    "copier",
    "copy",
    "--defaults",
    "--data",
    "project_name=Acme Platform",
    "--data",
    "project_slug=!!!",
    "/workspace/template",
    "/workspace/project"
  );
  stage("copy.completed");

  await assertGeneratedProject({ projectRoot, templateRoot });

  git(projectRoot, "init", "--initial-branch", "main");
  git(projectRoot, "config", "user.email", "consumer@example.test");
  git(projectRoot, "config", "user.name", "Consumer Test");
  git(projectRoot, "add", ".");
  git(projectRoot, "commit", "--message", "generated project");

  const generatedConfigPath = join(projectRoot, "packages/config/src/index.ts");
  await writeFile(
    generatedConfigPath,
    `${await readFile(generatedConfigPath, "utf8")}\nexport const consumerSetting = true;\n`
  );
  git(projectRoot, "add", ".");
  git(projectRoot, "commit", "--message", "consumer customization");

  const templateConfigPath = join(templateRoot, "packages/config/src/index.ts");
  const templateConfig = await readFile(templateConfigPath, "utf8");
  await writeFile(
    templateConfigPath,
    templateConfig.replace(
      '  name: "monorepo-template"',
      '  name: "monorepo-template",\n  templateVersion: 2'
    )
  );
  git(templateRoot, "add", ".");
  git(templateRoot, "commit", "--message", "template v2");
  git(templateRoot, "tag", "v1.1.0");

  stage("update.started");
  docker(
    "exec",
    ...containerUserArgs,
    "--workdir",
    "/workspace/project",
    containerName,
    "copier",
    "update",
    "--defaults",
    "--skip-answered",
    "--vcs-ref",
    "v1.1.0"
  );
  stage("update.completed");

  const updatedConfig = await readFile(generatedConfigPath, "utf8");
  assert.match(updatedConfig, /name: "acme-platform"/);
  assert.match(updatedConfig, /templateVersion: 2/);
  assert.match(updatedConfig, /consumerSetting = true/);
  assert.doesNotMatch(updatedConfig, /<{7}|={7}|>{7}/);
  assert.doesNotMatch(
    await readFile(join(projectRoot, "Justfile"), "utf8"),
    /template-test/
  );
  assert.match(
    await readFile(join(projectRoot, ".copier-answers.yml"), "utf8"),
    /_commit: v1\.1\.0/
  );
  await assert.rejects(readFile(join(projectRoot, "core"), "utf8"));
  stage("install.started");
  run("pnpm", ["install", "--frozen-lockfile"], { cwd: projectRoot });
  stage("install.completed");
  assertDevelopmentTaskGraph(
    JSON.parse(
      run("pnpm", ["exec", "turbo", "run", "dev", "--dry=json"], {
        cwd: projectRoot
      })
    )
  );
  stage("build.started");
  run("pnpm", ["build"], { cwd: projectRoot, timeout: 180_000 });
  stage("build.completed");
});
