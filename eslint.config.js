import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["**/dist/**", "**/node_modules/**"]
  },
  {
    files: ["**/*.{js,mjs,ts}"],
    languageOptions: {
      globals: globals.node
    }
  }
]);
