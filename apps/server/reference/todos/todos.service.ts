import { Inject, Injectable } from '@nestjs/common';
import {
  createTodo,
  deleteTodo,
  getTodoById,
  listTodosByUser,
  updateTodo,
} from '@monorepo-template/db/example';
import type {
  CreateTodoInput,
  UpdateTodoInput,
} from '@monorepo-template/db/example';

import { EXAMPLE_DB } from '#reference/database/database.constants';
import type { ExampleDb } from '#reference/database/database.module';

@Injectable()
export class TodosService {
  constructor(@Inject(EXAMPLE_DB) private readonly db: ExampleDb) {}

  create(input: CreateTodoInput) {
    return createTodo(this.db, input);
  }

  findByUser(userId: string) {
    return listTodosByUser(this.db, userId);
  }

  findOne(id: string) {
    return getTodoById(this.db, id);
  }

  update(id: string, input: UpdateTodoInput) {
    return updateTodo(this.db, id, input);
  }

  remove(id: string) {
    return deleteTodo(this.db, id);
  }
}
