import type { CrudService } from "@repo/api-client";
import type { ServiceOptions } from "@repo/api-client";
import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions
} from "@tanstack/react-query";

export function createCrudQueryHooks<T, CreateInput, UpdateInput>(
  resourceKey: string,
  service: CrudService<T, CreateInput, UpdateInput>
) {
  return {
    useList: (
      serviceOptions?: ServiceOptions,
      options?: Omit<UseQueryOptions<T[], Error, T[]>, "queryKey" | "queryFn">
    ) =>
      useQuery({
        queryKey: [resourceKey, "list", serviceOptions],
        queryFn: () => service.list(serviceOptions),
        ...options
      }),

    useDetail: (
      id: string,
      serviceOptions?: ServiceOptions,
      options?: Omit<UseQueryOptions<T, Error, T>, "queryKey" | "queryFn">
    ) =>
      useQuery({
        queryKey: [resourceKey, "detail", id, serviceOptions],
        queryFn: () => service.detail(id, serviceOptions),
        ...options
      }),

    useCreate: (
      serviceOptions?: ServiceOptions,
      options?: Omit<UseMutationOptions<T, Error, CreateInput>, "mutationFn">
    ) =>
      useMutation({
        mutationFn: (input) => service.create(input, serviceOptions),
        ...options
      }),

    useUpdate: (
      serviceOptions?: ServiceOptions,
      options?: Omit<
        UseMutationOptions<T, Error, { id: string; input: UpdateInput }>,
        "mutationFn"
      >
    ) =>
      useMutation({
        mutationFn: ({ id, input }) =>
          service.update(id, input, serviceOptions),
        ...options
      }),

    useRemove: (
      serviceOptions?: ServiceOptions,
      options?: Omit<UseMutationOptions<T, Error, string>, "mutationFn">
    ) =>
      useMutation({
        mutationFn: (id) => service.remove(id, serviceOptions),
        ...options
      })
  };
}
