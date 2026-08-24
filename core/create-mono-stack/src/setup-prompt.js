import { createInterface } from "node:readline/promises";

export const setupSteps = [
  "Install workspace dependencies with pnpm install --frozen-lockfile",
  "Start Postgres, Redis, pgAdmin, Act, QEMU, OpenDesign, and OpenPanel with docker compose up -d",
  "Build all workspace packages and applications with pnpm build"
];

export async function promptForSetup({ input, output }) {
  output.write(
    `\nAutomated project setup will:\n${setupSteps
      .map((step, index) => `  ${index + 1}. ${step}`)
      .join(
        "\n"
      )}\n\nThis requires pnpm, Just, and a running Docker-compatible runtime. QEMU may also require Linux KVM support.\n`
  );
  const readline = createInterface({ input, output });
  try {
    const answer = await readline.question("Run automated setup now? [y/N] ");
    return /^y(?:es)?$/i.test(answer.trim());
  } finally {
    readline.close();
  }
}
