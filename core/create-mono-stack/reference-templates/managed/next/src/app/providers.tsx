"use client";

import * as React from "react";
import {
  ApiClientConfigProvider,
  QueryClient,
  QueryClientProvider
} from "@monorepo-template/query-client/example";

import { clientEnv } from "@/lib/env";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ApiClientConfigProvider
        options={{ baseURL: clientEnv.NEXT_PUBLIC_API_BASE_URL }}
      >
        {children}
      </ApiClientConfigProvider>
    </QueryClientProvider>
  );
}
