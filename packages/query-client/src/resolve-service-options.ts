import type { ServiceOptions } from "@repo/api-client";

export function resolveServiceOptions(
  providerOptions: ServiceOptions | undefined,
  inlineOptions: ServiceOptions | undefined
): ServiceOptions {
  const options = {
    ...providerOptions,
    ...inlineOptions,
    headers:
      providerOptions?.headers || inlineOptions?.headers
        ? { ...providerOptions?.headers, ...inlineOptions?.headers }
        : undefined
  };

  if (!options.baseURL) {
    throw new Error(
      "API client requires a baseURL. Configure ApiClientConfigProvider with ServiceOptions or pass inline ServiceOptions."
    );
  }

  return options;
}
