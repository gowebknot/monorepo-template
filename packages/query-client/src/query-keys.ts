export const queryKeys = {
  todos: {
    all: ["todos"] as const,
    lists: {
      all: () => [...queryKeys.todos.all, "list"] as const,
      byUser: (userId: string, ...rest: unknown[]) =>
        [...queryKeys.todos.lists.all(), { userId }, ...rest] as const
    },
    details: {
      all: () => [...queryKeys.todos.all, "detail"] as const,
      byId: (id: string, ...rest: unknown[]) =>
        [...queryKeys.todos.details.all(), id, ...rest] as const
    }
  },
  todoItems: {
    all: ["todoItems"] as const,
    lists: {
      all: () => [...queryKeys.todoItems.all, "list"] as const,
      byTodo: (todoId: string, ...rest: unknown[]) =>
        [...queryKeys.todoItems.lists.all(), { todoId }, ...rest] as const
    },
    details: {
      all: () => [...queryKeys.todoItems.all, "detail"] as const,
      byId: (id: string, ...rest: unknown[]) =>
        [...queryKeys.todoItems.details.all(), id, ...rest] as const
    }
  }
};
