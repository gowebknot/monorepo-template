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
    // readline/promises' question() promise never settles if the interface closes first (Ctrl+C or
    // Ctrl+D before an answer) -- https://github.com/nodejs/node/issues/53497 -- which otherwise
    // leaves the CLI's top-level await permanently unsettled and prints a confusing Node warning
    // right after generation already succeeded. Race it against the interface's own close event and
    // treat an interruption as a decline, matching what answering "N" does.
    return await new Promise((resolve) => {
      readline.once("close", () => resolve(false));
      readline.question("Run automated setup now? [y/N] ").then(
        (answer) => resolve(/^y(?:es)?$/i.test(answer.trim())),
        () => resolve(false)
      );
    });
  } finally {
    readline.close();
  }
}
