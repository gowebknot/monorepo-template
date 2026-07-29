import type { ServiceOptions } from "@monorepo-template/api-client";
import {
  useQuery,
  type QueryKey,
  type UseQueryOptions
} from "@tanstack/react-query";

export interface QueryHookOptions<TData> {
  queryKey: QueryKey;
  queryFn: (options?: ServiceOptions) => Promise<TData>;
}

export function createQueryHook<TData>(
  resourceKey: string,
  queryFn: (options?: ServiceOptions) => Promise<TData>
) {
  return function useData(
    serviceOptions?: ServiceOptions,
    options?: Omit<UseQueryOptions<TData, Error, TData>, "queryKey" | "queryFn">
  ) {
    return useQuery({
      queryKey: [resourceKey, serviceOptions],
      queryFn: () => queryFn(serviceOptions),
      ...options
    });
  };
}
