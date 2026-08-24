import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  ApiClientConfigProvider,
  QueryClient,
  QueryClientProvider
} from "@monorepo-template/query-client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { createWebEnv } from "@monorepo-template/env/web";
import { routeTree } from "./routeTree.gen";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export const runtimeEnv = createWebEnv(import.meta.env);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ApiClientConfigProvider options={{ baseURL: runtimeEnv.WEB_PUBLIC_API_BASE_URL }}>
        <RouterProvider router={router} />
      </ApiClientConfigProvider>
    </QueryClientProvider>
  </StrictMode>
);
