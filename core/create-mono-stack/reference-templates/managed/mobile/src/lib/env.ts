import { createReactNativeEnv } from "@monorepo-template/env/react-native";

import { runtimeConfig } from "@/config";

export const clientEnv = createReactNativeEnv(runtimeConfig);
