import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  access,
  copyFile,
  mkdtemp,
  mkdir,
  readFile,
  writeFile
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const script = join(repositoryRoot, "scripts/skills.mjs");
const resourceDirectories = [
  "scripts",
  "references",
  "assets",
  "templates",
  "examples"
];
const skillRoots = [
  "skills",
  ".agents/skills",
  ".claude/skills",
  ".opencode/skills"
];

async function temporaryRepository(t) {
  const root = await mkdtemp(join(tmpdir(), "portable-skills-test-"));
  t.after(async () => {
    const { rm } = await import("node:fs/promises");
    await rm(root, { recursive: true, force: true });
  });
  return root;
}

function run(root, ...args) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    env: { ...process.env, SKILLS_REPO_ROOT: root },
    encoding: "utf8"
  });
}

function expectSuccess(result) {
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

async function writeMinimalSkill(path, name, description) {
  await mkdir(path, { recursive: true });
  await writeFile(
    join(path, "SKILL.md"),
    `---\nname: ${name}\ndescription: ${description}\n---\n\n# Test\n\nFollow the test workflow.\n`
  );
}

test("creates and projects the required portable structure", async (t) => {
  const root = await temporaryRepository(t);
  expectSuccess(
    run(
      root,
      "create",
      "review-api",
      "--description",
      "Review API changes when requested."
    )
  );

  for (const skillRoot of skillRoots) {
    const skillPath = join(root, skillRoot, "review-api");
    assert.match(
      await readFile(join(skillPath, "SKILL.md"), "utf8"),
      /name: review-api/
    );
    for (const directory of resourceDirectories) {
      assert.equal(
        await readFile(join(skillPath, directory, ".gitkeep"), "utf8"),
        ""
      );
    }
  }
  expectSuccess(run(root, "check"));
});

test("imports and normalizes a skill created in a native directory", async (t) => {
  const root = await temporaryRepository(t);
  await writeMinimalSkill(
    join(root, ".claude/skills/write-release"),
    "write-release",
    "Write release notes when preparing a release."
  );

  expectSuccess(run(root, "sync"));
  for (const skillRoot of skillRoots) {
    for (const directory of resourceDirectories) {
      assert.equal(
        await readFile(
          join(root, skillRoot, "write-release", directory, ".gitkeep"),
          "utf8"
        ),
        ""
      );
    }
  }
});

test("refuses divergent edits without overwriting either side", async (t) => {
  const root = await temporaryRepository(t);
  expectSuccess(
    run(
      root,
      "create",
      "review-code",
      "--description",
      "Review code when requested."
    )
  );

  await writeFile(
    join(root, "skills/review-code/SKILL.md"),
    "---\nname: review-code\ndescription: Review canonical code changes.\n---\n"
  );
  await writeFile(
    join(root, ".claude/skills/review-code/SKILL.md"),
    "---\nname: review-code\ndescription: Review Claude code changes.\n---\n"
  );

  const result = run(root, "sync");
  assert.notEqual(result.status, 0);
  assert.match(
    await readFile(join(root, "skills/review-code/SKILL.md"), "utf8"),
    /canonical/
  );
  assert.match(
    await readFile(join(root, ".claude/skills/review-code/SKILL.md"), "utf8"),
    /Claude/
  );
});

test("staged check rejects a partially staged skill update", async (t) => {
  const root = await temporaryRepository(t);
  expectSuccess(
    run(
      root,
      "create",
      "check-stage",
      "--description",
      "Check staged skill fixtures."
    )
  );

  expectSuccess(spawnSync("git", ["init"], { cwd: root, encoding: "utf8" }));
  expectSuccess(
    spawnSync("git", ["add", "."], { cwd: root, encoding: "utf8" })
  );
  expectSuccess(run(root, "check", "--staged"));

  await writeFile(
    join(root, "skills/check-stage/SKILL.md"),
    "---\nname: check-stage\ndescription: Changed only in the canonical staged copy.\n---\n"
  );
  expectSuccess(
    spawnSync("git", ["add", "skills/check-stage/SKILL.md"], {
      cwd: root,
      encoding: "utf8"
    })
  );

  const result = run(root, "check", "--staged");
  assert.notEqual(result.status, 0);
});

test("TEST-SKILL-137 discovers every skill test file", async () => {
  const packageJson = JSON.parse(
    await readFile(join(repositoryRoot, "package.json"), "utf8")
  );

  assert.equal(
    packageJson.scripts["skills:test"],
    "node scripts/run-skills-tests.mjs"
  );
});

test("TEST-SKILL-161 uses cross-version test discovery", async () => {
  const packageJson = JSON.parse(
    await readFile(join(repositoryRoot, "package.json"), "utf8")
  );
  const command = packageJson.scripts["skills:test"];
  const runner = await readFile(
    join(repositoryRoot, "scripts/run-skills-tests.mjs"),
    "utf8"
  );

  assert.equal(command, "node scripts/run-skills-tests.mjs");
  assert.doesNotMatch(command, /[*?[]/);
  assert.match(runner, /readdirSync/);
  assert.match(runner, /endsWith\("\.test\.mjs"\)/);
  assert.match(
    runner,
    /spawnSync\(process\.execPath, \["--test", \.\.\.files\]/
  );
});

test("TEST-SKILL-164 executes every discovered test file", async (t) => {
  const root = await temporaryRepository(t);
  const scripts = join(root, "scripts");
  await mkdir(scripts);
  await copyFile(
    join(repositoryRoot, "scripts/run-skills-tests.mjs"),
    join(scripts, "run-skills-tests.mjs")
  );
  await writeFile(
    join(scripts, "first.test.mjs"),
    'import { writeFile } from "node:fs/promises"; import test from "node:test"; test("first", () => writeFile(new URL("first-ran", import.meta.url), ""));\n'
  );
  await writeFile(
    join(scripts, "second.test.mjs"),
    'import { writeFile } from "node:fs/promises"; import test from "node:test"; test("second", () => writeFile(new URL("second-ran", import.meta.url), ""));\n'
  );
  await writeFile(
    join(scripts, "ignored.mjs"),
    'throw new Error("non-test file ran");\n'
  );

  const result = spawnSync(
    process.execPath,
    [join(scripts, "run-skills-tests.mjs")],
    {
      cwd: root,
      encoding: "utf8",
      env: Object.fromEntries(
        Object.entries(process.env).filter(
          ([name]) => name !== "NODE_TEST_CONTEXT"
        )
      )
    }
  );

  expectSuccess(result);
  await access(join(scripts, "first-ran"));
  await access(join(scripts, "second-ran"));
});
