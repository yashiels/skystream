import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'node_modules']),

  // Source files (browser)
  {
    files: ['**/*.{js,jsx}'],
    ignores: [
      '**/*.test.{js,jsx}',
      '**/*.spec.{js,jsx}',
      '**/__tests__/**',
      '**/__mocks__/**',
      'src/services/tmdbServer.js',
      'src/utils/config.js',
      'src/utils/analytics.js',
      'src/app/**/page.jsx',
      'src/app/layout.jsx',
    ],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      // New rules from eslint-plugin-react-hooks v7 — downgrade to warnings so
      // they surface during the deps upgrade without failing CI on pre-existing
      // patterns. Address in a follow-up refactor.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      // Core ESLint rule (not react-hooks) — downgraded for the same reason.
      'no-useless-assignment': 'warn',
    },
  },

  // Next.js server files + page routes (export metadata + component)
  {
    files: [
      'src/app/**/page.jsx',
      'src/app/layout.jsx',
      'src/services/tmdbServer.js',
      'src/utils/config.js',
      'src/utils/analytics.js',
    ],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
    },
  },

  // Test files — Jest globals
  {
    files: ['**/*.test.{js,jsx}', '**/*.spec.{js,jsx}', '**/__tests__/**/*.{js,jsx}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
    },
  },

  // Mock files
  {
    files: ['**/__mocks__/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
    },
    rules: {
      'no-unused-vars': 'off',
    },
  },

  // Config files
  {
    files: ['vite.config.{js,ts}', 'jest.config.{js,ts}', 'babel.config.{js,cjs}'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'no-unused-vars': 'off',
    },
  },
]);
