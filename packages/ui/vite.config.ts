import path from "path";
import dts from "unplugin-dts/vite";
import { defineConfig } from "vite";

// <https://vite.dev/config/>
export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index"
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "@base-ui/react",
        "@hugeicons/core-free-icons",
        "@hugeicons/react",
        "class-variance-authority",
        "clsx",
        "next-themes",
        "sonner",
        "tailwind-merge",
        /^@base-ui\//,
        /^react(?:$|\/)/,
        /^react-dom(?:$|\/)/
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: "src"
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
