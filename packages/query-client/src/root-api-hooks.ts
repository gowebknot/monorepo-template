import { rootApi } from "@repo/api-client";
import type { RootApiResponse } from "@repo/entities";

import { createQueryHook } from "@/create-query-hook";

export const useRootApi = createQueryHook<RootApiResponse>(
  "root-api",
  rootApi.get
);
