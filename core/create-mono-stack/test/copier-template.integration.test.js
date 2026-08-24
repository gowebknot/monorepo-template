import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile
} from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  assertReferenceBuilds,
  assertReferenceTaskGraph,
  assertGeneratedProject
} from "./copier-template.integration.helpers.js";
import { copyTemplateFixture } from "./copier-template.integration.fixture.js";
import { applyNativeReferenceProfiles } from "./copier-template.integration.native.js";
import {
  runReferenceDevelopment,
  runReferencePreview
} from "./copier-template.integration.runtime.js";
import { addApp, addPackage } from "../src/project-management.js";

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
    result.error?.message || `${result.stderr}\n${result.stdout}`.trim()
  );
  return result.stdout.trim();
}

function git(cwd, ...args) {
  return run("git", args, { cwd });
}

async function runPreview(projectRoot) {
  const port = 4179;
  const child = spawn(
    "pnpm",
    [
      "--filter",
      "admin",
      "preview",
      "--host",
      "127.0.0.1",
      "--port",
      String(port)
    ],
    { cwd: projectRoot, stdio: "ignore" }
  );
  try {
    let response;
    for (let attempt = 0; attempt < 60; attempt += 1) {
      try {
        response = await fetch(`http://127.0.0.1:${port}`);
        if (response.ok) return;
      } catch {
        // The preview process may need a few seconds to bind its port.
      }
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 500));
    }
    throw new Error(`managed app preview did not respond: ${response?.status}`);
  } finally {
    child.kill("SIGTERM");
    await new Promise((resolvePromise) => child.once("close", resolvePromise));
  }
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

  await copyTemplateFixture({ root, templateRoot });

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
    `apt-get update -qq && apt-get install --yes --no-install-recommends nodejs >/dev/null && python -m pip install --disable-pip-version-check --quiet --requirement /workspace/template/requirements/copier.txt && mkdir -p /tmp/copier-home && chown ${hostUser} /tmp/copier-home`
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
      "--trust",
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
    "--trust",
    "--data",
    "project_name=Acme Platform",
    "--data",
    "project_slug=!!!",
    "/workspace/template",
    "/workspace/project"
  );
  stage("copy.completed");

  stage("native-profiles.started");
  const stack = await applyNativeReferenceProfiles({
    projectRoot,
    temporaryRoot: join(fixtureRoot, "native-scaffolds")
  });
  await copyFile(join(projectRoot, ".env.example"), join(projectRoot, ".env"));
  run("pnpm", ["install", "--lockfile-only"], {
    cwd: projectRoot,
    timeout: 180_000
  });
  await assertGeneratedProject({
    projectRoot,
    stackConfig: stack.config,
    templateRoot
  });
  await writeFile(
    join(projectRoot, ".env"),
    `${await readFile(join(projectRoot, ".env"), "utf8")}CONSUMER_ENV_MARKER=preserve-me\n`
  );
  stage("native-profiles.completed");

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
  const templateEnvironmentExamplePath = join(templateRoot, ".env.example");
  const templateEnvironmentExample = await readFile(
    templateEnvironmentExamplePath,
    "utf8"
  );
  await writeFile(
    templateConfigPath,
    templateConfig.replace(
      '  name: "monorepo-template"',
      '  name: "monorepo-template",\n  templateVersion: 2'
    )
  );
  await writeFile(
    templateEnvironmentExamplePath,
    `${templateEnvironmentExample}TEMPLATE_ENV_MARKER=updated\n`
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
    "--trust",
    "--defaults",
    "--skip-answered",
    "--vcs-ref",
    "v1.1.0"
  );
  stage("update.completed");

  assert.equal(
    await readFile(join(projectRoot, ".mono-stack.json"), "utf8"),
    stack.contents
  );
  assert.match(
    await readFile(join(projectRoot, ".env"), "utf8"),
    /CONSUMER_ENV_MARKER=preserve-me/
  );
  assert.match(
    await readFile(join(projectRoot, ".env.example"), "utf8"),
    /TEMPLATE_ENV_MARKER=updated/
  );

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
  assertReferenceTaskGraph(
    JSON.parse(
      run("pnpm", ["exec", "turbo", "run", "dev:reference", "--dry=json"], {
        cwd: projectRoot
      })
    )
  );
  stage("build.started");
  await assertReferenceBuilds({ projectRoot, run });
  stage("build.completed");
  stage("reference-preview.started");
  await runReferencePreview(projectRoot);
  stage("reference-preview.completed");
  stage("reference-development.started");
  await runReferenceDevelopment(projectRoot);
  stage("reference-development.completed");

  stage("managed-members.started");
  const managedRun = async (command, args, options) =>
    run(command, args, { ...options, timeout: 300_000 });
  await addApp(
    projectRoot,
    { feature: "web-vite", name: "admin" },
    { runCommand: managedRun }
  );
  await addPackage(projectRoot, "billing", { runCommand: managedRun });
  await assert.rejects(
    readFile(join(projectRoot, "apps/admin/dist/index.html"))
  );
  assert.match(
    await readFile(join(projectRoot, "apps/web/package.json"), "utf8"),
    /"name"/
  );
  run("pnpm", ["--filter", "admin", "build"], {
    cwd: projectRoot,
    timeout: 300_000
  });
  run("pnpm", ["--filter", "@acme-platform/billing", "build"], {
    cwd: projectRoot,
    timeout: 300_000
  });
  await runPreview(projectRoot);
  stage("managed-members.completed");
});
