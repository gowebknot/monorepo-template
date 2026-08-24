import path from "path";
import dts from "unplugin-dts/vite";
import { defineConfig } from "vite";

// <https://vite.dev/config/>
export default defineConfig({
  plugins: [
    dts({
      include: ["src", "example"],
      insertTypesEntry: true
    })
  ],
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, "src/index.ts"),
        example: path.resolve(__dirname, "example/index.ts")
      },
      formats: ["es"],
      fileName: (_format: string, entryName: string) => `${entryName}.js`
    },
    rollupOptions: {
      external: [
        "react",
        "@tanstack/react-query",
        "@monorepo-template/api-client",
        "@monorepo-template/api-client/example",
        "@monorepo-template/entities",
        "@monorepo-template/entities/example"
      ]
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
