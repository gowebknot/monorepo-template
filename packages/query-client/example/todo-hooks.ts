import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { todoApi, todoCrudApi } from "@repo/api-client/example";
import type {
  CreateTodoInput,
  Todo,
  UpdateTodoInput
} from "@repo/entities/example";
import type { ServiceOptions } from "@repo/api-client";

import { createCrudQueryHooks } from "@/create-crud-query-hooks";
import { queryKeys } from "@/query-keys";

export const todoHooks = createCrudQueryHooks<
  Todo,
  CreateTodoInput,
  UpdateTodoInput
>("todos", todoCrudApi);

export const {
  useList: useTodoList,
  useDetail: useTodoDetail,
  useCreate: useCreateTodo,
  useUpdate: useUpdateTodo,
  useRemove: useRemoveTodo
} = todoHooks;

export function useTodoListByUser(
  userId: string,
  serviceOptions?: ServiceOptions,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.todos.lists.byUser(userId, serviceOptions),
    queryFn: () => todoApi.list(userId, serviceOptions),
    enabled: !!userId && (options?.enabled ?? true)
  });
}

export function useCreateTodoOptimistic(serviceOptions?: ServiceOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTodoInput) =>
      todoCrudApi.create(input, serviceOptions),
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.todos.lists.all()
      });
      const previousLists = queryClient.getQueriesData<Todo[]>({
        queryKey: queryKeys.todos.lists.all()
      });
      const optimisticTodo: Todo = {
        id: crypto.randomUUID(),
        title: newTodo.title,
        userId: newTodo.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      queryClient.setQueriesData<Todo[]>(
        { queryKey: queryKeys.todos.lists.all() },
        (old) => [...(old ?? []), optimisticTodo]
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
        queryKey: queryKeys.todos.lists.all()
      });
    }
  });
}

export function useUpdateTodoOptimistic(serviceOptions?: ServiceOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTodoInput }) =>
      todoCrudApi.update(id, input, serviceOptions),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.todos.all
      });
      const previousDetail = queryClient.getQueryData<Todo>(
        queryKeys.todos.details.byId(id, serviceOptions)
      );
      const previousLists = queryClient.getQueriesData<Todo[]>({
        queryKey: queryKeys.todos.lists.all()
      });
      queryClient.setQueryData(
        queryKeys.todos.details.byId(id, serviceOptions),
        (old: Todo | undefined) =>
          old ? { ...old, ...input, updatedAt: new Date().toISOString() } : old
      );
      queryClient.setQueriesData<Todo[]>(
        { queryKey: queryKeys.todos.lists.all() },
        (old) =>
          old?.map((todo) =>
            todo.id === id
              ? { ...todo, ...input, updatedAt: new Date().toISOString() }
              : todo
          ) ?? []
      );
      return { previousDetail, previousLists };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(
          queryKeys.todos.details.byId(_vars.id, serviceOptions),
          context.previousDetail
        );
      }
      if (context?.previousLists) {
        for (const [key, data] of context.previousLists) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.todos.all
      });
    }
  });
}

export function useRemoveTodoOptimistic(serviceOptions?: ServiceOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => todoCrudApi.remove(id, serviceOptions),
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.todos.all
      });
      const previousDetail = queryClient.getQueryData<Todo>(
        queryKeys.todos.details.byId(id, serviceOptions)
      );
      const previousLists = queryClient.getQueriesData<Todo[]>({
        queryKey: queryKeys.todos.lists.all()
      });
      queryClient.removeQueries({
        queryKey: queryKeys.todos.details.byId(id, serviceOptions)
      });
      queryClient.setQueriesData<Todo[]>(
        { queryKey: queryKeys.todos.lists.all() },
        (old) => old?.filter((todo) => todo.id !== id) ?? []
      );
      return { previousDetail, previousLists };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(
          queryKeys.todos.details.byId(_vars, serviceOptions),
          context.previousDetail
        );
      }
      if (context?.previousLists) {
        for (const [key, data] of context.previousLists) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.todos.all
      });
    }
  });
}
