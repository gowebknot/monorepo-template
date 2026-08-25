import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";

import type { AuthClientOptions } from "@/index";

export type ExpoAuthStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
};

export type ExpoAuthClientOptions = AuthClientOptions & {
  scheme: string;
  storagePrefix: string;
  storage: ExpoAuthStorage;
};

export const createExpoAuthClient = ({
  scheme,
  storagePrefix,
  storage,
  ...options
}: ExpoAuthClientOptions) =>
  createAuthClient({
    ...options,
    plugins: [
      expoClient({
        scheme,
        storagePrefix,
        storage
      })
    ]
  });
