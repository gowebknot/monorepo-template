import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { todoItemApi } from "@monorepo-template/api-client/example";
import type { ServiceOptions } from "@monorepo-template/api-client";
import type {
  CreateTodoItemInput,
  TodoItem,
  UpdateTodoItemInput
} from "@monorepo-template/entities/example";

import { queryKeys } from "@/query-keys";
import { useApiClientOptions } from "@/api-client-context";

export function useTodoItemListByTodo(
  todoId: string,
  serviceOptions?: ServiceOptions,
  options?: { enabled?: boolean }
) {
  const resolvedOptions = useApiClientOptions(serviceOptions);

  return useQuery({
    queryKey: queryKeys.todoItems.lists.byTodo(todoId, resolvedOptions),
    queryFn: () => todoItemApi.list(todoId, resolvedOptions),
    enabled: !!todoId && (options?.enabled ?? true)
  });
}

export function useCreateTodoItemOptimistic(serviceOptions?: ServiceOptions) {
  const queryClient = useQueryClient();
  const resolvedOptions = useApiClientOptions(serviceOptions);

  return useMutation({
    mutationFn: (input: CreateTodoItemInput) =>
      todoItemApi.create(input, resolvedOptions),
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.todoItems.lists.all()
      });
      const previousLists = queryClient.getQueriesData<TodoItem[]>({
        queryKey: queryKeys.todoItems.lists.all()
      });
      const optimisticItem: TodoItem = {
        id: crypto.randomUUID(),
        todoId: newItem.todoId,
        title: newItem.title,
        completed: newItem.completed ?? false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      queryClient.setQueriesData<TodoItem[]>(
        { queryKey: queryKeys.todoItems.lists.all() },
        (old) => [...(old ?? []), optimisticItem]
      );
      return { previousLists };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousLists) {
        for (const [key, data] of context.previousLists) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.todoItems.lists.all()
      });
    }
  });
}

export function useUpdateTodoItemOptimistic(serviceOptions?: ServiceOptions) {
  const queryClient = useQueryClient();
  const resolvedOptions = useApiClientOptions(serviceOptions);

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTodoItemInput }) =>
      todoItemApi.update(id, input, resolvedOptions),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.todoItems.lists.all()
      });
      const previousLists = queryClient.getQueriesData<TodoItem[]>({
        queryKey: queryKeys.todoItems.lists.all()
      });
      queryClient.setQueriesData<TodoItem[]>(
        { queryKey: queryKeys.todoItems.lists.all() },
        (old) =>
          old?.map((item) =>
            item.id === id
              ? { ...item, ...input, updatedAt: new Date().toISOString() }
              : item
          ) ?? []
      );
      return { previousLists };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousLists) {
        for (const [key, data] of context.previousLists) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.todoItems.lists.all()
      });
    }
  });
}

export function useRemoveTodoItemOptimistic(serviceOptions?: ServiceOptions) {
  const queryClient = useQueryClient();
  const resolvedOptions = useApiClientOptions(serviceOptions);

  return useMutation({
    mutationFn: (id: string) => todoItemApi.remove(id, resolvedOptions),
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.todoItems.lists.all()
      });
      const previousLists = queryClient.getQueriesData<TodoItem[]>({
        queryKey: queryKeys.todoItems.lists.all()
      });
      queryClient.setQueriesData<TodoItem[]>(
        { queryKey: queryKeys.todoItems.lists.all() },
        (old) => old?.filter((item) => item.id !== id) ?? []
      );
      return { previousLists };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousLists) {
        for (const [key, data] of context.previousLists) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.todoItems.lists.all()
      });
    }
  });
}
