import type { CrudService } from "@monorepo-template/api-client";
import type { ServiceOptions } from "@monorepo-template/api-client";
import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions
} from "@tanstack/react-query";

import { useApiClientOptions } from "@/api-client-context";

export function createCrudQueryHooks<T, CreateInput, UpdateInput>(
  resourceKey: string,
  service: CrudService<T, CreateInput, UpdateInput>
) {
  return {
    useList: (
      serviceOptions?: ServiceOptions,
      options?: Omit<UseQueryOptions<T[], Error, T[]>, "queryKey" | "queryFn">
    ) => {
      const resolvedOptions = useApiClientOptions(serviceOptions);

      return useQuery({
        queryKey: [resourceKey, "list", resolvedOptions],
        queryFn: () => service.list(resolvedOptions),
        ...options
      });
    },

    useDetail: (
      id: string,
      serviceOptions?: ServiceOptions,
      options?: Omit<UseQueryOptions<T, Error, T>, "queryKey" | "queryFn">
    ) => {
      const resolvedOptions = useApiClientOptions(serviceOptions);

      return useQuery({
        queryKey: [resourceKey, "detail", id, resolvedOptions],
        queryFn: () => service.detail(id, resolvedOptions),
        ...options
      });
    },

    useCreate: (
      serviceOptions?: ServiceOptions,
      options?: Omit<UseMutationOptions<T, Error, CreateInput>, "mutationFn">
    ) => {
      const resolvedOptions = useApiClientOptions(serviceOptions);

      return useMutation({
        mutationFn: (input) => service.create(input, resolvedOptions),
        ...options
      });
    },

    useUpdate: (
      serviceOptions?: ServiceOptions,
      options?: Omit<
        UseMutationOptions<T, Error, { id: string; input: UpdateInput }>,
        "mutationFn"
      >
    ) => {
      const resolvedOptions = useApiClientOptions(serviceOptions);

      return useMutation({
        mutationFn: ({ id, input }) =>
          service.update(id, input, resolvedOptions),
        ...options
      });
    },

    useRemove: (
      serviceOptions?: ServiceOptions,
      options?: Omit<UseMutationOptions<T, Error, string>, "mutationFn">
    ) => {
      const resolvedOptions = useApiClientOptions(serviceOptions);

      return useMutation({
        mutationFn: (id) => service.remove(id, resolvedOptions),
        ...options
      });
    }
  };
}
