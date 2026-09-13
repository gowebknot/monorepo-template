import { getClient } from "@/client/axios-instance";
import type { ServiceOptions } from "@/client/axios-instance";
import { createCrudService } from "@/services/crud.service";
import type {
  AuthSession,
  CreateAuthSessionInput
} from "@monorepo-template/entities/example";

import { referenceApiPaths } from "#example/api-paths";

const crud = createCrudService<AuthSession, CreateAuthSessionInput, unknown>(
  referenceApiPaths.authSessions
);

export const authSessionApi = {
  create: crud.create,
  detail: crud.detail,
  remove: crud.remove,

  async list(userId: string, options?: ServiceOptions) {
    const response = await getClient(options).get<AuthSession[]>(
      referenceApiPaths.authSessions.collection(),
      { params: { userId } }
    );
    return response.data;
  },

  async byToken(token: string, options?: ServiceOptions) {
    const response = await getClient(options).get<AuthSession>(
      referenceApiPaths.authSessions.byToken(token)
    );
    return response.data;
  }
};
