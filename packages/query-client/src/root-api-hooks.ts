import { rootApi } from "@monorepo-template/api-client";
import type { RootApiResponse } from "@monorepo-template/entities";

import { createQueryHook } from "@/create-query-hook";

export const useRootApi = createQueryHook<RootApiResponse>(
  "root-api",
  rootApi.get
);
