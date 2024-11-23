import globals from "globals";
import babelParser from "@babel/eslint-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import vitest from "@vitest/eslint-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      "tests/**/*",
      "src/init/artifacts/test/**/*",
      "src/init/update-artifacts/test/**/*",
      "build/**/*",
    ],
  },
  ...compat.extends("plugin:prettier/recommended", "eslint:recommended"),
  {
    plugins: { vitest },
    languageOptions: {
      globals: {
        ...globals.node,
        ...vitest.environments.env.globals,
      },
      parser: babelParser,
      ecmaVersion: 2020,
      sourceType: "module",
      parserOptions: {
        requireConfigFile: false,
        project: "./tsconfig.json",
        ecmaFeatures: {
          modules: true,
        },
      },
    },
    rules: {
      ...vitest.configs.recommended.rules,
      "@typescript-eslint/no-use-before-define": "off",
      "no-use-before-define": "off",
    },
  },
];
