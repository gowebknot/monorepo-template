import { eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import { todoItems } from "#example/schema/todo-item";

type Db = BetterSQLite3Database;

export interface CreateTodoItemInput {
  todoId: string;
  title: string;
  completed?: boolean;
}

export interface UpdateTodoItemInput {
  title?: string;
  completed?: boolean;
}

export async function createTodoItem(db: Db, input: CreateTodoItemInput) {
  const now = new Date();
  const [todoItem] = await db
    .insert(todoItems)
    .values({
      id: crypto.randomUUID(),
      todoId: input.todoId,
      title: input.title,
      completed: input.completed ?? false,
      createdAt: now,
      updatedAt: now
    })
    .returning();
  return todoItem;
}

export async function getTodoItemById(db: Db, id: string) {
  const [todoItem] = await db
    .select()
    .from(todoItems)
    .where(eq(todoItems.id, id));
  return todoItem;
}

export async function listTodoItemsByTodo(db: Db, todoId: string) {
  return db.select().from(todoItems).where(eq(todoItems.todoId, todoId));
}

export async function updateTodoItem(
  db: Db,
  id: string,
  input: UpdateTodoItemInput
) {
  const [todoItem] = await db
    .update(todoItems)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(todoItems.id, id))
    .returning();
  return todoItem;
}

export async function deleteTodoItem(db: Db, id: string) {
  const [todoItem] = await db
    .delete(todoItems)
    .where(eq(todoItems.id, id))
    .returning();
  return todoItem;
}
