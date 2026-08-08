import { Inject, Injectable } from '@nestjs/common';
import {
  createTodoItem,
  deleteTodoItem,
  getTodoItemById,
  listTodoItemsByTodo,
  updateTodoItem,
} from '@repo/db/example';
import type {
  CreateTodoItemInput,
  UpdateTodoItemInput,
} from '@repo/db/example';

import { EXAMPLE_DB } from '../database/database.constants';
import type { ExampleDb } from '../database/database.module';

@Injectable()
export class TodoItemsService {
  constructor(@Inject(EXAMPLE_DB) private readonly db: ExampleDb) {}

  create(input: CreateTodoItemInput) {
    return createTodoItem(this.db, input);
  }

  findByTodo(todoId: string) {
    return listTodoItemsByTodo(this.db, todoId);
  }

  findOne(id: string) {
    return getTodoItemById(this.db, id);
  }

  update(id: string, input: UpdateTodoItemInput) {
    return updateTodoItem(this.db, id, input);
  }

  remove(id: string) {
    return deleteTodoItem(this.db, id);
  }
}
