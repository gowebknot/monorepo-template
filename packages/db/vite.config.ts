import path from "path";
import dts from "unplugin-dts/vite";
import { defineConfig } from "vite";

// <https://vite.dev/config/>
export default defineConfig({
  plugins: [dts({ include: ["src", "example"] })],
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, "src/index.ts"),
        "auth-schema": path.resolve(__dirname, "src/auth-schema.ts"),
        example: path.resolve(__dirname, "example/index.ts")
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`
    },
    rollupOptions: {
      external: [
        "node:url",
        "@monorepo-template/env/server",
        "better-sqlite3",
        "drizzle-orm",
        "drizzle-orm/better-sqlite3",
        "drizzle-orm/better-sqlite3/migrator",
        "drizzle-orm/node-postgres",
        "drizzle-orm/sqlite-core",
        "pg"
      ]
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
