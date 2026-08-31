#!/usr/bin/env node

// PreToolUse hook: block Edit/Write until the skills that apply to the target
// file have been invoked this session. "Applies" is defined by the committed,
// editable trigger table at .claude/skill-triggers.json. This enforces the
// repository's mandatory skill workflow at the exact moment code is written, so
// crossing from plan/research into implementation cannot silently skip a skill.
//
// The hook denies via the PreToolUse permissionDecision contract and never
// throws into the caller: on any unexpected problem it fails open (allows) so a
// gate bug can never brick editing.

import { readFile } from "node:fs/promises";
import { isAbsolute, relative } from "node:path";
import {
  extractChecklistReferences,
  findActiveChecklist,
  formatValidationFailure,
  parseLightAttestation,
  validateActiveChecklist
} from "./implementation-contract.mjs";
import { matchesAny } from "#scripts/glob.mjs";

const SKILL_CALL_PATTERN =
  /"name"\s*:\s*"Skill"[^}]*"skill"\s*:\s*"([a-z0-9-]+)"/g;

export function parseInvokedSkills(transcriptText) {
  const invoked = new Set();
  if (typeof transcriptText !== "string") return invoked;
  for (const match of transcriptText.matchAll(SKILL_CALL_PATTERN)) {
    invoked.add(match[1]);
  }
  return invoked;
}

export function parseReadPaths(transcriptText, cwd) {
  const paths = new Set();
  const pattern =
    /["']name["']\s*:\s*["'](?:Read|read)["'][\s\S]{0,500}?["'](?:filePath|file_path|path)["']\s*:\s*["']([^"']+)["']/g;
  for (const match of transcriptText.matchAll(pattern)) {
    paths.add(toRelative(match[1], cwd));
  }
  return paths;
}

export function collectRequired(relativePath, triggers) {
  const required = new Set(triggers.always ?? []);
  for (const rule of triggers.rules ?? []) {
    if (matchesAny(relativePath, rule.when)) {
      for (const skill of rule.require ?? []) required.add(skill);
    }
  }
  return [...required];
}

function toRelative(filePath, cwd) {
  if (!filePath) return undefined;
  if (cwd && isAbsolute(filePath)) return relative(cwd, filePath);
  return filePath;
}

function denyReason(relativePath, missing) {
  return (
    `Skill gate: before editing ${relativePath}, invoke the required skill(s) ` +
    `with the Skill tool: ${missing.join(", ")}. ` +
    `Having prior context, an approved plan, or familiarity with the steps is ` +
    `not an exemption — invoke the skill(s) now so their current rules load, ` +
    `then retry the edit. Set SKILL_GATE_DISABLE=1 to opt out.`
  );
}

function contractDenyReason(relativePath, result) {
  return `Implementation contract gate: before editing ${relativePath}, ${formatValidationFailure(result)}`;
}

export function evaluate({
  filePath,
  cwd,
  permissionMode,
  invokedSkills,
  triggers,
  env = {},
  implementationContract,
  checklistReads,
  changeTierLight = false
}) {
  const allow = (missing = []) => ({ allow: true, required: [], missing });
  if (env.SKILL_GATE_DISABLE) return allow();
  if (permissionMode === "plan") return allow();

  const relativePath = toRelative(filePath, cwd);
  if (!relativePath) return allow();
  if (matchesAny(relativePath, triggers.exempt)) return allow();

  if (
    !changeTierLight &&
    implementationContract &&
    !implementationContract.valid
  ) {
    return {
      allow: false,
      required: [],
      missing: [],
      reason: contractDenyReason(relativePath, implementationContract)
    };
  }

  if (!changeTierLight && implementationContract && checklistReads) {
    const requiredReads = [
      implementationContract.activeChecklist,
      ...(implementationContract.relatedChecklists ?? [])
    ].filter(Boolean);
    const missingReads = requiredReads.filter(
      (path) => !checklistReads.has(path)
    );
    if (missingReads.length > 0) {
      return {
        allow: false,
        required: [],
        missing: [],
        reason: `Checklist gate: before editing ${relativePath}, read the active and related checklist file(s): ${missingReads.join(", ")}.`
      };
    }
  }

  const invoked = new Set(invokedSkills ?? []);
  const required = collectRequired(relativePath, triggers);
  const missing = required.filter((skill) => !invoked.has(skill));
  if (missing.length === 0) return { allow: true, required, missing: [] };

  return {
    allow: false,
    required,
    missing,
    reason: denyReason(relativePath, missing)
  };
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function loadTriggers(projectDir) {
  const raw = await readFile(
    `${projectDir}/.claude/skill-triggers.json`,
    "utf8"
  );
  return JSON.parse(raw);
}

async function main() {
  let payload;
  try {
    payload = JSON.parse((await readStdin()) || "{}");
  } catch {
    return; // Unparseable input: fail open.
  }

  const cwd = payload.cwd ?? process.cwd();
  const projectDir = process.env.CLAUDE_PROJECT_DIR ?? cwd;
  const toolInput = payload.tool_input ?? {};
  const filePath = toolInput.file_path ?? toolInput.notebook_path;

  let triggers;
  try {
    triggers = await loadTriggers(projectDir);
  } catch {
    return; // No/invalid trigger table: fail open.
  }

  let transcriptText = "";
  if (payload.transcript_path) {
    try {
      transcriptText = await readFile(payload.transcript_path, "utf8");
    } catch {
      transcriptText = "";
    }
  }

  const changeTierLight = parseLightAttestation(transcriptText) === "light";

  let implementationContract;
  if (
    !changeTierLight &&
    payload.permission_mode !== "plan" &&
    filePath &&
    !matchesAny(toRelative(filePath, cwd), triggers.exempt)
  ) {
    const activeChecklist = await findActiveChecklist(cwd);
    if (!activeChecklist) {
      implementationContract = {
        valid: false,
        errors: ["no active checklist was found"]
      };
    } else {
      try {
        const markdown = await readFile(`${cwd}/${activeChecklist}`, "utf8");
        implementationContract = {
          ...(await validateActiveChecklist(markdown, { cwd })),
          activeChecklist,
          relatedChecklists: extractChecklistReferences(markdown)
        };
      } catch {
        implementationContract = {
          valid: false,
          errors: [`cannot read active checklist ${activeChecklist}`]
        };
      }
    }
  }

  const decision = evaluate({
    filePath,
    cwd,
    permissionMode: payload.permission_mode,
    invokedSkills: parseInvokedSkills(transcriptText),
    checklistReads: parseReadPaths(transcriptText, cwd),
    triggers,
    env: process.env,
    implementationContract,
    changeTierLight
  });

  if (decision.allow) return;

  process.stdout.write(
    `${JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: decision.reason
      }
    })}\n`
  );
}

const invokedDirectly =
  process.argv[1] && isAbsolute(process.argv[1])
    ? import.meta.url === `file://${process.argv[1]}`
    : false;

if (invokedDirectly) {
  await main();
}
