import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { ServiceOptions } from "@repo/api-client";

import { resolveServiceOptions } from "@/resolve-service-options";

const ApiClientConfigContext = createContext<ServiceOptions | undefined>(
  undefined
);

export function ApiClientConfigProvider({
  options,
  children
}: {
  options: ServiceOptions;
  children: ReactNode;
}) {
  return (
    <ApiClientConfigContext.Provider value={options}>
      {children}
    </ApiClientConfigContext.Provider>
  );
}

export function useApiClientOptions(
  inlineOptions?: ServiceOptions
): ServiceOptions {
  return resolveServiceOptions(
    useContext(ApiClientConfigContext),
    inlineOptions
  );
}
