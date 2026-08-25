import path from "path";
import dts from "unplugin-dts/vite";
import { defineConfig } from "vite";

// <https://vite.dev/config/>
export default defineConfig({
  plugins: [dts({ include: ["src"] })],
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, "src/index.ts"),
        server: path.resolve(__dirname, "src/server.ts"),
        web: path.resolve(__dirname, "src/web.ts"),
        expo: path.resolve(__dirname, "src/expo.ts")
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`
    },
    rollupOptions: {
      external: [
        "@better-auth/drizzle-adapter",
        "@better-auth/expo",
        "@better-auth/expo/client",
        "@monorepo-template/db/auth-schema",
        "better-auth",
        "better-auth/node",
        "better-auth/react",
        "drizzle-orm"
      ]
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
