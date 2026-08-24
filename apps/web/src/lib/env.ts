import { createWebEnv } from "@monorepo-template/env/web";

export const clientEnv = createWebEnv(
  import.meta.env as Record<string, string>
);
