import { getClient } from "@/client/axios-instance";
import type { ServiceOptions } from "@/client/axios-instance";
import { createCrudService } from "@/services/crud.service";
import type {
  AuthAccount,
  CreateAuthAccountInput
} from "@monorepo-template/entities/example";

import { referenceApiPaths } from "./api-paths";

const crud = createCrudService<AuthAccount, CreateAuthAccountInput, unknown>(
  referenceApiPaths.authAccounts
);

export const authAccountApi = {
  create: crud.create,
  detail: crud.detail,
  remove: crud.remove,

  async list(userId: string, options?: ServiceOptions) {
    const response = await getClient(options).get<AuthAccount[]>(
      referenceApiPaths.authAccounts.collection(),
      { params: { userId } }
    );
    return response.data;
  }
};
