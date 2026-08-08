import type { ServiceOptions } from "@/client/axios-instance";
import { getClient } from "@/client/axios-instance";
import type { HealthResponse } from "@repo/entities";

export const healthApi = {
  async get(options?: ServiceOptions) {
    const response = await getClient(options).get<HealthResponse>("/health");
    return response.data;
  }
};
