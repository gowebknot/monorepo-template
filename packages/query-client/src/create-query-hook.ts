import type { ServiceOptions } from "@repo/api-client";
import {
  useQuery,
  type QueryKey,
  type UseQueryOptions
} from "@tanstack/react-query";

import { useApiClientOptions } from "@/api-client-context";

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
    const resolvedOptions = useApiClientOptions(serviceOptions);

    return useQuery({
      queryKey: [resourceKey, resolvedOptions],
      queryFn: () => queryFn(resolvedOptions),
      ...options
    });
  };
}
