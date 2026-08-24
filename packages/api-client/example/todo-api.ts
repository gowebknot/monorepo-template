import { createCrudService } from "@/services/crud.service";
import type { ServiceOptions } from "@/client/axios-instance";
import { getClient } from "@/client/axios-instance";
import type {
  CreateTodoInput,
  Todo,
  UpdateTodoInput
} from "@monorepo-template/entities/example";

import { referenceApiPaths } from "./api-paths";

export const todoCrudApi = createCrudService<
  Todo,
  CreateTodoInput,
  UpdateTodoInput
>(referenceApiPaths.todos);

export const todoApi = {
  ...todoCrudApi,

  async list(userId: string, options?: ServiceOptions) {
    const response = await getClient(options).get<Todo[]>(
      referenceApiPaths.todos.collection(),
      { params: { userId } }
    );
    return response.data;
  }
};
