import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-form";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../../components/ui/table";
import { useAppForm } from "../../components/forms/form-core";
import {
  useTodoListByUser,
  useCreateTodoOptimistic,
  useRemoveTodoOptimistic
} from "@repo/query-client/example";
import type { CreateTodoInput } from "@repo/entities/example";
import { clientEnv } from "../../lib/env";

export const Route = createFileRoute("/reference/todos")({
  component: TodosPage
});

function TodosPage() {
  const apiOptions = { baseURL: clientEnv.WEB_PUBLIC_API_BASE_URL };
  const createTodo = useCreateTodoOptimistic(apiOptions);
  const removeTodo = useRemoveTodoOptimistic(apiOptions);

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

  const { data: todos, isLoading } = useTodoListByUser(userId, apiOptions, {
    enabled: !!userId
  });

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
                  data-testid="web-create-todo-user-id"
                  placeholder="User ID"
                  labelProps={{
                    children: "User ID",
                    "data-testid": "web-create-todo-user-id-label"
                  }}
                  autoComplete="off"
                />
              )}
            </createForm.AppField>
            <createForm.AppField name="title">
              {(field) => (
                <field.FormInput
                  data-testid="web-create-todo-title"
                  placeholder="Todo title"
                  labelProps={{
                    children: "Title",
                    "data-testid": "web-create-todo-title-label"
                  }}
                  autoComplete="off"
                />
              )}
            </createForm.AppField>
            <createForm.SubmitButton
              data-testid="web-create-todo-submit"
              className="w-full"
            >
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
                data-testid="web-todo-user-filter"
                placeholder="Enter a User ID to load todos"
                labelProps={{
                  children: "User ID",
                  "data-testid": "web-todo-user-filter-label"
                }}
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
          <Table data-testid="web-todos-table">
            <TableHeader data-testid="web-todos-table-header">
              <TableRow data-testid="web-todos-table-header-row">
                <TableHead data-testid="web-todos-title-head">Title</TableHead>
                <TableHead data-testid="web-todos-actions-head">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody data-testid="web-todos-table-body">
              {todos.map((todo) => (
                <TableRow data-testid={`web-todo-row-${todo.id}`} key={todo.id}>
                  <TableCell data-testid={`web-todo-title-cell-${todo.id}`}>
                    <Link
                      to="/reference/todos/$todoId"
                      params={{ todoId: todo.id }}
                      className="hover:underline"
                    >
                      {todo.title}
                    </Link>
                  </TableCell>
                  <TableCell data-testid={`web-todo-actions-cell-${todo.id}`}>
                    <Button
                      data-testid={`web-todo-delete-${todo.id}`}
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
