import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

// Common rules shared across configs
const commonRules = {
  "@typescript-eslint/no-unused-vars": [
    "error",
    { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
  ],
};

const baseConfig = {
  extends: [js.configs.recommended, ...tseslint.configs.recommended],
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
};

export default tseslint.config([
  // Global ignores
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/build/**",
      "**/public/**",
      "**/.next/**",
      "**/coverage/**",
      "apps/server/prisma/migrations/**",
      "pnpm-lock.yaml",
    ],
  },

  // Client/React specific config
  {
    files: ["apps/client/**/*.{ts,tsx}"],
    ...baseConfig,
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    languageOptions: {
      ...baseConfig.languageOptions,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...commonRules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },

  // Server/Node specific config
  {
    files: ["apps/server/**/*.{ts,js}"],
    ...baseConfig,
    languageOptions: {
      ...baseConfig.languageOptions,
      globals: globals.node,
    },
    rules: commonRules,
  },
]);
