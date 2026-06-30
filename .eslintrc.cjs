/**
 * ESLint config.
 */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  plugins: ["@typescript-eslint", "react", "react-hooks"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    // Must stay last so it disables stylistic rules that conflict with Prettier.
    "prettier",
  ],
  rules: {
    // The new JSX transform makes the React import optional.
    "react/react-in-jsx-scope": "off",
    // TypeScript already checks prop types.
    "react/prop-types": "off",
    // Allow intentionally unused args/vars prefixed with "_".
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
  ignorePatterns: [
    "build",
    "dist",
    "node_modules",
    "*.config.ts",
    "*.config.js",
    "*.cjs",
  ],
};
