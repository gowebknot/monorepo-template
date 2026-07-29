import type { ServiceOptions } from "@/client/axios-instance";
import { getClient } from "@/client/axios-instance";
import type { RootApiResponse } from "@monorepo-template/entities";

export const rootApi = {
  async get(options?: ServiceOptions) {
    const response = await getClient(options).get<RootApiResponse>("/");
    return response.data;
  }
};
