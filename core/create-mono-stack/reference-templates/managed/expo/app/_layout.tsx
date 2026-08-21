import "@/globals.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Providers } from "@/lib/providers";

export default function RootLayout() {
  return (
    <Providers>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerTitleStyle: { fontWeight: "600" } }}>
          <Stack.Screen name="index" options={{ title: "Expo reference" }} />
          <Stack.Screen name="form-demo" options={{ title: "Form Demo" }} />
          <Stack.Screen name="table-demo" options={{ title: "Table Demo" }} />
          <Stack.Screen
            name="reference/index"
            options={{ title: "Reference" }}
          />
          <Stack.Screen name="reference/todos" options={{ title: "Todos" }} />
          <Stack.Screen
            name="reference/todos/[todoId]"
            options={{ title: "Todo Detail" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </Providers>
  );
}
