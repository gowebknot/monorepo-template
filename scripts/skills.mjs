#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  cp,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";

const RESOURCE_DIRECTORIES = [
  "scripts",
  "references",
  "assets",
  "templates",
  "examples"
];
const SKILL_ROOTS = [
  "skills",
  ".agents/skills",
  ".claude/skills",
  ".opencode/skills"
];
const MANIFEST_FILE = ".skills-sync.json";
const NATIVE_SKILLS_LOCK_FILE = "skills-lock.json";
const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VENDOR_BODY_PATTERNS = [
  { pattern: /!\s*`/, label: "Claude dynamic shell injection" },
  { pattern: /\$\{CLAUDE_[A-Z0-9_]+\}/, label: "Claude-only variable" },
  { pattern: /\$ARGUMENTS(?:\[\d+\])?/, label: "Claude-only arguments" }
];

const repositoryRoot = resolve(process.env.SKILLS_REPO_ROOT || process.cwd());

function fail(message) {
  throw new Error(message);
}

function validateName(name) {
  if (
    typeof name !== "string" ||
    name.length < 1 ||
    name.length > 64 ||
    !NAME_PATTERN.test(name)
  ) {
    fail(
      `Invalid skill name "${name}". Use 1-64 lowercase letters, digits, and single hyphens.`
    );
  }
}

function titleFromName(name) {
  return name
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

async function pathExists(path) {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function assertNoSymlinks(path, skillName) {
  const stat = await lstat(path);
  if (stat.isSymbolicLink()) {
    fail(`Skill "${skillName}" contains an unsafe symlink: ${path}`);
  }
  if (!stat.isDirectory()) return;

  for (const entry of await readdir(path)) {
    await assertNoSymlinks(join(path, entry), skillName);
  }
}

function parseFrontmatter(content, skillName) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    fail(`Skill "${skillName}" must start with YAML frontmatter.`);
  }

  const document = parseDocument(match[1]);
  if (document.errors.length > 0) {
    fail(
      `Skill "${skillName}" has invalid YAML: ${document.errors[0].message}`
    );
  }

  const metadata = document.toJS();
  if (
    metadata === null ||
    typeof metadata !== "object" ||
    Array.isArray(metadata)
  ) {
    fail(`Skill "${skillName}" frontmatter must be a YAML mapping.`);
  }

  const keys = Object.keys(metadata).sort();
  const expectedKeys = ["description", "name"];
  if (
    keys.length !== expectedKeys.length ||
    keys.some((key, index) => key !== expectedKeys[index])
  ) {
    fail(
      `Skill "${skillName}" frontmatter may contain only "name" and "description".`
    );
  }

  validateName(metadata.name);
  if (metadata.name !== skillName) {
    fail(
      `Skill folder "${skillName}" must match frontmatter name "${metadata.name}".`
    );
  }
  if (
    typeof metadata.description !== "string" ||
    metadata.description.trim().length < 1 ||
    metadata.description.length > 1024
  ) {
    fail(`Skill "${skillName}" description must contain 1-1024 characters.`);
  }

  const body = content.slice(match[0].length);
  for (const { pattern, label } of VENDOR_BODY_PATTERNS) {
    if (pattern.test(body)) {
      fail(`Skill "${skillName}" uses unsupported ${label}.`);
    }
  }
}

async function validateSkill(skillPath, expectedName = basename(skillPath)) {
  validateName(expectedName);
  await assertNoSymlinks(skillPath, expectedName);

  const entries = await readdir(skillPath, { withFileTypes: true });
  const entryByName = new Map(entries.map((entry) => [entry.name, entry]));
  const skillEntry = entryByName.get("SKILL.md");
  if (!skillEntry?.isFile()) {
    fail(`Skill "${expectedName}" must contain SKILL.md.`);
  }

  for (const directory of RESOURCE_DIRECTORIES) {
    const entry = entryByName.get(directory);
    if (!entry?.isDirectory()) {
      fail(`Skill "${expectedName}" must contain ${directory}/.`);
    }
  }

  for (const entry of entries) {
    if (entry.isDirectory() && !RESOURCE_DIRECTORIES.includes(entry.name)) {
      fail(
        `Skill "${expectedName}" contains unsupported root directory "${entry.name}/".`
      );
    }
  }

  const content = await readFile(join(skillPath, "SKILL.md"), "utf8");
  parseFrontmatter(content, expectedName);
}

async function ensureConvention(skillPath) {
  for (const directory of RESOURCE_DIRECTORIES) {
    const resourcePath = join(skillPath, directory);
    await mkdir(resourcePath, { recursive: true });
    const entries = await readdir(resourcePath);
    if (entries.length === 0) {
      await writeFile(join(resourcePath, ".gitkeep"), "");
    }
  }
}

async function collectFiles(path, prefix = "") {
  const files = [];
  for (const entry of (await readdir(path, { withFileTypes: true })).sort(
    (left, right) => left.name.localeCompare(right.name)
  )) {
    const entryPath = join(path, entry.name);
    const entryPrefix = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) {
      fail(`Symlinks are not allowed in portable skills: ${entryPath}`);
    }
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath, entryPrefix)));
    } else if (entry.isFile()) {
      files.push({
        path: entryPrefix,
        content: await readFile(entryPath)
      });
    }
  }
  return files;
}

async function hashTree(path) {
  const hash = createHash("sha256");
  for (const file of await collectFiles(path)) {
    hash.update(file.path);
    hash.update("\0");
    hash.update(file.content);
    hash.update("\0");
  }
  return hash.digest("hex");
}

async function listSkills(rootPath) {
  if (!(await pathExists(rootPath))) return [];
  const entries = await readdir(rootPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

async function readLockedNativeSkillNames(root = repositoryRoot) {
  const path = join(root, NATIVE_SKILLS_LOCK_FILE);
  if (!(await pathExists(path))) return new Set();

  const lock = JSON.parse(await readFile(path, "utf8"));
  if (lock.version !== 1 || lock.skills === null || typeof lock.skills !== "object") {
    fail(`${NATIVE_SKILLS_LOCK_FILE} has an unsupported format.`);
  }

  return new Set(Object.keys(lock.skills));
}

async function listPortableSkills(rootPath, lockedNativeSkillNames) {
  return (await listSkills(rootPath)).filter(
    (name) => !lockedNativeSkillNames.has(name)
  );
}

async function copyTree(source, destination) {
  await rm(destination, { recursive: true, force: true });
  await mkdir(resolve(destination, ".."), { recursive: true });
  await cp(source, destination, {
    recursive: true,
    force: true,
    errorOnExist: false
  });
}

async function readManifest(root = repositoryRoot) {
  const path = join(root, MANIFEST_FILE);
  if (!(await pathExists(path))) return { version: 1, skills: {} };
  const manifest = JSON.parse(await readFile(path, "utf8"));
  if (
    manifest.version !== 1 ||
    manifest.skills === null ||
    typeof manifest.skills !== "object"
  ) {
    fail(`${MANIFEST_FILE} has an unsupported format.`);
  }
  return manifest;
}

async function writeManifest(manifest, root = repositoryRoot) {
  const sortedSkills = Object.fromEntries(
    Object.entries(manifest.skills).sort(([left], [right]) =>
      left.localeCompare(right)
    )
  );
  await writeFile(
    join(root, MANIFEST_FILE),
    `${JSON.stringify({ version: 1, skills: sortedSkills }, null, 2)}\n`
  );
}

async function normalizeToTemporary(source) {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "portable-skill-"));
  const temporarySkill = join(temporaryRoot, basename(source));
  await cp(source, temporarySkill, { recursive: true });
  await ensureConvention(temporarySkill);
  await validateSkill(temporarySkill);
  return { temporaryRoot, temporarySkill };
}

async function synchronize(root = repositoryRoot) {
  const manifest = await readManifest(root);
  const lockedNativeSkillNames = await readLockedNativeSkillNames(root);
  const locations = SKILL_ROOTS.map((skillRoot) => join(root, skillRoot));
  const names = new Set(Object.keys(manifest.skills));

  for (const location of locations) {
    for (const name of await listPortableSkills(location, lockedNativeSkillNames)) {
      names.add(name);
    }
  }

  const nextManifest = { version: 1, skills: {} };
  for (const name of [...names].sort()) {
    validateName(name);
    const candidates = [];
    for (const location of locations) {
      const candidatePath = join(location, name);
      if (await pathExists(candidatePath)) {
        await assertNoSymlinks(candidatePath, name);
        candidates.push({
          path: candidatePath,
          hash: await hashTree(candidatePath)
        });
      }
    }
    if (candidates.length === 0) continue;

    const baseline = manifest.skills[name]?.hash;
    const changed = baseline
      ? candidates.filter((candidate) => candidate.hash !== baseline)
      : candidates;
    const distinctChangedHashes = new Set(
      changed.map((candidate) => candidate.hash)
    );
    if (distinctChangedHashes.size > 1) {
      fail(
        `Skill "${name}" has conflicting edits:\n${changed
          .map((candidate) => `  - ${relative(root, candidate.path)}`)
          .join("\n")}`
      );
    }

    const source =
      changed[0] ??
      candidates.find((candidate) => candidate.path.startsWith(locations[0])) ??
      candidates[0];
    const { temporaryRoot, temporarySkill } = await normalizeToTemporary(
      source.path
    );
    try {
      const finalHash = await hashTree(temporarySkill);
      for (const location of locations) {
        await copyTree(temporarySkill, join(location, name));
      }
      nextManifest.skills[name] = { hash: finalHash };
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  }

  await writeManifest(nextManifest, root);
  return names.size;
}

async function checkRoot(root = repositoryRoot) {
  const manifest = await readManifest(root);
  const lockedNativeSkillNames = await readLockedNativeSkillNames(root);
  const locations = SKILL_ROOTS.map((skillRoot) => join(root, skillRoot));
  const allNames = await Promise.all(
    locations.map((path) => listPortableSkills(path, lockedNativeSkillNames))
  );
  const expectedNames = [...new Set(allNames.flat())].sort();

  for (const [index, names] of allNames.entries()) {
    if (JSON.stringify(names) !== JSON.stringify(expectedNames)) {
      fail(
        `${relative(root, locations[index])} does not contain the same skills as the other skill roots.`
      );
    }
  }

  const manifestNames = Object.keys(manifest.skills).sort();
  if (JSON.stringify(manifestNames) !== JSON.stringify(expectedNames)) {
    fail(`${MANIFEST_FILE} does not match the synchronized skill roots.`);
  }

  for (const name of expectedNames) {
    const hashes = [];
    for (const location of locations) {
      const skillPath = join(location, name);
      await validateSkill(skillPath, name);
      hashes.push(await hashTree(skillPath));
    }
    if (new Set(hashes).size !== 1) {
      fail(`Skill "${name}" differs between synchronized skill roots.`);
    }
    if (manifest.skills[name].hash !== hashes[0]) {
      fail(`Skill "${name}" does not match ${MANIFEST_FILE}.`);
    }
  }
  return expectedNames.length;
}

async function checkStaged() {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "staged-skills-"));
  try {
    const result = spawnSync(
      "git",
      ["checkout-index", "--all", `--prefix=${temporaryRoot}/`],
      {
        cwd: repositoryRoot,
        encoding: "utf8"
      }
    );
    if (result.status !== 0) {
      fail(
        `Unable to inspect the staged snapshot: ${(result.stderr || result.stdout).trim()}`
      );
    }
    return await checkRoot(temporaryRoot);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

function parseDescription(args) {
  const index = args.indexOf("--description");
  if (index === -1 || !args[index + 1]) {
    fail('Provide --description "<when and why this skill should be used>".');
  }
  return args[index + 1];
}

async function createSkill(args) {
  const name = args[0];
  validateName(name);
  const description = parseDescription(args);
  if (description.length > 1024) {
    fail("Description must not exceed 1024 characters.");
  }

  const destination = join(repositoryRoot, "skills", name);
  if (await pathExists(destination)) {
    fail(`Skill "${name}" already exists.`);
  }

  await mkdir(destination, { recursive: true });
  await writeFile(
    join(destination, "SKILL.md"),
    `---\nname: ${name}\ndescription: ${JSON.stringify(description)}\n---\n\n# ${titleFromName(name)}\n\nAdd concise, imperative instructions for using this skill.\n`
  );
  await ensureConvention(destination);
  await synchronize();
  console.log(`Created portable skill "${name}".`);
}

async function removeSkill(name) {
  validateName(name);
  const manifest = await readManifest();
  let removed = false;
  for (const root of SKILL_ROOTS) {
    const path = join(repositoryRoot, root, name);
    if (await pathExists(path)) {
      await rm(path, { recursive: true });
      removed = true;
    }
  }
  delete manifest.skills[name];
  await writeManifest(manifest);
  if (!removed) fail(`Skill "${name}" does not exist.`);
  console.log(`Removed portable skill "${name}".`);
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (command === "create") return createSkill(args);
  if (command === "sync") {
    const count = await synchronize();
    console.log(`Synchronized ${count} portable skill(s).`);
    return;
  }
  if (command === "check") {
    const staged = args.includes("--staged");
    const count = staged ? await checkStaged() : await checkRoot();
    console.log(
      `Validated ${count} portable skill(s)${staged ? " in the staged snapshot" : ""}.`
    );
    return;
  }
  if (command === "remove") return removeSkill(args[0]);

  fail(
    "Usage: skills.mjs <create|sync|check|remove> [name] [--description text] [--staged]"
  );
}

const isEntrypoint =
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isEntrypoint) {
  main().catch((error) => {
    console.error(`skills: ${error.message}`);
    process.exitCode = 1;
  });
}

export {
  RESOURCE_DIRECTORIES,
  SKILL_ROOTS,
  checkRoot,
  parseFrontmatter,
  synchronize,
  validateSkill
};
