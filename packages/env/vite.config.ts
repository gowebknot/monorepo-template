import path from "path";
import dts from "unplugin-dts/vite";
import { defineConfig } from "vite";

// <https://vite.dev/config/>
export default defineConfig({
  envDir: "../..",
  plugins: [dts()],
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, "env.ts"),
        "web-env": path.resolve(__dirname, "src/web-env.ts"),
        "next-env": path.resolve(__dirname, "src/next-env.ts"),
        "expo-env": path.resolve(__dirname, "src/expo-env.ts"),
        "react-native-env": path.resolve(__dirname, "src/react-native-env.ts"),
        "server-env": path.resolve(__dirname, "src/server-env.ts"),
        "reference-server-env": path.resolve(
          __dirname,
          "src/reference-server-env.ts"
        )
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`
    },
    rollupOptions: {
      external: ["@t3-oss/env-core", "zod"]
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
