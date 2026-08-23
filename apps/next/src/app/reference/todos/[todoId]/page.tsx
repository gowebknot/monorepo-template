"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useCreateTodoItemOptimistic,
  useRemoveTodoItemOptimistic,
  useTodoDetail,
  useTodoItemListByTodo,
  useUpdateTodoItemOptimistic,
  useUpdateTodoOptimistic
} from "@repo/query-client/example";
import type { CreateTodoItemInput } from "@repo/entities/example";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useAppForm } from "@/components/forms/form-core";
import { clientEnv } from "@/lib/env";

export default function TodoDetailPage() {
  const { todoId } = useParams<{ todoId: string }>();
  const apiOptions = { baseURL: clientEnv.NEXT_PUBLIC_API_BASE_URL };

  const { data: todo, isLoading: todoLoading } = useTodoDetail(
    todoId,
    apiOptions
  );
  const updateTodo = useUpdateTodoOptimistic(apiOptions);
  const { data: items, isLoading: itemsLoading } = useTodoItemListByTodo(
    todoId,
    apiOptions
  );
  const createItem = useCreateTodoItemOptimistic(apiOptions);
  const updateItem = useUpdateTodoItemOptimistic(apiOptions);
  const removeItem = useRemoveTodoItemOptimistic(apiOptions);

  const [isEditing, setIsEditing] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState("");

  const itemForm = useAppForm({
    defaultValues: {
      todoId,
      title: "",
      completed: false
    } satisfies CreateTodoItemInput,
    onSubmit: async ({ value }) => {
      createItem.mutate(value);
      itemForm.reset();
    }
  });

  const startEditing = () => {
    setEditTitle(todo?.title ?? "");
    setIsEditing(true);
  };

  const saveTitle = () => {
    if (editTitle.trim() && editTitle !== todo?.title) {
      updateTodo.mutate({ id: todoId, input: { title: editTitle } });
    }
    setIsEditing(false);
  };

  const handleItemSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    itemForm.handleSubmit();
  };

  if (todoLoading) {
    return <div>Loading todo...</div>;
  }

  if (!todo) {
    return <div>Todo not found.</div>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/reference/todos"
        className="mb-4 inline-block text-sm text-muted-foreground hover:underline"
      >
        &larr; Back to Todos
      </Link>

      <section className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                data-testid="next-todo-edit-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="max-w-md"
                autoFocus
              />
              <Button
                data-testid="next-todo-save-title"
                size="sm"
                onClick={saveTitle}
              >
                Save
              </Button>
              <Button
                data-testid="next-todo-cancel-edit"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <span>
              {todo.title}{" "}
              <Button
                data-testid="next-todo-start-edit"
                variant="ghost"
                size="sm"
                onClick={startEditing}
              >
                Edit
              </Button>
            </span>
          )}
        </h1>
        <p className="text-sm text-muted-foreground">ID: {todo.id}</p>
        <p className="text-sm text-muted-foreground">User ID: {todo.userId}</p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Add Item</h2>
        <itemForm.AppForm>
          <form
            method="POST"
            className="flex w-full flex-col gap-4"
            onSubmit={handleItemSubmit}
          >
            <itemForm.AppField name="title">
              {(field) => (
                <field.FormInput
                  data-testid="next-add-item-title"
                  placeholder="Item title"
                  labelProps={{
                    children: "Title",
                    "data-testid": "next-add-item-title-label"
                  }}
                  autoComplete="off"
                />
              )}
            </itemForm.AppField>
            <itemForm.AppField name="completed">
              {(field) => (
                <field.FormSwitch
                  data-testid="next-add-item-completed"
                  labelProps={{
                    children: "Completed",
                    "data-testid": "next-add-item-completed-label"
                  }}
                />
              )}
            </itemForm.AppField>
            <itemForm.SubmitButton
              data-testid="next-add-item-submit"
              className="w-full"
            >
              Add Item
            </itemForm.SubmitButton>
          </form>
        </itemForm.AppForm>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold">Items</h2>
        {itemsLoading && <p>Loading items...</p>}
        {items && items.length === 0 && <p>No items yet.</p>}
        {items && items.length > 0 && (
          <Table data-testid="next-items-table">
            <TableHeader data-testid="next-items-table-header">
              <TableRow data-testid="next-items-table-header-row">
                <TableHead data-testid="next-items-done-head" className="w-12">
                  Done
                </TableHead>
                <TableHead data-testid="next-items-title-head">Title</TableHead>
                <TableHead data-testid="next-items-actions-head">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody data-testid="next-items-table-body">
              {items.map((item) => (
                <TableRow
                  data-testid={`next-item-row-${item.id}`}
                  key={item.id}
                >
                  <TableCell data-testid={`next-item-done-cell-${item.id}`}>
                    <Checkbox
                      data-testid={`next-item-completed-${item.id}`}
                      checked={item.completed}
                      onCheckedChange={(checked) =>
                        updateItem.mutate({
                          id: item.id,
                          input: { completed: !!checked }
                        })
                      }
                    />
                  </TableCell>
                  <TableCell
                    data-testid={`next-item-title-cell-${item.id}`}

                    className={
                      item.completed ? "text-muted-foreground line-through" : ""
                    }
                  >
                    {item.title}
                  </TableCell>
                  <TableCell data-testid={`next-item-actions-cell-${item.id}`}>
                    <Button
                      data-testid={`next-item-delete-${item.id}`}
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem.mutate(item.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
