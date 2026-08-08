import { getClient } from "@/client/axios-instance";
import type { ServiceOptions } from "@/client/axios-instance";
import { createCrudService } from "@/services/crud.service";
import type {
  CreateTodoItemInput,
  TodoItem,
  UpdateTodoItemInput
} from "@repo/entities/example";

import { referenceApiPaths } from "./api-paths";

const crud = createCrudService<
  TodoItem,
  CreateTodoItemInput,
  UpdateTodoItemInput
>(referenceApiPaths.todoItems);

export const todoItemApi = {
  ...crud,

  async list(todoId: string, options?: ServiceOptions) {
    const response = await getClient(options).get<TodoItem[]>(
      referenceApiPaths.todoItems.collection(),
      { params: { todoId } }
    );
    return response.data;
  }
};
