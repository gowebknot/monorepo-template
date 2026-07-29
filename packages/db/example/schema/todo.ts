import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { todoItems } from "#example/schema/todo-item";
import { users } from "#example/schema/user";

export const todos = sqliteTable("todos", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull()
});

export const todosRelations = relations(todos, ({ many, one }) => ({
  user: one(users, {
    fields: [todos.userId],
    references: [users.id]
  }),
  items: many(todoItems)
}));
