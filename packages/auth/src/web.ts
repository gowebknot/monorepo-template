import { createAuthClient } from "better-auth/react";

import type { AuthClientOptions } from "@/index";

export const createWebAuthClient = (options: AuthClientOptions) =>
  createAuthClient({
    ...options,
    fetchOptions: {
      ...options.fetchOptions,
      credentials: "include"
    }
  });
