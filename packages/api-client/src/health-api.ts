import type { ServiceOptions } from "@/client/axios-instance";
import { getClient } from "@/client/axios-instance";
import type { HealthResponse } from "@monorepo-template/entities";

export const healthApi = {
  async get(options?: ServiceOptions) {
    const response = await getClient(options).get<HealthResponse>("/health");
    return response.data;
  }
};
