"use client";

import { useState } from "react";
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

  const [isEditing, setIsEditing] = useState(false);

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
  const editForm = useAppForm({
    defaultValues: { title: "" },
    onSubmit: async ({ value }) => {
      if (value.title.trim() && value.title !== todo?.title) {
        updateTodo.mutate({ id: todoId, input: { title: value.title } });
      }
      setIsEditing(false);
    }
  });

  const startEditing = () => {
    editForm.reset({ title: todo?.title ?? "" });
    setIsEditing(true);
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
              <editForm.AppForm>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    editForm.handleSubmit();
                  }}
                  className="flex items-center gap-2"
                >
                  <editForm.AppField name="title">
                    {(field) => (
                      <field.FormInput
                        className="max-w-md"
                        autoFocus
                        labelProps={{
                          className: "sr-only",
                          children: "Title"
                        }}
                      />
                    )}
                  </editForm.AppField>
                  <Button size="sm" type="submit">
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => {
                      editForm.reset();
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                </form>
              </editForm.AppForm>
            </div>
          ) : (
            <span>
              {todo.title}{" "}
              <Button variant="ghost" size="sm" onClick={startEditing}>
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
                  placeholder="Item title"
                  labelProps={{ children: "Title" }}
                  autoComplete="off"
                />
              )}
            </itemForm.AppField>
            <itemForm.AppField name="completed">
              {(field) => (
                <field.FormSwitch labelProps={{ children: "Completed" }} />
              )}
            </itemForm.AppField>
            <itemForm.SubmitButton className="w-full">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Done</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Checkbox
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
                    className={
                      item.completed ? "text-muted-foreground line-through" : ""
                    }
                  >
                    {item.title}
                  </TableCell>
                  <TableCell>
                    <Button
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
