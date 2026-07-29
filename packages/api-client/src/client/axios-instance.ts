import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";

export interface ServiceOptions {
  baseURL?: string;
  headers?: Record<string, string>;
}

export function createApiClient(config: AxiosRequestConfig): AxiosInstance {
  return axios.create(config);
}

export function getClient(options?: ServiceOptions): AxiosInstance {
  if (!options?.baseURL) {
    throw new Error("API client requires explicit baseURL");
  }

  return createApiClient({
    baseURL: options.baseURL,
    headers: options.headers
  });
}
