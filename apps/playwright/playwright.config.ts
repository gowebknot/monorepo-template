import { fileURLToPath } from "node:url";

import { defineConfig, devices } from "@playwright/test";

import { findAppByFeature } from "monorepo-template/scripts/stack-app-lookup.mjs";

const projectRoot = fileURLToPath(new URL("../..", import.meta.url));
const webApp = findAppByFeature(projectRoot, ["web-vite", "web-next"]);

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: {
    command: `pnpm --filter ${webApp?.name ?? "web"} dev --host 127.0.0.1`,
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
