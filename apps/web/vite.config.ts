import path from "path";
import tailwindcss from "@tailwindcss/vite";
import {
  tanstackRouter,
  tanStackRouterCodeSplitter
} from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

export default defineConfig({
  envDir: path.resolve(__dirname, "../.."),
  envPrefix: ["VITE_", "WEB_PUBLIC_"],
  plugins: [
    tanstackRouter({ autoCodeSplitting: true }),
    tanStackRouterCodeSplitter(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
