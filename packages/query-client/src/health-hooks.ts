import { healthApi } from "@monorepo-template/api-client";
import type { HealthResponse } from "@monorepo-template/entities";

import { createQueryHook } from "@/create-query-hook";

export const useHealth = createQueryHook<HealthResponse>(
  "health",
  healthApi.get
);
