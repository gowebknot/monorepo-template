import { healthApi } from "@repo/api-client";
import type { HealthResponse } from "@repo/entities";

import { createQueryHook } from "@/create-query-hook";

export const useHealth = createQueryHook<HealthResponse>(
  "health",
  healthApi.get
);
