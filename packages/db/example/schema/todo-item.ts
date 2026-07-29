import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { todos } from "#example/schema/todo";

export const todoItems = sqliteTable("todo_items", {
  id: text("id").primaryKey(),
  todoId: text("todo_id")
    .notNull()
    .references(() => todos.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull()
});

export const todoItemsRelations = relations(todoItems, ({ one }) => ({
  todo: one(todos, {
    fields: [todoItems.todoId],
    references: [todos.id]
  })
}));
