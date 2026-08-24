"use client";

import Link from "next/link";
import { useStore } from "@tanstack/react-form";
import {
  useCreateTodoOptimistic,
  useRemoveTodoOptimistic,
  useTodoListByUser
} from "@repo/query-client/example";
import type { CreateTodoInput } from "@repo/entities/example";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useAppForm } from "@/components/forms/form-core";

export default function TodosPage() {
  const createTodo = useCreateTodoOptimistic();
  const removeTodo = useRemoveTodoOptimistic();

  const createForm = useAppForm({
    defaultValues: {
      userId: "",
      title: ""
    } satisfies CreateTodoInput,
    onSubmit: async ({ value }) => {
      createTodo.mutate(value);
      createForm.reset();
    }
  });

  const filterForm = useAppForm({
    defaultValues: { userId: "" },
    onSubmit: async () => undefined
  });
  const userId = useStore(filterForm.store, (state) => state.values.userId);

  const { data: todos, isLoading } = useTodoListByUser(
    userId,
    undefined,
    { enabled: !!userId }
  );

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    createForm.handleSubmit();
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-3xl font-bold">Todos</h1>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Create Todo</h2>
        <createForm.AppForm>
          <form
            method="POST"
            className="flex w-full flex-col gap-4"
            onSubmit={handleCreateSubmit}
          >
            <createForm.AppField name="userId">
              {(field) => (
                <field.FormInput
                  placeholder="User ID"
                  labelProps={{ children: "User ID" }}
                  autoComplete="off"
                />
              )}
            </createForm.AppField>
            <createForm.AppField name="title">
              {(field) => (
                <field.FormInput
                  placeholder="Todo title"
                  labelProps={{ children: "Title" }}
                  autoComplete="off"
                />
              )}
            </createForm.AppField>
            <createForm.SubmitButton className="w-full">
              Create Todo
            </createForm.SubmitButton>
          </form>
        </createForm.AppForm>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Filter by User</h2>
        <filterForm.AppForm>
          <filterForm.AppField name="userId">
            {(field) => (
              <field.FormInput
                placeholder="Enter a User ID to load todos"
                labelProps={{ children: "User ID" }}
                autoComplete="off"
              />
            )}
          </filterForm.AppField>
        </filterForm.AppForm>
      </section>

      <section>
        {isLoading && <p>Loading todos...</p>}
        {todos && todos.length === 0 && <p>No todos found for this user.</p>}
        {todos && todos.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todos.map((todo) => (
                <TableRow key={todo.id}>
                  <TableCell>
                    <Link
                      href={`/reference/todos/${todo.id}`}
                      className="hover:underline"
                    >
                      {todo.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeTodo.mutate(todo.id)}
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
