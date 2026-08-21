import { createWebEnv } from "@repo/env/web";

export const clientEnv = createWebEnv(
  import.meta.env as Record<string, string>
);
