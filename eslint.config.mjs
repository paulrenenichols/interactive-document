import js from "@eslint/js";
import tseslint from "typescript-eslint";

// React plugin omitted for now: eslint-plugin-react@7 has compat issues with ESLint 10 flat config (getFilename). Add when plugin supports ESLint 10.
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
