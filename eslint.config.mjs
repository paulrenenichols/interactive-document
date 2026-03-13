import { fixupPluginRules } from "@eslint/compat";
import js from "@eslint/js";
import react from "eslint-plugin-react";
import tseslint from "typescript-eslint";

const reactPlugin = fixupPluginRules(react);

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: [
      "apps/frontend/app/**/*.ts",
      "apps/frontend/app/**/*.tsx",
      "apps/frontend/components/**/*.ts",
      "apps/frontend/components/**/*.tsx",
      "apps/frontend/lib/**/*.ts",
      "apps/frontend/lib/**/*.tsx",
    ],
    plugins: { react: reactPlugin },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...react.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // not needed with React 17+ JSX transform
    },
  },
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      ".next/**",
      "**/*.config.js",
      "**/*.config.mjs",
      "**/*.config.ts",
    ],
  },
];
